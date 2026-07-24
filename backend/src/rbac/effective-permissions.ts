import { PrismaService } from '../prisma/prisma.service';

/**
 * Effective permissions = union of role permissions
 * + user allows − user denies
 */
export async function computeEffectivePermissions(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  const [roleLinks, overrides] = await Promise.all([
    prisma.userRole.findMany({
      where: { user_id: userId },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    }),
    prisma.userPermission.findMany({
      where: { user_id: userId },
      include: { permission: true },
    }),
  ]);

  const set = new Set<string>();
  for (const ur of roleLinks) {
    for (const rp of ur.role?.rolePermissions || []) {
      if (rp.permission?.slug) set.add(rp.permission.slug);
    }
  }

  for (const ov of overrides) {
    const slug = ov.permission?.slug;
    if (!slug) continue;
    if (ov.effect === 'deny') set.delete(slug);
    else set.add(slug);
  }

  return [...set].sort();
}
