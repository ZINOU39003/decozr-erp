import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getProfitReport() {
    // Only fetch delivered orders for real profit
    const deliveredOrders = await this.prisma.order.findMany({
      where: { status: 'delivered' },
      include: {
        items: true,
      }
    });

    let totalRevenue = 0;
    let totalMaterialCost = 0;
    let totalLaborCost = 0;

    const orderProfits = deliveredOrders.map(order => {
      let orderMaterialCost = 0;
      let orderLaborCost = 0;

      for (const item of order.items) {
        const bom = item.computed_bom_snapshot as any;
        if (bom && bom.materials) {
          orderMaterialCost += bom.materials.reduce((sum: number, m: any) => sum + (m.unit_cost * m.quantity), 0);
        }
        if (bom && bom.labor) {
          orderLaborCost += bom.labor.reduce((sum: number, l: any) => sum + (l.machine_cost_per_minute * l.time_minutes), 0);
        }
      }

      const orderProfit = order.total - (orderMaterialCost + orderLaborCost);

      totalRevenue += order.total;
      totalMaterialCost += orderMaterialCost;
      totalLaborCost += orderLaborCost;

      return {
        order_number: order.order_number,
        revenue: order.total,
        material_cost: orderMaterialCost,
        labor_cost: orderLaborCost,
        profit: orderProfit,
        delivered_at: order.delivered_at || order.updated_at
      };
    });

    return {
      summary: {
        total_revenue: totalRevenue,
        total_material_cost: totalMaterialCost,
        total_labor_cost: totalLaborCost,
        total_profit: totalRevenue - (totalMaterialCost + totalLaborCost),
        margin_pct: totalRevenue > 0 ? ((totalRevenue - (totalMaterialCost + totalLaborCost)) / totalRevenue) * 100 : 0
      },
      orders: orderProfits
    };
  }
}
