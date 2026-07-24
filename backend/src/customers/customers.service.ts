import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private async resolvePriceListId(preferred?: string) {
    if (preferred) {
      const pl = await this.prisma.priceList.findUnique({ where: { id: preferred } });
      if (pl) return pl.id;
    }
    const retail = await this.prisma.priceList.findFirst({
      where: { list_type: 'retail', is_active: true },
    });
    if (retail) return retail.id;
    const any = await this.prisma.priceList.findFirst({ where: { is_active: true } });
    if (!any) throw new BadRequestException('لا توجد قائمة أسعار. شغّل الـ seed أولاً.');
    return any.id;
  }

  private async generateCode() {
    const count = await this.prisma.customer.count();
    let code = `CUST-${String(count + 1).padStart(4, '0')}`;
    let exists = await this.prisma.customer.findUnique({ where: { code } });
    let n = count + 1;
    while (exists) {
      n += 1;
      code = `CUST-${String(n).padStart(4, '0')}`;
      exists = await this.prisma.customer.findUnique({ where: { code } });
    }
    return code;
  }

  private normalizeType(input?: string) {
    const map: Record<string, string> = {
      فرد: 'individual',
      شركة: 'company',
      حكومي: 'distributor',
      individual: 'individual',
      company: 'company',
      distributor: 'distributor',
    };
    return map[String(input || '').trim()] || 'individual';
  }

  async listPriceLists() {
    return this.prisma.priceList.findMany({
      where: { is_active: true },
      orderBy: { name_ar: 'asc' },
    });
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 50, search, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { name_ar: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          priceList: true,
          orders: {
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              invoices: {
                where: { deletedAt: null },
                select: {
                  total_amount: true,
                  payments: {
                    select: { amount: true, status: true },
                  },
                },
              },
            },
          },
          customRequests: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const closedStatuses = ['delivered', 'completed', 'cancelled', 'returned', 'rejected'];
    const enriched = data.map((c) => {
      let invoiced = 0;
      let paid = 0;
      for (const o of c.orders || []) {
        for (const inv of o.invoices || []) {
          invoiced += Number(inv.total_amount || 0);
          for (const p of inv.payments || []) {
            const st = (p.status || 'confirmed').toLowerCase();
            if (st === 'pending' || st === 'pending_review' || st === 'rejected') continue;
            paid += Number(p.amount || 0);
          }
        }
      }
      const remaining = Math.max(0, invoiced - paid);
      const { orders, customRequests, ...rest } = c as any;
      const ordersList = orders || [];
      return {
        ...rest,
        invoiced_total: invoiced,
        paid_total: paid,
        remaining_total: remaining,
        orders_count: ordersList.length,
        active_orders_count: ordersList.filter(
          (o: any) => !closedStatuses.includes(o.status),
        ).length,
        designs_count: customRequests?.length || 0,
        open_designs:
          customRequests?.filter((d: any) =>
            ['new', 'reviewing', 'quoted'].includes(d.status),
          ).length || 0,
      };
    });

    return {
      data: enriched,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        priceList: true,
        portalUsers: {
          where: { deleted_at: null },
          select: {
            id: true,
            email: true,
            full_name_ar: true,
            status: true,
            last_login_at: true,
            created_at: true,
          },
        },
        orders: {
          where: { deletedAt: null },
          orderBy: { created_at: 'desc' },
          include: {
            items: {
              take: 3,
              select: { design_name_snapshot: true, quantity: true },
            },
            invoices: {
              where: { deletedAt: null },
              include: {
                payments: {
                  select: { id: true, amount: true, status: true, paid_at: true },
                },
              },
            },
          },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { paid_at: 'desc' },
          take: 100,
        },
        customRequests: {
          orderBy: { created_at: 'desc' },
          take: 50,
        },
      },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const invoices = (customer.orders || []).flatMap((o) =>
      (o.invoices || []).map((inv) => ({
        ...inv,
        order_number: o.order_number,
        order_id: o.id,
      })),
    );

    let invoiced = 0;
    let paid = 0;
    for (const inv of invoices) {
      invoiced += Number(inv.total_amount || 0);
      for (const p of inv.payments || []) {
        const st = (p.status || 'confirmed').toLowerCase();
        if (st === 'pending' || st === 'pending_review' || st === 'rejected') continue;
        paid += Number(p.amount || 0);
      }
    }
    // Also count direct customer payments
    for (const p of customer.payments || []) {
      const st = (p.status || 'confirmed').toLowerCase();
      if (st === 'pending' || st === 'pending_review' || st === 'rejected') continue;
      // avoid double-count if linked to invoice already counted
      if (!p.invoice_id) paid += Number(p.amount || 0);
    }

    const remaining = Math.max(0, invoiced - paid);
    const orders = customer.orders || [];
    const byStatus = {
      active: orders.filter((o) =>
        !['delivered', 'completed', 'cancelled', 'returned'].includes(o.status),
      ).length,
      completed: orders.filter((o) =>
        ['delivered', 'completed'].includes(o.status),
      ).length,
      returned: orders.filter((o) =>
        ['cancelled', 'returned', 'rejected'].includes(o.status),
      ).length,
    };

    return {
      ...customer,
      invoices,
      invoiced_total: invoiced,
      paid_total: paid,
      remaining_total: remaining,
      orders_summary: byStatus,
      orders_count: orders.length,
      active_orders_count: byStatus.active,
      designs_count: customer.customRequests?.length || 0,
    };
  }

  private generateTempPassword(length = 10) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = randomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
    return out;
  }

  async activatePortal(
    customerId: string,
    options?: { email?: string; password?: string; reset?: boolean },
  ) {
    const customer = await this.findById(customerId);
    const email = String(options?.email || customer.email || '').trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('البريد الإلكتروني مطلوب لتفعيل بوابة العميل');
    }

    const tempPassword = options?.password || this.generateTempPassword(10);
    const password_hash = await bcrypt.hash(tempPassword, 10);
    const roleSlug = customer.customer_type === 'distributor' ? 'distributor' : 'customer';
    const role = await this.prisma.role.findUnique({ where: { slug: roleSlug } });
    if (!role) throw new BadRequestException(`دور ${roleSlug} غير موجود — شغّل الـ seed`);

    let user = await this.prisma.user.findFirst({
      where: { customer_id: customerId, deleted_at: null },
    });

    if (!user) {
      const emailTaken = await this.prisma.user.findUnique({ where: { email } });
      if (emailTaken && emailTaken.customer_id !== customerId) {
        throw new ConflictException('البريد مستخدم لحساب آخر');
      }
      if (emailTaken && emailTaken.customer_id === customerId) {
        user = emailTaken;
      }
    }

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          full_name_ar: customer.name_ar,
          password_hash,
          customer_id: customerId,
          status: 'active',
          deleted_at: null,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name_ar: customer.name_ar,
          password_hash,
          customer_id: customerId,
          status: 'active',
        },
      });
    }

    await this.prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
      update: {},
      create: { user_id: user.id, role_id: role.id },
    });

    if (!customer.email) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { email },
      });
    }

    return {
      customer_id: customerId,
      user_id: user.id,
      email: user.email,
      temporary_password: tempPassword,
      role: roleSlug,
      message_ar: 'تم تفعيل بوابة العميل. احفظ كلمة المرور الآن فلن تُعرض لاحقًا.',
    };
  }

  async create(raw: any) {
    const name_ar = String(raw?.name_ar || raw?.name || '').trim();
    const phone = String(raw?.phone || '').trim();
    if (!name_ar) throw new BadRequestException('الاسم مطلوب');
    if (!phone) throw new BadRequestException('رقم الهاتف مطلوب');

    const existingPhone = await this.prisma.customer.findFirst({
      where: { phone, deleted_at: null },
    });
    if (existingPhone) {
      throw new ConflictException('يوجد عميل بنفس رقم الهاتف');
    }

    const price_list_id = await this.resolvePriceListId(raw?.price_list_id);
    const code = raw?.code ? String(raw.code).trim() : await this.generateCode();

    const codeTaken = await this.prisma.customer.findUnique({ where: { code } });
    if (codeTaken) throw new ConflictException('رمز العميل مستخدم مسبقًا');

    const customer = await this.prisma.customer.create({
      data: {
        code,
        name_ar,
        phone,
        phone_alt: raw?.phone_alt || null,
        email: raw?.email || null,
        address_ar: raw?.address_ar || null,
        city: raw?.city || null,
        customer_type: this.normalizeType(raw?.customer_type || raw?.type),
        price_list_id,
        credit_limit: Number(raw?.credit_limit) || 0,
        balance: Number(raw?.balance) || 0,
        tax_number: raw?.tax_number || null,
        notes: raw?.notes || null,
        is_active: raw?.is_active !== false,
        created_by: raw?.created_by || null,
      },
      include: { priceList: true },
    });

    let portal: any = null;
    if (raw?.enable_portal && customer.email) {
      portal = await this.activatePortal(customer.id, {
        email: customer.email,
        password: raw?.portal_password,
      });
    }

    return { ...customer, portal };
  }

  async update(id: string, raw: any) {
    await this.findById(id);

    const data: any = {};
    if (raw.name_ar != null || raw.name != null) data.name_ar = String(raw.name_ar || raw.name).trim();
    if (raw.phone != null) data.phone = String(raw.phone).trim();
    if (raw.phone_alt !== undefined) data.phone_alt = raw.phone_alt;
    if (raw.email !== undefined) data.email = raw.email;
    if (raw.address_ar !== undefined) data.address_ar = raw.address_ar;
    if (raw.city !== undefined) data.city = raw.city;
    if (raw.customer_type != null || raw.type != null) {
      data.customer_type = this.normalizeType(raw.customer_type || raw.type);
    }
    if (raw.price_list_id) data.price_list_id = await this.resolvePriceListId(raw.price_list_id);
    if (raw.credit_limit != null) data.credit_limit = Number(raw.credit_limit) || 0;
    if (raw.balance != null) data.balance = Number(raw.balance) || 0;
    if (raw.tax_number !== undefined) data.tax_number = raw.tax_number;
    if (raw.notes !== undefined) data.notes = raw.notes;
    if (raw.is_active !== undefined) data.is_active = !!raw.is_active;

    return this.prisma.customer.update({
      where: { id },
      data,
      include: { priceList: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.customer.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }
}
