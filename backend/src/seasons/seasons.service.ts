import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeasonsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.season.findMany({
      include: { designSeasons: { include: { design: true } } },
      orderBy: [{ priority: 'desc' }, { start_date: 'asc' }],
    });
  }

  async findOne(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: { designSeasons: { include: { design: true } } },
    });
    if (!season) throw new NotFoundException('Season not found');
    return season;
  }

  async create(data: {
    name_ar: string;
    start_date: string | Date;
    end_date: string | Date;
    priority?: number;
    is_active?: boolean;
  }) {
    return this.prisma.season.create({
      data: {
        name_ar: data.name_ar,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        priority: data.priority ?? 0,
        is_active: data.is_active ?? true,
      },
    });
  }

  async update(id: string, data: Partial<{
    name_ar: string;
    start_date: string | Date;
    end_date: string | Date;
    priority: number;
    is_active: boolean;
  }>) {
    await this.findOne(id);
    const payload: any = { ...data };
    if (data.start_date) payload.start_date = new Date(data.start_date);
    if (data.end_date) payload.end_date = new Date(data.end_date);
    return this.prisma.season.update({ where: { id }, data: payload });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.designSeason.deleteMany({ where: { season_id: id } });
    return this.prisma.season.delete({ where: { id } });
  }

  async linkDesign(seasonId: string, designId: string) {
    await this.findOne(seasonId);
    return this.prisma.designSeason.upsert({
      where: {
        design_id_season_id: { design_id: designId, season_id: seasonId },
      },
      update: {},
      create: { design_id: designId, season_id: seasonId },
    });
  }

  async unlinkDesign(seasonId: string, designId: string) {
    return this.prisma.designSeason.delete({
      where: {
        design_id_season_id: { design_id: designId, season_id: seasonId },
      },
    });
  }

  async getActiveSeasons() {
    const now = new Date();
    return this.prisma.season.findMany({
      where: {
        is_active: true,
        start_date: { lte: now },
        end_date: { gte: now },
      },
      include: { designSeasons: { include: { design: true } } },
      orderBy: { priority: 'desc' },
    });
  }
}
