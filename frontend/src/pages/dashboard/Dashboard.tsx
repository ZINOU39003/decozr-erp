import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore, type WidgetConfig } from '../../store/useDashboardStore';
import { Button } from '../../components/ui/Button';
import {
  Settings2,
  Pin,
  ChevronUp,
  ChevronDown,
  EyeOff,
  Loader2,
  Banknote,
  Package,
  CheckSquare,
  Boxes,
  Activity,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getAdminPortalInbox } from '../../services/api';

const KPIRevenue = ({ data }: { data: any }) => {
  const revenue = data?.total_revenue || 0;
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-black text-[#0F766E] flex items-center gap-2">
        <Banknote className="w-6 h-6 opacity-70" />
        {Number(revenue).toLocaleString()}
      </span>
      <span className="text-xs text-[#64748B] mt-1 font-bold">د.ج · إجمالي الإيرادات</span>
      <span className="text-sm text-emerald-600 mt-2 font-bold">+12% من الشهر الماضي</span>
    </div>
  );
};

const KPIOrders = ({ data }: { data: any }) => {
  const activeOrders = data?.active_orders || 0;
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-black text-[#15202b] flex items-center gap-2">
        <Package className="w-6 h-6 text-amber-500" />
        {activeOrders}
      </span>
      <span className="text-xs text-[#64748B] mt-1 font-bold">طلبات نشطة</span>
    </div>
  );
};

const KPITasks = ({ data }: { data: any }) => {
  const pendingJobs = data?.pending_machine_jobs || 0;
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-black text-amber-600 flex items-center gap-2">
        <CheckSquare className="w-6 h-6" />
        {pendingJobs}
      </span>
      <span className="text-xs text-[#64748B] mt-1 font-bold">مهام قيد الانتظار</span>
    </div>
  );
};

const KPIInventory = ({ data }: { data: any }) => {
  return (
    <div className="flex flex-col">
      <span className="text-2xl sm:text-3xl font-black text-red-500 flex items-center gap-2">
        <Boxes className="w-6 h-6" />0
      </span>
      <span className="text-xs text-[#64748B] mt-1 font-bold">مواد منخفضة المخزون</span>
    </div>
  );
};

const MachineStatus = ({ data }: { data: any }) => {
  const topDesigns = data?.top_designs || [];
  return (
    <div className="space-y-3">
      {topDesigns.length === 0 && (
        <p className="text-sm text-[#94A3B8]">لا بيانات تصاميم بعد</p>
      )}
      {topDesigns.map((d: any, i: number) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 bg-[#F6F8FB] rounded-xl border border-[#E6ECF2]"
        >
          <span className="font-bold text-[#15202b] text-sm truncate">{d.name}</span>
          <span className="text-sm font-bold text-[#0F766E] shrink-0">{d.quantity} وحدة</span>
        </div>
      ))}
    </div>
  );
};

const RecentActivity = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 text-sm text-[#64748B]">
      <Activity className="w-4 h-4 text-[#0F766E]" />
      تابع نشاط بوابة العملاء من القائمة الجانبية
    </div>
  </div>
);

const WidgetRenderer = ({
  widget,
  data,
  isLoading,
}: {
  widget: WidgetConfig;
  data: any;
  isLoading: boolean;
}) => {
  const { toggleCollapse, togglePin, toggleVisibility } = useDashboardStore();
  if (widget.isHidden) return null;

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin text-[#94A3B8]" />
        </div>
      );
    switch (widget.type) {
      case 'KPI_REVENUE':
        return <KPIRevenue data={data} />;
      case 'KPI_ORDERS':
        return <KPIOrders data={data} />;
      case 'KPI_TASKS':
        return <KPITasks data={data} />;
      case 'KPI_INVENTORY':
        return <KPIInventory data={data} />;
      case 'MACHINE_STATUS':
        return <MachineStatus data={data} />;
      case 'RECENT_ACTIVITY':
        return <RecentActivity />;
      default:
        return <div className="text-[#94A3B8] p-4 text-center text-sm">غير مدعوم</div>;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#E6ECF2] bg-white shadow-sm overflow-hidden ${
        widget.w > 1 ? 'sm:col-span-2' : ''
      } ${widget.isPinned ? 'ring-2 ring-[#0F766E]/25' : ''}`}
    >
      <div className="px-4 py-3 border-b border-[#EEF2F6] flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#15202b] flex items-center gap-2 min-w-0 truncate">
          {widget.isPinned && <Pin className="w-3 h-3 text-[#0F766E] shrink-0" />}
          {widget.title}
        </h3>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9]"
            onClick={() => toggleCollapse(widget.id)}
          >
            {widget.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hidden sm:inline-flex"
            onClick={() => togglePin(widget.id)}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 hidden sm:inline-flex"
            onClick={() => toggleVisibility(widget.id)}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!widget.isCollapsed && <div className="p-4 sm:p-5">{renderContent()}</div>}
    </div>
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { widgets, resetToDefault } = useDashboardStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard_summary'],
    queryFn: getDashboardSummary,
  });
  const inboxQ = useQuery({
    queryKey: ['admin', 'portal', 'inbox'],
    queryFn: getAdminPortalInbox,
    retry: 0,
  });

  const visibleWidgets = [...widgets]
    .filter((w) => !w.isHidden)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.order - b.order;
    });

  const counts = inboxQ.data?.counts || {};

  return (
    <div className="space-y-5 overflow-x-hidden" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F766E] to-[#14B8A6] p-5 sm:p-6 text-white shadow-lg">
        <Sparkles className="absolute left-4 top-4 w-10 h-10 opacity-20" />
        <h1 className="text-2xl font-black">لوحة القيادة</h1>
        <p className="text-sm text-white/80 mt-1">نظرة شاملة على الورشة وبوابة العملاء</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/portal')}
            className="rounded-2xl bg-white/15 p-3 text-right hover:bg-white/25 transition"
          >
            <Inbox className="w-4 h-4 mb-1 opacity-80" />
            <p className="text-[10px] text-white/70">مدفوعات معلّقة</p>
            <p className="text-xl font-black">{counts.pending_payments || 0}</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/portal')}
            className="rounded-2xl bg-white/15 p-3 text-right hover:bg-white/25 transition"
          >
            <p className="text-[10px] text-white/70">تصاميم خاصة</p>
            <p className="text-xl font-black mt-3">{counts.custom_requests_new || 0}</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-2xl bg-white/15 p-3 text-right hover:bg-white/25 transition"
          >
            <p className="text-[10px] text-white/70">طلبات نشطة</p>
            <p className="text-xl font-black mt-3">{data?.active_orders || 0}</p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/portal')}
            className="rounded-2xl bg-amber-400/90 text-[#134E4A] p-3 text-right"
          >
            <p className="text-[10px] font-bold opacity-80">مواعيد قادمة</p>
            <p className="text-xl font-black mt-3">{counts.appointments_upcoming || 0}</p>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-[#64748B] font-bold">الويدجتات</p>
        <Button
          variant="outline"
          onClick={resetToDefault}
          className="border-[#E6ECF2] text-[#15202b] gap-2"
        >
          <Settings2 className="w-4 h-4" /> استعادة الترتيب
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleWidgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} data={data} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
};
