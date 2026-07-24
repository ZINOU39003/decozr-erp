import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, Clock, Package, Wallet, Users, Boxes,
  CreditCard, PenTool, RefreshCw, ChevronLeft,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getDashboardAlerts } from '../../services/api';
import { getStatusConfig } from '../orders/OrdersList';

const money = (n: number) => `${Number(n || 0).toLocaleString('ar-DZ')} د.ج`;

export const AlertsCenter = () => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: async () => {
      const res = await getDashboardAlerts();
      return (res as any).data || res;
    },
    refetchInterval: 60_000,
  });

  const counts = data?.counts || {};
  const tiles = useMemo(
    () => [
      { key: 'late_orders', label: 'طلبات متأخرة', value: counts.late_orders || 0, icon: Clock, color: 'text-red-600 bg-red-50' },
      { key: 'due_soon', label: 'قريبة الاستحقاق', value: counts.due_soon || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
      { key: 'shortages', label: 'نواقص مخزون', value: counts.shortages || 0, icon: Boxes, color: 'text-orange-600 bg-orange-50' },
      { key: 'unpaid_invoices', label: 'فواتير ناقصة', value: counts.unpaid_invoices || 0, icon: Wallet, color: 'text-rose-600 bg-rose-50' },
      { key: 'high_debt', label: 'ديون مرتفعة', value: counts.high_debt || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
      { key: 'pending_payments', label: 'مدفوعات بانتظار المراجعة', value: counts.pending_payments || 0, icon: CreditCard, color: 'text-teal-700 bg-teal-50' },
      { key: 'open_designs', label: 'طلبات تصميم مفتوحة', value: counts.open_designs || 0, icon: PenTool, color: 'text-sky-700 bg-sky-50' },
    ],
    [counts],
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-64 bg-[var(--color-bg-card)] rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[var(--color-bg-card)] rounded-xl border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            مركز التنبيهات
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            نظرة شاملة على المتأخرات، النواقص، المدفوعات الناقصة، والديون
            {data?.total_alerts != null ? ` · ${data.total_alerts} تنبيه` : ''}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
        {tiles.map((t) => (
          <Card key={t.key} className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${t.color}`}>
                <t.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black">{t.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug">{t.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section
          title="طلبات متأخرة"
          icon={Clock}
          empty={!data?.late_orders?.length}
          items={(data?.late_orders || []).map((o: any) => (
            <Row
              key={o.id}
              title={o.order_number}
              subtitle={`${o.customer?.name_ar || 'عميل'} · استحقاق ${o.due_date ? new Date(o.due_date).toLocaleDateString('ar-DZ') : '—'}`}
              right={<Badge variant="destructive">{getStatusConfig(o.status).label}</Badge>}
              onClick={() => navigate(`/orders/${o.id}`)}
            />
          ))}
        />

        <Section
          title="نواقص المخزون"
          icon={Boxes}
          empty={!data?.shortages?.length}
          items={(data?.shortages || []).map((m: any) => (
            <Row
              key={m.id}
              title={m.name_ar}
              subtitle={`SKU ${m.sku} · الحد الأدنى ${m.min_stock_level} ${m.unit}`}
              right={<span className="font-bold text-orange-600">{m.current_stock} {m.unit}</span>}
              onClick={() => navigate('/materials')}
            />
          ))}
        />

        <Section
          title="فواتير ومدفوعات ناقصة"
          icon={Wallet}
          empty={!data?.unpaid_invoices?.length}
          items={(data?.unpaid_invoices || []).map((inv: any) => (
            <Row
              key={inv.id}
              title={inv.invoice_number}
              subtitle={`${inv.customer?.name_ar || 'عميل'} · متبقي ${money(inv.remaining)}`}
              right={<Badge variant="warning">{inv.status}</Badge>}
              onClick={() => (inv.order_id ? navigate(`/orders/${inv.order_id}`) : navigate('/invoices'))}
            />
          ))}
        />

        <Section
          title="عملاء بديون مرتفعة"
          icon={Users}
          empty={!data?.high_debt_customers?.length}
          items={(data?.high_debt_customers || []).map((c: any) => (
            <Row
              key={c.id}
              title={c.name_ar}
              subtitle={`${c.code || ''} · ${c.phone || ''}`}
              right={<span className="font-bold text-[var(--color-danger)]">{money(c.balance)}</span>}
              onClick={() => navigate(`/customers/${c.id}`)}
            />
          ))}
        />

        <Section
          title="مدفوعات بانتظار المراجعة"
          icon={CreditCard}
          empty={!data?.pending_payments?.length}
          items={(data?.pending_payments || []).map((p: any) => (
            <Row
              key={p.id}
              title={p.payment_number || 'دفعة'}
              subtitle={p.customer?.name_ar || 'عميل'}
              right={<span className="font-bold text-teal-700">{money(p.amount)}</span>}
              onClick={() => navigate('/payments')}
            />
          ))}
        />

        <Section
          title="طلبات تصميم مفتوحة"
          icon={PenTool}
          empty={!data?.open_design_requests?.length}
          items={(data?.open_design_requests || []).map((d: any) => (
            <Row
              key={d.id}
              title={d.title_ar}
              subtitle={d.customer?.name_ar || 'عميل'}
              right={<Badge variant="info">{d.status}</Badge>}
              onClick={() => (d.customer?.id ? navigate(`/customers/${d.customer.id}`) : undefined)}
            />
          ))}
        />
      </div>
    </div>
  );
};

function Section({
  title,
  icon: Icon,
  empty,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  empty: boolean;
  items: React.ReactNode[];
}) {
  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <CardHeader className="pb-2 border-b border-[var(--color-border)]">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#0F766E]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {empty ? (
          <p className="text-sm text-[var(--color-text-muted)] text-center py-8">لا توجد عناصر</p>
        ) : (
          items
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  title,
  subtitle,
  right,
  onClick,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-right flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] hover:border-[#0F766E]/40 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        <ChevronLeft className="w-4 h-4 text-[var(--color-text-muted)]" />
      </div>
    </button>
  );
}
