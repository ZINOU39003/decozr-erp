import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_LABELS: Record<string, string> = {
  received: 'تم استلام الطلب',
  pending_review: 'قيد المراجعة',
  pending_approval: 'بانتظار الموافقة',
  in_design: 'قيد التصميم',
  design_ready: 'التصميم جاهز',
  in_cutting: 'قيد القص',
  in_printing: 'قيد الطباعة',
  in_assembly: 'قيد التجميع',
  ready: 'جاهز للتسليم',
  delivered: 'تم التسليم',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) {}

  statusLabel(status: string) {
    return STATUS_LABELS[status] || status;
  }

  /** Normalize Algerian / intl phone to digits for wa.me */
  normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    let digits = String(phone).replace(/\D/g, '');
    if (!digits) return null;
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0') && digits.length === 10) digits = `213${digits.slice(1)}`;
    return digits;
  }

  buildCustomerStatusMessage(orderNumber: string, status: string, customerName?: string) {
    const label = this.statusLabel(status);
    const name = customerName ? `مرحباً ${customerName}،\n` : '';
    return (
      `${name}تحديث طلبك في DecoZR\n` +
      `رقم الطلب: ${orderNumber}\n` +
      `الحالة الجديدة: ${label}\n` +
      `شكراً لثقتكم.`
    );
  }

  buildWaMeLink(phone: string, message: string) {
    const n = this.normalizePhone(phone);
    if (!n) return null;
    return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Outbound WhatsApp:
   * 1) If WHATSAPP_WEBHOOK_URL is set → POST JSON (Meta/Twilio/n8n/CallMeBot bridge)
   * 2) Always returns wa.me link for UI / staff one-click send
   */
  async notifyCustomerStatus(opts: {
    phone?: string | null;
    customerName?: string;
    orderNumber: string;
    status: string;
    orderId: string;
  }) {
    const message = this.buildCustomerStatusMessage(
      opts.orderNumber,
      opts.status,
      opts.customerName,
    );
    const link = opts.phone ? this.buildWaMeLink(opts.phone, message) : null;
    const webhook = process.env.WHATSAPP_WEBHOOK_URL?.trim();

    let sent = false;
    if (webhook && opts.phone) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.WHATSAPP_WEBHOOK_TOKEN
              ? { Authorization: `Bearer ${process.env.WHATSAPP_WEBHOOK_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({
            channel: 'whatsapp',
            to: this.normalizePhone(opts.phone),
            message,
            order_number: opts.orderNumber,
            order_id: opts.orderId,
            status: opts.status,
          }),
        });
        sent = res.ok;
        if (!res.ok) {
          this.logger.warn(`WhatsApp webhook failed: ${res.status}`);
        }
      } catch (e: any) {
        this.logger.warn(`WhatsApp webhook error: ${e?.message || e}`);
      }
    }

    return { sent, link, message };
  }

  async getWorkshopWhatsappPhone(): Promise<string | null> {
    const row = await this.prisma.systemSettings.findUnique({
      where: { key: 'whatsapp_phone' },
    });
    if (row?.value != null) {
      const v = row.value as any;
      const raw = typeof v === 'string' ? v : v?.phone || v?.value || '';
      const digits = String(raw).replace(/\D/g, '');
      if (digits) return digits;
    }
    const sf = await this.prisma.systemSettings.findUnique({
      where: { key: 'storefront' },
    });
    const val = sf?.value as any;
    return val?.whatsapp ? String(val.whatsapp).replace(/\D/g, '') : null;
  }
}