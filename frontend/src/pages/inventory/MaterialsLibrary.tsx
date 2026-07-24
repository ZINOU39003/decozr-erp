import React, { useState } from 'react';
import { 
  Package, Plus, Search, Filter, MoreHorizontal, ArrowUpDown, 
  Download, Box, Edit, Trash2, ShieldAlert
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { getMaterials, deleteMaterial } from '../../services/api';
import { useUIStore } from '../../store/uiStore';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

export const MaterialsLibrary = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const openModal = useUIStore((s) => s.modal.openModal);
  const openConfirm = useUIStore((s) => s.confirm.openConfirm);
  const queryClient = useQueryClient();

  const { data: materialsResponse, isLoading: loading } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials
  });
  
  const data = materialsResponse?.data || (Array.isArray(materialsResponse) ? materialsResponse : []);

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('تم الحذف بنجاح');
    },
    onError: () => toast.error('حدث خطأ أثناء الحذف')
  });

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'حذف مادة',
      description: 'هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع عن هذا الإجراء.',
      variant: 'danger',
      onConfirm: () => deleteMutation.mutate(id)
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sku",
      header: "الرمز",
      cell: ({ row }) => <span className="font-mono text-[var(--color-text-muted)] text-sm">{row.getValue("sku") || row.original.id}</span>,
    },
    {
      accessorKey: "name_ar",
      header: "اسم المادة",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold text-[var(--color-text-main)]">
          <Box className="w-4 h-4 text-[var(--color-primary-500)]" />
          {row.getValue("name_ar") || row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "current_stock",
      header: "المخزون الحالي",
      cell: ({ row }) => {
        const stock = (row.getValue("current_stock") ?? row.original.stock) as number;
        const minStock = (row.original.min_stock_level ?? row.original.minStock) as number;
        const isLow = stock <= minStock;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLow ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-main)]'}`}>
              {stock} {row.original.unit}
            </span>
            {isLow && <ShieldAlert className="w-4 h-4 text-[var(--color-danger)] animate-pulse" title="مخزون منخفض" />}
          </div>
        )
      },
    },
    {
      accessorKey: "min_stock_level",
      header: "الحد الأدنى",
      cell: ({ row }) => <span className="text-[var(--color-text-muted)]">{row.getValue("min_stock_level") ?? row.original.minStock} {row.original.unit}</span>,
    },
    {
      id: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const stock = (row.original.current_stock ?? row.original.stock) as number;
        const minStock = (row.original.min_stock_level ?? row.original.minStock) as number;
        if (stock === 0) return <Badge variant="danger">نفد تماماً</Badge>;
        if (stock <= minStock) return <Badge variant="warning">منخفض</Badge>;
        return <Badge variant="success">متوفر</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)]" onClick={() => openModal('CREATE_MATERIAL', row.original)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
            <Package className="w-6 h-6 text-[var(--color-primary-500)]" />
            مكتبة المواد الخام
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">إدارة {data.length} مادة في المستودع</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Download className="w-4 h-4" /> تصدير
          </Button>
          <Button onClick={() => openModal('CREATE_MATERIAL')} className="gap-2 bg-[var(--color-primary-600)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20">
            <Plus className="w-4 h-4" /> إضافة مادة
          </Button>
        </div>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-main)]/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <Input 
              placeholder="ابحث عن مادة (خشب، أكريليك، معدن)..." 
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
                    لا يوجد مواد تطابق بحثك.
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
