import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { DesignVersionsService } from './design-versions.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('designs/:designId/versions')
export class DesignVersionsController {
  constructor(private readonly versionsService: DesignVersionsService) {}

  @Get()
  async getVersions(@Param('designId') designId: string) {
    return this.versionsService.findAllByDesignId(designId);
  }

  @Post()
  async createVersion(@Request() req, @Param('designId') designId: string, @Body() data: any) {
    return this.versionsService.create(req.user.id, designId, data);
  }

  @Get(':versionId')
  async getVersionById(@Param('versionId') versionId: string) {
    return this.versionsService.findOne(versionId);
  }

  @Put(':versionId')
  async updateVersion(@Param('versionId') versionId: string, @Body() data: any) {
    return this.versionsService.update(versionId, data);
  }

  // --- Customization Options ---

  @Post(':versionId/customization-options')
  async addCustomizationOption(@Param('versionId') versionId: string, @Body() data: any) {
    return this.versionsService.addCustomizationOption(versionId, data);
  }

  @Delete(':versionId/customization-options/:optionId')
  async removeCustomizationOption(@Param('optionId') optionId: string) {
    return this.versionsService.removeCustomizationOption(optionId);
  }

  // --- BOM Materials ---

  @Post(':versionId/bom-materials')
  async addBomMaterial(@Param('versionId') versionId: string, @Body() data: any) {
    return this.versionsService.addBomMaterial(versionId, data);
  }

  @Delete(':versionId/bom-materials/:bomMaterialId')
  async removeBomMaterial(@Param('bomMaterialId') bomMaterialId: string) {
    return this.versionsService.removeBomMaterial(bomMaterialId);
  }

  // --- BOM Labor ---

  @Post(':versionId/bom-labor')
  async addBomLabor(@Param('versionId') versionId: string, @Body() data: any) {
    return this.versionsService.addBomLabor(versionId, data);
  }

  @Delete(':versionId/bom-labor/:bomLaborId')
  async removeBomLabor(@Param('bomLaborId') bomLaborId: string) {
    return this.versionsService.removeBomLabor(bomLaborId);
  }

  // --- Price Rules ---

  @Post(':versionId/price-rules')
  async setPriceRule(@Param('versionId') versionId: string, @Body() data: any) {
    return this.versionsService.setPriceRule(versionId, data);
  }

  // --- Version Files ---

  @Post(':versionId/files')
  async addVersionFile(@Param('versionId') versionId: string, @Body() data: { file_id: string; file_role: string; sort_order?: number }) {
    return this.versionsService.addVersionFile(versionId, data);
  }

  @Delete(':versionId/files/:versionFileId')
  async removeVersionFile(@Param('versionFileId') versionFileId: string) {
    return this.versionsService.removeVersionFile(versionFileId);
  }
}
