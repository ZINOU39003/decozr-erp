import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DesignVersionsService {
  constructor(private prisma: PrismaService) {}

  async findAllByDesignId(designId: string) {
    return this.prisma.designVersion.findMany({
      where: { design_id: designId },
      orderBy: { version_number: 'desc' },
      include: {
        customizationOptions: true,
        bomMaterials: { include: { material: true } },
        bomLabor: { include: { machine: true } },
        priceRules: true,
      },
    });
  }

  async findOne(id: string) {
    const version = await this.prisma.designVersion.findUnique({
      where: { id },
      include: {
        customizationOptions: true,
        bomMaterials: { include: { material: true } },
        bomLabor: { include: { machine: true } },
        priceRules: true,
        versionFiles: { include: { file: true } },
      },
    });
    if (!version) throw new NotFoundException('Design version not found');
    return version;
  }

  async create(userId: string, designId: string, data: any) {
    // Determine the next version number
    const latestVersion = await this.prisma.designVersion.findFirst({
      where: { design_id: designId },
      orderBy: { version_number: 'desc' },
    });
    
    const versionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    return this.prisma.designVersion.create({
      data: {
        design_id: designId,
        version_number: versionNumber,
        created_by: userId,
        status: data.status || 'draft',
        changelog: data.changelog,
        manufacturing_time_minutes: data.manufacturing_time_minutes || 0,
        requires_printing: data.requires_printing || false,
        requires_assembly: data.requires_assembly || false,
        requires_led: data.requires_led || false,
        size_customizable: data.size_customizable ?? true,
        color_customizable: data.color_customizable ?? true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.designVersion.update({
      where: { id },
      data,
    });
  }

  // --- Customization Options ---

  async addCustomizationOption(versionId: string, data: any) {
    return this.prisma.designCustomizationOption.create({
      data: {
        ...data,
        design_version_id: versionId,
      },
    });
  }

  async removeCustomizationOption(optionId: string) {
    return this.prisma.designCustomizationOption.delete({
      where: { id: optionId },
    });
  }

  // --- BOM Materials ---

  async addBomMaterial(versionId: string, data: any) {
    return this.prisma.designBomMaterial.create({
      data: {
        ...data,
        design_version_id: versionId,
      },
    });
  }

  async removeBomMaterial(bomMaterialId: string) {
    return this.prisma.designBomMaterial.delete({
      where: { id: bomMaterialId },
    });
  }

  // --- BOM Labor ---

  async addBomLabor(versionId: string, data: any) {
    return this.prisma.designBomLabor.create({
      data: {
        ...data,
        design_version_id: versionId,
      },
    });
  }

  async removeBomLabor(bomLaborId: string) {
    return this.prisma.designBomLabor.delete({
      where: { id: bomLaborId },
    });
  }

  // --- Price Rules ---

  async setPriceRule(versionId: string, data: any) {
    return this.prisma.designPriceRule.upsert({
      where: {
        design_version_id_price_list_id: {
          design_version_id: versionId,
          price_list_id: data.price_list_id,
        },
      },
      update: {
        base_price: data.base_price,
        option_modifiers: data.option_modifiers,
      },
      create: {
        design_version_id: versionId,
        price_list_id: data.price_list_id,
        base_price: data.base_price,
        option_modifiers: data.option_modifiers,
      },
    });
  }

  // --- Version Files ---

  async addVersionFile(versionId: string, data: { file_id: string; file_role: string; sort_order?: number }) {
    return this.prisma.designVersionFile.create({
      data: {
        design_version_id: versionId,
        file_id: data.file_id,
        file_role: data.file_role,
        sort_order: data.sort_order || 0,
      },
    });
  }

  async removeVersionFile(versionFileId: string) {
    return this.prisma.designVersionFile.delete({
      where: { id: versionFileId },
    });
  }
}
