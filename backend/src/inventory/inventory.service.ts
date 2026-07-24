import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryMovementWhereInput = {
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          material: true,
          creator: { select: { id: true, full_name_ar: true } },
          order: { select: { id: true } },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async getStockSummary() {
    const materials = await this.prisma.material.findMany({
      where: { deletedAt: null },
      include: {
        inventoryMovements: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    return materials.map((m) => ({
      ...m,
      isLowStock: m.current_stock <= m.min_stock_level,
      lastMovement: m.inventoryMovements[0] ?? null,
    }));
  }

  async recordMovement(data: {
    material_id: string;
    movement_type: string;
    quantity: number;
    notes?: string;
    performed_by_id: string;
    order_id?: string;
  }) {
    const { material_id, quantity, movement_type } = data;

    // Use a transaction to record movement and update stock
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: {
          material_id,
          movement_type,
          quantity,
          notes: data.notes,
          created_by: data.performed_by_id,
          order_id: data.order_id,
          stock_before: 0, // Should read actual before setting
          stock_after: 0,
        },
      });

      // Update material quantity based on movement type
      const quantityChange = movement_type === 'manufacturing_deduct' ? -quantity : quantity;
      await tx.material.update({
        where: { id: material_id },
        data: { current_stock: { increment: quantityChange } },
      });

      return movement;
    });
  }
}
