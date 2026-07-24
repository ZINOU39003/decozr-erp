import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, RefreshCw, Search, Factory } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, changeOrderStatus } from '../../services/api';
import { toast } from 'sonner';
import { getStatusConfig } from '../orders/OrdersList';

const PRODUCTION_STATUSES = ['in_design', 'in_cutting', 'in_printing', 'in_assembly'];

const UI_COLUMNS = [
  {
    id: 'received',
    backendStatus: 'received',
    title: 'استلام',
    accent: '#0EA5E9',
  },
  {
    id: 'in_production',
    backendStatus: 'in_cutting',
    title: 'قيد التنفيذ',
    accent: '#F59E0B',
    matchStatuses: PRODUCTION_STATUSES,
  },
  {
    id: 'ready',
    backendStatus: 'ready',
    title: 'جاهز',
    accent: '#10B981',
  },
  {
    id: 'delivered',
    backendStatus: 'delivered',
    title: 'تم التسليم',
    accent: '#64748B',
  },
];

const getColumnForStatus = (status: string) => {
  if (status === 'received' || status === 'pending_review' || status === 'pending_approval') return 'received';
  if (PRODUCTION_STATUSES.includes(status)) return 'in_production';
  if (status === 'ready') return 'ready';
  if (status === 'delivered' || status === 'completed') return 'delivered';
  return null;
};

const getDesignName = (order: any) =>
  order.items?.[0]?.design?.name_ar ||
  order.items?.[0]?.design_name_snapshot ||
  order.design?.name_ar ||
  '—';

export const KanbanBoard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');

  const { data: ordersResponse, isLoading: loading, refetch, isFetching } = useQuery({
    queryKey: ['orders', 'production'],
    queryFn: () => getOrders({ limit: 120 }),
  });

  const orders = useMemo(() => {
    const list = Array.isArray(ordersResponse)
      ? ordersResponse
      : Array.isArray((ordersResponse as any)?.data)
        ? (ordersResponse as any).data
        : [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((o: any) => {
      const hay = `${o.order_number || ''} ${o.customer?.name_ar || ''} ${getDesignName(o)}`.toLowerCase();
      return hay.includes(term);
    });
  }, [ordersResponse, q]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => changeOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('تم تحديث حالة الطلب');
    },
    onError: () => toast.error('حدث خطأ أثناء تحديث الحالة'),
  });

  const handleMoveOrder = (orderId: string, col: (typeof UI_COLUMNS)[number]) => {
    statusMutation.mutate({ id: orderId, status: col.backendStatus });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('orderId', id);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, col: (typeof UI_COLUMNS)[number]) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) handleMoveOrder(orderId, col);
  };

  const counts = useMemo(() => {
    const base = { received: 0, in_production: 0, ready: 0, delivered: 0 };
    for (const o of orders) {
      const c = getColumnForStatus(o.status);
      if (c && c in base) (base as any)[c] += 1;
    }
    return base;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex gap-4 h-[calc(100vh-12rem)] animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[280px] flex-shrink-0 bg-[var(--color-bg-sidebar)] rounded-2xl border border-[var(--color-border)] h-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden pb-4" dir="rtl">
      <div className="mb-5 flex flex-wrap justify-between items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Factory className="w-6 h-6 text-[#0F766E]" />
            الإنتاج
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1 text-sm">
            أربع مراحل واضحة — اسحب البطاقة أو افتح الطلب للتفاصيل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث برقم الطلب أو العميل..."
              className="pr-9 w-56 bg-[var(--color-bg-card)] border-[var(--color-border)]"
            />
          </div>
          <Button variant="outline" className="gap-2 border-[var(--color-border)]" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
        {UI_COLUMNS.map((col) => (
          <div key={col.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">{col.title}</p>
            <p className="text-xl font-black mt-1" style={{ color: col.accent }}>
              {(counts as any)[col.id] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar flex-1 items-start">
        {UI_COLUMNS.map((col) => {
          const colOrders = orders.filter((o: any) => getColumnForStatus(o.status) === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              className="w-[280px] flex-shrink-0 bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border)] flex flex-col max-h-[calc(100vh-16rem)]"
            >
              <div
                className="p-3.5 border-b border-[var(--color-border)] flex justify-between items-center rounded-t-2xl bg-[var(--color-bg-card)]"
                style={{ borderTop: `3px solid ${col.accent}` }}
              >
                <h3 className="font-bold text-[var(--color-text-main)] text-sm">{col.title}</h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: col.accent }}
                >
                  {colOrders.length}
                </span>
              </div>

              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar min-h-[120px]">
                <AnimatePresence>
                  {colOrders.map((order: any) => {
                    const st = getStatusConfig(order.status);
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        draggable
                        onDragStart={(e: React.DragEvent) => handleDragStart(e, order.id)}
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="bg-[var(--color-bg-card)] p-3 rounded-xl border border-[var(--color-border)] hover:border-[#0F766E]/45 transition-all group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-1 mb-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100" />
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{order.order_number}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">{order.customer?.name_ar || 'عميل'}</p>
                        <p className="text-sm font-medium text-[var(--color-text-main)] mt-1 line-clamp-1">{getDesignName(order)}</p>
                        <p className="text-[11px] mt-2" style={{ color: col.accent }}>{st.label}</p>

                        {col.id === 'in_production' && (
                          <select
                            value={PRODUCTION_STATUSES.includes(order.status) ? order.status : 'in_cutting'}
                            onChange={(e) => {
                              e.stopPropagation();
                              statusMutation.mutate({ id: order.id, status: e.target.value });
                            }}
                            className="mt-2 w-full h-8 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] px-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="in_design">تصميم</option>
                            <option value="in_cutting">قص</option>
                            <option value="in_printing">طباعة</option>
                            <option value="in_assembly">تجميع</option>
                          </select>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {colOrders.length === 0 && (
                  <div className="text-center py-10 text-[var(--color-text-muted)] text-xs border border-dashed border-[var(--color-border)] rounded-xl">
                    اسحب الطلب هنا
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
