import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { OrderStatusTracker } from '../../../components/shared/OrderStatusTracker';
import { OrderMediaGallery } from '../../../components/orders/OrderMediaGallery';
import { Button } from '../../../components/ui/Button';
import { FileDown } from 'lucide-react';
import { orderSummaryToPrintHtml, printHtmlAsPdf } from '../../../lib/exportFiles';

export const OverviewTab = ({ order, onOrderChange }: { order: any; onOrderChange?: (o: any) => void }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[var(--color-border)] mb-4">
            <CardTitle className="text-lg">مراحل التنفيذ</CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                printHtmlAsPdf(`طلب ${order.order_number}`, orderSummaryToPrintHtml(order))
              }
            >
              <FileDown className="w-4 h-4" /> تصدير PDF
            </Button>
          </CardHeader>
          <CardContent>
            <OrderStatusTracker status={order.status} />
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[var(--color-border)] mb-4">
            <CardTitle className="text-lg">بنود الطلب والتخصيص</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(order.items || []).length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">لا توجد بنود</p>
            )}
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)]/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      {item.design_name_snapshot}{' '}
                      <span className="text-[var(--color-text-muted)] text-sm font-normal">
                        ({item.design_code_snapshot})
                      </span>
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      الإصدار: v{item.version_number_snapshot}.0
                    </p>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="font-bold text-xl block">
                      {Number(item.line_total ?? 0).toLocaleString()} د.ج
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)] block">
                      {Number(item.unit_price || 0).toLocaleString()} د.ج × {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="text-lg">وسائط المشروع (قبل / بعد / تقدّم)</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderMediaGallery
              orderId={order.id}
              images={order.progress_images || []}
              onUpdated={onOrderChange}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="text-base">ملخص العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">الاسم:</span>
              <span className="font-bold">{order.customer?.name_ar || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">الهاتف:</span>
              <span className="font-medium">{order.customer?.phone || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="text-base">ملاحظات الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-bg-main)] p-3 rounded-lg border border-[var(--color-border)] whitespace-pre-wrap">
              {order.notes || order.internal_notes || 'لا توجد ملاحظات'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
