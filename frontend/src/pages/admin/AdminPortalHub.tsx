import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  CreditCard,
  MessageSquare,
  Sparkles,
  CalendarDays,
  Check,
  X,
  Send,
  Banknote,
  Users,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  getAdminPortalInbox,
  getAdminPortalPayments,
  getAdminPortalSupportThreads,
  getAdminPortalSupportMessages,
  replyAdminPortalSupport,
  reviewAdminPortalPayment,
  getAdminPortalCustomRequests,
  updateAdminPortalCustomRequest,
  getAdminPortalAppointments,
  mediaUrl,
} from '../../services/api';
import { Button } from '../../components/ui/Button';

type Tab = 'overview' | 'payments' | 'support' | 'custom' | 'appointments';

const methodLabel: Record<string, string> = {
  baridi_mob: 'بريدي موب',
  poste: 'مكتب البريد',
  app: 'تطبيق بنكي',
  cash: 'نقداً',
};

export const AdminPortalHub = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [viewer, setViewer] = useState<string | null>(null);

  const inboxQ = useQuery({ queryKey: ['admin', 'portal', 'inbox'], queryFn: getAdminPortalInbox });
  const paymentsQ = useQuery({
    queryKey: ['admin', 'portal', 'payments'],
    queryFn: getAdminPortalPayments,
    enabled: tab === 'payments' || tab === 'overview',
  });
  const threadsQ = useQuery({
    queryKey: ['admin', 'portal', 'support-threads'],
    queryFn: getAdminPortalSupportThreads,
    enabled: tab === 'support',
  });
  const msgsQ = useQuery({
    queryKey: ['admin', 'portal', 'support', customerId],
    queryFn: () => getAdminPortalSupportMessages(customerId!),
    enabled: tab === 'support' && !!customerId,
    refetchInterval: 8000,
  });
  const customQ = useQuery({
    queryKey: ['admin', 'portal', 'custom'],
    queryFn: getAdminPortalCustomRequests,
    enabled: tab === 'custom' || tab === 'overview',
  });
  const apptQ = useQuery({
    queryKey: ['admin', 'portal', 'appointments'],
    queryFn: getAdminPortalAppointments,
    enabled: tab === 'appointments',
  });

  const reviewMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'confirm' | 'reject' }) =>
      reviewAdminPortalPayment(id, action),
    onSuccess: () => {
      toast.success('تم تحديث حالة الدفع');
      qc.invalidateQueries({ queryKey: ['admin', 'portal'] });
    },
    onError: () => toast.error('تعذر التحديث'),
  });

  const replyMut = useMutation({
    mutationFn: () => replyAdminPortalSupport(customerId!, draft),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['admin', 'portal', 'support', customerId] });
      qc.invalidateQueries({ queryKey: ['admin', 'portal', 'support-threads'] });
      toast.success('تم إرسال الرد للعميل');
    },
    onError: () => toast.error('تعذر الإرسال'),
  });

  const customMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAdminPortalCustomRequest(id, status),
    onSuccess: () => {
      toast.success('تم تحديث الطلب');
      qc.invalidateQueries({ queryKey: ['admin', 'portal', 'custom'] });
      qc.invalidateQueries({ queryKey: ['admin', 'portal', 'inbox'] });
    },
  });

  const counts = inboxQ.data?.counts || {};
  const payments = useMemo(
    () => (Array.isArray(paymentsQ.data) ? paymentsQ.data : []),
    [paymentsQ.data]
  );
  const pending = payments.filter((p: any) => p.status === 'pending_review');
  const threads = Array.isArray(threadsQ.data) ? threadsQ.data : [];
  const messages = Array.isArray(msgsQ.data) ? msgsQ.data : [];
  const customs = Array.isArray(customQ.data) ? customQ.data : [];
  const appointments = Array.isArray(apptQ.data) ? apptQ.data : [];

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: Inbox },
    { id: 'payments', label: 'مدفوعات البوابة', icon: CreditCard, badge: counts.pending_payments },
    { id: 'support', label: 'رسائل العملاء', icon: MessageSquare },
    { id: 'custom', label: 'تصاميم خاصة', icon: Sparkles, badge: counts.custom_requests_new },
    { id: 'appointments', label: 'المواعيد', icon: CalendarDays, badge: counts.appointments_upcoming },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {viewer && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setViewer(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/\.pdf/i.test(viewer) ? (
              <iframe src={mediaUrl(viewer) || viewer} className="w-full h-[70vh]" title="وصل" />
            ) : (
              <img src={mediaUrl(viewer) || viewer} alt="وصل" className="w-full rounded-xl" />
            )}
            <Button className="w-full mt-3" variant="outline" onClick={() => setViewer(null)}>
              إغلاق
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)] flex items-center gap-2">
            <Users className="text-[var(--color-primary-500)]" /> بوابة العملاء
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            كل ما يرسله العميل من البوابة يصل هنا للمتابعة والرد والاعتماد
          </p>
        </div>
        <Link
          to="/customers"
          className="text-sm font-bold text-[var(--color-primary-600)] flex items-center gap-1"
        >
          قائمة العملاء <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
              tab === t.id
                ? 'bg-[var(--color-primary-600)] text-white border-transparent'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {!!t.badge && t.badge > 0 && (
              <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-amber-400 text-[#134E4A] text-[10px] flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'مدفوعات بانتظار الاعتماد', value: counts.pending_payments || 0, tone: 'bg-amber-50 text-amber-800' },
              { label: 'رسائل الأسبوع', value: counts.support_messages_week || 0, tone: 'bg-sky-50 text-sky-800' },
              { label: 'تصاميم خاصة جديدة', value: counts.custom_requests_new || 0, tone: 'bg-violet-50 text-violet-800' },
              { label: 'مواعيد قادمة', value: counts.appointments_upcoming || 0, tone: 'bg-emerald-50 text-emerald-800' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl p-4 border border-black/5 ${c.tone}`}>
                <p className="text-xs font-bold opacity-80">{c.label}</p>
                <p className="text-3xl font-black mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4" /> أحدث إثباتات الدفع
              </h2>
              {(inboxQ.data?.recent_payments || []).length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)]">لا إثباتات بانتظار المراجعة</p>
              )}
              {(inboxQ.data?.recent_payments || []).map((p: any) => (
                <div key={p.id} className="py-2 border-b border-[var(--color-border)] last:border-0 text-sm">
                  <p className="font-bold">{p.customer?.name_ar}</p>
                  <p className="text-[var(--color-text-muted)]">
                    {Number(p.amount).toLocaleString()} د.ج · {methodLabel[p.payment_method] || p.payment_method}
                  </p>
                </div>
              ))}
              <Button className="mt-3 w-full" variant="outline" onClick={() => setTab('payments')}>
                إدارة المدفوعات
              </Button>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> طلبات تصميم خاصة
              </h2>
              {(inboxQ.data?.recent_custom || []).length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)]">لا طلبات جديدة</p>
              )}
              {(inboxQ.data?.recent_custom || []).map((r: any) => (
                <div key={r.id} className="py-2 border-b border-[var(--color-border)] last:border-0 text-sm">
                  <p className="font-bold">{r.title_ar}</p>
                  <p className="text-[var(--color-text-muted)]">{r.customer?.name_ar}</p>
                </div>
              ))}
              <Button className="mt-3 w-full" variant="outline" onClick={() => setTab('custom')}>
                عرض الطلبات
              </Button>
            </section>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-3">
          {paymentsQ.isLoading && <p className="animate-pulse">جاري التحميل...</p>}
          {pending.length === 0 && !paymentsQ.isLoading && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center text-[var(--color-text-muted)]">
              لا مدفوعات بانتظار الاعتماد حالياً
            </div>
          )}
          {payments.map((p: any) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-3"
            >
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-bold">{p.customer?.name_ar}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {p.payment_number} · {methodLabel[p.payment_method] || p.payment_method}
                    {p.invoice?.invoice_number ? ` · فاتورة ${p.invoice.invoice_number}` : ''}
                    {p.order?.order_number ? ` · طلب ${p.order.order_number}` : ''}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg text-emerald-600">
                    {Number(p.amount).toLocaleString()} د.ج
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'pending_review'
                        ? 'bg-amber-50 text-amber-700'
                        : p.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {p.status === 'pending_review'
                      ? 'قيد المراجعة'
                      : p.status === 'confirmed'
                        ? 'مؤكد'
                        : 'مرفوض'}
                  </span>
                </div>
              </div>
              {p.receipt_url && (
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--color-primary-600)] underline"
                  onClick={() => setViewer(p.receipt_url)}
                >
                  عرض الوصل
                </button>
              )}
              {p.status === 'pending_review' && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-600 text-white gap-1"
                    onClick={() => reviewMut.mutate({ id: p.id, action: 'confirm' })}
                  >
                    <Check className="w-4 h-4" /> اعتماد
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 gap-1"
                    onClick={() => reviewMut.mutate({ id: p.id, action: 'reject' })}
                  >
                    <X className="w-4 h-4" /> رفض
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'support' && (
        <div className="h-[min(70vh,640px)] flex rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)]">
          <aside className="w-full max-w-[280px] border-l border-[var(--color-border)] overflow-y-auto">
            {threads.map((t: any) => (
              <button
                key={t.customer_id}
                type="button"
                onClick={() => setCustomerId(t.customer_id)}
                className={`w-full text-right p-3 border-b border-[var(--color-border)] ${
                  customerId === t.customer_id ? 'bg-[var(--color-primary-500)]/10' : ''
                }`}
              >
                <p className="font-bold text-sm">{t.customer?.name_ar}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">
                  {t.last_message?.body_ar}
                </p>
              </button>
            ))}
            {!threads.length && (
              <p className="p-6 text-sm text-[var(--color-text-muted)]">لا محادثات بعد</p>
            )}
          </aside>
          <section className="flex-1 flex flex-col min-w-0">
            {!customerId ? (
              <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                اختر عميلاً للرد
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--color-bg-main)]">
                  {messages.map((m: any) => {
                    const fromCustomer = !!m.sender?.customer_id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${fromCustomer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            fromCustomer
                              ? 'bg-white border border-[var(--color-border)]'
                              : 'bg-[var(--color-primary-600)] text-white'
                          }`}
                        >
                          <p className="text-[10px] opacity-70 mb-1">
                            {m.sender?.full_name_ar || 'مستخدم'}
                          </p>
                          <p className="whitespace-pre-wrap">{m.body_ar}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-[var(--color-border)] flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && draft.trim()) replyMut.mutate();
                    }}
                    placeholder="اكتب رداً للعميل..."
                    className="flex-1 h-11 rounded-xl border border-[var(--color-border)] px-3 text-sm bg-[var(--color-bg-main)]"
                  />
                  <Button
                    className="bg-[var(--color-primary-600)] text-white"
                    disabled={!draft.trim() || replyMut.isPending}
                    onClick={() => replyMut.mutate()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {tab === 'custom' && (
        <div className="space-y-3">
          {customs.length === 0 && (
            <div className="rounded-2xl border border-[var(--color-border)] p-8 text-center text-[var(--color-text-muted)]">
              لا طلبات تصميم خاصة
            </div>
          )}
          {customs.map((r: any) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 space-y-3"
            >
              <div className="flex gap-3">
                {r.reference_image && (
                  <img
                    src={mediaUrl(r.reference_image) || r.reference_image}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{r.title_ar}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {r.customer?.name_ar} · {r.request_type} · {r.status}
                  </p>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{r.description_ar}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {[
                      r.width_cm && `عرض ${r.width_cm}`,
                      r.height_cm && `ارتفاع ${r.height_cm}`,
                      r.depth_cm && `عمق ${r.depth_cm}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['reviewing', 'quoted', 'accepted', 'rejected'].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    className={r.status === s ? 'border-[var(--color-primary-500)]' : ''}
                    onClick={() => customMut.mutate({ id: r.id, status: s })}
                  >
                    {s === 'reviewing'
                      ? 'مراجعة'
                      : s === 'quoted'
                        ? 'عرض سعر'
                        : s === 'accepted'
                          ? 'قبول'
                          : 'رفض'}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="space-y-3">
          {appointments.length === 0 && (
            <div className="rounded-2xl border border-[var(--color-border)] p-8 text-center text-[var(--color-text-muted)]">
              لا مواعيد
            </div>
          )}
          {appointments.map((a: any) => (
            <div
              key={a.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 flex justify-between gap-3"
            >
              <div>
                <p className="font-bold">{a.title_ar}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {a.customer?.name_ar} · {new Date(a.starts_at).toLocaleString('ar-DZ')}
                </p>
                {a.notes && <p className="text-sm mt-2">{a.notes}</p>}
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 h-fit">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
