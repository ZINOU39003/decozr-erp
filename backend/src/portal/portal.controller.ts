import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PortalService } from './portal.service';

const receiptDir = join(process.cwd(), 'uploads', 'receipts');
if (!existsSync(receiptDir)) mkdirSync(receiptDir, { recursive: true });

@ApiTags('Portal')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('me')
  getMe(@Request() req) {
    return this.portalService.getMe(req.user);
  }

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.portalService.getDashboard(req.user);
  }

  @Get('catalog')
  getCatalog() {
    return this.portalService.getCatalog();
  }

  @Get('orders')
  getOrders(@Request() req) {
    return this.portalService.getOrders(req.user);
  }

  @Post('orders')
  createOrder(
    @Request() req,
    @Body()
    body: {
      items: Array<{
        design_id: string;
        design_version_id?: string;
        quantity: number;
        options?: Record<string, unknown>;
      }>;
      notes?: string;
    },
  ) {
    return this.portalService.createOrder(req.user, body);
  }

  @Get('orders/:id')
  getOrder(@Request() req, @Param('id') id: string) {
    return this.portalService.getOrder(req.user, id);
  }

  @Get('invoices')
  getInvoices(@Request() req) {
    return this.portalService.getInvoices(req.user);
  }

  @Get('payments')
  getPayments(@Request() req) {
    return this.portalService.getPayments(req.user);
  }

  @Get('payments/summary')
  getPaymentSummary(@Request() req) {
    return this.portalService.getPaymentSummary(req.user);
  }

  @Post('payments/proof')
  submitPaymentProof(
    @Request() req,
    @Body()
    body: {
      amount: number;
      payment_method: string;
      reference?: string;
      notes?: string;
      receipt_url?: string;
      order_id?: string;
      invoice_id?: string;
    },
  ) {
    return this.portalService.submitPaymentProof(req.user, body);
  }

  @Post('payments/receipt')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, receiptDir),
        filename: (_req, file, cb) => {
          const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
        },
      }),
      limits: { fileSize: 12 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype.startsWith('image/') ||
          file.mimetype === 'application/pdf';
        if (!ok) return cb(new BadRequestException('يُسمح بصورة أو PDF فقط') as any, false);
        cb(null, true);
      },
    }),
  )
  uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('لم يتم رفع ملف');
    return { url: `/uploads/receipts/${file.filename}` };
  }

  @Patch('me')
  updateMe(
    @Request() req,
    @Body()
    body: {
      name_ar?: string;
      phone?: string;
      city?: string;
      address_ar?: string;
      avatar_url?: string;
    },
  ) {
    return this.portalService.updateProfile(req.user, body);
  }

  @Get('custom-requests')
  getCustomRequests(@Request() req) {
    return this.portalService.getCustomRequests(req.user);
  }

  @Post('custom-requests')
  createCustomRequest(
    @Request() req,
    @Body()
    body: {
      request_type: string;
      title_ar: string;
      description_ar: string;
      width_cm?: number;
      height_cm?: number;
      depth_cm?: number;
      material_hint?: string;
      reference_image?: string;
    },
  ) {
    return this.portalService.createCustomRequest(req.user, body);
  }

  @Get('chat/threads')
  getChatThreads(@Request() req) {
    return this.portalService.getChatThreads(req.user);
  }

  @Get('chat/threads/:orderId')
  getChatMessages(@Request() req, @Param('orderId') orderId: string) {
    return this.portalService.getChatMessages(req.user, orderId);
  }

  @Post('chat/threads/:orderId')
  postChatMessage(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() body: { body_ar: string },
  ) {
    return this.portalService.postChatMessage(req.user, orderId, body?.body_ar);
  }

  @Get('support/messages')
  @ApiOperation({ summary: 'Direct chat with workshop' })
  getSupportMessages(@Request() req) {
    return this.portalService.getSupportMessages(req.user);
  }

  @Post('support/messages')
  postSupportMessage(
    @Request() req,
    @Body() body: { body_ar: string; attachment_url?: string },
  ) {
    return this.portalService.postSupportMessage(req.user, body?.body_ar, body?.attachment_url);
  }

  @Get('favorites')
  getFavorites(@Request() req) {
    return this.portalService.getFavorites(req.user);
  }

  @Post('favorites/:designId')
  toggleFavorite(@Request() req, @Param('designId') designId: string) {
    return this.portalService.toggleFavorite(req.user, designId);
  }

  @Get('appointments')
  getAppointments(@Request() req) {
    return this.portalService.getAppointments(req.user);
  }

  @Get('notifications')
  async getNotifications(@Request() req) {
    await this.portalService.ensureWelcomeNotification(req.user.id);
    return this.portalService.getNotifications(req.user);
  }

  @Patch('notifications/read-all')
  markAllRead(@Request() req) {
    return this.portalService.markNotificationsRead(req.user);
  }

  @Patch('notifications/:id/read')
  markOneRead(@Request() req, @Param('id') id: string) {
    return this.portalService.markNotificationsRead(req.user, id);
  }

  @Get('whatsapp')
  getWhatsapp(@Request() req) {
    return this.portalService.getWhatsappContact(req.user);
  }
}
