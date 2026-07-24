import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getOrderWorkspace(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        currentStage: true,
        items: {
          include: {
            design: true,
            designVersion: true,
          },
        },
        orderFiles: { include: { file: true } },
        payments: true,
        invoices: true,
        machineJobs: { include: { machine: true, worker: true } },
        statusHistory: {
          include: { changer: true },
          orderBy: { changed_at: 'desc' },
        },
        productionTasks: { include: { worker: true } },
        messages: {
          include: { user: true, attachment: true },
          orderBy: { created_at: 'asc' },
        },
        offcutsCreated: { include: { material: true } },
        offcutsUsed: { include: { material: true } },
        activities: {
          include: { creator: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const timeline = await this.buildTimeline(orderId, order.customer_id);

    return {
      order,
      timeline,
      summary: {
        total: order.total,
        paid: order.paid_amount,
        remaining: order.total - order.paid_amount,
        items_count: order.items.length,
        messages_count: order.messages.length,
        jobs_count: order.machineJobs.length,
      },
    };
  }

  async buildTimeline(orderId: string, customerId: string) {
    const [messages, activities, statusHistory, payments] = await Promise.all([
      this.prisma.orderMessage.findMany({
        where: { order_id: orderId },
        include: { user: true },
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.customerActivity.findMany({
        where: {
          OR: [{ order_id: orderId }, { customer_id: customerId }],
        },
        include: { creator: true },
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.orderStatusHistory.findMany({
        where: { order_id: orderId },
        include: { changer: true },
        orderBy: { changed_at: 'asc' },
      }),
      this.prisma.payment.findMany({
        where: { order_id: orderId },
        orderBy: { paid_at: 'asc' },
      }),
    ]);

    const events: Array<{
      type: string;
      at: Date;
      title_ar: string;
      body_ar?: string | null;
      meta?: any;
    }> = [];

    for (const m of messages) {
      events.push({
        type: 'message',
        at: m.created_at,
        title_ar: `رسالة من ${m.user.full_name_ar}`,
        body_ar: m.body_ar,
        meta: { message_id: m.id, user_id: m.user_id },
      });
    }

    for (const a of activities) {
      events.push({
        type: a.activity_type,
        at: a.created_at,
        title_ar: a.title_ar,
        body_ar: a.body_ar,
        meta: { activity_id: a.id },
      });
    }

    for (const s of statusHistory) {
      events.push({
        type: 'status_change',
        at: s.changed_at,
        title_ar: `تغيير الحالة: ${s.from_status || '—'} → ${s.to_status}`,
        body_ar: s.notes,
        meta: { history_id: s.id },
      });
    }

    for (const p of payments) {
      events.push({
        type: 'payment',
        at: p.paid_at,
        title_ar: `دفعة ${p.amount} د.ج`,
        body_ar: p.notes,
        meta: { payment_id: p.id, amount: p.amount },
      });
    }

    events.sort((a, b) => a.at.getTime() - b.at.getTime());
    return events;
  }

  async listMessages(orderId: string) {
    return this.prisma.orderMessage.findMany({
      where: { order_id: orderId },
      include: { user: true, attachment: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async createMessage(orderId: string, data: {
    user_id?: string;
    body_ar: string;
    attachment_file_id?: string;
  }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!data.body_ar?.trim()) throw new BadRequestException('نص الرسالة مطلوب');

    let userId = data.user_id;
    if (!userId) {
      const admin = await this.prisma.user.findFirst({
        where: { email: 'admin@decozr.local' },
      });
      userId = admin?.id;
    }
    if (!userId) throw new NotFoundException('المستخدم غير موجود');

    return this.prisma.orderMessage.create({
      data: {
        order_id: orderId,
        user_id: userId,
        body_ar: data.body_ar.trim(),
        attachment_file_id: data.attachment_file_id,
      },
      include: { user: true, attachment: true },
    });
  }

  async deleteMessage(messageId: string) {
    const msg = await this.prisma.orderMessage.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    return this.prisma.orderMessage.delete({ where: { id: messageId } });
  }

  async createActivity(data: {
    customer_id: string;
    order_id?: string;
    activity_type: string;
    title_ar: string;
    body_ar?: string;
    created_by?: string;
  }) {
    return this.prisma.customerActivity.create({
      data: {
        customer_id: data.customer_id,
        order_id: data.order_id,
        activity_type: data.activity_type,
        title_ar: data.title_ar,
        body_ar: data.body_ar,
        created_by: data.created_by,
      },
      include: { creator: true },
    });
  }

  async listCustomerActivities(customerId: string) {
    return this.prisma.customerActivity.findMany({
      where: { customer_id: customerId },
      include: { creator: true, order: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
