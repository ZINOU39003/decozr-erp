import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export const OverviewTab = ({ order }: { order: any }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
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
                className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)]/50 hover:bg-[var(--color-bg-hover)] transition-colors"
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
                      الإصدار المعتمد: v{item.version_number_snapshot}.0
                    </p>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="font-bold text-xl block">
                      {Number(item.line_total ?? item.unit_price * item.quantity ?? 0).toLocaleString()} د.ج
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)] block">
                      {Number(item.unit_price || 0).toLocaleString()} د.ج × {item.quantity}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] block max-w-[200px]">
                      يشمل قائمة الأسعار والتخصيص (قد يختلف عن سعر الكتالوج العام)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-text-muted)] block mb-2">
                      التخصيص المختار:
                    </span>
                    <div className="space-y-2">
                      {Object.keys(item.options_snapshot || {}).length === 0 ? (
                        <p className="text-sm text-[var(--color-text-muted)]">بدون تخصيص إضافي</p>
                      ) : (
                        Object.entries(item.options_snapshot || {}).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm bg-[var(--color-bg-card)] px-3 py-2 rounded-md border border-[var(--color-border)]"
                          >
                            <span className="text-[var(--color-text-muted)]">{key}</span>
                            <span className="font-medium text-[var(--color-text-main)]">
                              {String(val)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--color-text-muted)] block mb-2">
                      المواد المطلوبة (BOM):
                    </span>
                    <div className="space-y-2">
                      {(item.computed_bom_snapshot?.materials || []).length === 0 && (
                        <p className="text-sm text-[var(--color-text-muted)]">لا توجد مواد مسجّلة</p>
                      )}
                      {(item.computed_bom_snapshot?.materials || []).map((m: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm bg-[var(--color-bg-card)] px-3 py-2 rounded-md border border-[var(--color-border)]"
                        >
                          <span className="text-[var(--color-text-muted)]">
                            {m.name || m.material?.name_ar || 'مادة'}
                          </span>
                          <span className="font-medium text-[var(--color-primary-400)]">
                            {m.quantity} {m.unit || m.material?.unit || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              <span className="font-bold">{order.customer?.name_ar || order.customer?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">النوع:</span>
              <span className="font-medium">
                {order.customer?.customer_type || order.customer?.type || '—'}
              </span>
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

        {order.qr_code_token && (
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader>
              <CardTitle className="text-base">رمز العامل QR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <code className="block break-all text-xs bg-[var(--color-bg-main)] p-2 rounded border border-[var(--color-border)]">
                {order.qr_code_token}
              </code>
              <a
                className="text-[var(--color-primary-400)] underline"
                href={`/w/${order.qr_code_token}`}
                target="_blank"
                rel="noreferrer"
              >
                فتح واجهة العامل
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
