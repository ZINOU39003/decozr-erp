import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeasonsService } from './seasons.service';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a season' })
  create(@Body() body: any) {
    return this.seasonsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all seasons' })
  findAll() {
    return this.seasonsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'List currently active seasons' })
  getActive() {
    return this.seasonsService.getActiveSeasons();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get season by ID' })
  findOne(@Param('id') id: string) {
    return this.seasonsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a season' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.seasonsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a season' })
  remove(@Param('id') id: string) {
    return this.seasonsService.remove(id);
  }

  @Post(':id/designs/:designId')
  @ApiOperation({ summary: 'Link a design to a season' })
  linkDesign(@Param('id') id: string, @Param('designId') designId: string) {
    return this.seasonsService.linkDesign(id, designId);
  }

  @Delete(':id/designs/:designId')
  @ApiOperation({ summary: 'Unlink a design from a season' })
  unlinkDesign(@Param('id') id: string, @Param('designId') designId: string) {
    return this.seasonsService.unlinkDesign(id, designId);
  }
}
