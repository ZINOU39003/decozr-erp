import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Settings, Plus, Edit3, Trash2, Cpu, Wrench, PlayCircle, StopCircle, 
  Activity, Filter, Clock, Download, Search
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';

const mockMachines = [
  { id: 'MAC-001', name_ar: 'آلة ليزر CO2 - الحجم الكبير', machine_type: 'Laser', hourly_cost: 45, status: 'running', current_job: 'ORD-104', efficiency: 92, next_maintenance: '2026-08-15', runtime: 1240 },
  { id: 'MAC-002', name_ar: 'آلة ليزر Fiber - معادن', machine_type: 'Laser', hourly_cost: 85, status: 'maintenance', current_job: null, efficiency: 0, next_maintenance: '2026-07-10', runtime: 850 },
  { id: 'MAC-003', name_ar: 'طابعة UV مسطحة', machine_type: 'UV Printer', hourly_cost: 60, status: 'running', current_job: 'ORD-088', efficiency: 85, next_maintenance: '2026-09-01', runtime: 2100 },
  { id: 'MAC-004', name_ar: 'آلة راوتر CNC', machine_type: 'CNC', hourly_cost: 55, status: 'idle', current_job: null, efficiency: 70, next_maintenance: '2026-07-25', runtime: 1560 },
  { id: 'MAC-005', name_ar: 'آلة ثني الأكريليك', machine_type: 'Heater', hourly_cost: 15, status: 'idle', current_job: null, efficiency: 100, next_maintenance: '2026-12-01', runtime: 430 },
];

export const MachinesManager = () => {
  const openModal = useUIStore((s) => s.modal.openModal);

  const [data] = useState(mockMachines);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge variant="success" className="gap-1"><PlayCircle className="w-3 h-3" /> قيد التشغيل</Badge>;
      case 'maintenance': return <Badge variant="danger" className="gap-1"><Wrench className="w-3 h-3" /> في الصيانة</Badge>;
      case 'idle': return <Badge variant="warning" className="gap-1"><StopCircle className="w-3 h-3" /> متوقفة (جاهزة)</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "الرمز",
      cell: ({ row }) => <span className="font-mono text-[var(--color-text-muted)] text-sm">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name_ar",
      header: "الآلة",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center border border-[var(--color-primary-500)]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-[var(--color-text-main)] block">{row.getValue("name_ar")}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{row.original.machine_type}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "efficiency",
      header: "كفاءة OEE",
      cell: ({ row }) => {
        const eff = row.getValue("efficiency") as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-[var(--color-bg-main)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <div className={`h-full ${eff > 80 ? 'bg-[var(--color-success)]' : eff > 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`} style={{ width: `${eff}%` }} />
            </div>
            <span className="font-bold text-sm text-[var(--color-text-main)]">{eff}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: "runtime",
      header: "ساعات التشغيل",
      cell: ({ row }) => <span className="font-bold text-[var(--color-text-muted)]">{(row.getValue("runtime") as number).toLocaleString()} ساعة</span>,
    },
    {
      accessorKey: "next_maintenance",
      header: "الصيانة القادمة",
      cell: ({ row }) => <span className="text-[var(--color-text-main)]">{new Date(row.getValue("next_maintenance") as string).toLocaleDateString('ar-DZ')}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
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
            <Settings className="w-6 h-6 text-[var(--color-primary-500)]" />
            إدارة الآلات (Machine Management)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">تتبع الأداء، OEE، الصيانة وجدول العمل</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-border)] gap-2" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
            <Download className="w-4 h-4" /> تقرير الأداء
          </Button>
          <Button
            className="gap-2 bg-[var(--color-primary-600)] text-white shadow-[0_0_15px_var(--color-primary-500)]/20"
            onClick={() => openModal('CREATE_MACHINE')}
          >
            <Plus className="w-4 h-4" /> إضافة آلة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-lg"><PlayCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">قيد التشغيل</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-lg"><StopCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">متوقفة (جاهزة)</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-lg"><Wrench className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">في الصيانة</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-lg"><Activity className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">متوسط الكفاءة (OEE)</p>
              <h3 className="text-2xl font-bold">86%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-main)]/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <Input 
              placeholder="ابحث عن آلة..." 
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
                    لا يوجد آلات مطابقة.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
