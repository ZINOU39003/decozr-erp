import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'issue_date', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { invoice_number: { contains: search } },
        { order: { customer: { name_ar: { contains: search } } } },
      ];
    }

    const allowedSort = new Set([
      'issue_date',
      'invoice_number',
      'total_amount',
      'status',
      'createdAt',
      'updatedAt',
    ]);
    const orderField =
      sortBy === 'created_at' || sortBy === 'createdAt'
        ? 'createdAt'
        : allowedSort.has(sortBy || '')
          ? sortBy!
          : 'issue_date';

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        include: {
          order: { include: { customer: true } },
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const enriched = data.map((inv) => ({
      ...inv,
      paid_amount: inv.payments.reduce((sum: number, p: any) => sum + p.amount, 0),
      remaining_amount: inv.total_amount - inv.payments.reduce((sum: number, p: any) => sum + p.amount, 0),
    }));

    return {
      data: enriched,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: { include: { customer: true } },
        payments: { include: { recorder: true } },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice with ID ${id} not found`);
    return invoice;
  }

  async create(data: any) {
    return this.prisma.invoice.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.invoice.update({ where: { id }, data });
  }
}
