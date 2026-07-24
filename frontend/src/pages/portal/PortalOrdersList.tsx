import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { getPortalOrders } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { PortalProgress, PortalStatusPill } from './components/PortalUI';

const progressOf = (status: string) => {
  const map: Record<string, number> = {
    received: 12,
    pending_review: 22,
    pending_approval: 35,
    in_design: 48,
    in_cutting: 62,
    in_printing: 72,
    in_assembly: 82,
    ready: 94,
    delivered: 100,
  };
  return map[status] ?? 10;
};

export const PortalOrdersList = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'orders'],
    queryFn: getPortalOrders,
  });

  const orders = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#15202b] flex items-center gap-2">
            <ShoppingCart className="text-[#0F766E]" /> طلباتي
          </h1>
          <p className="text-sm text-[#64748B] mt-1">متابعة مشاريعك وحالة التنفيذ لدى الورشة</p>
        </div>
        <Button className="bg-[#0F766E] text-white" onClick={() => navigate('/portal/catalog')}>
          طلب جديد
        </Button>
      </div>

      {isLoading && <p className="animate-pulse text-[#64748B]">جاري التحميل...</p>}
      {isError && <p className="text-red-500">تعذر تحميل الطلبات</p>}

      <div className="rounded-2xl border border-[#E6ECF2] bg-white overflow-hidden shadow-sm">
        {!isLoading && orders.length === 0 && (
          <div className="p-12 text-center text-[#94A3B8]">
            لا توجد طلبات بعد — ابدأ من الكتالوج
          </div>
        )}
        <div className="divide-y divide-[#F1F5F9]">
          {orders.map((order: any) => {
            const progress = progressOf(order.status);
            const title =
              (order.items || []).map((i: any) => i.design_name_snapshot).join(' · ') || 'طلب';
            return (
              <button
                key={order.id}
                onClick={() => navigate(`/portal/orders/${order.id}`)}
                className="w-full text-right p-5 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-black font-mono text-[#15202b]">{order.order_number}</p>
                      <PortalStatusPill status={order.status} />
                    </div>
                    <p className="text-sm font-semibold text-[#334155] truncate">{title}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-DZ') : ''}
                    </p>
                  </div>
                  <div className="w-full lg:w-48">
                    <PortalProgress value={progress} />
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 lg:min-w-[140px]">
                    <span className="font-black text-[#0F766E]">
                      {Number(order.total || 0).toLocaleString()} د.ج
                    </span>
                    <span className="text-xs font-bold text-[#0F766E] inline-flex items-center gap-1">
                      تفاصيل <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
