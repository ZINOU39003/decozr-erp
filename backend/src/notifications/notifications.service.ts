import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { user_id: userId, deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async create(data: { user_id: string; title_ar: string; body_ar: string; notification_type?: string; link?: string }) {
    return this.prisma.notification.create({ data: { ...data, notification_type: data.notification_type || 'info' } });
  }
}
