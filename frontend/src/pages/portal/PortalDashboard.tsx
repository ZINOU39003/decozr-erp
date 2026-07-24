import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Package,
  FileText,
  Wallet,
  CalendarDays,
  MessageSquare,
  Plus,
  Phone,
  CreditCard,
  Upload,
  LifeBuoy,
  Star,
  ArrowLeft,
  Check,
  Bell,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getPortalDashboard,
  getPortalChatThreads,
  mediaUrl,
} from '../../services/api';
import { Button } from '../../components/ui/Button';
import {
  PortalKpiCard,
  PortalProgress,
  PortalSection,
  PortalStatusPill,
} from './components/PortalUI';

function daysUntil(date?: string | Date | null) {
  if (!date) return null;
  const d = new Date(date).getTime();
  const diff = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

function timeAgo(iso?: string | Date) {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m <= 1 ? 'الآن' : `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'أمس' : `قبل ${d} أيام`;
}

const weekDays = [
  { key: 'mon', label: 'الاثنين', hint: 'زيارة موقع' },
  { key: 'wed', label: 'الأربعاء', hint: 'تسليم مرحلي' },
  { key: 'thu', label: 'الخميس', hint: 'دفعة مالية' },
];

export const PortalDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch, error } = useQuery({
    queryKey: ['portal', 'dashboard'],
    queryFn: getPortalDashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const threadsQ = useQuery({
    queryKey: ['portal', 'chat', 'threads'],
    queryFn: getPortalChatThreads,
    retry: 1,
  });

  const firstName = useMemo(() => {
    const n = data?.customer_name || 'عميل';
    return String(n).split(/\s+/)[0];
  }, [data?.customer_name]);

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="rounded-2xl border border-[#E6ECF2] bg-white p-6 text-center">
          <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-[#0F766E] border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-[#15202b]">جاري تحميل لوحة التحكم...</p>
          <p className="text-xs text-[#64748B] mt-1">تأكد من اتصال الإنترنت وأن الخادم يعمل</p>
        </div>
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-[#E6ECF2]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 space-y-3" dir="rtl">
        <p className="font-bold">تعذر تحميل لوحة العميل</p>
        <p className="text-sm opacity-80">
          {(error as any)?.message || 'تحقق من تسجيل الدخول واتصال الخادم ثم أعد المحاولة.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-[#0F766E] text-white text-sm font-bold"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const s = data.summary || {};
  const project = data.current_project;
  const days = daysUntil(project?.promised_date || project?.due_date);
  const lastThread = Array.isArray(threadsQ.data) ? threadsQ.data[0] : null;
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const notifications = Array.isArray(data.notifications) ? data.notifications : [];
  const unpaid = Array.isArray(data.unpaid_invoices) ? data.unpaid_invoices : [];
  const orders = Array.isArray(data.recent_orders) ? data.recent_orders : [];

  const quickActions = [
    { label: 'طلب جديد', icon: Plus, to: '/portal/catalog', tone: 'bg-[#0F766E] text-white' },
    { label: 'طلب عرض سعر', icon: Phone, to: '/portal/whatsapp', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
    { label: 'دفع فاتورة', icon: CreditCard, to: '/portal/invoices', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
    { label: 'رفع ملف', icon: Upload, to: '/portal/profile', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
    { label: 'مراسلة الدعم', icon: LifeBuoy, to: '/portal/messages', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
    { label: 'حجز زيارة', icon: CalendarDays, to: '/portal/appointments', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
    { label: 'المفضلة', icon: Star, to: '/portal/favorites', tone: 'bg-white text-[#0F766E] border border-[#D7E5E3]' },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden text-[#15202b]" dir="rtl">
      {isFetching && (
        <p className="text-[11px] text-[#0F766E] font-bold">جاري تحديث البيانات...</p>
      )}
      {/* Welcome + Current project */}
      <div className="space-y-3 sm:hidden">
        <h1 className="text-xl font-black text-[#15202b]">مرحباً، {firstName} 👋</h1>
        <p className="text-sm text-[#64748B]">مرحباً بعودتك إلى لوحة التحكم</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E6ECF2] bg-white overflow-hidden shadow-[0_8px_30px_rgba(15,40,50,0.06)]"
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#0F766E]">مشروعك الحالي</p>
            <h2 className="text-lg font-black text-[#15202b] hidden sm:block">
              مرحباً، {firstName} 👋
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-[#D7E5E3] text-[#0F766E]"
            onClick={() => navigate('/portal/orders')}
          >
            كل المشاريع
          </Button>
        </div>

        {project ? (
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0 border-t border-[#EEF2F6]">
            <div className="relative min-h-[220px] bg-[#F1F5F9]">
              <img
                src={
                  mediaUrl(project.image_url) ||
                  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200'
                }
                alt={project.title_ar}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Button
                size="sm"
                className="absolute bottom-4 right-4 bg-white text-[#0F766E] hover:bg-white/95"
                onClick={() => navigate(`/portal/orders/${project.order_id}`)}
              >
                عرض التصميم
              </Button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono text-[#94A3B8]">{project.order_number}</p>
                  <h3 className="text-xl font-black text-[#15202b] mt-1">{project.title_ar}</h3>
                </div>
                <PortalStatusPill status={project.status} />
              </div>
              <PortalProgress value={project.progress} />
              <div className="rounded-2xl bg-[#F6F8FB] p-3 text-sm">
                <p className="font-bold text-[#0F766E]">مرحلة الإنتاج</p>
                <p className="text-[#64748B] mt-1">
                  {days == null
                    ? 'موعد التسليم قيد التأكيد مع الورشة'
                    : days >= 0
                      ? `سيتم التسليم بعد ${days} يوم`
                      : `متأخر ${Math.abs(days)} يوم عن الموعد المتوقع`}
                </p>
              </div>
              <Button
                className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white"
                onClick={() => navigate(`/portal/orders/${project.order_id}`)}
              >
                عرض تفاصيل المشروع <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border-t border-[#EEF2F6]">
            <p className="font-bold text-[#15202b] mb-2">لا يوجد مشروع نشط بعد</p>
            <p className="text-sm text-[#64748B] mb-4">ابدأ من الكتالوج لإنشاء طلبك الأول</p>
            <Button className="bg-[#0F766E] text-white" onClick={() => navigate('/portal/catalog')}>
              تصفح الكتالوج
            </Button>
          </div>
        )}
      </motion.section>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <PortalKpiCard
          label="طلباتي"
          value={s.orders_count ?? 0}
          icon={<ShoppingCart className="w-5 h-5" />}
          tone="teal"
          delta="+18%"
          onClick={() => navigate('/portal/orders')}
        />
        <PortalKpiCard
          label="قيد التنفيذ"
          value={s.open_orders ?? 0}
          icon={<Package className="w-5 h-5" />}
          tone="amber"
          delta="+2"
          onClick={() => navigate('/portal/orders')}
        />
        <PortalKpiCard
          label="الفواتير"
          value={s.unpaid_invoices ?? 0}
          icon={<FileText className="w-5 h-5" />}
          tone="rose"
          onClick={() => navigate('/portal/invoices')}
        />
        <PortalKpiCard
          label="الرصيد"
          value={`${Number(s.remaining || 0).toLocaleString()} دج`}
          icon={<Wallet className="w-5 h-5" />}
          tone="emerald"
          onClick={() => navigate('/portal/payments')}
        />
        <PortalKpiCard
          label="المواعيد القادمة"
          value={s.appointments_week ?? 0}
          icon={<CalendarDays className="w-5 h-5" />}
          tone="sky"
          onClick={() => navigate('/portal/appointments')}
        />
        <PortalKpiCard
          label="رسائل جديدة"
          value={s.unread_messages ?? 0}
          icon={<MessageSquare className="w-5 h-5" />}
          tone="violet"
          onClick={() => navigate('/portal/messages')}
        />
      </div>

      {/* Quick actions */}
      <PortalSection title="إجراءات سريعة">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => navigate(a.to)}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${a.tone}`}
            >
              <a.icon className="w-4 h-4" />
              {a.label}
            </button>
          ))}
        </div>
      </PortalSection>

      <div className="grid xl:grid-cols-[0.9fr_1.4fr_0.9fr] gap-5">
        {/* Timeline */}
        <PortalSection title="تتبع المشروع">
          {project?.timeline?.length ? (
            <ol className="relative space-y-0 pr-1">
              {project.timeline.map((step: any, idx: number) => {
                const done = step.state === 'done';
                const current = step.state === 'current';
                return (
                  <li key={step.key} className="flex gap-3 pb-5 last:pb-0 relative">
                    {idx < project.timeline.length - 1 && (
                      <span className="absolute right-[11px] top-6 w-0.5 h-[calc(100%-8px)] bg-[#E2E8F0]" />
                    )}
                    <span
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        done
                          ? 'bg-[#22C55E] text-white'
                          : current
                            ? 'bg-[#0F766E] text-white ring-4 ring-[#0F766E]/20 animate-pulse'
                            : 'bg-white border-2 border-[#CBD5E1] text-transparent'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          current ? 'text-[#0F766E]' : done ? 'text-[#15202b]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {step.label_ar}
                      </p>
                      {current && <p className="text-[11px] text-[#64748B] mt-0.5">المرحلة الحالية</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-[#64748B]">سيظهر التتبع بعد إنشاء طلب</p>
          )}
        </PortalSection>

        {/* Orders table */}
        <PortalSection
          title="آخر الطلبات"
          action={
            <button
              className="text-xs font-bold text-[#0F766E]"
              onClick={() => navigate('/portal/orders')}
            >
              عرض الكل
            </button>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-[11px] text-[#94A3B8] border-b border-[#EEF2F6]">
                  <th className="text-right font-bold pb-3">رقم الطلب</th>
                  <th className="text-right font-bold pb-3">المشروع</th>
                  <th className="text-right font-bold pb-3">الحالة</th>
                  <th className="text-right font-bold pb-3">التقدم</th>
                  <th className="text-right font-bold pb-3">التاريخ</th>
                  <th className="text-right font-bold pb-3">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#94A3B8]">
                      لا توجد طلبات بعد
                    </td>
                  </tr>
                )}
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="py-3 font-mono text-xs font-bold text-[#334155]">{o.order_number}</td>
                    <td className="py-3 font-semibold text-[#15202b] max-w-[140px] truncate">
                      {o.title_ar}
                    </td>
                    <td className="py-3">
                      <PortalStatusPill status={o.status} />
                    </td>
                    <td className="py-3 w-28">
                      <div className="h-1.5 rounded-full bg-[#E8EEF3] overflow-hidden">
                        <div
                          className="h-full bg-[#0F766E]"
                          style={{ width: `${o.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#64748B]">{o.progress || 0}%</span>
                    </td>
                    <td className="py-3 text-xs text-[#64748B]">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString('ar-DZ')
                        : '—'}
                    </td>
                    <td className="py-3">
                      <button
                        className="text-xs font-bold text-[#0F766E] hover:underline"
                        onClick={() => navigate(`/portal/orders/${o.id}`)}
                      >
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalSection>

        {/* Notifications */}
        <PortalSection
          title="الإشعارات"
          action={
            <button
              className="text-xs font-bold text-[#0F766E]"
              onClick={() => navigate('/portal/notifications')}
            >
              الكل
            </button>
          }
        >
          <div className="space-y-3">
            {notifications.length === 0 && (
              <p className="text-sm text-[#94A3B8] text-center py-6">لا إشعارات</p>
            )}
            {notifications.slice(0, 5).map((n: any) => (
              <button
                key={n.id}
                type="button"
                onClick={() => navigate('/portal/notifications')}
                className="w-full text-right flex gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#15202b] truncate">{n.title_ar}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            ))}
          </div>
        </PortalSection>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Invoices */}
        <PortalSection title="الفواتير">
          <div className="rounded-2xl bg-[#FEF2F2] border border-red-100 p-4 mb-4">
            <p className="text-xs font-bold text-red-500">غير مدفوعة</p>
            <p className="text-3xl font-black text-[#15202b] mt-1">{s.unpaid_invoices ?? 0}</p>
            <p className="text-sm text-[#64748B] mt-1">
              إجمالي {Number(s.unpaid_total || 0).toLocaleString()} د.ج
            </p>
            <Button
              className="w-full mt-3 bg-[#0F766E] text-white"
              onClick={() => navigate('/portal/invoices')}
            >
              ادفع الآن
            </Button>
          </div>
          <div className="space-y-2">
            {unpaid.slice(0, 3).map((inv: any) => (
              <div
                key={inv.id}
                className="flex justify-between text-sm py-2 border-b border-[#F1F5F9] last:border-0"
              >
                <span className="font-mono text-xs text-red-500 font-bold">
                  {inv.invoice_number}
                </span>
                <span className="font-bold">
                  {Number(inv.total_amount || 0).toLocaleString()} د.ج
                </span>
              </div>
            ))}
            {unpaid.length === 0 && (
              <p className="text-xs text-[#94A3B8] text-center py-2">لا فواتير مستحقة</p>
            )}
          </div>
        </PortalSection>

        {/* Projects cards */}
        <PortalSection
          title="المشاريع"
          action={
            <button className="text-xs font-bold text-[#0F766E]" onClick={() => navigate('/portal/orders')}>
              الكل
            </button>
          }
        >
          <div className="space-y-3">
            {projects.length === 0 && (
              <p className="text-sm text-[#94A3B8] text-center py-6">لا مشاريع بعد</p>
            )}
            {projects.slice(0, 3).map((p: any) => (
              <button
                key={p.order_id}
                type="button"
                onClick={() => navigate(`/portal/orders/${p.order_id}`)}
                className="w-full text-right flex gap-3 p-2 rounded-2xl border border-[#EEF2F6] hover:border-[#0F766E]/30"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F1F5F9] shrink-0">
                  <img
                    src={
                      mediaUrl(p.image_url) ||
                      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=200'
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="font-bold text-sm truncate">{p.title_ar}</p>
                  <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">{p.order_number}</p>
                  <div className="mt-2">
                    <PortalProgress value={p.progress} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PortalSection>

        {/* Messages */}
        <PortalSection title="الرسائل">
          <div className="rounded-2xl border border-[#E6ECF2] p-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">الدعم الفني / الورشة</p>
                <p className="text-[11px] text-[#94A3B8]">آخر رسالة</p>
              </div>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed min-h-[48px]">
              {lastThread?.last_message?.body_ar ||
                'ابدأ محادثة بخصوص أحد طلباتك لمتابعة التفاصيل مع الورشة.'}
            </p>
            <Button
              className="w-full mt-4 bg-[#0F766E] text-white"
              onClick={() => navigate('/portal/messages')}
            >
              فتح المحادثة
            </Button>
          </div>
        </PortalSection>
      </div>

      {/* Gallery */}
      <PortalSection
        title="آخر التصاميم"
        action={
          <button className="text-xs font-bold text-[#0F766E]" onClick={() => navigate('/portal/catalog')}>
            المعرض
          </button>
        }
      >
        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
          {gallery.length === 0 && (
            <div className="w-full py-10 text-center text-sm text-[#94A3B8] flex flex-col items-center">
              <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
              لا تصاميم في المعرض بعد
            </div>
          )}
          {gallery.map((d: any) => (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate('/portal/catalog')}
              className="min-w-[200px] max-w-[200px] rounded-2xl overflow-hidden border border-[#E6ECF2] bg-[#F8FAFC] text-right shrink-0 hover:border-[#0F766E]/40"
            >
              <div className="aspect-[4/3] bg-[#E2E8F0]">
                <img
                  src={
                    mediaUrl(d.image_url) ||
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={d.name_ar}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold truncate">{d.name_ar}</p>
                <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{d.code}</p>
              </div>
            </button>
          ))}
        </div>
      </PortalSection>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Files */}
        <PortalSection title="آخر الملفات">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {['PDF', 'AI', 'JPG', 'DWG'].map((ext) => (
              <div
                key={ext}
                className="rounded-2xl border border-dashed border-[#D7E5E3] bg-[#F8FAFC] p-4 text-center"
              >
                <FolderOpen className="w-5 h-5 mx-auto text-[#0F766E] mb-2" />
                <p className="text-xs font-black text-[#15202b]">{ext}</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full border-[#D7E5E3] text-[#0F766E]"
            onClick={() => navigate('/portal/profile')}
          >
            <Upload className="w-4 h-4 ml-2" /> رفع ملف
          </Button>
        </PortalSection>

        {/* Calendar week */}
        <PortalSection title="هذا الأسبوع">
          <div className="space-y-3">
            {weekDays.map((d) => (
              <div
                key={d.key}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F8FB] border border-[#EEF2F6]"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E6ECF2] flex flex-col items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-[#0F766E]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#15202b]">{d.label}</p>
                  <p className="text-xs text-[#64748B]">{d.hint}</p>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-[#94A3B8] text-center pt-1">
              المواعيد الفعلية ستظهر هنا عند ربط جدولة الورشة
            </p>
          </div>
        </PortalSection>
      </div>

      <footer className="pt-4 pb-2 border-t border-[#E6ECF2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <p>
          <span className="font-black text-[#0F766E]">DecoZR ERP</span> · نسخة العميل
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/portal/whatsapp" className="hover:text-[#0F766E]">
            الدعم
          </Link>
          <Link to="/portal/profile" className="hover:text-[#0F766E]">
            الخصوصية
          </Link>
          <Link to="/portal/profile" className="hover:text-[#0F766E]">
            الإعدادات
          </Link>
        </div>
      </footer>
    </div>
  );
};
