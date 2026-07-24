import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { user_id: userId, deletedAt: null };
    const [data, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, is_read: false } }),
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit), unread },
    };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false, deletedAt: null },
    });
    return { count };
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async markRead(id: string, userId?: string) {
    if (userId) {
      const row = await this.prisma.notification.findFirst({
        where: { id, user_id: userId, deletedAt: null },
      });
      if (!row) throw new NotFoundException('الإشعار غير موجود');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async create(data: {
    user_id: string;
    title_ar: string;
    body_ar: string;
    notification_type?: string;
    link?: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        user_id: data.user_id,
        title_ar: data.title_ar,
        body_ar: data.body_ar,
        notification_type: data.notification_type || 'info',
        metadata: data.metadata
          ? { ...data.metadata, ...(data.link ? { link: data.link } : {}) }
          : data.link
            ? { link: data.link }
            : undefined,
      },
    });
  }

  async notifyWorkshopStaff(
    title_ar: string,
    body_ar: string,
    type = 'workshop',
    metadata?: any,
  ) {
    const staff = await this.prisma.user.findMany({
      where: { deleted_at: null, customer_id: null },
      take: 40,
      select: { id: true },
    });
    if (!staff.length) return [];
    await this.prisma.notification.createMany({
      data: staff.map((u) => ({
        user_id: u.id,
        notification_type: type,
        title_ar,
        body_ar,
        metadata: metadata || undefined,
      })),
    });
    return staff;
  }

  async notifyCustomerUsers(
    customerId: string,
    title_ar: string,
    body_ar: string,
    type = 'order_status',
    metadata?: any,
  ) {
    const users = await this.prisma.user.findMany({
      where: { customer_id: customerId, deleted_at: null },
      select: { id: true },
    });
    for (const u of users) {
      await this.create({
        user_id: u.id,
        title_ar,
        body_ar,
        notification_type: type,
        metadata,
      });
    }
    return users.length;
  }
}
