import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  requireCustomerId(user: { customer_id?: string; roles?: string[] }) {
    const roles = user?.roles || [];
    const isPortal =
      roles.includes('customer') ||
      roles.includes('distributor') ||
      !!user?.customer_id;
    if (!isPortal || !user?.customer_id) {
      throw new ForbiddenException('هذه البوابة مخصصة لحسابات العملاء فقط');
    }
    return user.customer_id;
  }

  async getMe(user: any) {
    const customerId = this.requireCustomerId(user);
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { priceList: true },
    });
    if (!customer || customer.deleted_at) {
      throw new NotFoundException('العميل غير موجود');
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name_ar || user.full_name,
        roles: user.roles,
        customer_id: customerId,
      },
      customer,
    };
  }

  async getDashboard(user: any) {
    const customerId = this.requireCustomerId(user);
    const me = await this.getMe(user);
    const orders = await this.prisma.order.findMany({
      where: { customer_id: customerId, deletedAt: null },
      include: {
        items: { include: { design: true } },
        statusHistory: { orderBy: { changed_at: 'asc' } },
      },
      orderBy: { created_at: 'desc' },
    });
    const invoices = await this.prisma.invoice.findMany({
      where: { order: { customer_id: customerId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const payments = await this.prisma.payment.findMany({
      where: { customer_id: customerId },
      orderBy: { paid_at: 'desc' },
      take: 5,
    });
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: user.id, deletedAt: null },
      orderBy: { created_at: 'desc' },
      take: 8,
    });
    const gallery = await this.prisma.design.findMany({
      where: {
        is_active: true,
        deleted_at: null,
        OR: [{ library_status: 'public' }, { visibility: 'public' }],
      },
      orderBy: { updated_at: 'desc' },
      take: 6,
    });

    const openStatuses = [
      'received',
      'pending_review',
      'pending_approval',
      'in_design',
      'in_cutting',
      'in_printing',
      'in_assembly',
      'ready',
    ];
    const productionStatuses = ['in_cutting', 'in_printing', 'in_assembly', 'in_design'];
    const openOrders = orders.filter((o) => openStatuses.includes(o.status));
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalPaid = orders.reduce((s, o) => s + (o.paid_amount || 0), 0);
    const unpaidInvoices = invoices.filter(
      (inv) => String(inv.status || '').toLowerCase() !== 'paid',
    );
    const unpaidTotal = unpaidInvoices.reduce((s, inv) => s + Number(inv.total_amount || 0), 0);

    const progressOf = (status: string) => {
      const map: Record<string, number> = {
        received: 12,
        pending_review: 22,
        pending_approval: 35,
        in_design: 48,
        in_cutting: 62,
        in_printing: 72,
        in_assembly: 82,
        ready: 94,
        delivered: 100,
      };
      return map[status] ?? 10;
    };

    const timelineOf = (status: string) => {
      const steps = [
        { key: 'received', label_ar: 'تم استلام الطلب' },
        { key: 'design', label_ar: 'بدأ التصميم' },
        { key: 'approved', label_ar: 'تمت الموافقة' },
        { key: 'production', label_ar: 'جاري الإنتاج' },
        { key: 'inspection', label_ar: 'الفحص النهائي' },
        { key: 'shipping', label_ar: 'الشحن / التسليم' },
      ];
      const rank: Record<string, number> = {
        received: 0,
        pending_review: 0,
        pending_approval: 1,
        in_design: 1,
        in_cutting: 3,
        in_printing: 3,
        in_assembly: 3,
        ready: 4,
        delivered: 5,
      };
      // approval reached when past design
      if (['in_cutting', 'in_printing', 'in_assembly', 'ready', 'delivered'].includes(status)) {
        rank[status] = Math.max(rank[status] ?? 0, 3);
      }
      if (['pending_approval', 'in_design'].includes(status)) {
        // at design stage, mark received done and design active
      }
      const current =
        status === 'delivered'
          ? 5
          : status === 'ready'
            ? 4
            : ['in_cutting', 'in_printing', 'in_assembly'].includes(status)
              ? 3
              : status === 'pending_approval'
                ? 2
                : ['in_design', 'pending_review'].includes(status)
                  ? 1
                  : 0;
      return steps.map((step, idx) => ({
        ...step,
        state: idx < current ? 'done' : idx === current ? 'current' : 'todo',
      }));
    };

    const currentOrder = openOrders[0] || orders[0] || null;
    const current_project = currentOrder
      ? {
          order_id: currentOrder.id,
          order_number: currentOrder.order_number,
          title_ar:
            currentOrder.items?.[0]?.design_name_snapshot ||
            currentOrder.items?.[0]?.design?.name_ar ||
            currentOrder.order_number,
          image_url: currentOrder.items?.[0]?.design?.image_url || null,
          status: currentOrder.status,
          progress: progressOf(currentOrder.status),
          promised_date: currentOrder.promised_date,
          due_date: currentOrder.due_date,
          total: currentOrder.total,
          timeline: timelineOf(currentOrder.status),
        }
      : null;

    let unreadMessages = 0;
    try {
      const chatThreads = await this.getChatThreads(user);
      unreadMessages = chatThreads.filter((t: any) => t.unread_hint).length;
    } catch {
      unreadMessages = 0;
    }

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    let appointmentsWeek = 0;
    try {
      appointmentsWeek = await this.prisma.customerAppointment.count({
        where: {
          customer_id: customerId,
          starts_at: { gte: weekStart, lt: weekEnd },
          status: { not: 'cancelled' },
        },
      });
    } catch {
      appointmentsWeek = 0;
    }

    return {
      customer_name: me.customer.name_ar,
      updated_at: new Date().toISOString(),
      summary: {
        orders_count: orders.length,
        open_orders: openOrders.length,
        production_orders: orders.filter((o) => productionStatuses.includes(o.status)).length,
        total_spent: totalSpent,
        total_paid: totalPaid,
        remaining: Math.max(0, totalSpent - totalPaid),
        invoices_count: invoices.length,
        unpaid_invoices: unpaidInvoices.length,
        unpaid_total: unpaidTotal,
        unread_notifications: notifications.filter((n) => !n.is_read).length,
        unread_messages: unreadMessages,
        appointments_week: appointmentsWeek,
      },
      current_project,
      recent_orders: orders.slice(0, 6).map((o) => ({
        ...o,
        progress: progressOf(o.status),
        title_ar: o.items?.[0]?.design_name_snapshot || o.order_number,
      })),
      recent_invoices: invoices,
      unpaid_invoices: unpaidInvoices.slice(0, 5),
      recent_payments: payments,
      notifications,
      gallery,
      projects: orders.slice(0, 4).map((o) => ({
        order_id: o.id,
        order_number: o.order_number,
        title_ar: o.items?.[0]?.design_name_snapshot || o.order_number,
        image_url: o.items?.[0]?.design?.image_url || null,
        status: o.status,
        progress: progressOf(o.status),
        total: o.total,
      })),
    };
  }

  async getOrders(user: any) {
    const customerId = this.requireCustomerId(user);
    return this.prisma.order.findMany({
      where: { customer_id: customerId, deletedAt: null },
      include: {
        items: true,
        statusHistory: { orderBy: { changed_at: 'desc' }, take: 5 },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async createOrder(
    user: any,
    body: {
      items: Array<{
        design_id: string;
        design_version_id?: string;
        quantity: number;
        options?: Record<string, unknown>;
      }>;
      notes?: string;
    },
  ) {
    const customerId = this.requireCustomerId(user);
    if (!body?.items?.length) throw new BadRequestException('السلة فارغة');

    const order = await this.ordersService.create(user.id, {
      customer_id: customerId,
      items: body.items,
      notes: body.notes || 'طلب من بوابة العميل',
    });

    await this.prisma.notification.create({
      data: {
        user_id: user.id,
        notification_type: 'order',
        title_ar: `تم استلام طلبك ${order.order_number}`,
        body_ar: 'يمكنك متابعة حالة الطلب والدردشة مع الورشة من بوابة العميل.',
        metadata: { order_id: order.id },
      },
    });

    await this.notifyWorkshopStaff(
      'طلب جديد من بوابة العميل',
      `طلب ${order.order_number} بقيمة ${Number(order.total || 0).toLocaleString()} د.ج`,
      'order',
    );

    return order;
  }

  async getOrder(user: any, orderId: string) {
    const customerId = this.requireCustomerId(user);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { design: true } },
        statusHistory: { orderBy: { changed_at: 'asc' } },
        invoices: true,
        payments: true,
        machineJobs: { include: { machine: true } },
      },
    });
    if (!order || order.customer_id !== customerId) {
      throw new NotFoundException('الطلب غير موجود');
    }
    return order;
  }

  async getInvoices(user: any) {
    const customerId = this.requireCustomerId(user);
    const invoices = await this.prisma.invoice.findMany({
      where: { order: { customer_id: customerId } },
      include: {
        order: true,
        payments: { orderBy: { paid_at: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((inv) => {
      const paid = inv.payments
        .filter((p) => p.status !== 'rejected')
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      const remaining = Math.max(0, Number(inv.total_amount || 0) - paid);
      return {
        ...inv,
        paid_amount: paid,
        remaining_amount: remaining,
        derived_status: remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : inv.status || 'unpaid',
      };
    });
  }

  async getPayments(user: any) {
    const customerId = this.requireCustomerId(user);
    return this.prisma.payment.findMany({
      where: { customer_id: customerId },
      include: { order: true, invoice: true },
      orderBy: { paid_at: 'desc' },
    });
  }

  async getCatalog() {
    return this.prisma.design.findMany({
      where: {
        is_active: true,
        deleted_at: null,
        OR: [{ library_status: 'public' }, { visibility: 'public' }],
      },
      include: {
        category: true,
        versions: {
          include: { priceRules: true },
          orderBy: { version_number: 'desc' },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async getChatThreads(user: any) {
    const customerId = this.requireCustomerId(user);
    const orders = await this.prisma.order.findMany({
      where: { customer_id: customerId, deletedAt: null },
      include: {
        items: true,
        messages: {
          include: { user: true },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    return orders.map((o) => {
      const last = o.messages[0];
      return {
        order_id: o.id,
        order_number: o.order_number,
        status: o.status,
        title_ar: o.items?.[0]?.design_name_snapshot || o.order_number,
        last_message: last
          ? {
              body_ar: last.body_ar,
              at: last.created_at,
              from: last.user?.full_name_ar || 'مستخدم',
            }
          : null,
        unread_hint: !!last && last.user_id !== user.id,
      };
    });
  }

  async getChatMessages(user: any, orderId: string) {
    await this.getOrder(user, orderId);
    return this.prisma.orderMessage.findMany({
      where: { order_id: orderId },
      include: { user: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async postChatMessage(user: any, orderId: string, body_ar: string) {
    await this.getOrder(user, orderId);
    if (!body_ar?.trim()) throw new BadRequestException('نص الرسالة مطلوب');
    return this.prisma.orderMessage.create({
      data: {
        order_id: orderId,
        user_id: user.id,
        body_ar: body_ar.trim(),
      },
      include: { user: true },
    });
  }

  async getNotifications(user: any) {
    this.requireCustomerId(user);
    const data = await this.prisma.notification.findMany({
      where: { user_id: user.id, deletedAt: null },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    const unread = data.filter((n) => !n.is_read).length;
    return { data, unread };
  }

  async markNotificationsRead(user: any, id?: string) {
    this.requireCustomerId(user);
    if (id) {
      const n = await this.prisma.notification.findFirst({
        where: { id, user_id: user.id },
      });
      if (!n) throw new NotFoundException('الإشعار غير موجود');
      return this.prisma.notification.update({
        where: { id },
        data: { is_read: true, read_at: new Date() },
      });
    }
    return this.prisma.notification.updateMany({
      where: { user_id: user.id, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async getWhatsappContact(user: any) {
    const me = await this.getMe(user);
    const setting = await this.prisma.systemSettings.findFirst({
      where: { key: 'whatsapp_phone' },
    });
    const phone =
      (setting?.value as any)?.phone ||
      (typeof setting?.value === 'string' ? setting.value : null) ||
      '213555000000';
    const workshopName =
      ((await this.prisma.systemSettings.findFirst({ where: { key: 'workshop_name' } }))
        ?.value as any)?.name_ar || 'ورشة DecoZR';

    const message = encodeURIComponent(
      `مرحباً، أنا ${me.customer.name_ar} وأرغب بالتواصل بخصوص طلباتي.`
    );
    const digits = String(phone).replace(/\D/g, '');
    return {
      phone: digits,
      workshop_name: workshopName,
      wa_link: `https://wa.me/${digits}?text=${message}`,
      wa_embed: `https://web.whatsapp.com/send?phone=${digits}&text=${message}`,
      customer_name: me.customer.name_ar,
    };
  }

  async getSupportMessages(user: any) {
    const customerId = this.requireCustomerId(user);
    return this.prisma.portalSupportMessage.findMany({
      where: { customer_id: customerId },
      include: { sender: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async postSupportMessage(user: any, body_ar: string, attachment_url?: string) {
    const customerId = this.requireCustomerId(user);
    if (!body_ar?.trim() && !attachment_url) {
      throw new BadRequestException('نص الرسالة مطلوب');
    }
    return this.prisma.portalSupportMessage.create({
      data: {
        customer_id: customerId,
        sender_user_id: user.id,
        body_ar: (body_ar || '').trim() || 'مرفق',
        attachment_url: attachment_url || null,
      },
      include: { sender: true },
    }).then(async (msg) => {
      await this.notifyWorkshopStaff(
        'رسالة جديدة من بوابة العميل',
        (body_ar || '').trim().slice(0, 140) || 'مرفق',
        'support',
      );
      return msg;
    });
  }

  async getFavorites(user: any) {
    const customerId = this.requireCustomerId(user);
    return this.prisma.customerFavorite.findMany({
      where: { customer_id: customerId },
      include: { design: { include: { category: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async toggleFavorite(user: any, designId: string) {
    const customerId = this.requireCustomerId(user);
    const existing = await this.prisma.customerFavorite.findFirst({
      where: { customer_id: customerId, design_id: designId },
    });
    if (existing) {
      await this.prisma.customerFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await this.prisma.customerFavorite.create({
      data: { customer_id: customerId, design_id: designId },
    });
    return { favorited: true };
  }

  async getAppointments(user: any) {
    const customerId = this.requireCustomerId(user);
    let list = await this.prisma.customerAppointment.findMany({
      where: { customer_id: customerId },
      orderBy: { starts_at: 'asc' },
    });
    if (list.length === 0) {
      const base = new Date();
      base.setHours(10, 0, 0, 0);
      const samples = [
        { title_ar: 'زيارة موقع', notes: 'معاينة القياسات', days: 2 },
        { title_ar: 'تسليم مرحلي', notes: 'مراجعة نصف التنفيذ', days: 5 },
        { title_ar: 'موعد تركيب', notes: 'التركيب النهائي', days: 10 },
      ];
      await this.prisma.customerAppointment.createMany({
        data: samples.map((s) => {
          const d = new Date(base);
          d.setDate(d.getDate() + s.days);
          return {
            customer_id: customerId,
            title_ar: s.title_ar,
            notes: s.notes,
            starts_at: d,
            status: 'scheduled',
          };
        }),
      });
      list = await this.prisma.customerAppointment.findMany({
        where: { customer_id: customerId },
        orderBy: { starts_at: 'asc' },
      });
    }
    return list;
  }

  async getPaymentSummary(user: any) {
    const customerId = this.requireCustomerId(user);
    const orders = await this.prisma.order.findMany({
      where: { customer_id: customerId, deletedAt: null },
    });
    const payments = await this.prisma.payment.findMany({
      where: { customer_id: customerId, deletedAt: null },
      include: { order: true, invoice: true },
      orderBy: { paid_at: 'desc' },
    });
    const totalDue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalPaid = payments
      .filter((p) => p.status !== 'rejected')
      .reduce((s, p) => s + (p.amount || 0), 0);
    const byDay: Record<string, number> = {};
    for (const p of payments) {
      if (p.status === 'rejected') continue;
      const key = new Date(p.paid_at).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + Number(p.amount || 0);
    }
    const baridi =
      ((await this.prisma.systemSettings.findFirst({ where: { key: 'baridi_mob' } }))
        ?.value as any) || {
        account_name: 'ورشة DecoZR',
        rip: '00799999000000000000',
        phone: '0555000000',
        note_ar: 'أرسل الوصل بعد التحويل عبر بريدي موب',
      };

    return {
      currency: 'د.ج',
      total_due: totalDue,
      total_paid: totalPaid,
      remaining: Math.max(0, totalDue - totalPaid),
      payments,
      by_day: Object.entries(byDay)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
      unpaid_invoices: await this.getInvoices(user).then((list) =>
        list.filter((i: any) => i.derived_status !== 'paid'),
      ),
      methods: {
        baridi_mob: baridi,
        poste: {
          name_ar: 'مكتب البريد',
          note_ar: 'ادفع في مكتب البريد ثم ارفع صورة الوصل هنا',
        },
        app: {
          name_ar: 'تطبيق بنكي / دفع إلكتروني',
          note_ar: 'حوّل عبر تطبيقك البنكي ثم ارفع وصل PDF أو صورة',
        },
      },
    };
  }

  async submitPaymentProof(
    user: any,
    body: {
      amount: number;
      payment_method: string;
      reference?: string;
      notes?: string;
      receipt_url?: string;
      order_id?: string;
      invoice_id?: string;
    },
  ) {
    const customerId = this.requireCustomerId(user);
    const amount = Number(body.amount);
    if (!amount || amount <= 0) throw new BadRequestException('المبلغ غير صالح');
    if (!body.payment_method) throw new BadRequestException('وسيلة الدفع مطلوبة');

    let orderId = body.order_id || null;
    let invoiceId = body.invoice_id || null;
    if (invoiceId) {
      const inv = await this.prisma.invoice.findFirst({
        where: { id: invoiceId, order: { customer_id: customerId } },
        include: { order: true },
      });
      if (!inv) throw new BadRequestException('الفاتورة غير موجودة');
      invoiceId = inv.id;
      orderId = inv.order_id;
    }

    const count = await this.prisma.payment.count();
    const payment = await this.prisma.payment.create({
      data: {
        payment_number: `PAY-P-${String(count + 1).padStart(5, '0')}`,
        customer_id: customerId,
        order_id: orderId,
        invoice_id: invoiceId,
        amount,
        payment_method: body.payment_method,
        reference: body.reference || null,
        notes: body.notes || 'إثبات دفع من بوابة العميل',
        receipt_url: body.receipt_url || null,
        status: 'pending_review',
        recorded_by: user.id,
        paid_at: new Date(),
      },
      include: { invoice: true, order: true, customer: true },
    });

    await this.prisma.notification.create({
      data: {
        user_id: user.id,
        notification_type: 'payment',
        title_ar: 'تم استلام إثبات الدفع',
        body_ar: `سيتم مراجعة دفعتك بقيمة ${amount.toLocaleString()} د.ج${
          payment.invoice?.invoice_number ? ` للفاتورة ${payment.invoice.invoice_number}` : ''
        }.`,
      },
    });

    await this.notifyWorkshopStaff(
      'إثبات دفع جديد من البوابة',
      `${payment.customer?.name_ar || 'عميل'} أرسل ${amount.toLocaleString()} د.ج عبر ${body.payment_method}`,
      'payment',
    );

    return payment;
  }

  async updateProfile(
    user: any,
    body: { name_ar?: string; phone?: string; city?: string; address_ar?: string; avatar_url?: string },
  ) {
    const customerId = this.requireCustomerId(user);
    const data: any = {};
    if (body.name_ar?.trim()) data.name_ar = body.name_ar.trim();
    if (body.phone?.trim()) data.phone = body.phone.trim();
    if (body.city !== undefined) data.city = body.city?.trim() || null;
    if (body.address_ar !== undefined) data.address_ar = body.address_ar?.trim() || null;
    if (body.avatar_url !== undefined) data.avatar_url = body.avatar_url || null;
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data,
      include: { priceList: true },
    });
    if (data.name_ar) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { full_name_ar: data.name_ar },
      });
    }
    return { customer, user: await this.prisma.user.findUnique({ where: { id: user.id } }) };
  }

  async getCustomRequests(user: any) {
    const customerId = this.requireCustomerId(user);
    return this.prisma.customDesignRequest.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createCustomRequest(
    user: any,
    body: {
      request_type: string;
      title_ar: string;
      description_ar: string;
      width_cm?: number;
      height_cm?: number;
      depth_cm?: number;
      material_hint?: string;
      reference_image?: string;
    },
  ) {
    const customerId = this.requireCustomerId(user);
    if (!body?.title_ar?.trim() || !body?.description_ar?.trim()) {
      throw new BadRequestException('العنوان والوصف مطلوبان');
    }
    if (!body.request_type) throw new BadRequestException('نوع الطلب مطلوب');
    const req = await this.prisma.customDesignRequest.create({
      data: {
        customer_id: customerId,
        request_type: body.request_type,
        title_ar: body.title_ar.trim(),
        description_ar: body.description_ar.trim(),
        width_cm: body.width_cm != null ? Number(body.width_cm) : null,
        height_cm: body.height_cm != null ? Number(body.height_cm) : null,
        depth_cm: body.depth_cm != null ? Number(body.depth_cm) : null,
        material_hint: body.material_hint || null,
        reference_image: body.reference_image || null,
      },
    });
    await this.prisma.notification.create({
      data: {
        user_id: user.id,
        notification_type: 'custom_design',
        title_ar: 'تم استلام طلب تصميم خاص',
        body_ar: `طلبك «${req.title_ar}» قيد المراجعة من الورشة.`,
      },
    });
    await this.notifyWorkshopStaff(
      'طلب تصميم خاص جديد',
      `طلب «${req.title_ar}» (${body.request_type}) من بوابة العميل`,
      'custom_design',
    );
    return req;
  }

  private async notifyWorkshopStaff(title_ar: string, body_ar: string, type = 'portal') {
    const staff = await this.prisma.user.findMany({
      where: {
        deleted_at: null,
        customer_id: null,
      },
      take: 25,
    });
    for (const u of staff) {
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

  async ensureWelcomeNotification(userId: string) {
    const count = await this.prisma.notification.count({ where: { user_id: userId } });
    if (count > 0) return;
    await this.prisma.notification.createMany({
      data: [
        {
          user_id: userId,
          notification_type: 'welcome',
          title_ar: 'مرحبًا بك في بوابة DecoZR',
          body_ar: 'يمكنك متابعة طلباتك والدردشة مع الورشة من هنا.',
        },
        {
          user_id: userId,
          notification_type: 'tip',
          title_ar: 'تصفّح الكتالوج',
          body_ar: 'اكتشف التصاميم المتاحة وأضف ما يناسبك لطلب التنفيذ.',
        },
      ],
    });
  }
}
