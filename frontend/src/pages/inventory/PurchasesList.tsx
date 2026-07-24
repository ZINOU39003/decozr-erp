import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  ShoppingCart, Plus, Search, Filter, FileText, CheckCircle2, 
  Clock, XCircle, FileDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { mockSuppliers as suppliers } from '../../data/mockDatabase';
import { useUIStore } from '../../store/uiStore';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

const MOCK_PURCHASES = [
  { id: 'PO-2024-001', supplier: suppliers[0].name, date: '2026-07-10', total: 150000, status: 'pending', items: 3 },
  { id: 'PO-2024-002', supplier: suppliers[1].name, date: '2026-07-09', total: 85000, status: 'approved', items: 12 },
  { id: 'PO-2024-003', supplier: suppliers[2].name, date: '2026-07-08', total: 420000, status: 'received', items: 5 },
  { id: 'PO-2024-004', supplier: suppliers[0].name, date: '2026-07-05', total: 12500, status: 'cancelled', items: 1 },
  { id: 'PO-2024-005', supplier: suppliers[3].name, date: '2026-07-01', total: 290000, status: 'received', items: 8 },
];

export const PurchasesList = () => {
  const openModal = useUIStore((s) => s.modal.openModal);
  const [data] = useState(MOCK_PURCHASES);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "رقم الطلب",
      cell: ({ row }) => <span className="font-bold text-[var(--color-primary-500)]">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "supplier",
      header: "المورد",
      cell: ({ row }) => <span className="font-bold text-[var(--color-text-main)]">{row.getValue("supplier")}</span>,
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => <span className="text-[var(--color-text-muted)]">{row.getValue("date")}</span>,
    },
    {
      accessorKey: "items",
      header: "عدد المواد",
      cell: ({ row }) => <span className="text-[var(--color-text-muted)]">{row.getValue("items")} مواد</span>,
    },
    {
      accessorKey: "total",
      header: "الإجمالي",
      cell: ({ row }) => <span className="font-bold text-[var(--color-text-main)]">{(row.getValue("total") as number).toLocaleString()} د.ج</span>,
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        switch(status) {
          case 'pending': return <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> قيد المراجعة</Badge>;
          case 'approved': return <Badge variant="info" className="gap-1"><CheckCircle2 className="w-3 h-3" /> معتمد (جاري التوريد)</Badge>;
          case 'received': return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> مستلم</Badge>;
          case 'cancelled': return <Badge variant="danger" className="gap-1"><XCircle className="w-3 h-3" /> ملغي</Badge>;
          default: return <Badge>{status}</Badge>;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/10" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
          عرض التفاصيل
        </Button>
      ),
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
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[var(--color-primary-500)]" />
            طلبات الشراء (Purchase Orders)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">إدارة أوامر الشراء للمواد الخام وتتبع استلامها</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <FileDown className="w-4 h-4" /> تصدير
          </Button>
          <Button onClick={() => openModal('CREATE_PURCHASE')} className="gap-2 bg-[var(--color-primary-600)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20">
            <Plus className="w-4 h-4" /> طلب شراء جديد
          </Button>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-main)]/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <Input 
              placeholder="ابحث برقم الطلب أو اسم المورد..." 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-4 pr-10 bg-[var(--color-bg-card)] border-[var(--color-border)]" 
            />
          </div>
          <Button variant="outline" size="sm" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Filter className="w-4 h-4" /> فلاتر
          </Button>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-[var(--color-bg-main)]/80 sticky top-0 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-[var(--color-border)]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-3 px-4 text-[var(--color-text-muted)] font-bold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center text-[var(--color-text-muted)]">
                    لا يوجد طلبات شراء تطابق بحثك.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-main)]/50">
          <div className="text-sm text-[var(--color-text-muted)]">
            صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="border-[var(--color-border)] bg-[var(--color-bg-card)]">السابق</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="border-[var(--color-border)] bg-[var(--color-bg-card)]">التالي</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
