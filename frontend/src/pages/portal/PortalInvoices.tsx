import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Banknote, CreditCard, AlertCircle } from 'lucide-react';
import { getPortalInvoices } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const PortalInvoices = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'invoices'],
    queryFn: getPortalInvoices,
  });
  const invoices = Array.isArray(data) ? data : [];
  const unpaid = invoices.filter((i: any) => i.derived_status !== 'paid');
  const unpaidTotal = unpaid.reduce(
    (s: number, i: any) => s + Number(i.remaining_amount ?? i.total_amount ?? 0),
    0
  );

  return (
    <div className="space-y-6 overflow-x-hidden" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0F766E] to-[#14B8A6] p-5 text-white shadow-lg">
        <FileText className="absolute -left-2 -bottom-2 w-24 h-24 opacity-15" />
        <h1 className="text-2xl font-black flex items-center gap-2">
          <FileText className="w-6 h-6" /> الفواتير
        </h1>
        <p className="text-sm text-white/80 mt-1">مرتبطة بطلباتك ومدفوعاتك مباشرة</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-white/15 p-3">
            <p className="text-[10px] text-white/70">غير مدفوعة</p>
            <p className="text-2xl font-black mt-1">{unpaid.length}</p>
          </div>
          <div className="rounded-2xl bg-amber-400/90 text-[#134E4A] p-3">
            <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
              <Banknote className="w-3 h-3" /> المستحق
            </p>
            <p className="text-xl font-black mt-1">{unpaidTotal.toLocaleString()} د.ج</p>
          </div>
        </div>
      </div>

      {isLoading && <p className="animate-pulse text-[#64748B]">جاري التحميل...</p>}
      {isError && <p className="text-red-500">تعذر تحميل الفواتير</p>}
      {!isLoading && invoices.length === 0 && (
        <div className="rounded-2xl border border-[#E6ECF2] bg-white p-10 text-center text-[#94A3B8]">
          لا توجد فواتير بعد
        </div>
      )}

      <div className="space-y-3">
        {invoices.map((inv: any) => {
          const status = inv.derived_status || inv.status;
          const unpaidInv = status !== 'paid';
          const remaining = Number(inv.remaining_amount ?? inv.total_amount ?? 0);
          const paid = Number(inv.paid_amount || 0);
          return (
            <div
              key={inv.id}
              className="rounded-2xl border border-[#E6ECF2] bg-white p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold font-mono text-[#15202b]">{inv.invoice_number}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    طلب: {inv.order?.order_number || '—'} ·{' '}
                    {inv.issue_date
                      ? new Date(inv.issue_date).toLocaleDateString('ar-DZ')
                      : ''}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'partial'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-600'
                  }`}
                >
                  {status === 'paid' ? 'مدفوعة' : status === 'partial' ? 'جزئية' : 'غير مدفوعة'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#F8FAFC] p-2">
                  <p className="text-[10px] text-[#94A3B8]">الإجمالي</p>
                  <p className="font-black text-sm">
                    {Number(inv.total_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2">
                  <p className="text-[10px] text-emerald-700">مدفوع</p>
                  <p className="font-black text-sm text-emerald-700">{paid.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2">
                  <p className="text-[10px] text-amber-700">متبقي</p>
                  <p className="font-black text-sm text-amber-700">{remaining.toLocaleString()}</p>
                </div>
              </div>

              {Array.isArray(inv.payments) && inv.payments.length > 0 && (
                <div className="text-xs text-[#64748B] space-y-1 border-t border-[#F1F5F9] pt-2">
                  <p className="font-bold text-[#15202b] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#0F766E]" /> مدفوعات مرتبطة
                  </p>
                  {inv.payments.slice(0, 3).map((p: any) => (
                    <p key={p.id}>
                      {Number(p.amount).toLocaleString()} د.ج ·{' '}
                      {p.status === 'pending_review'
                        ? 'قيد المراجعة'
                        : p.status === 'confirmed'
                          ? 'مؤكد'
                          : p.status}
                    </p>
                  ))}
                </div>
              )}

              {unpaidInv && (
                <Button
                  className="w-full bg-[#0F766E] text-white gap-2"
                  onClick={() => navigate(`/portal/payments?invoice=${inv.id}`)}
                >
                  <Banknote className="w-4 h-4" /> ادفع المتبقي ({remaining.toLocaleString()} د.ج)
                </Button>
              )}
              {!unpaidInv && (
                <p className="text-xs text-emerald-700 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> تم سداد هذه الفاتورة
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
