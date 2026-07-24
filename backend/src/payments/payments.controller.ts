import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  findAll(@Query() query: PaginationDto) {
    return this.paymentsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new payment (auto-updates invoice status)' })
  record(@Request() req, @Body() body: any) {
    return this.paymentsService.record({ ...body, recorded_by_id: req.user.id });
  }
}
