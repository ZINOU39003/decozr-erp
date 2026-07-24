import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CapacityService } from './capacity.service';

@ApiTags('Capacity')
@Controller('capacity')
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Capacity forecast for machines over N days' })
  forecast(
    @Query('from') from?: string,
    @Query('days') days?: string,
  ) {
    const fromDate = from || new Date().toISOString().slice(0, 10);
    const dayCount = days ? parseInt(days, 10) : 7;
    return this.capacityService.forecast(fromDate, dayCount);
  }

  @Post('snapshots')
  @ApiOperation({ summary: 'Upsert a capacity snapshot' })
  upsertSnapshot(@Body() body: any) {
    return this.capacityService.upsertSnapshot(body);
  }
}
