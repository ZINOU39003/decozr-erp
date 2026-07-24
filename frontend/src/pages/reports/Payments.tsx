import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { CreditCard, Plus, Search, RefreshCw, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useUIStore } from '../../store/uiStore';
import { getPayments } from '../../services/api';

const formatMoney = (n: number) => `${Number(n || 0).toLocaleString('ar-DZ')} د.ج`;

export const Payments = () => {
  const { modal } = useUIStore();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getPayments({ limit: 100 }),
  });

  const payments = useMemo(() => {
    const raw = (data as any)?.data ?? (Array.isArray(data) ? data : []);
    return raw.map((p: any) => ({
      ...p,
      number: p.payment_number || p.receipt_number || p.id?.slice(0, 8),
      when: p.paid_at || p.created_at || p.payment_date,
      customer_name:
        p.invoice?.order?.customer?.name_ar ||
        p.customer?.name_ar ||
        p.customer ||
        '—',
      invoice_no: p.invoice?.invoice_number || '—',
      method: p.payment_method || p.method || 'cash',
      status: p.status === 'confirmed' ? 'completed' : p.status || 'completed',
    }));
  }, [data]);

  const filtered = payments.filter((p: any) => {
    const hay = `${p.number} ${p.customer_name} ${p.invoice_no}`.toLowerCase();
    return !q || hay.includes(q.toLowerCase());
  });

  const monthTotal = filtered
    .filter((p: any) => p.status === 'completed' || p.status === 'confirmed')
    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

  const getMethodBadge = (method: string) => {
    if (method === 'bank_transfer' || method === 'baridi_mob')
      return (
        <span className="flex items-center gap-1 text-sm">
          <CreditCard className="w-3 h-3 text-[#0F766E]" /> تحويل
        </span>
      );
    if (method === 'cheque')
      return (
        <span className="flex items-center gap-1 text-sm">
          <Wallet className="w-3 h-3 text-amber-600" /> شيك
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-sm">
        <DollarSign className="w-3 h-3 text-emerald-600" /> نقدي
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">المدفوعات</h1>
          <p className="text-slate-500 mt-1">تسجيل وتتبع المقبوضات بالدينار الجزائري</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" /> تحديث
          </Button>
          <Button
            onClick={() => modal.openModal('CREATE_PAYMENT')}
            className="gap-2 bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4" /> تسجيل دفعة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[#E6ECF2] rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">إجمالي المعروض</p>
              <h3 className="text-xl font-bold text-emerald-700">{formatMoney(monthTotal)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6ECF2] rounded-2xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500">عدد الدفعات</p>
              <h3 className="text-xl font-bold">{filtered.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative bg-white p-4 rounded-2xl border border-[#E6ECF2]">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث برقم الإيصال أو العميل أو الفاتورة..."
          className="w-full h-11 pr-10 pl-3 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] text-sm"
        />
      </div>

      <Card className="border-[#E6ECF2] bg-white overflow-hidden rounded-2xl">
        {isLoading && <div className="p-10 text-center text-slate-500">جاري التحميل...</div>}
        {isError && (
          <div className="p-6 text-center text-red-600 space-y-2">
            <p>تعذر تحميل المدفوعات</p>
            <Button onClick={() => refetch()} className="bg-[#0F766E] text-white">
              إعادة المحاولة
            </Button>
          </div>
        )}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#F8FAFC] border-b border-[#E6ECF2]">
                <tr>
                  <th className="px-4 py-3 text-sm text-slate-500">الإيصال</th>
                  <th className="px-4 py-3 text-sm text-slate-500">التاريخ</th>
                  <th className="px-4 py-3 text-sm text-slate-500">العميل</th>
                  <th className="px-4 py-3 text-sm text-slate-500">الفاتورة</th>
                  <th className="px-4 py-3 text-sm text-slate-500">الطريقة</th>
                  <th className="px-4 py-3 text-sm text-slate-500">المبلغ</th>
                  <th className="px-4 py-3 text-sm text-slate-500">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2]">
                {filtered.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-mono text-sm text-[#0F766E]">{payment.number}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {payment.when
                        ? new Date(payment.when).toLocaleDateString('ar-DZ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold">{payment.customer_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">
                      {payment.invoice_no}
                    </td>
                    <td className="px-4 py-3">{getMethodBadge(payment.method)}</td>
                    <td className="px-4 py-3 font-bold">{formatMoney(payment.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-emerald-50 text-emerald-700 border-0">مؤكد</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      لا توجد مدفوعات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
