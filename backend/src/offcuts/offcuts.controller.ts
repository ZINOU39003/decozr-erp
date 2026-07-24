import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffcutsService } from './offcuts.service';

@ApiTags('Offcuts')
@Controller('offcuts')
export class OffcutsController {
  constructor(private readonly offcutsService: OffcutsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an offcut piece' })
  create(@Body() body: any) {
    return this.offcutsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all offcuts' })
  findAll() {
    return this.offcutsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Find available offcuts that fit dimensions' })
  findAvailable(
    @Query('materialId') materialId: string,
    @Query('width') width: string,
    @Query('height') height: string,
  ) {
    return this.offcutsService.findAvailable(
      materialId,
      parseFloat(width),
      parseFloat(height),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offcut by ID' })
  findOne(@Param('id') id: string) {
    return this.offcutsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offcut' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.offcutsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offcut' })
  remove(@Param('id') id: string) {
    return this.offcutsService.remove(id);
  }
}
