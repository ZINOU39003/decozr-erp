import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request } from '@nestjs/common';
import { DesignsService } from './designs.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  // --- Categories ---

  @Get('categories')
  async getCategories() {
    return this.designsService.findAllCategories();
  }

  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string) {
    return this.designsService.findCategoryById(id);
  }

  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.designsService.createCategory(createCategoryDto);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.designsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.designsService.deleteCategory(id);
  }

  // --- Designs ---

  @Get()
  async getDesigns(
    @Query('catalog') catalog?: string,
    @Query('library_status') library_status?: string,
    @Query('owner_customer_id') owner_customer_id?: string,
  ) {
    return this.designsService.findAllDesigns({
      catalog,
      library_status,
      owner_customer_id,
    });
  }

  @Get(':id')
  async getDesignById(@Param('id') id: string) {
    return this.designsService.findDesignById(id);
  }

  @Post()
  async createDesign(@Request() req, @Body() createDesignDto: CreateDesignDto) {
    const userId = req.user?.id || 'admin';
    return this.designsService.createDesign(userId, createDesignDto);
  }

  @Post('calculate-price')
  async calculatePrice(@Body() data: { design_version_id: string; options: any; price_list_id: string }) {
    return this.designsService.calculatePrice(data);
  }

  @Post('calculate-bom')
  async calculateBom(@Body() data: { design_version_id: string; options: any }) {
    return this.designsService.calculateBom(data);
  }

  @Put(':id')
  async updateDesign(@Param('id') id: string, @Body() updateDesignDto: UpdateDesignDto) {
    return this.designsService.updateDesign(id, updateDesignDto);
  }

  @Delete(':id')
  async deleteDesign(@Param('id') id: string) {
    return this.designsService.deleteDesign(id);
  }
}
