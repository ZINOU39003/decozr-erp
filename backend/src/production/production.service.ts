import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) {}

  private materialIdFromBomRow(m: any): string | null {
    return m?.material_id || m?.id || null;
  }

  private minutesFromLabor(l: any): number {
    return Number(l?.minutes ?? l?.time_minutes ?? 0) || 0;
  }

  async getShortageReport(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const shortages = [];
    const requiredMaterials = new Map<string, number>();

    for (const item of order.items) {
      const bom = item.computed_bom_snapshot as any;
      if (bom && bom.materials) {
        for (const m of bom.materials) {
          const materialId = this.materialIdFromBomRow(m);
          if (!materialId) continue;
          const current = requiredMaterials.get(materialId) || 0;
          requiredMaterials.set(materialId, current + (Number(m.quantity) || 0));
        }
      }
    }

    for (const [materialId, reqQty] of requiredMaterials.entries()) {
      const material = await this.prisma.material.findUnique({ where: { id: materialId } });
      if (material) {
        if (material.current_stock < reqQty) {
          shortages.push({
            material: material.name_ar,
            required: reqQty,
            available: material.current_stock,
            shortage: reqQty - material.current_stock,
            unit: material.unit,
          });
        }
      }
    }

    return { has_shortage: shortages.length > 0, shortages };
  }

  async startProduction(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.inventory_deducted) {
      throw new BadRequestException('Inventory already deducted for this order');
    }

    let resolvedUserId = userId;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const admin = await this.prisma.user.findFirst({
        where: { email: 'admin@decozr.local' },
      });
      if (!admin) throw new BadRequestException('مستخدم النظام غير موجود');
      resolvedUserId = admin.id;
    }

    for (const item of order.items) {
      const bom = item.computed_bom_snapshot as any;
      if (bom && bom.materials) {
        for (const m of bom.materials) {
          const materialId = this.materialIdFromBomRow(m);
          if (!materialId) continue;
          const material = await this.prisma.material.findUnique({ where: { id: materialId } });
          if (material) {
            const qty = Number(m.quantity) || 0;
            await this.prisma.inventoryMovement.create({
              data: {
                material_id: material.id,
                order_id: order.id,
                movement_type: 'manufacturing_deduct',
                quantity: -qty,
                stock_before: material.current_stock,
                stock_after: material.current_stock - qty,
                created_by: resolvedUserId,
                notes: `Deducted for order ${order.order_number}`,
              },
            });
            await this.prisma.material.update({
              where: { id: material.id },
              data: { current_stock: material.current_stock - qty },
            });
          }
        }
      }

      if (bom && bom.labor) {
        for (const l of bom.labor) {
          if (l.machine_id) {
            await this.prisma.machineJob.create({
              data: {
                order_id: order.id,
                order_item_id: item.id,
                machine_id: l.machine_id,
                production_stage: l.production_stage || 'cutting',
                estimated_minutes: this.minutesFromLabor(l),
                status: 'pending',
              },
            });
          }
        }
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'in_cutting',
        inventory_deducted: true,
        statusHistory: {
          create: {
            from_status: order.status,
            to_status: 'in_cutting',
            changed_by: resolvedUserId,
            notes: 'Started production, inventory deducted, machine jobs generated.',
          },
        },
      },
      include: {
        items: true,
        machineJobs: { include: { machine: true } },
        customer: true,
      },
    });

    return updatedOrder;
  }
}
