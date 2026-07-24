import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Edit, Trash, Eye, Phone, RefreshCw, KeyRound,
  Search, Wallet, Palette, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { useUIStore } from '../../store/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, deleteCustomer, activateCustomerPortal } from '../../services/api';

const TEAL = '#0F766E';

const typeLabel = (t: string) => {
  if (t === 'company') return 'شركة';
  if (t === 'distributor') return 'موزع';
  return 'فرد';
};

export const CustomersList = () => {
  const navigate = useNavigate();
  const openModal = useUIStore((s) => s.modal.openModal);
  const openConfirm = useUIStore((s) => s.confirm.openConfirm);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');

  const {
    data: customersResponse,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ limit: 200 }),
  });

  const customers = Array.isArray(customersResponse?.data)
    ? customersResponse.data
    : Array.isArray(customersResponse)
      ? customersResponse
      : [];

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c: any) => {
      if (customerType !== 'all' && c.customer_type !== customerType) return false;
      const remaining = Number(c.remaining_total ?? c.balance ?? 0);
      if (balanceFilter === 'has_debt' && remaining <= 0) return false;
      if (balanceFilter === 'settled' && remaining > 0) return false;
      if (!q) return true;
      const haystack = [c.name_ar, c.phone, c.email, c.code]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, search, customerType, balanceFilter]);

  const kpis = useMemo(() => {
    const totalRemaining = customers.reduce(
      (sum: number, c: any) => sum + Number(c.remaining_total ?? c.balance ?? 0),
      0,
    );
    const openDesigns = customers.reduce(
      (sum: number, c: any) => sum + Number(c.open_designs ?? 0),
      0,
    );
    return { count: customers.length, totalRemaining, openDesigns };
  }, [customers]);

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'حدث خطأ أثناء حذف العميل';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const portalMutation = useMutation({
    mutationFn: (customerId: string) => activateCustomerPortal(customerId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم تفعيل بوابة العميل');
      toast.message('احفظ بيانات الدخول الآن', {
        description: `${res.email} / ${res.temporary_password}`,
        duration: 20000,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'فشل تفعيل البوابة';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'الرمز',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[var(--color-text-muted)]">
          {row.original.code || String(row.original.id || '').slice(0, 8)}
        </span>
      ),
    },
    {
      id: 'name_phone',
      header: 'العميل',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-[var(--color-text-main)]">{row.original.name_ar}</div>
          {row.original.phone && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-0.5">
              <Phone className="w-3 h-3" />
              <span dir="ltr">{row.original.phone}</span>
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'customer_type',
      header: 'النوع',
      cell: ({ row }) => (
        <span className="text-sm px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] font-medium">
          {typeLabel(row.original.customer_type || 'individual')}
        </span>
      ),
    },
    {
      accessorKey: 'paid_total',
      header: 'المدفوع',
      cell: ({ row }) => (
        <span className="font-medium text-[var(--color-success)]">
          {Number(row.original.paid_total || 0).toLocaleString()} د.ج
        </span>
      ),
    },
    {
      accessorKey: 'remaining_total',
      header: 'المتبقي',
      cell: ({ row }) => {
        const remaining = Number(row.original.remaining_total ?? row.original.balance ?? 0);
        return (
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-sm ${
              remaining > 0
                ? 'text-[var(--color-danger)] bg-[var(--color-danger)]/10'
                : 'text-[var(--color-text-muted)] bg-[var(--color-bg-sidebar)]'
            }`}
          >
            {remaining.toLocaleString()} د.ج
          </span>
        );
      },
    },
    {
      id: 'orders',
      header: 'الطلبات',
      cell: ({ row }) => {
        const total = Number(row.original.orders_count ?? 0);
        const active = Number(row.original.active_orders_count ?? 0);
        return (
          <span className="text-sm text-[var(--color-text-muted)]">
            {total}
            {active > 0 && (
              <span className="mr-1 text-[var(--color-primary-600)] font-bold">({active} نشط)</span>
            )}
          </span>
        );
      },
    },
    {
      id: 'designs',
      header: 'تصاميم خاصة',
      cell: ({ row }) => {
        const total = Number(row.original.designs_count ?? 0);
        const open = Number(row.original.open_designs ?? 0);
        return (
          <span className="text-sm text-[var(--color-text-muted)]">
            {total}
            {open > 0 && (
              <span className="mr-1 text-[var(--color-warning)] font-bold">({open} مفتوح)</span>
            )}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="h-8 w-8 p-0 text-[#0F766E] border-[#0F766E]/30 hover:bg-[#0F766E]/10"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openModal('CREATE_CUSTOMER', {
                  id: customer.id,
                  name_ar: customer.name_ar,
                  phone: customer.phone,
                  email: customer.email,
                  notes: customer.notes,
                  customer_type: customer.customer_type,
                  price_list_id: customer.price_list_id,
                })
              }
              className="h-8 w-8 p-0 text-[var(--color-warning)] border-[var(--color-warning)]/30 hover:bg-[var(--color-warning)]/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="تفعيل / إعادة تعيين بوابة العميل"
              onClick={() => {
                if (!customer.email) {
                  toast.error('أضف بريدًا إلكترونيًا للعميل أولًا');
                  return;
                }
                portalMutation.mutate(customer.id);
              }}
              className="h-8 w-8 p-0 text-[var(--color-info)] border-[var(--color-info)]/30 hover:bg-[var(--color-info)]/10"
            >
              <KeyRound className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                openConfirm({
                  title: 'حذف العميل',
                  description: `هل أنت متأكد من حذف العميل ${customer.name_ar}؟`,
                  confirmText: 'حذف',
                  variant: 'danger',
                  onConfirm: () => deleteMutation.mutate(customer.id),
                })
              }
              className="h-8 w-8 p-0 text-[var(--color-danger)] border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/10"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    autoResetPageIndex: false,
    data: filteredCustomers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-[var(--color-border)] rounded w-1/4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--color-border)] rounded-lg" />
          ))}
        </div>
        <div className="h-[400px] bg-[var(--color-border)] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col space-y-6" dir="rtl">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
            <Users className="text-[#0F766E]" size={28} />
            إدارة العملاء
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            قاعدة بيانات العملاء، الأرصدة، وطلبات التصميم
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> تحديث
          </Button>
          <Button
            className="text-white shadow-lg"
            style={{ backgroundColor: TEAL }}
            onClick={() => navigate('/customers/new')}
          >
            إضافة عميل جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${TEAL}18`, color: TEAL }}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">إجمالي العملاء</p>
              <h3 className="text-2xl font-bold">{kpis.count}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">إجمالي الديون المتبقية</p>
              <h3 className="text-2xl font-bold text-[var(--color-danger)]">
                {kpis.totalRemaining.toLocaleString()} د.ج
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">طلبات تصميم مفتوحة</p>
              <h3 className="text-2xl font-bold text-[var(--color-warning)]">{kpis.openDesigns}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {isError && (
        <div className="p-4 rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-[var(--color-danger)] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[var(--color-danger)]">تعذر تحميل العملاء</p>
            <p className="text-[var(--color-text-muted)] mt-1">
              {(error as any)?.message || 'تحقق من الاتصال بالخادم'}
            </p>
          </div>
        </div>
      )}

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap gap-3 items-center bg-[var(--color-bg-main)]/50">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <Input
              placeholder="بحث بالاسم، الهاتف، البريد، أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 bg-[var(--color-bg-card)]"
            />
          </div>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm"
          >
            <option value="all">كل الأنواع</option>
            <option value="individual">فرد</option>
            <option value="company">شركة</option>
            <option value="distributor">موزع</option>
          </select>
          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm"
          >
            <option value="all">كل الأرصدة</option>
            <option value="has_debt">عليه دين</option>
            <option value="settled">مسدّد</option>
          </select>
          <span className="text-sm text-[var(--color-text-muted)] mr-auto">
            {filteredCustomers.length} من {customers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-[var(--color-border)]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-[var(--color-text-muted)] font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-[var(--color-text-muted)]">
                    لا يوجد عملاء يطابقون الفلاتر.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
          <span className="text-sm text-[var(--color-text-muted)]">
            صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount() || 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالي
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
