import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('by-qr/:token')
  @ApiOperation({ summary: 'Get order by QR token (public worker access)' })
  async getOrderByQr(@Param('token') token: string) {
    return this.ordersService.findByQr(token);
  }

  @Post('by-qr/:token/jobs/:jobId/start')
  @ApiOperation({ summary: 'Start machine job via QR (public worker)' })
  async startJobByQr(@Param('token') token: string, @Param('jobId') jobId: string) {
    return this.ordersService.startJobByQr(token, jobId);
  }

  @Post('by-qr/:token/jobs/:jobId/complete')
  @ApiOperation({ summary: 'Complete machine job via QR (public worker)' })
  async completeJobByQr(
    @Param('token') token: string,
    @Param('jobId') jobId: string,
    @Body() data: { actual_minutes?: number },
  ) {
    return this.ordersService.completeJobByQr(token, jobId, data?.actual_minutes);
  }

  @Post('public')
  @ApiOperation({ summary: 'Create order from public storefront cart (no JWT)' })
  async createPublicOrder(@Body() data: any) {
    return this.ordersService.createPublic(data);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all orders with pagination, search & filter' })
  async getAllOrders(@Query() query: PaginationDto & { status?: string; customer_id?: string }) {
    return this.ordersService.findAll(query);
  }

  @Get('board/follow-up')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('dispatch_production', 'view_production')
  @ApiOperation({ summary: 'Follow-up command center board' })
  async followUpBoard() {
    return this.ordersService.getFollowUpBoard();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get order by ID (full detail)' })
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new order (with transaction)' })
  async createOrder(@Request() req, @Body() data: any) {
    return this.ordersService.create(req.user?.id, data);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Change order status (PUT)' })
  async changeStatusPut(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { status: string; notes?: string },
  ) {
    return this.ordersService.changeStatus(id, req.user?.id, data.status, data.notes);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Change order status (PATCH)' })
  async changeStatusPatch(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { status: string; notes?: string },
  ) {
    return this.ordersService.changeStatus(id, req.user?.id, data.status, data.notes);
  }

  @Post(':id/finish-design')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('finish_design', 'edit_orders')
  @ApiOperation({ summary: 'Designer marks design complete → follow-up queue' })
  async finishDesign(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.ordersService.finishDesign(id, req.user?.id, body?.notes);
  }

  @Get(':id/route-suggestion')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('dispatch_production', 'view_production', 'finish_design')
  @ApiOperation({ summary: 'AI-style cutting vs printing suggestion' })
  async routeSuggestion(@Param('id') id: string) {
    return this.ordersService.getRouteSuggestion(id);
  }

  @Post(':id/dispatch')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('dispatch_production', 'edit_orders')
  @ApiOperation({ summary: 'Follow-up dispatches order to cutting/printing' })
  async dispatch(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      target_stage: 'in_cutting' | 'in_printing';
      assignee_user_id?: string;
      notes?: string;
    },
  ) {
    return this.ordersService.dispatchProduction(id, req.user?.id, body);
  }

  @Post(':id/reorder')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Re-order from existing order' })
  async reorder(@Request() req, @Param('id') id: string) {
    return this.ordersService.reorder(id, req.user?.id);
  }
}
