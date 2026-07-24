import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { createEmployee, getRoles } from '../../services/api';
import { unlockDocumentUi, useUIStore } from '../../store/uiStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PermissionMatrix } from '../../components/rbac/PermissionMatrix';

/** Full-page employee create — avoids modal freeze */
export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: rolesRaw } = useQuery({ queryKey: ['roles'], queryFn: getRoles });
  const roles = useMemo(() => {
    const list = Array.isArray(rolesRaw) ? rolesRaw : [];
    return list.filter(
      (r: any) => !['customer', 'distributor'].includes(r.slug),
    );
  }, [rolesRaw]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [salary, setSalary] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPerms, setShowPerms] = useState(false);

  React.useEffect(() => {
    useUIStore.getState().modal.closeModal();
    unlockDocumentUi();
  }, []);

  React.useEffect(() => {
    if (!roles.length) return;
    const match = roles.find((r: any) => r.slug === role) || roles[0];
    if (match && !roles.some((r: any) => r.slug === role)) setRole(match.slug);
    setPermissions(Array.isArray(match?.permissions) ? [...match.permissions] : []);
  }, [roles, role]);

  const onRoleChange = (slug: string) => {
    setRole(slug);
    const match = roles.find((r: any) => r.slug === slug);
    setPermissions(Array.isArray(match?.permissions) ? [...match.permissions] : []);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('الاسم والبريد مطلوبان');
      return;
    }
    setSaving(true);
    try {
      const res = await createEmployee({
        full_name_ar: name.trim(),
        employee_number: `EMP-${Date.now().toString().slice(-5)}`,
        position: position.trim() || 'موظف',
        phone: phone.trim() || undefined,
        email: email.trim(),
        password: password.trim() || undefined,
        role,
        permissions,
        monthly_salary: salary ? Number(salary) : undefined,
        is_active: true,
      });
      const cred = (res as any)?.data ?? res;
      const pwd = cred?.temporary_password || cred?.password;
      if (pwd) {
        toast.message('احفظ بيانات الدخول', {
          description: `${cred?.email || email} / ${pwd}`,
          duration: 20000,
        });
      } else {
        toast.success('تم إضافة الموظف بنجاح');
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'تعذر الحفظ';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'bg-white border-[#E6ECF2]';

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Link
          to="/employees"
          className="p-2 rounded-xl border border-[#E6ECF2] bg-white hover:bg-[#F8FAFC]"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#15202b] flex items-center gap-2">
            <UserCircle className="text-[#0F766E]" /> إضافة موظف جديد
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            اختر دوراً كقالب ثم خصّص الصلاحيات لهذا الموظف إن لزم
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E6ECF2] bg-white p-5 sm:p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1.5 block">الاسم الكامل</label>
            <Input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">المسمى الوظيفي</label>
            <Input
              className={inputCls}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="مثال: مسؤول آلات القطع"
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">الهاتف</label>
            <Input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">البريد الإلكتروني</label>
            <Input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">كلمة المرور</label>
            <Input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اتركها فارغة لتوليد تلقائي"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">الدور (قالب الصلاحيات)</label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className={`w-full h-10 rounded-md border px-3 text-sm ${inputCls}`}
            >
              {roles.map((r: any) => (
                <option key={r.id} value={r.slug}>
                  {r.name_ar}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block">الراتب الشهري (د.ج)</label>
            <Input className={inputCls} type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>

          <div className="pt-2 border-t border-[#E6ECF2]">
            <button
              type="button"
              className="text-sm font-bold text-[#0F766E] mb-3"
              onClick={() => setShowPerms((v) => !v)}
            >
              {showPerms ? 'إخفاء تخصيص الصلاحيات' : 'تخصيص صلاحيات هذا الموظف'}
            </button>
            {showPerms && (
              <PermissionMatrix value={permissions} onChange={setPermissions} />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-[#0F766E] text-white" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ الموظف'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
