import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminPortalService } from './admin-portal.service';

@ApiTags('Admin Portal Bridge')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin/portal')
export class AdminPortalController {
  constructor(private readonly service: AdminPortalService) {}

  @Get('inbox')
  @ApiOperation({ summary: 'Portal activity inbox for workshop staff' })
  inbox() {
    return this.service.getInbox();
  }

  @Get('payments')
  listPayments() {
    return this.service.listPendingPayments();
  }

  @Patch('payments/:id/review')
  reviewPayment(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { action: 'confirm' | 'reject'; note?: string },
  ) {
    return this.service.reviewPayment(req.user, id, body.action, body.note);
  }

  @Get('support/threads')
  supportThreads() {
    return this.service.listSupportThreads();
  }

  @Get('support/:customerId')
  supportMessages(@Param('customerId') customerId: string) {
    return this.service.getSupportMessages(customerId);
  }

  @Post('support/:customerId/reply')
  reply(
    @Request() req,
    @Param('customerId') customerId: string,
    @Body() body: { body_ar: string },
  ) {
    return this.service.replySupport(req.user, customerId, body.body_ar);
  }

  @Get('custom-requests')
  customRequests() {
    return this.service.listCustomRequests();
  }

  @Patch('custom-requests/:id')
  updateCustom(
    @Param('id') id: string,
    @Body() body: { status: string; note?: string },
  ) {
    return this.service.updateCustomRequest(id, body.status, body.note);
  }

  @Get('appointments')
  appointments() {
    return this.service.listAppointments();
  }

  @Post('appointments')
  upsertAppointment(@Body() body: any) {
    return this.service.upsertAppointment(body);
  }
}
