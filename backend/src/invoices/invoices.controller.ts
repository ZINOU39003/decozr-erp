import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice' })
  create(@Body() createDto: any) {
    return this.invoicesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with balance info' })
  findAll(@Query() query: PaginationDto) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details with payments' })
  findById(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.invoicesService.update(id, updateDto);
  }
}
