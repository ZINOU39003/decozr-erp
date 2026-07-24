import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, User, Calendar, Banknote, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/Table';
import {
  getEmployee,
  addEmployeeAttendance,
  addEmployeeSalary,
  getEmployeeAccess,
  setEmployeeAccess,
  getRoles,
} from '../../services/api';
import { PermissionMatrix } from '../../components/rbac/PermissionMatrix';
import { usePermission } from '../../lib/permissions';

const TEAL = '#0F766E';

const attendanceStatusLabel: Record<string, string> = {
  present: 'حاضر',
  absent: 'غائب',
  leave: 'إجازة',
  late: 'متأخر',
};

const salaryStatusLabel: Record<string, string> = {
  pending: 'معلق',
  paid: 'مدفوع',
  partial: 'جزئي',
};

export const EmployeeProfile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermission();

  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState('present');
  const [salMonth, setSalMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salAmount, setSalAmount] = useState('');
  const [salStatus, setSalStatus] = useState('pending');
  const [accessRole, setAccessRole] = useState('');
  const [accessPerms, setAccessPerms] = useState<string[]>([]);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id!),
    enabled: !!id,
  });

  const employee = (raw as any)?.data ?? raw;

  const { data: rolesRaw } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    enabled: hasPermission('manage_employees'),
  });
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw.filter((r: any) => !['customer', 'distributor'].includes(r.slug))
    : [];

  const { data: accessRaw } = useQuery({
    queryKey: ['employees', id, 'access'],
    queryFn: () => getEmployeeAccess(id!),
    enabled: !!id && !!employee?.user_id && hasPermission('manage_employees'),
  });

  React.useEffect(() => {
    if (!accessRaw) return;
    setAccessRole(accessRaw.role || '');
    setAccessPerms(Array.isArray(accessRaw.permissions) ? accessRaw.permissions : []);
  }, [accessRaw]);

  const attendanceMutation = useMutation({
    mutationFn: (data: { date: string; status: string }) =>
      addEmployeeAttendance(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('تم تسجيل الحضور');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل الحضور');
    },
  });

  const salaryMutation = useMutation({
    mutationFn: (data: { month: string; amount: number; status: string }) =>
      addEmployeeSalary(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('تم تسجيل الراتب');
      setSalAmount('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل الراتب');
    },
  });

  const accessMutation = useMutation({
    mutationFn: () =>
      setEmployeeAccess(id!, { role: accessRole, permissions: accessPerms }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', id, 'access'] });
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('تم تحديث صلاحيات الموظف');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تحديث الصلاحيات');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-[var(--color-border)] rounded w-1/3" />
        <div className="h-40 bg-[var(--color-border)] rounded-lg" />
      </div>
    );
  }

  if (!employee) {
    return <div className="text-[var(--color-text-muted)] p-8">لم يتم العثور على الموظف</div>;
  }

  const name = employee.full_name_ar || employee.name_ar || '—';
  const attendance: any[] = Array.isArray(employee.attendance) ? employee.attendance : [];
  const salaries: any[] = Array.isArray(employee.salaries) ? employee.salaries : [];

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <Link
        to="/employees"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[#0F766E] transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة إلى الموظفين
      </Link>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="h-20 bg-gradient-to-l from-[#0F766E] to-[#14B8A6]" />
        <CardContent className="p-6 -mt-10 relative">
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl bg-[var(--color-bg-main)] border-4 border-[var(--color-bg-card)] flex items-center justify-center text-2xl font-bold text-[#0F766E] shadow-lg">
                {name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-main)]">{name}</h1>
                <p className="text-[var(--color-text-muted)]">{employee.position || '—'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {employee.role_ar && (
                    <Badge variant="secondary">{employee.role_ar}</Badge>
                  )}
                  {employee.login_email && (
                    <Badge variant="outline" dir="ltr">{employee.login_email}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)]">الهاتف</p>
                <p className="font-bold" dir="ltr">{employee.phone || '—'}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">الراتب الشهري</p>
                <p className="font-bold text-[#0F766E]">
                  {Number(employee.monthly_salary || 0).toLocaleString()} د.ج
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <TabsTrigger value="overview" className="gap-2">
            <User className="w-4 h-4" /> نبذة
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Calendar className="w-4 h-4" /> الحضور
          </TabsTrigger>
          <TabsTrigger value="salary" className="gap-2">
            <Banknote className="w-4 h-4" /> الرواتب
          </TabsTrigger>
          {hasPermission('manage_employees') && employee.user_id && (
            <TabsTrigger value="access" className="gap-2">
              <Shield className="w-4 h-4" /> الصلاحيات
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">الاسم</p>
                <p className="font-bold">{name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">المسمى الوظيفي</p>
                <p className="font-bold">{employee.position || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">الهاتف</p>
                <p className="font-bold" dir="ltr">{employee.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">البريد (تسجيل الدخول)</p>
                <p className="font-bold" dir="ltr">{employee.login_email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">الدور</p>
                <p className="font-bold">{employee.role_ar || employee.role || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">الراتب الشهري</p>
                <p className="font-bold text-[#0F766E]">
                  {Number(employee.monthly_salary || 0).toLocaleString()} د.ج
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4">
              <form
                className="flex flex-wrap gap-3 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  attendanceMutation.mutate({ date: attDate, status: attStatus });
                }}
              >
                <div>
                  <label className="text-sm font-bold mb-1 block">التاريخ</label>
                  <Input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">الحالة</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value)}
                    className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3"
                  >
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="leave">إجازة</option>
                    <option value="late">متأخر</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: TEAL }}
                  disabled={attendanceMutation.isPending}
                >
                  {attendanceMutation.isPending ? 'جاري الحفظ...' : 'تسجيل'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length ? (
                  attendance.map((a: any, i: number) => (
                    <TableRow key={a.id || i}>
                      <TableCell>{a.date || a.attendance_date || '—'}</TableCell>
                      <TableCell>
                        {attendanceStatusLabel[a.status] || a.status}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-[var(--color-text-muted)] h-24">
                      لا سجلات حضور
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="mt-4 space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4">
              <form
                className="flex flex-wrap gap-3 items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!salAmount || Number(salAmount) <= 0) {
                    toast.error('أدخل مبلغاً صالحاً');
                    return;
                  }
                  salaryMutation.mutate({
                    month: salMonth,
                    amount: Number(salAmount),
                    status: salStatus,
                  });
                }}
              >
                <div>
                  <label className="text-sm font-bold mb-1 block">الشهر</label>
                  <Input type="month" value={salMonth} onChange={(e) => setSalMonth(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">المبلغ (د.ج)</label>
                  <Input
                    type="number"
                    value={salAmount}
                    onChange={(e) => setSalAmount(e.target.value)}
                    placeholder={String(employee.monthly_salary || '')}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">الحالة</label>
                  <select
                    value={salStatus}
                    onChange={(e) => setSalStatus(e.target.value)}
                    className="h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3"
                  >
                    <option value="pending">معلق</option>
                    <option value="paid">مدفوع</option>
                    <option value="partial">جزئي</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="text-white"
                  style={{ backgroundColor: TEAL }}
                  disabled={salaryMutation.isPending}
                >
                  {salaryMutation.isPending ? 'جاري الحفظ...' : 'تسجيل راتب'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الشهر</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.length ? (
                  salaries.map((s: any, i: number) => (
                    <TableRow key={s.id || i}>
                      <TableCell>{s.month || s.salary_month || '—'}</TableCell>
                      <TableCell>{Number(s.amount || 0).toLocaleString()} د.ج</TableCell>
                      <TableCell>{salaryStatusLabel[s.status] || s.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-[var(--color-text-muted)] h-24">
                      لا سجلات رواتب
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {hasPermission('manage_employees') && employee.user_id && (
          <TabsContent value="access" className="mt-4 space-y-4">
            <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 block">الدور (قالب)</label>
                  <select
                    value={accessRole}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setAccessRole(slug);
                      const match = roles.find((r: any) => r.slug === slug);
                      if (match?.permissions) setAccessPerms([...match.permissions]);
                    }}
                    className="w-full h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3 text-sm"
                  >
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.slug}>
                        {r.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="font-bold mb-2">صلاحيات هذا الموظف</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-3">
                    يمكنك منح أو سحب صلاحيات فوق الدور الافتراضي
                  </p>
                  <PermissionMatrix value={accessPerms} onChange={setAccessPerms} />
                </div>
                <div className="flex justify-end">
                  <Button
                    className="bg-[#0F766E] text-white"
                    disabled={accessMutation.isPending}
                    onClick={() => accessMutation.mutate()}
                  >
                    حفظ الصلاحيات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
