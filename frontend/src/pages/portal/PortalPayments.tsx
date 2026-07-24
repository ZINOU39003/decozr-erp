import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Banknote,
  CreditCard,
  Upload,
  Wallet,
  Copy,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPortalPaymentSummary,
  mediaUrl,
  submitPortalPaymentProof,
  uploadPortalReceipt,
} from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ReceiptViewer } from './components/ReceiptViewer';

const methodLabel: Record<string, string> = {
  baridi_mob: 'بريدي موب',
  poste: 'مكتب البريد',
  app: 'تطبيق بنكي',
  cash: 'نقداً',
};

export const PortalPayments = () => {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['portal', 'payments', 'summary'],
    queryFn: getPortalPaymentSummary,
  });

  const [method, setMethod] = useState<'baridi_mob' | 'poste' | 'app'>('baridi_mob');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const unpaidInvoices = Array.isArray(data?.unpaid_invoices) ? data.unpaid_invoices : [];

  useEffect(() => {
    const fromUrl = params.get('invoice');
    if (fromUrl) setInvoiceId(fromUrl);
  }, [params]);

  useEffect(() => {
    if (!invoiceId || !unpaidInvoices.length) return;
    const inv = unpaidInvoices.find((i: any) => i.id === invoiceId);
    if (inv && !amount) {
      setAmount(String(Math.round(Number(inv.remaining_amount || inv.total_amount || 0))));
    }
  }, [invoiceId, unpaidInvoices, amount]);

  const submitMut = useMutation({
    mutationFn: () =>
      submitPortalPaymentProof({
        amount: Number(amount),
        payment_method: method,
        reference: reference || undefined,
        notes: notes || undefined,
        receipt_url: receiptUrl || undefined,
        invoice_id: invoiceId || undefined,
      }),
    onSuccess: () => {
      toast.success('تم إرسال إثبات الدفع للمراجعة');
      setAmount('');
      setReference('');
      setNotes('');
      setReceiptUrl('');
      setInvoiceId('');
      qc.invalidateQueries({ queryKey: ['portal', 'payments'] });
      qc.invalidateQueries({ queryKey: ['portal', 'invoices'] });
      qc.invalidateQueries({ queryKey: ['portal', 'dashboard'] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'تعذر إرسال إثبات الدفع'),
  });

  const baridi = data?.methods?.baridi_mob || {};
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const byDay = Array.isArray(data?.by_day) ? data.by_day : [];

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم النسخ');
    } catch {
      toast.error('تعذر النسخ');
    }
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      let toUpload = file;
      if (file.type.startsWith('image/')) {
        const { compressImageFile } = await import('../../lib/compressImage');
        toUpload = await compressImageFile(file, { maxWidth: 1600, maxBytes: 900 * 1024 });
      }
      const res: any = await uploadPortalReceipt(toUpload);
      setReceiptUrl(res.url);
      toast.success('تم رفع الوصل');
    } catch {
      toast.error('تعذر رفع الملف (صورة أو PDF)');
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = useMemo(
    () => ({
      pending_review: { label: 'قيد المراجعة', cls: 'bg-amber-50 text-amber-700' },
      confirmed: { label: 'مؤكد', cls: 'bg-emerald-50 text-emerald-700' },
      rejected: { label: 'مرفوض', cls: 'bg-red-50 text-red-600' },
    }),
    []
  );

  if (isLoading) {
    return <p className="animate-pulse text-[#64748B]">جاري تحميل المدفوعات...</p>;
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
        تعذر التحميل{' '}
        <button className="underline font-bold" onClick={() => refetch()}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden" dir="rtl">
      <ReceiptViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F766E] to-[#14B8A6] p-5 text-white shadow-lg">
        <Coins className="absolute -left-2 -bottom-2 w-28 h-28 opacity-15" />
        <p className="text-sm font-bold text-white/80 flex items-center gap-2">
          <Banknote className="w-4 h-4" /> المدفوعات بالدينار الجزائري
        </p>
        <h1 className="text-2xl font-black mt-1">متابعة ما دُفع وما تبقى</h1>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
            <p className="text-[10px] text-white/70">المطلوب</p>
            <p className="font-black text-sm sm:text-lg mt-1">
              {Number(data.total_due || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
            <p className="text-[10px] text-white/70">المدفوع</p>
            <p className="font-black text-sm sm:text-lg mt-1">
              {Number(data.total_paid || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-400/90 text-[#134E4A] p-3">
            <p className="text-[10px] font-bold opacity-80">المتبقي</p>
            <p className="font-black text-sm sm:text-lg mt-1">
              {Number(data.remaining || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {byDay.length > 0 && (
        <div className="rounded-2xl border border-[#E6ECF2] bg-white p-4">
          <h2 className="font-bold text-[#15202b] mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#0F766E]" /> الدفع حسب اليوم
          </h2>
          <div className="space-y-2">
            {byDay.slice(0, 7).map((d: any) => (
              <div
                key={d.date}
                className="flex justify-between text-sm py-2 border-b border-[#F1F5F9] last:border-0"
              >
                <span className="text-[#64748B]">
                  {new Date(d.date).toLocaleDateString('ar-DZ', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="font-black text-[#0F766E]">
                  {Number(d.amount).toLocaleString()} د.ج
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#E6ECF2] bg-white p-5 space-y-4 shadow-sm">
        <h2 className="font-bold text-[#15202b] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#0F766E]" /> إرسال دفعة جديدة
        </h2>

        {unpaidInvoices.length > 0 && (
          <div>
            <label className="text-xs font-bold mb-1 block flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> ربط بفاتورة
            </label>
            <select
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] px-3 text-sm"
            >
              <option value="">بدون فاتورة محددة</option>
              {unpaidInvoices.map((inv: any) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} · متبقي{' '}
                  {Number(inv.remaining_amount || inv.total_amount || 0).toLocaleString()} د.ج
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['baridi_mob', 'بريدي موب'],
              ['poste', 'مكتب البريد'],
              ['app', 'تطبيق بنكي'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMethod(key)}
              className={`rounded-xl px-2 py-3 text-xs font-bold border ${
                method === key
                  ? 'bg-[#0F766E] text-white border-[#0F766E]'
                  : 'bg-[#F8FAFC] text-[#334155] border-[#E6ECF2]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {method === 'baridi_mob' && (
          <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-4 space-y-2 text-sm">
            <p className="font-bold text-[#0F766E]">حساب الورشة — بريدي موب</p>
            <div className="flex justify-between gap-2 items-center">
              <span>الاسم: {baridi.account_name || 'ورشة DecoZR'}</span>
            </div>
            <div className="flex justify-between gap-2 items-center">
              <span className="font-mono text-xs" dir="ltr">
                RIP: {baridi.rip || '—'}
              </span>
              <button
                type="button"
                onClick={() => copy(String(baridi.rip || ''))}
                className="p-1.5 rounded-lg hover:bg-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between gap-2 items-center">
              <span dir="ltr">الهاتف: {baridi.phone || '—'}</span>
              <button
                type="button"
                onClick={() => copy(String(baridi.phone || ''))}
                className="p-1.5 rounded-lg hover:bg-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#64748B]">{baridi.note_ar}</p>
          </div>
        )}

        {method !== 'baridi_mob' && (
          <p className="text-sm text-[#64748B] bg-[#F8FAFC] rounded-xl p-3">
            {data.methods?.[method]?.note_ar || 'أكمل الدفع ثم ارفع الوصل هنا'}
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold mb-1 block">المبلغ (د.ج)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 25000"
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">رقم العملية / المرجع</label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="اختياري"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block">ملاحظات</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="اختياري" />
        </div>
        <div>
          <label className="text-xs font-bold mb-2 block">إرفاق الوصل (صورة أو PDF)</label>
          <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0F766E]/40 bg-[#F0FDFA] p-4 cursor-pointer text-sm font-bold text-[#0F766E]">
            <Upload className="w-4 h-4" />
            {uploading
              ? 'جاري الرفع...'
              : receiptUrl
                ? 'تم رفع الوصل — اضغط لتغييره'
                : 'اختر ملف الوصل'}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {receiptUrl && (
            <button
              type="button"
              onClick={() => setViewerUrl(receiptUrl)}
              className="text-xs text-[#0F766E] underline mt-2 inline-block"
            >
              معاينة الوصل
            </button>
          )}
        </div>
        <Button
          className="w-full bg-[#0F766E] text-white"
          disabled={submitMut.isPending || uploading}
          onClick={() => {
            if (!amount || Number(amount) <= 0) return toast.error('أدخل مبلغاً صالحاً');
            if (!receiptUrl) return toast.error('أرفق وصل الدفع');
            submitMut.mutate();
          }}
        >
          {submitMut.isPending ? 'جاري الإرسال...' : 'تأكيد وإرسال الإثبات'}
        </Button>
      </div>

      <div className="rounded-2xl border border-[#E6ECF2] bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#EEF2F6] font-bold flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#0F766E]" /> سجل المدفوعات
        </div>
        {payments.length === 0 && (
          <p className="p-8 text-center text-sm text-[#94A3B8]">لا مدفوعات بعد</p>
        )}
        <div className="divide-y divide-[#F1F5F9]">
          {payments.map((p: any) => {
            const st = statusBadge[p.status as keyof typeof statusBadge] || statusBadge.confirmed;
            return (
              <div
                key={p.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-[#15202b]">
                    {methodLabel[p.payment_method] || p.payment_method}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1 flex-wrap">
                    <Clock className="w-3 h-3" />
                    {p.paid_at ? new Date(p.paid_at).toLocaleString('ar-DZ') : ''}
                    {p.invoice?.invoice_number ? ` · فاتورة ${p.invoice.invoice_number}` : ''}
                    {p.order?.order_number ? ` · ${p.order.order_number}` : ''}
                  </p>
                  {p.receipt_url && (
                    <button
                      type="button"
                      onClick={() => setViewerUrl(p.receipt_url)}
                      className="text-[11px] text-[#0F766E] underline font-bold mt-1"
                    >
                      عرض الوصل
                    </button>
                  )}
                </div>
                <div className="text-left space-y-1">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                  <p className="font-black text-emerald-600 flex items-center gap-1 justify-end">
                    <Banknote className="w-4 h-4" />
                    {Number(p.amount || 0).toLocaleString()} د.ج
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
