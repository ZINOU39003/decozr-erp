import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material' })
  create(@Body() createDto: any) {
    return this.materialsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.materialsService.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock materials' })
  getLowStock() {
    return this.materialsService.getLowStock();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  findById(@Param('id') id: string) {
    return this.materialsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.materialsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a material' })
  remove(@Param('id') id: string) {
    return this.materialsService.softDelete(id);
  }
}
