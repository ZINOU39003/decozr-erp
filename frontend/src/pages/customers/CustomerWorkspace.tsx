import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Package, Edit, Wallet, CheckCircle2,
  Clock3, RotateCcw, FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useQuery } from '@tanstack/react-query';
import { getCustomerActivities } from '../../services/api';
import { apiClient } from '../../services/apiClient';
import { FileManager } from '../../components/shared/FileManager';
import { ActivityTimeline } from '../../components/shared/ActivityTimeline';
import { getStatusConfig } from '../orders/OrdersList';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

const money = (n: number) => `${Number(n || 0).toLocaleString('ar-DZ')} د.ج`;

const DONE = new Set(['delivered', 'completed']);
const RETURNED = new Set(['cancelled', 'returned', 'rejected']);

export const CustomerWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed' | 'returned'>('all');

  const { data: customer, isLoading: loading } = useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const res = await apiClient.get(`/customers/${id}`);
      return (res as any).data || res;
    },
    enabled: !!id,
  });

  const { data: activitiesRaw, isLoading: activitiesLoading } = useQuery({
    queryKey: ['customers', id, 'activities'],
    queryFn: () => getCustomerActivities(id!),
    enabled: !!id,
  });

  const activities = useMemo(() => {
    return unwrapList(activitiesRaw).map((a: any, i: number) => ({
      id: a.id || String(i),
      type: (a.activity_type === 'payment'
        ? 'payment'
        : a.activity_type === 'message'
          ? 'message'
          : a.activity_type === 'invoice'
            ? 'invoice'
            : a.activity_type === 'order'
              ? 'order'
              : 'system') as 'order' | 'invoice' | 'payment' | 'message' | 'system',
      title: a.title_ar || a.title || 'نشاط',
      description: a.body_ar || a.description || '',
      timestamp: a.created_at || a.at || new Date().toISOString(),
      user: a.creator?.full_name_ar || a.user || 'النظام',
    }));
  }, [activitiesRaw]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-40 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]" />
        <div className="h-[400px] bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]" />
      </div>
    );
  }

  if (!customer) return <div className="text-[var(--color-text-muted)] p-8">لم يتم العثور على العميل</div>;

  const customerOrders = customer.orders || [];
  const customerInvoices = customer.invoices || [];
  const customerPayments = customer.payments || [];
  const summary = customer.orders_summary || {
    active: customerOrders.filter((o: any) => !DONE.has(o.status) && !RETURNED.has(o.status)).length,
    completed: customerOrders.filter((o: any) => DONE.has(o.status)).length,
    returned: customerOrders.filter((o: any) => RETURNED.has(o.status)).length,
  };
  const paidTotal = Number(customer.paid_total ?? 0);
  const remainingTotal = Number(customer.remaining_total ?? customer.balance ?? 0);
  const invoicedTotal = Number(customer.invoiced_total ?? 0);

  const filteredOrders = customerOrders.filter((o: any) => {
    if (orderFilter === 'active') return !DONE.has(o.status) && !RETURNED.has(o.status);
    if (orderFilter === 'completed') return DONE.has(o.status);
    if (orderFilter === 'returned') return RETURNED.has(o.status);
    return true;
  });

  const kpis = [
    { label: 'إجمالي الفواتير', value: money(invoicedTotal), icon: FileText, tone: 'text-[var(--color-text-main)]' },
    { label: 'المدفوع', value: money(paidTotal), icon: Wallet, tone: 'text-[var(--color-success)]' },
    { label: 'المتبقي', value: money(remainingTotal), icon: Clock3, tone: 'text-[var(--color-danger)]' },
    { label: 'طلبات منجزة', value: String(summary.completed), icon: CheckCircle2, tone: 'text-[var(--color-success)]' },
    { label: 'قيد التنفيذ', value: String(summary.active), icon: Package, tone: 'text-[var(--color-warning)]' },
    { label: 'مرتجع / ملغى', value: String(summary.returned), icon: RotateCcw, tone: 'text-[var(--color-text-muted)]' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="h-20 bg-gradient-to-l from-[#0F766E] to-[#14B8A6]" />
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-10 mb-4">
            <div className="w-20 h-20 rounded-xl bg-white border-4 border-[var(--color-bg-card)] flex items-center justify-center text-3xl font-bold text-[#0F766E] shadow-md">
              {(customer.name_ar || customer.name || '?').charAt(0)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[var(--color-border)]"
                onClick={() => toast.info('تعديل العميل قريباً من هذه الشاشة')}
              >
                <Edit className="w-4 h-4 ml-2" /> تعديل
              </Button>
              <Button
                className="bg-[#0F766E] text-white hover:bg-[#0D9488]"
                onClick={() => navigate('/orders/create')}
              >
                <Package className="w-4 h-4 ml-2" /> طلب جديد
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-main)]">{customer.name_ar || customer.name}</h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                {customer.code || customer.id} • {customer.customer_type === 'company' ? 'شركة' : 'فرد'}
              </p>
              <Badge variant="success" className="mt-3">نشط</Badge>
            </div>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#0F766E]" /> {customer.phone || '—'}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#0F766E]" /> {customer.email || '—'}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#0F766E]" /> {customer.address_ar || customer.city || '—'}</div>
            </div>
            <div className="bg-[var(--color-bg-main)] p-4 rounded-xl border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">رصيد الديون المسجّل</p>
              <p className="text-2xl font-bold text-[var(--color-danger)]">{money(customer.balance || remainingTotal)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
                <k.icon className="w-3.5 h-3.5" />
                {k.label}
              </div>
              <p className={`text-lg font-bold ${k.tone}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="bg-[var(--color-bg-card)] border border-[var(--color-border)] flex-wrap h-auto">
          <TabsTrigger value="orders">الطلبات ({customerOrders.length})</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير ({customerInvoices.length})</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات ({customerPayments.length})</TabsTrigger>
          <TabsTrigger value="files">الملفات</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: `قيد التنفيذ (${summary.active})` },
              { id: 'completed', label: `منجزة (${summary.completed})` },
              { id: 'returned', label: `مرتجعة (${summary.returned})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOrderFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  orderFilter === f.id
                    ? 'bg-[#0F766E] text-white border-[#0F766E]'
                    : 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4">
              {filteredOrders.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-center py-8">لا توجد طلبات في هذا التصنيف</p>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.map((order: any) => {
                    const st = getStatusConfig(order.status);
                    const total = Number(order.total || 0);
                    const paid = Number(order.paid_amount || 0);
                    return (
                      <button
                        key={order.id}
                        type="button"
                        className="w-full text-right flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] hover:border-[#0F766E]/50 transition-colors"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div>
                          <p className="font-bold text-[var(--color-text-main)]">{order.order_number}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {order.items?.[0]?.design_name_snapshot || '—'}
                            {order.created_at ? ` · ${new Date(order.created_at).toLocaleDateString('ar-DZ')}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left text-sm">
                            <p className="font-semibold">{money(total)}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">مدفوع {money(paid)}</p>
                          </div>
                          <Badge variant={st.color as any}>{st.label}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-2">
              {customerInvoices.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-center py-8">لا توجد فواتير</p>
              ) : (
                customerInvoices.map((inv: any) => {
                  const total = Number(inv.total_amount || inv.total || 0);
                  const paid = (inv.payments || [])
                    .filter((p: any) => !['pending', 'pending_review', 'rejected'].includes((p.status || '').toLowerCase()))
                    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
                  return (
                    <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]">
                      <div>
                        <p className="font-bold">{inv.invoice_number}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">طلب {inv.order_number || '—'}</p>
                      </div>
                      <div className="text-sm text-left">
                        <p>{money(total)}</p>
                        <p className="text-xs text-[var(--color-danger)]">متبقي {money(Math.max(0, total - paid))}</p>
                      </div>
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-2">
              {customerPayments.length === 0 ? (
                <p className="text-[var(--color-text-muted)] text-center py-8">لا توجد مدفوعات</p>
              ) : (
                customerPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]">
                    <div>
                      <p className="font-medium">{p.payment_number || 'دفعة'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString('ar-DZ') : '—'} · {p.payment_method || '—'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[var(--color-success)]">{money(p.amount)}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{p.status}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <FileManager entityType="customer" entityId={id || ''} />
        </TabsContent>

        <TabsContent value="activity">
          {activitiesLoading ? (
            <p className="text-[var(--color-text-muted)] animate-pulse p-4">جاري التحميل...</p>
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
