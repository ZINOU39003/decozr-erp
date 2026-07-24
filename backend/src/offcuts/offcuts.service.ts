import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OffcutsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.offcutPiece.findMany({
      include: { material: true, sourceOrder: true, usedInOrder: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const offcut = await this.prisma.offcutPiece.findUnique({
      where: { id },
      include: { material: true, sourceOrder: true, usedInOrder: true },
    });
    if (!offcut) throw new NotFoundException('Offcut not found');
    return offcut;
  }

  async create(data: {
    material_id: string;
    width_cm: number;
    height_cm: number;
    source_order_id?: string;
    status?: string;
    location?: string;
    notes?: string;
  }) {
    return this.prisma.offcutPiece.create({
      data: {
        material_id: data.material_id,
        width_cm: data.width_cm,
        height_cm: data.height_cm,
        source_order_id: data.source_order_id,
        status: data.status || 'available',
        location: data.location,
        notes: data.notes,
      },
      include: { material: true },
    });
  }

  async update(id: string, data: Partial<{
    width_cm: number;
    height_cm: number;
    status: string;
    location: string;
    notes: string;
    used_in_order_id: string;
  }>) {
    await this.findOne(id);
    return this.prisma.offcutPiece.update({
      where: { id },
      data,
      include: { material: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.offcutPiece.delete({ where: { id } });
  }

  /** Find available offcuts that fit the required dimensions (either orientation). */
  async findAvailable(materialId: string, widthCm: number, heightCm: number) {
    const candidates = await this.prisma.offcutPiece.findMany({
      where: {
        material_id: materialId,
        status: 'available',
      },
      include: { material: true },
      orderBy: [{ width_cm: 'asc' }, { height_cm: 'asc' }],
    });

    return candidates.filter((o) => {
      const fitsNormal = o.width_cm >= widthCm && o.height_cm >= heightCm;
      const fitsRotated = o.width_cm >= heightCm && o.height_cm >= widthCm;
      return fitsNormal || fitsRotated;
    });
  }
}
