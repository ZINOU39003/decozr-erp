import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminPortalService {
  constructor(private prisma: PrismaService) {}

  async getInbox() {
    const [
      pendingPayments,
      supportUnreadHint,
      customNew,
      appointmentsUpcoming,
      recentPayments,
      recentSupport,
      recentCustom,
    ] = await Promise.all([
      this.prisma.payment.count({ where: { status: 'pending_review', deletedAt: null } }),
      this.prisma.portalSupportMessage.count({
        where: {
          created_at: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
        },
      }),
      this.prisma.customDesignRequest.count({ where: { status: 'new' } }),
      this.prisma.customerAppointment.count({
        where: {
          status: 'scheduled',
          starts_at: { gte: new Date() },
        },
      }),
      this.prisma.payment.findMany({
        where: { status: 'pending_review', deletedAt: null },
        include: { customer: true, invoice: true, order: true },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
      this.prisma.portalSupportMessage.findMany({
        include: { customer: true, sender: true },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
      this.prisma.customDesignRequest.findMany({
        where: { status: { in: ['new', 'reviewing'] } },
        include: { customer: true },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
    ]);

    return {
      counts: {
        pending_payments: pendingPayments,
        support_messages_week: supportUnreadHint,
        custom_requests_new: customNew,
        appointments_upcoming: appointmentsUpcoming,
      },
      recent_payments: recentPayments,
      recent_support: recentSupport,
      recent_custom: recentCustom,
    };
  }

  async listPendingPayments() {
    return this.prisma.payment.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        invoice: true,
        order: true,
        recorder: true,
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async reviewPayment(adminUser: any, paymentId: string, action: 'confirm' | 'reject', note?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true, customer: true },
    });
    if (!payment) throw new NotFoundException('الدفعة غير موجودة');

    const status = action === 'confirm' ? 'confirmed' : 'rejected';
    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          notes: note
            ? `${payment.notes || ''}\n[أدمن] ${note}`.trim()
            : payment.notes,
        },
        include: { invoice: true, customer: true, order: true },
      });

      if (action === 'confirm' && payment.invoice_id) {
        const inv = await tx.invoice.findUnique({
          where: { id: payment.invoice_id },
          include: { payments: true },
        });
        if (inv) {
          const paid = inv.payments
            .map((x) =>
              x.id === paymentId
                ? { ...x, status: 'confirmed' }
                : x,
            )
            .filter((x) => x.status === 'confirmed')
            .reduce((s, x) => s + Number(x.amount || 0), 0);
          const statusInv =
            paid >= inv.total_amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
          await tx.invoice.update({
            where: { id: inv.id },
            data: { status: statusInv },
          });
          if (inv.order_id) {
            await tx.order.update({
              where: { id: inv.order_id },
              data: { paid_amount: paid },
            });
          }
        }
      }

      return p;
    });

    // notify customer portal users
    const portalUsers = await this.prisma.user.findMany({
      where: { customer_id: payment.customer_id, deleted_at: null },
    });
    for (const u of portalUsers) {
      await this.prisma.notification.create({
        data: {
          user_id: u.id,
          notification_type: 'payment',
          title_ar: action === 'confirm' ? 'تم تأكيد دفعتك' : 'تم رفض إثبات الدفع',
          body_ar:
            action === 'confirm'
              ? `تم اعتماد دفعتك بقيمة ${payment.amount.toLocaleString()} د.ج.`
              : `لم يتم اعتماد إثبات الدفع (${payment.amount.toLocaleString()} د.ج). ${note || 'راجع مع الورشة.'}`,
        },
      });
    }

    return updated;
  }

  async listSupportThreads() {
    const messages = await this.prisma.portalSupportMessage.findMany({
      include: { customer: true, sender: true },
      orderBy: { created_at: 'desc' },
      take: 500,
    });
    const byCustomer = new Map<string, any>();
    for (const m of messages) {
      const existing = byCustomer.get(m.customer_id);
      if (!existing) {
        byCustomer.set(m.customer_id, {
          customer_id: m.customer_id,
          customer: m.customer,
          last_message: m,
          messages_count: 1,
        });
      } else {
        existing.messages_count += 1;
      }
    }
    return Array.from(byCustomer.values());
  }

  async getSupportMessages(customerId: string) {
    return this.prisma.portalSupportMessage.findMany({
      where: { customer_id: customerId },
      include: { sender: true, customer: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async replySupport(adminUser: any, customerId: string, body_ar: string) {
    if (!body_ar?.trim()) throw new BadRequestException('نص الرسالة مطلوب');
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('العميل غير موجود');

    const msg = await this.prisma.portalSupportMessage.create({
      data: {
        customer_id: customerId,
        sender_user_id: adminUser.id,
        body_ar: body_ar.trim(),
      },
      include: { sender: true, customer: true },
    });

    const portalUsers = await this.prisma.user.findMany({
      where: { customer_id: customerId, deleted_at: null },
    });
    for (const u of portalUsers) {
      await this.prisma.notification.create({
        data: {
          user_id: u.id,
          notification_type: 'support',
          title_ar: 'رد جديد من الورشة',
          body_ar: body_ar.trim().slice(0, 120),
        },
      });
    }
    return msg;
  }

  async listCustomRequests() {
    return this.prisma.customDesignRequest.findMany({
      include: { customer: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateCustomRequest(id: string, status: string, adminNote?: string) {
    const allowed = ['new', 'reviewing', 'quoted', 'accepted', 'rejected'];
    if (!allowed.includes(status)) throw new BadRequestException('حالة غير صالحة');
    const existing = await this.prisma.customDesignRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('الطلب غير موجود');

    const updated = await this.prisma.customDesignRequest.update({
      where: { id },
      data: {
        status,
        description_ar: adminNote
          ? `${existing.description_ar}\n\n— ملاحظة الورشة: ${adminNote}`
          : existing.description_ar,
      },
      include: { customer: true },
    });

    const portalUsers = await this.prisma.user.findMany({
      where: { customer_id: existing.customer_id, deleted_at: null },
    });
    for (const u of portalUsers) {
      await this.prisma.notification.create({
        data: {
          user_id: u.id,
          notification_type: 'custom_design',
          title_ar: 'تحديث طلب التصميم الخاص',
          body_ar: `طلب «${existing.title_ar}» أصبح: ${status}`,
        },
      });
    }
    return updated;
  }

  async listAppointments() {
    return this.prisma.customerAppointment.findMany({
      include: { customer: true },
      orderBy: { starts_at: 'asc' },
    });
  }

  async upsertAppointment(
    body: {
      id?: string;
      customer_id: string;
      title_ar: string;
      notes?: string;
      location_ar?: string;
      starts_at: string;
      status?: string;
    },
  ) {
    if (!body.customer_id || !body.title_ar || !body.starts_at) {
      throw new BadRequestException('بيانات الموعد ناقصة');
    }
    const data = {
      customer_id: body.customer_id,
      title_ar: body.title_ar,
      notes: body.notes || null,
      location_ar: body.location_ar || null,
      starts_at: new Date(body.starts_at),
      status: body.status || 'scheduled',
    };
    if (body.id) {
      return this.prisma.customerAppointment.update({ where: { id: body.id }, data, include: { customer: true } });
    }
    const created = await this.prisma.customerAppointment.create({
      data,
      include: { customer: true },
    });
    const portalUsers = await this.prisma.user.findMany({
      where: { customer_id: body.customer_id, deleted_at: null },
    });
    for (const u of portalUsers) {
      await this.prisma.notification.create({
        data: {
          user_id: u.id,
          notification_type: 'appointment',
          title_ar: 'موعد جديد من الورشة',
          body_ar: `${body.title_ar} — ${new Date(body.starts_at).toLocaleString('ar-DZ')}`,
        },
      });
    }
    return created;
  }

  /** Notify all admin/staff when customer does something important */
  async notifyAdmins(title_ar: string, body_ar: string, type = 'portal') {
    const admins = await this.prisma.user.findMany({
      where: {
        deleted_at: null,
        customer_id: null,
        userRoles: { some: { role: { slug: { in: ['admin', 'owner', 'manager', 'accountant'] } } } },
      },
      take: 20,
    });
    // fallback: any non-customer user
    const targets =
      admins.length > 0
        ? admins
        : await this.prisma.user.findMany({
            where: { deleted_at: null, customer_id: null },
            take: 10,
          });
    for (const u of targets) {
      await this.prisma.notification.create({
        data: {
          user_id: u.id,
          notification_type: type,
          title_ar,
          body_ar,
        },
      });
    }
  }
}
