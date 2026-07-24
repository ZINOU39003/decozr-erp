import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { stage: { contains: search } },
        { notes: { contains: search } },
        { order: { order_number: { contains: search } } },
      ];
    }

    const orderField =
      !sortBy || sortBy === 'created_at' || sortBy === 'createdAt' ? 'createdAt' : sortBy;

    const [data, total] = await Promise.all([
      this.prisma.orderProductionTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        include: {
          worker: true,
          order: true,
        },
      }),
      this.prisma.orderProductionTask.count({ where }),
    ]);

    return { data, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async create(data: any) {
    return this.prisma.orderProductionTask.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.orderProductionTask.update({ where: { id }, data });
  }

  async completeTask(id: string) {
    return this.prisma.orderProductionTask.update({
      where: { id },
      data: {
        task_status: 'completed',
        completed_at: new Date(),
      },
    });
  }
}
