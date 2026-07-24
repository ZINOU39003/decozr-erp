import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Package } from 'lucide-react';
import { getPortalOrder } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const statusAr: Record<string, string> = {
  received: 'مستلم',
  pending_review: 'مراجعة',
  pending_approval: 'موافقة',
  in_design: 'تصميم',
  in_cutting: 'قص',
  in_printing: 'طباعة',
  in_assembly: 'تجميع',
  ready: 'جاهز',
  delivered: 'تم التسليم',
};

export const PortalOrderWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['portal', 'orders', id],
    queryFn: () => getPortalOrder(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 animate-pulse text-[var(--color-text-muted)]">جاري التحميل...</div>;
  if (isError || !order) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-[var(--color-danger)]">الطلب غير موجود أو ليس ضمن حسابك</p>
        <Button variant="outline" onClick={() => navigate('/portal/orders')}>العودة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/portal/orders')} className="gap-2 -mr-2">
        <ArrowRight className="w-4 h-4" /> طلباتي
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-mono">{order.order_number}</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {order.created_at ? new Date(order.created_at).toLocaleString('ar-DZ') : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="text-sm px-3 py-1">{statusAr[order.status] || order.status}</Badge>
          <span className="text-2xl font-black text-[var(--color-primary-400)]">
            {Number(order.total || 0).toLocaleString()} د.ج
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" /> البنود
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)]/40">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.design_name_snapshot}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                      {item.design_code_snapshot} · v{item.version_number_snapshot}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{Number(item.line_total || 0).toLocaleString()} د.ج</p>
                    <p className="text-xs text-[var(--color-text-muted)]">× {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader>
              <CardTitle>الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">الإجمالي</span>
                <span className="font-bold">{Number(order.total || 0).toLocaleString()} د.ج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">المدفوع</span>
                <span className="font-bold text-[var(--color-success)]">
                  {Number(order.paid_amount || 0).toLocaleString()} د.ج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">المتبقي</span>
                <span className="font-bold text-[var(--color-danger)]">
                  {Math.max(0, Number(order.total || 0) - Number(order.paid_amount || 0)).toLocaleString()} د.ج
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardHeader>
              <CardTitle>سجل الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(order.statusHistory || []).length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)]">لا يوجد سجل بعد</p>
              )}
              {(order.statusHistory || []).map((h: any) => (
                <div key={h.id} className="text-sm border-b border-[var(--color-border)] pb-2 last:border-0">
                  <p className="font-bold">{statusAr[h.to_status] || h.to_status}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {h.changed_at ? new Date(h.changed_at).toLocaleString('ar-DZ') : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
