import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomersService } from './customers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('price-lists')
  @ApiOperation({ summary: 'List active price lists' })
  listPriceLists() {
    return this.customersService.listPriceLists();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() createCustomerDto: any) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  findAll(@Query() query: PaginationDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  findById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Post(':id/activate-portal')
  @ApiOperation({ summary: 'Activate or reset customer portal login' })
  activatePortal(
    @Param('id') id: string,
    @Body() body: { email?: string; password?: string },
  ) {
    return this.customersService.activatePortal(id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
