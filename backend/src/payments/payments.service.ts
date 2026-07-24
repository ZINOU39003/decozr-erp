import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, sortBy = 'paid_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          invoice: { include: { order: { include: { customer: true } } } },
          recorder: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async record(data: {
    invoice_id: string;
    amount: number;
    payment_method: string;
    notes?: string;
    recorded_by: string;
    customer_id: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const payment_number = `PAY-${Date.now()}`;
      const payment = await tx.payment.create({ 
        data: {
          ...data,
          payment_number,
          paid_at: new Date(),
        }
      });

      // Update invoice payment status
      const invoice = await tx.invoice.findUnique({
        where: { id: data.invoice_id },
        include: { payments: true },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;
        const status = totalPaid >= invoice.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
        await tx.invoice.update({ where: { id: invoice.id }, data: { status } });
      }

      return payment;
    });
  }
}
