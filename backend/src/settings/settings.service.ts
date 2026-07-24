import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.systemSettings.findMany({
      orderBy: { key: 'asc' },
    });
    return settings.reduce((acc: Record<string, unknown>, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }

  async getPublicStorefront() {
    const row = await this.prisma.systemSettings.findUnique({
      where: { key: 'storefront' },
    });
    const defaults = {
      brand_name: 'DecoZR',
      tagline_ar: 'نظام متكامل لإدارة صناعة الأثاث والديكور',
      hero_title_ar: 'نصنع ديكورك باحتراف',
      hero_subtitle_ar: 'تصاميم ليزر، CNC، وطباعة حسب الطلب',
      hero_image_url: '',
      logo_url: '',
      phone: '',
      whatsapp: '',
      email: 'contact@decozr.com',
      address_ar: '',
      city: 'الجزائر',
      facebook: '',
      instagram: '',
      about_ar: '',
      working_hours_ar: 'السبت – الخميس · 9:00 – 18:00',
    };
    return { ...defaults, ...((row?.value as object) || {}) };
  }

  async upsert(key: string, value: unknown, updatedById?: string | null) {
    const updater = updatedById && updatedById !== 'system' ? updatedById : null;
    return this.prisma.systemSettings.upsert({
      where: { key },
      update: { value: value as any, updated_by: updater },
      create: { key, value: value as any, updated_by: updater },
    });
  }

  async bulkUpsert(data: Record<string, unknown>, updatedById?: string | null) {
    const updater = updatedById && updatedById !== 'system' ? updatedById : null;
    const operations = Object.entries(data).map(([key, value]) =>
      this.prisma.systemSettings.upsert({
        where: { key },
        update: { value: value as any, updated_by: updater },
        create: { key, value: value as any, updated_by: updater },
      }),
    );
    return this.prisma.$transaction(operations);
  }
}

