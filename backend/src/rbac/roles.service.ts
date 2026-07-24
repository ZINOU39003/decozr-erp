import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ROLE_DEFAULT_PERMISSIONS } from './permissions.catalog';
import { computeEffectivePermissions } from './effective-permissions';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { name_ar: 'asc' },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
    });
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      name_ar: r.name_ar,
      slug: r.slug,
      description_ar: r.description_ar,
      is_system: r.is_system,
      users_count: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission.slug).sort(),
    }));
  }

  async listPermissionsGrouped() {
    const perms = await this.prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: [{ module: 'asc' }, { slug: 'asc' }],
    });
    const groups: Record<string, typeof perms> = {};
    for (const p of perms) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return {
      items: perms,
      groups: Object.entries(groups).map(([module, permissions]) => ({
        module,
        permissions,
      })),
    };
  }

  async createRole(body: {
    name?: string;
    name_ar: string;
    slug: string;
    description_ar?: string;
    permissions?: string[];
  }) {
    const slug = String(body.slug || '').trim().toLowerCase().replace(/\s+/g, '_');
    const name_ar = String(body.name_ar || '').trim();
    if (!slug || !name_ar) throw new BadRequestException('الاسم والمعرّف مطلوبان');

    const exists = await this.prisma.role.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('معرّف الدور مستخدم مسبقاً');

    const role = await this.prisma.role.create({
      data: {
        slug,
        name: body.name || slug,
        name_ar,
        description_ar: body.description_ar || null,
        is_system: false,
      },
    });

    if (Array.isArray(body.permissions) && body.permissions.length) {
      await this.setRolePermissions(role.id, body.permissions);
    }

    return this.getRole(role.id);
  }

  async getRole(id: string) {
    const r = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
    });
    if (!r || r.deletedAt) throw new NotFoundException('الدور غير موجود');
    return {
      id: r.id,
      name: r.name,
      name_ar: r.name_ar,
      slug: r.slug,
      description_ar: r.description_ar,
      is_system: r.is_system,
      users_count: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => rp.permission.slug).sort(),
    };
  }

  async updateRole(
    id: string,
    body: { name_ar?: string; name?: string; description_ar?: string; permissions?: string[] },
  ) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role || role.deletedAt) throw new NotFoundException('الدور غير موجود');

    await this.prisma.role.update({
      where: { id },
      data: {
        name_ar: body.name_ar ?? undefined,
        name: body.name ?? undefined,
        description_ar: body.description_ar ?? undefined,
      },
    });

    if (Array.isArray(body.permissions)) {
      await this.setRolePermissions(id, body.permissions);
    }

    return this.getRole(id);
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role || role.deletedAt) throw new NotFoundException('الدور غير موجود');
    if (role.is_system) throw new BadRequestException('لا يمكن حذف دور نظامي');

    const users = await this.prisma.userRole.count({ where: { role_id: id } });
    if (users > 0) {
      throw new BadRequestException('لا يمكن حذف دور مرتبط بموظفين — انقلهم أولاً');
    }

    await this.prisma.rolePermission.deleteMany({ where: { role_id: id } });
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async setRolePermissions(roleId: string, permissionSlugs: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role || role.deletedAt) throw new NotFoundException('الدور غير موجود');

    const perms = await this.prisma.permission.findMany({
      where: { slug: { in: permissionSlugs } },
    });
    const ids = perms.map((p) => p.id);

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { role_id: roleId } }),
      ...ids.map((permission_id) =>
        this.prisma.rolePermission.create({
          data: { role_id: roleId, permission_id },
        }),
      ),
    ]);

    return this.getRole(roleId);
  }

  async getUserAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        userPermissions: { include: { permission: true } },
      },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      slug: ur.role.slug,
      name_ar: ur.role.name_ar,
    }));
    const roleSlug = roles[0]?.slug || null;

    let role_permissions: string[] = [];
    if (roles[0]?.id) {
      const rps = await this.prisma.rolePermission.findMany({
        where: { role_id: roles[0].id },
        include: { permission: true },
      });
      role_permissions = rps.map((r) => r.permission.slug).sort();
    } else if (roleSlug && ROLE_DEFAULT_PERMISSIONS[roleSlug]) {
      role_permissions = [...ROLE_DEFAULT_PERMISSIONS[roleSlug]];
    }

    const overrides = user.userPermissions.map((up) => ({
      slug: up.permission.slug,
      effect: up.effect,
    }));

    const effective = await computeEffectivePermissions(this.prisma, userId);

    return {
      user_id: userId,
      roles,
      role: roleSlug,
      role_permissions,
      overrides,
      permissions: effective,
    };
  }

  /**
   * Set primary role + permission overrides for a user.
   * overrides: [{ slug, effect: 'allow'|'deny' }]
   * Or pass `permissions` as the desired effective set — we derive allow/deny vs role.
   */
  async setUserAccess(
    userId: string,
    body: {
      role?: string;
      overrides?: Array<{ slug: string; effect: 'allow' | 'deny' }>;
      permissions?: string[];
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    if (body.role) {
      const role = await this.prisma.role.findUnique({
        where: { slug: String(body.role).toLowerCase() },
      });
      if (!role || role.deletedAt) throw new BadRequestException('الدور غير موجود');
      await this.prisma.userRole.deleteMany({ where: { user_id: userId } });
      await this.prisma.userRole.create({
        data: { user_id: userId, role_id: role.id },
      });
    }

    let overrides = body.overrides;
    if (Array.isArray(body.permissions)) {
      const access = await this.getUserAccess(userId);
      const roleSet = new Set(access.role_permissions || []);
      const desired = new Set(body.permissions);
      overrides = [];
      for (const slug of desired) {
        if (!roleSet.has(slug)) overrides.push({ slug, effect: 'allow' as const });
      }
      for (const slug of roleSet) {
        if (!desired.has(slug)) overrides.push({ slug, effect: 'deny' as const });
      }
    }

    if (Array.isArray(overrides)) {
      await this.prisma.userPermission.deleteMany({ where: { user_id: userId } });
      for (const ov of overrides) {
        const perm = await this.prisma.permission.findUnique({ where: { slug: ov.slug } });
        if (!perm) continue;
        await this.prisma.userPermission.create({
          data: {
            user_id: userId,
            permission_id: perm.id,
            effect: ov.effect === 'deny' ? 'deny' : 'allow',
          },
        });
      }
    }

    return this.getUserAccess(userId);
  }
}
