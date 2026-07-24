import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MaterialWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name_ar: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const orderField =
      !sortBy || sortBy === 'created_at' || sortBy === 'createdAt' ? 'createdAt' : sortBy;

    const [data, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      this.prisma.material.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });
    if (!material) throw new NotFoundException(`Material with ID ${id} not found`);
    return material;
  }

  async getLowStock() {
    return this.prisma.material.findMany({
      where: {
        deletedAt: null,
        current_stock: { lte: this.prisma.material.fields.min_stock_level as any },
      },
    });
  }

  async create(data: Prisma.MaterialCreateInput) {
    return this.prisma.material.create({ data });
  }

  async update(id: string, data: Prisma.MaterialUpdateInput) {
    return this.prisma.material.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.material.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
