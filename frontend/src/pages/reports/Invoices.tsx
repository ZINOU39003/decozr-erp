import React, { useMemo, useState } from 'react';
import { exportRowsToCsv, invoiceToPrintHtml, printHtmlAsPdf } from '../../lib/exportFiles';
import { FileText, Plus, Search, Download, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useUIStore } from '../../store/uiStore';
import { getInvoices } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const formatMoney = (n: number) =>
  `${Number(n || 0).toLocaleString('ar-DZ')} د.ج`;

const formatDate = (d?: string | Date | null) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-DZ');
  } catch {
    return '—';
  }
};

export const Invoices = () => {
  const { modal } = useUIStore();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices({ limit: 100 }),
  });

  const invoices = useMemo(() => {
    const raw = (data as any)?.data ?? (Array.isArray(data) ? data : []);
    return raw.map((inv: any) => {
      const paid = Number(inv.paid_amount ?? 0);
      const total = Number(inv.total_amount ?? inv.total ?? 0);
      const remaining = Number(inv.remaining_amount ?? total - paid);
      return {
        ...inv,
        customer_name: inv.order?.customer?.name_ar || inv.customer?.name_ar || inv.customer || '—',
        issue: inv.issue_date || inv.createdAt,
        total,
        paid,
        remaining,
      };
    });
  }, [data]);

  const filtered = invoices.filter((inv: any) => {
    const hay = `${inv.invoice_number} ${inv.customer_name}`.toLowerCase();
    const okQ = !q || hay.includes(q.toLowerCase());
    const okS = statusFilter === 'all' || inv.status === statusFilter;
    return okQ && okS;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-50 text-emerald-700 border-0">مدفوعة</Badge>;
      case 'unpaid':
        return <Badge className="bg-amber-50 text-amber-700 border-0">غير مدفوعة</Badge>;
      case 'partial':
        return <Badge className="bg-sky-50 text-sky-700 border-0">جزئية</Badge>;
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-600 border-0">مسودة</Badge>;
      case 'overdue':
        return <Badge className="bg-red-50 text-red-700 border-0">متأخرة</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 border-0">{status || '—'}</Badge>;
    }
  };

  return (
    <div className="flex flex-col space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">الفواتير</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            {filtered.length} فاتورة · المبالغ بالدينار الجزائري
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              exportRowsToCsv(
                `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
                ['رقم الفاتورة', 'العميل', 'التاريخ', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'],
                filtered.map((inv: any) => [
                  inv.invoice_number || '',
                  inv.customer_name || '',
                  formatDate(inv.issue),
                  inv.total,
                  inv.paid,
                  inv.remaining,
                  inv.status || '',
                ]),
              );
              toast.success('تم تصدير الفواتير إلى Excel/CSV');
            }}
          >
            <Download className="w-4 h-4" /> تصدير Excel
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" /> تحديث
          </Button>
          <Button
            onClick={() => navigate('/orders')}
            className="gap-2 bg-[#0F766E] text-white"
          >
            <Plus className="w-4 h-4" /> من الطلبات
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[#E6ECF2]">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث برقم الفاتورة أو العميل..."
            className="w-full h-11 pr-10 pl-3 rounded-xl border border-[#E6ECF2] bg-[#F8FAFC] text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-[#E6ECF2] bg-white px-3 text-sm min-w-[140px]"
        >
          <option value="all">كل الحالات</option>
          <option value="unpaid">غير مدفوعة</option>
          <option value="partial">جزئية</option>
          <option value="paid">مدفوعة</option>
          <option value="overdue">متأخرة</option>
        </select>
      </div>

      <Card className="border-[#E6ECF2] bg-white overflow-hidden rounded-2xl">
        {isLoading && (
          <div className="p-10 text-center text-slate-500 animate-pulse">جاري التحميل...</div>
        )}
        {isError && (
          <div className="p-6 text-center text-red-600 space-y-3">
            <p>تعذر تحميل الفواتير</p>
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
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">العميل</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">الإجمالي</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">المدفوع</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">المتبقي</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-sm text-slate-500 font-semibold text-center">عرض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6ECF2]">
                {filtered.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 font-medium">{invoice.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(invoice.issue)}</td>
                    <td className="px-4 py-3 font-bold">{formatMoney(invoice.total)}</td>
                    <td className="px-4 py-3 text-emerald-700">{formatMoney(invoice.paid)}</td>
                    <td className="px-4 py-3 text-amber-700">{formatMoney(invoice.remaining)}</td>
                    <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="PDF"
                          onClick={() =>
                            printHtmlAsPdf(
                              `فاتورة ${invoice.invoice_number}`,
                              invoiceToPrintHtml(invoice),
                            )
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            invoice.order_id
                              ? navigate(`/orders/${invoice.order_id}`)
                              : toast.info('لا يوجد طلب مرتبط')
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      لا توجد فواتير
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
