import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Filter, 
  Download, Briefcase, Edit, Trash2,
  CheckCircle2, XCircle, Eye, Mail
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import { getEmployees, deleteEmployee } from '../../services/api';
import { unlockDocumentUi, useUIStore } from '../../store/uiStore';
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

export const EmployeesList = () => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const openConfirm = useUIStore((s) => s.confirm.openConfirm);
  const queryClient = useQueryClient();

  const { data: rawResponse, isLoading: loading } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees
  });

  const rawData = rawResponse?.data || (Array.isArray(rawResponse) ? rawResponse : []);

  const data = useMemo(
    () =>
      (Array.isArray(rawData) ? rawData : []).map((e: any) => ({
        ...e,
        full_name_ar: e.full_name_ar || e.name_ar,
        status: e.is_active !== undefined ? (e.is_active ? 'present' : 'absent') : (e.status || 'present'),
        joinDate: e.hire_date || e.join_date || e.created_at,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stabilize on API payload identity
    [rawResponse],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('تم حذف الموظف بنجاح');
    },
    onError: () => toast.error('حدث خطأ أثناء الحذف')
  });

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'حذف موظف',
      description: 'هل أنت متأكد من حذف هذا الموظف؟',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      variant: 'danger',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "full_name_ar",
      header: "الموظف",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-text-main)] shadow-sm">
            {row.getValue("full_name_ar") ? (row.getValue("full_name_ar") as string).charAt(0) : 'U'}
          </div>
          <div>
            <span className="font-bold text-[var(--color-text-main)] block">{row.getValue("full_name_ar")}</span>
            {row.original.position && (
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5">{row.original.position}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "login_email",
      header: "البريد",
      cell: ({ row }) => (
        <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-1" dir="ltr">
          <Mail className="w-3 h-3 shrink-0" />
          {row.original.login_email || row.original.email || '—'}
        </span>
      ),
    },
    {
      accessorKey: "role_ar",
      header: "الدور",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.role_ar || row.original.role || '—'}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return status === 'present' ? 
          <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> نشط</Badge> : 
          <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> غير نشط</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[#0F766E]" onClick={() => navigate(`/employees/${row.original.id}`)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)]" onClick={() => navigate(`/employees/${row.original.id}`)}>
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
            <Users className="w-6 h-6 text-[var(--color-primary-500)]" />
            إدارة الموارد البشرية
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">تتبع فريق العمل، الحضور والانصراف، ومؤشرات الأداء</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Download className="w-4 h-4" /> تقرير الحضور
          </Button>
          <Button asChild className="gap-2 bg-[#0F766E] text-white hover:bg-[#0D9488]">
            <Link
              to="/employees/new"
              onClick={() => {
                useUIStore.getState().modal.closeModal();
                unlockDocumentUi();
              }}
            >
              <Plus className="w-4 h-4" /> موظف جديد
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-lg"><Briefcase className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">إجمالي الموظفين</p>
              <h3 className="text-2xl font-bold">{data.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">حاضر اليوم</p>
              <h3 className="text-2xl font-bold text-[var(--color-success)]">{data.filter(e => e.status === 'present').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg"><XCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">غائب اليوم</p>
              <h3 className="text-2xl font-bold text-[var(--color-danger)]">{data.filter(e => e.status === 'absent').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-lg"><Briefcase className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">غير نشط</p>
              <h3 className="text-2xl font-bold text-[var(--color-warning)]">{data.filter(e => e.status === 'absent').length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-main)]/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <Input 
              placeholder="ابحث عن موظف أو دور..." 
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
                    لا يوجد موظفين يطابقون بحثك.
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
