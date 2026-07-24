import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name_ar: { contains: search } },
        { phone: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const orderField =
      !sortBy || sortBy === 'created_at' || sortBy === 'createdAt' ? 'createdAt' : sortBy;

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderField]: sortOrder,
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async create(data: Prisma.SupplierCreateInput) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
