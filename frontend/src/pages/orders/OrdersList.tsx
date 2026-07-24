import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { unlockDocumentUi } from '../../store/uiStore';
import { 
  ShoppingBag, Plus, Search, Filter, MoreHorizontal, ArrowUpDown, 
  Download, Printer, FileDown, CheckSquare, Trash2, Archive, 
  LayoutGrid, List, Calendar as CalendarIcon, Clock, ChevronDown, FilterX,
  Flag, Factory, Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { useOrdersList } from '../../modules/orders/hooks/useOrdersList';
import { useDeleteOrder } from '../../modules/orders/hooks/useDeleteOrder';
import { motion } from 'framer-motion';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table";

// Helper for status formatting
export const getStatusConfig = (status: string) => {
  const map: Record<string, { label: string, color: string }> = {
    'new': { label: 'جديد', color: 'info' },
    'received': { label: 'استلام', color: 'info' },
    'pending_review': { label: 'مراجعة', color: 'info' },
    'pending_approval': { label: 'موافقة', color: 'secondary' },
    'quotation': { label: 'تسعيرة', color: 'secondary' },
    'approved': { label: 'معتمد', color: 'success' },
    'design': { label: 'التصميم', color: 'indigo-500' },
    'in_design': { label: 'تصميم', color: 'indigo-500' },
    'design_ready': { label: 'تصميم جاهز', color: 'success' },
    'material_prep': { label: 'تجهيز المواد', color: 'orange-500' },
    'laser_cutting': { label: 'قص ليزر', color: 'warning' },
    'in_cutting': { label: 'قص', color: 'warning' },
    'printing': { label: 'طباعة', color: 'purple-500' },
    'in_printing': { label: 'طباعة', color: 'purple-500' },
    'assembly': { label: 'تجميع', color: 'blue-500' },
    'in_assembly': { label: 'تجميع', color: 'blue-500' },
    'qc': { label: 'فحص الجودة', color: 'amber-500' },
    'packaging': { label: 'تغليف', color: 'teal-500' },
    'ready': { label: 'جاهز', color: 'success' },
    'delivered': { label: 'تم التسليم', color: 'default' },
    'completed': { label: 'مكتمل', color: 'default' },
  };
  return map[status] || { label: status, color: 'secondary' };
};

export const OrdersList = () => {
  const navigate = useNavigate();
  
  // React Query Integration — debounce search to reduce API load
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalFilter.trim()), 350);
    return () => clearTimeout(t);
  }, [globalFilter]);
  const { data: ordersResponse, isLoading: loading, isError, error, refetch, isFetching } = useOrdersList(
    debouncedSearch ? { search: debouncedSearch } : undefined,
    undefined,
    { page: 1, limit: 100, total: 0, totalPages: 1 },
  );
  const data = useMemo(() => {
    const rawOrders = Array.isArray(ordersResponse?.data)
      ? ordersResponse.data
      : Array.isArray(ordersResponse)
        ? ordersResponse
        : [];
    return rawOrders.map((order: any) => {
      const firstItem = order.items?.[0];
      const total = Number(order.total ?? order.revenue ?? 0);
      const paid = Number(order.paid_amount ?? order.paid ?? 0);
      const remaining = Math.max(0, total - paid);
      const designName =
        firstItem?.design_name_snapshot ||
        order.design?.name_ar ||
        order.design?.name ||
        (order.items?.length > 1 ? `${order.items.length} بنود` : '—');
      return {
        ...order,
        design: { name: designName, name_ar: designName },
        revenue: total,
        remaining,
        progress: order.progress ?? (order.status === 'delivered' || order.status === 'completed' ? 100 : order.status === 'ready' ? 90 : order.inventory_deducted ? 40 : 10),
        delivery_date: order.promised_date || order.due_date || order.delivery_date || null,
        assigned_employees: order.assigned_employees || [],
        assigned_machines: order.assigned_machines || [],
        priority: order.priority === 2 || order.priority === 'high' ? 'high' : order.priority === 1 || order.priority === 'medium' ? 'medium' : 'normal',
      };
    });
  }, [ordersResponse]);

  const { mutate: deleteOrder } = useDeleteOrder();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [viewMode, setViewMode] = useState('table');

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="rounded border-[var(--color-border)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] bg-[var(--color-bg-main)] w-4 h-4"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="rounded border-[var(--color-border)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)] bg-[var(--color-bg-main)] w-4 h-4"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "order_number",
      header: "الطلب",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold text-[var(--color-text-main)] cursor-pointer hover:text-[var(--color-primary-500)]" onClick={() => navigate(`/orders/${row.original.id}`)}>
          <ShoppingBag className="w-4 h-4 text-[var(--color-primary-500)]" />
          {row.getValue("order_number")}
        </div>
      ),
    },
    {
      accessorKey: "customer.name_ar",
      header: "العميل",
      cell: ({ row }) => <div className="font-semibold text-[var(--color-text-main)] truncate max-w-[120px]">{row.original.customer?.name_ar || row.original.customer?.name || '—'}</div>,
    },
    {
      accessorKey: "design.name",
      header: "التصميم",
      cell: ({ row }) => <div className="text-[var(--color-text-muted)] truncate max-w-[120px]">{row.original.design?.name || '—'}</div>,
    },
    {
      accessorKey: "priority",
      header: "الأولوية",
      cell: ({ row }) => {
        const p = (row.getValue("priority") as string) || 'normal';
        return (
          <div className="flex items-center gap-1">
            <Flag className={`w-3 h-3 ${p === 'high' ? 'text-[var(--color-danger)]' : p === 'medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}`} />
            <span className={p === 'high' ? 'text-[var(--color-danger)]' : p === 'medium' ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-muted)]'}>
              {p === 'high' ? 'عالي' : p === 'medium' ? 'متوسط' : 'عادي'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "progress",
      header: "التقدم",
      cell: ({ row }) => {
        const prog = Number(row.getValue("progress") || 0);
        return (
          <div className="flex items-center gap-2 w-24">
            <div className="flex-1 bg-[var(--color-bg-main)] rounded-full h-1.5 border border-[var(--color-border)] overflow-hidden">
              <div className="bg-[var(--color-primary-500)] h-full rounded-full" style={{ width: `${prog}%` }}></div>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{prog}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "المرحلة الحالية",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = getStatusConfig(status);
        return (
          <Badge className={`bg-${config.color}/10 text-${config.color} border-0`}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "assignments",
      header: "التعيين",
      cell: ({ row }) => {
        const emps = row.original.assigned_employees || [];
        const macs = row.original.assigned_machines || [];
        return (
          <div className="flex flex-col gap-1 text-[10px]">
            {emps.length > 0 && <div className="flex items-center gap-1 text-[var(--color-primary-400)]"><Users className="w-3 h-3"/> {emps[0].name || emps[0].full_name_ar} {emps.length>1 && `+${emps.length-1}`}</div>}
            {macs.length > 0 && <div className="flex items-center gap-1 text-[var(--color-warning)]"><Factory className="w-3 h-3"/> {macs[0].name || macs[0].name_ar}</div>}
            {emps.length === 0 && macs.length === 0 && <span className="text-[var(--color-text-muted)]">—</span>}
          </div>
        )
      }
    },
    {
      accessorKey: "revenue",
      header: "الإجمالي",
      cell: ({ row }) => <div className="font-bold text-[var(--color-text-main)]">{Number(row.getValue("revenue") || 0).toLocaleString()} د.ج</div>,
    },
    {
      accessorKey: "remaining",
      header: "المتبقي",
      cell: ({ row }) => {
        const rem = Number(row.getValue("remaining") || 0);
        return <div className={`font-bold ${rem > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>{rem.toLocaleString()} د.ج</div>
      },
    },
    {
      accessorKey: "delivery_date",
      header: "التسليم",
      cell: ({ row }) => {
        const raw = row.getValue("delivery_date") as string | null;
        if (!raw) return <div className="text-[var(--color-text-muted)]">—</div>;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return <div className="text-[var(--color-text-muted)]">—</div>;
        const isLate = d.getTime() < Date.now() && Number(row.original.progress || 0) < 100;
        return <div className={isLate ? 'text-[var(--color-danger)] font-bold' : 'text-[var(--color-text-muted)]'}>{d.toLocaleDateString('ar-DZ')}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)]" onClick={() => navigate(`/orders/${order.id}`)}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info(`خيارات الطلب ${order.order_number}`)}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )
      },
    },
  ];

  const table = useReactTable({
    autoResetPageIndex: false,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[var(--color-primary-500)]" />
            إدارة الطلبات
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">مركز التحكم الكامل بجميع طلبات المصنع وتتبع مراحل الإنتاج ({data.length} طلب).</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-border)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)]" onClick={() => { setGlobalFilter(''); setColumnFilters([]); setSorting([]); setRowSelection({}); toast.success('تم مسح جميع الفلاتر'); }}>
            <FilterX className="w-4 h-4 ml-2" /> مسح الفلاتر
          </Button>
          <Button asChild className="gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/20">
            <Link to="/orders/create" onClick={() => unlockDocumentUi()}>
              <Plus className="w-4 h-4" />
              <span>طلب جديد</span>
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[var(--color-danger)]">تعذر تحميل الطلبات</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {(error as any)?.message || 'تحقق من تسجيل الدخول وأن الخادم يعمل على المنفذ 3000'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col overflow-hidden">
        
        {/* Advanced Toolbar */}
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-l from-[var(--color-bg-card)] to-[var(--color-bg-main)]">
          
          <div className="flex items-center gap-3 flex-1 w-full">
            {/* Global Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
              <Input 
                placeholder="بحث شامل (رقم الطلب، العميل، التصميم)..." 
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-4 pr-10 bg-[var(--color-bg-main)] border-[var(--color-border)] focus:border-[var(--color-primary-500)]" 
              />
            </div>
            
            {/* View Modes */}
            <Tabs value={viewMode} onValueChange={setViewMode} className="hidden md:flex">
              <TabsList className="bg-[var(--color-bg-main)] border border-[var(--color-border)]">
                <TabsTrigger value="table" className="data-[state=active]:bg-[var(--color-primary-500)] data-[state=active]:text-white"><List className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="kanban" className="data-[state=active]:bg-[var(--color-primary-500)] data-[state=active]:text-white"><LayoutGrid className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="calendar" className="data-[state=active]:bg-[var(--color-primary-500)] data-[state=active]:text-white"><CalendarIcon className="w-4 h-4" /></TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-[var(--color-primary-500)] data-[state=active]:text-white"><Clock className="w-4 h-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('الفلاتر المتقدمة قيد التطوير')}>
              <Filter className="w-4 h-4" /> فلاتر متقدمة <ChevronDown className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="border-[var(--color-border)] gap-2" onClick={() => toast.success('جاري تصدير البيانات إلى ملف Excel...')}>
              <FileDown className="w-4 h-4" /> تصدير Excel
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar (Appears when rows are selected) */}
        {selectedRows.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-[var(--color-primary-500)]/10 border-b border-[var(--color-primary-500)]/20 p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-[var(--color-primary-500)] bg-[var(--color-bg-card)] px-2 py-1 rounded border border-[var(--color-primary-500)]/30">
                {selectedRows.length} طلبات محددة
              </span>
              <span className="text-[var(--color-text-main)] font-semibold">إجراءات جماعية:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-[var(--color-primary-500)]/30 text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] hover:text-white gap-2" onClick={() => toast.info(`تعيين فريق لـ ${selectedRows.length} طلبات`)}>
                <Users className="w-3 h-3" /> تعيين فريق
              </Button>
              <Button size="sm" variant="outline" className="border-[var(--color-primary-500)]/30 text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] hover:text-white gap-2" onClick={() => toast.info(`تغيير حالة ${selectedRows.length} طلبات`)}>
                <CheckSquare className="w-3 h-3" /> تغيير الحالة
              </Button>
              <Button size="sm" variant="outline" className="border-[var(--color-primary-500)]/30 text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)] hover:text-white gap-2" onClick={() => toast.success(`جاري طباعة فواتير ${selectedRows.length} طلبات...`)}>
                <Printer className="w-3 h-3" /> طباعة فواتير
              </Button>
              <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>
              <Button size="sm" variant="outline" 
                className="border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white gap-2"
                onClick={() => {
                  const selectedIds = Object.keys(rowSelection).map(index => data[parseInt(index)]?.id).filter(Boolean);
                  selectedIds.forEach(id => deleteOrder(id));
                  setRowSelection({});
                }}
              >
                <Trash2 className="w-3 h-3" /> حذف
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Content Area based on View Mode */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <Table>
              <TableHeader className="bg-[var(--color-bg-main)]/80 sticky top-0 z-10 backdrop-blur-md">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-[var(--color-border)]">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-bold text-[var(--color-text-muted)] whitespace-nowrap px-4 py-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({length: 10}).map((_, i) => (
                    <TableRow key={i} className="border-[var(--color-border)]">
                      <TableCell colSpan={columns.length} className="p-4">
                        <div className="h-6 bg-[var(--color-bg-main)] rounded animate-pulse w-full"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center">
                      <p className="text-[var(--color-danger)] font-bold mb-2">تعذر تحميل الطلبات</p>
                      <p className="text-sm text-[var(--color-text-muted)] mb-4">
                        {(error as any)?.message || 'تحقق من الاتصال ثم أعد المحاولة'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        إعادة المحاولة
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => navigate(`/orders/${row.original.id}`)}
                      className={`border-[var(--color-border)] hover:bg-[#F0FDFA] transition-colors cursor-pointer ${row.getIsSelected() ? 'bg-[var(--color-primary-500)]/5' : ''}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 whitespace-nowrap"
                          onClick={(e) => {
                            if (cell.column.id === 'select' || cell.column.id === 'actions') {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center text-[var(--color-text-muted)]">
                      لا يوجد طلبات تطابق بحثك.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] flex-col gap-4">
            <div className="p-6 rounded-full bg-[var(--color-bg-main)] border border-[var(--color-border)]">
              {viewMode === 'kanban' ? <LayoutGrid className="w-12 h-12 text-[var(--color-primary-500)]/50" /> : 
               viewMode === 'calendar' ? <CalendarIcon className="w-12 h-12 text-[var(--color-primary-500)]/50" /> : 
               <Clock className="w-12 h-12 text-[var(--color-primary-500)]/50" />}
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-main)]">
              عرض {viewMode === 'kanban' ? 'مخطط Kanban' : viewMode === 'calendar' ? 'التقويم' : 'السجل الزمني'} قيد التطوير
            </h2>
            <p className="max-w-md text-center">
              هذه الشاشة المتقدمة سيتم تفعيلها في تحديث لاحق. حالياً يرجى استخدام عرض الجدول (Table View) لإدارة الطلبات.
            </p>
            <Button variant="outline" onClick={() => setViewMode('table')}>العودة للجدول</Button>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'table' && !loading && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-main)]/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">
                نعرض {table.getRowModel().rows.length} من أصل {table.getFilteredRowModel().rows.length} طلب
                {isFetching ? ' · جاري التحديث…' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-[var(--color-border)] bg-[var(--color-bg-card)]"
              >
                السابق
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[var(--color-text-main)] bg-[var(--color-bg-card)] border border-[var(--color-border)] px-3 py-1 rounded">
                  {table.getState().pagination.pageIndex + 1}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">من {table.getPageCount() || 1}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-[var(--color-border)] bg-[var(--color-bg-card)]"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
