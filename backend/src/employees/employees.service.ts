import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { RolesService } from '../rbac/roles.service';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService,
  ) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { full_name_ar: { contains: search } },
        { employee_number: { contains: search } },
        { position: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const orderField =
      !sortBy || sortBy === 'created_at' || sortBy === 'createdAt' ? 'createdAt' : sortBy;

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              last_login_at: true,
              userRoles: { include: { role: true } },
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    const enriched = data.map((e) => ({
      ...e,
      login_email: e.user?.email || null,
      role: e.user?.userRoles?.[0]?.role?.slug || null,
      role_ar: e.user?.userRoles?.[0]?.role?.name_ar || null,
    }));

    return { data: enriched, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            last_login_at: true,
            userRoles: { include: { role: true } },
          },
        },
        attendances: { orderBy: { date: 'desc' }, take: 60 },
        salaryRecords: { orderBy: { created_at: 'desc' }, take: 24 },
      },
    });
    if (!emp || emp.deletedAt) throw new NotFoundException('الموظف غير موجود');
    return {
      ...emp,
      login_email: emp.user?.email || null,
      role: emp.user?.userRoles?.[0]?.role?.slug || null,
      role_ar: emp.user?.userRoles?.[0]?.role?.name_ar || null,
    };
  }

  async create(raw: any) {
    const full_name_ar = String(raw?.full_name_ar || raw?.name || '').trim();
    if (!full_name_ar) throw new BadRequestException('اسم الموظف مطلوب');

    const employee_number =
      String(raw?.employee_number || '').trim() ||
      `EMP-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const email = String(raw?.email || '').trim().toLowerCase();
    const password = String(raw?.password || '').trim();
    const roleSlug = String(raw?.role || 'worker').trim().toLowerCase();
    const phoneRaw = String(raw?.phone || '').trim();
    const phone = phoneRaw || null;

    if (email) {
      const roleExists = await this.prisma.role.findFirst({
        where: { slug: roleSlug, deletedAt: null },
      });
      if (!roleExists) {
        throw new BadRequestException('الدور غير موجود — اختر دوراً من قائمة الأدوار');
      }
    }

    let user_id: string | undefined;
    let temporary_password: string | undefined;

    try {
      if (email) {
        const taken = await this.prisma.user.findUnique({ where: { email } });
        if (taken) throw new ConflictException('البريد مستخدم مسبقاً');

        if (phone) {
          const phoneTaken = await this.prisma.user.findFirst({
            where: { phone, deleted_at: null },
          });
          if (phoneTaken) {
            throw new ConflictException(
              'رقم الهاتف مستخدم في حساب آخر — اتركه فارغاً أو غيّره',
            );
          }
        }

        const role = await this.prisma.role.findUnique({ where: { slug: roleSlug } });
        if (!role) throw new BadRequestException('الدور غير موجود — شغّل الـ seed');

        const plainPassword =
          password || `Emp${Math.random().toString(36).slice(-8)}!`;
        const password_hash = await bcrypt.hash(plainPassword, 10);
        const user = await this.prisma.user.create({
          data: {
            email,
            full_name_ar,
            password_hash,
            phone,
            status: 'active',
          },
        });
        await this.prisma.userRole.create({
          data: { user_id: user.id, role_id: role.id },
        });
        user_id = user.id;
        temporary_password = plainPassword;

        if (Array.isArray(raw?.permissions) || Array.isArray(raw?.overrides)) {
          await this.rolesService.setUserAccess(user.id, {
            overrides: raw.overrides,
            permissions: raw.permissions,
          });
        }
      }

      const employee = await this.prisma.employee.create({
        data: {
          full_name_ar,
          employee_number,
          position: raw?.position || 'موظف',
          phone,
          monthly_salary: Number(raw?.monthly_salary || 0),
          user_id: user_id || null,
          is_active: raw?.is_active !== false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userRoles: { include: { role: true } },
            },
          },
        },
      });

      return {
        ...employee,
        temporary_password,
        login_email: email || null,
        role: roleSlug,
        message_ar: email
          ? 'تم إنشاء الموظف وحساب الدخول. احفظ كلمة المرور.'
          : 'تم إنشاء الموظف بدون حساب دخول',
      };
    } catch (err: any) {
      if (err instanceof ConflictException || err instanceof BadRequestException) throw err;
      if (err?.code === 'P2002') {
        const fields = err?.meta?.target || [];
        if (String(fields).includes('phone')) {
          throw new ConflictException('رقم الهاتف مستخدم مسبقاً');
        }
        if (String(fields).includes('email')) {
          throw new ConflictException('البريد مستخدم مسبقاً');
        }
        if (String(fields).includes('employee_number')) {
          throw new ConflictException('رقم الموظف مكرر — أعد المحاولة');
        }
        throw new ConflictException('بيانات مكررة');
      }
      throw err;
    }
  }

  async update(id: string, data: any) {
    const emp = await this.findById(id);
    const { email, password, role, temporary_password, permissions, overrides, ...rest } = data;

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        full_name_ar: rest.full_name_ar,
        position: rest.position,
        phone: rest.phone === '' ? null : rest.phone,
        monthly_salary:
          rest.monthly_salary !== undefined ? Number(rest.monthly_salary) : undefined,
        is_active: rest.is_active,
      },
    });

    if (emp.user_id && (role || permissions || overrides)) {
      await this.rolesService.setUserAccess(emp.user_id, {
        role,
        permissions,
        overrides,
      });
    }

    if (emp.user_id && password) {
      const password_hash = await bcrypt.hash(String(password), 10);
      await this.prisma.user.update({
        where: { id: emp.user_id },
        data: { password_hash },
      });
    }

    return this.findById(id);
  }

  async softDelete(id: string) {
    return this.prisma.employee.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async addAttendance(employeeId: string, body: { date?: string; status: string; notes?: string }) {
    await this.findById(employeeId);
    const day = body.date ? new Date(body.date) : new Date();
    day.setHours(12, 0, 0, 0);
    return this.prisma.employeeAttendance.upsert({
      where: {
        employee_id_date: { employee_id: employeeId, date: day },
      },
      create: {
        employee_id: employeeId,
        date: day,
        status: body.status || 'present',
        notes: body.notes,
      },
      update: {
        status: body.status || 'present',
        notes: body.notes,
      },
    });
  }

  async addSalary(
    employeeId: string,
    body: { month: string; amount: number; status?: string; notes?: string },
  ) {
    await this.findById(employeeId);
    const month = String(body.month || '').trim();
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('الشهر بصيغة YYYY-MM');
    }
    return this.prisma.employeeSalaryRecord.upsert({
      where: { employee_id_month: { employee_id: employeeId, month } },
      create: {
        employee_id: employeeId,
        month,
        amount: Number(body.amount || 0),
        status: body.status || 'pending',
        notes: body.notes,
        paid_at: body.status === 'paid' ? new Date() : null,
      },
      update: {
        amount: Number(body.amount || 0),
        status: body.status || 'pending',
        notes: body.notes,
        paid_at: body.status === 'paid' ? new Date() : null,
      },
    });
  }
}
