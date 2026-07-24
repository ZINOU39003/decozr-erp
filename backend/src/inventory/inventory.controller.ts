import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory movements' })
  findAll(@Query() query: PaginationDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get stock summary for all materials' })
  getSummary() {
    return this.inventoryService.getStockSummary();
  }

  @Post('movements')
  @ApiOperation({ summary: 'Record an inventory movement (in/out)' })
  recordMovement(@Body() body: any) {
    return this.inventoryService.recordMovement(body);
  }
}
