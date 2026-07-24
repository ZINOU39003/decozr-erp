import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [revenueAgg, activeOrdersCount, pendingJobsCount, topItems] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: { status: 'delivered', deletedAt: null },
          _sum: { total: true },
        }),
        this.prisma.order.count({
          where: {
            deletedAt: null,
            status: { notIn: ['delivered', 'cancelled', 'completed'] },
          },
        }),
        this.prisma.machineJob.count({
          where: { status: { in: ['pending', 'in_progress'] } },
        }),
        this.prisma.orderItem.groupBy({
          by: ['design_id', 'design_name_snapshot'],
          _sum: { quantity: true, line_total: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        }),
      ]);

    return {
      total_revenue: revenueAgg._sum.total || 0,
      active_orders: activeOrdersCount,
      pending_machine_jobs: pendingJobsCount,
      top_designs: topItems.map((i) => ({
        name: i.design_name_snapshot,
        quantity: i._sum.quantity || 0,
        revenue: i._sum.line_total || 0,
      })),
    };
  }

  async getAlerts() {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 3600 * 1000);

    const [
      lateOrders,
      dueSoonOrders,
      unpaidInvoices,
      highDebtCustomers,
      lowStock,
      pendingPayments,
      openDesigns,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          deletedAt: null,
          status: { notIn: ['delivered', 'completed', 'cancelled'] },
          OR: [
            { due_date: { lt: now } },
            { promised_date: { lt: now } },
          ],
        },
        include: { customer: { select: { id: true, name_ar: true, phone: true } } },
        orderBy: { due_date: 'asc' },
        take: 30,
      }),
      this.prisma.order.findMany({
        where: {
          deletedAt: null,
          status: { notIn: ['delivered', 'completed', 'cancelled'] },
          OR: [
            { due_date: { gte: now, lte: in3Days } },
            { promised_date: { gte: now, lte: in3Days } },
          ],
        },
        include: { customer: { select: { id: true, name_ar: true } } },
        take: 20,
      }),
      this.prisma.invoice.findMany({
        where: {
          deletedAt: null,
          status: { in: ['unpaid', 'partial', 'overdue'] },
        },
        include: {
          order: { include: { customer: { select: { id: true, name_ar: true } } } },
          payments: { select: { amount: true, status: true } },
        },
        take: 40,
      }),
      this.prisma.customer.findMany({
        where: { deleted_at: null, balance: { gt: 0 } },
        orderBy: { balance: 'desc' },
        take: 20,
        select: {
          id: true,
          name_ar: true,
          phone: true,
          balance: true,
          code: true,
        },
      }),
      this.prisma.material.findMany({
        where: { deletedAt: null, is_active: true },
        take: 200,
      }),
      this.prisma.payment.findMany({
        where: {
          deletedAt: null,
          status: { in: ['pending_review', 'pending'] },
        },
        include: {
          customer: { select: { id: true, name_ar: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 30,
      }),
      this.prisma.customDesignRequest.findMany({
        where: { status: { in: ['new', 'reviewing'] } },
        include: { customer: { select: { id: true, name_ar: true } } },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
    ]);

    const shortages = lowStock
      .filter((m) => Number(m.current_stock) <= Number(m.min_stock_level))
      .slice(0, 30)
      .map((m) => ({
        id: m.id,
        name_ar: m.name_ar,
        sku: m.sku,
        current_stock: m.current_stock,
        min_stock_level: m.min_stock_level,
        unit: m.unit,
      }));

    const invoicesMapped = unpaidInvoices.map((inv) => {
      const paid = (inv.payments || [])
        .filter((p) => {
          const st = (p.status || 'confirmed').toLowerCase();
          return !['pending', 'pending_review', 'rejected'].includes(st);
        })
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      const total = Number(inv.total_amount || 0);
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        status: inv.status,
        total_amount: total,
        paid_amount: paid,
        remaining: Math.max(0, total - paid),
        customer: inv.order?.customer,
        order_id: inv.order_id,
      };
    });

    const counts = {
      late_orders: lateOrders.length,
      due_soon: dueSoonOrders.length,
      unpaid_invoices: invoicesMapped.length,
      high_debt: highDebtCustomers.length,
      shortages: shortages.length,
      pending_payments: pendingPayments.length,
      open_designs: openDesigns.length,
    };

    return {
      counts,
      total_alerts: Object.values(counts).reduce((a, b) => a + b, 0),
      late_orders: lateOrders.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        due_date: o.due_date || o.promised_date,
        total: o.total,
        customer: o.customer,
      })),
      due_soon: dueSoonOrders.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        due_date: o.due_date || o.promised_date,
        customer: o.customer,
      })),
      unpaid_invoices: invoicesMapped,
      high_debt_customers: highDebtCustomers,
      shortages,
      pending_payments: pendingPayments.map((p) => ({
        id: p.id,
        payment_number: p.payment_number,
        amount: p.amount,
        status: p.status,
        customer: p.customer,
        paid_at: p.paid_at,
      })),
      open_design_requests: openDesigns.map((d) => ({
        id: d.id,
        title_ar: d.title_ar,
        status: d.status,
        customer: d.customer,
        created_at: d.created_at,
      })),
    };
  }
}
