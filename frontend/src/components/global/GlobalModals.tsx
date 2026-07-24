import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore, unlockDocumentUi } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { CustomerForm } from '../forms/CustomerForm';
import { toast } from 'sonner';
import {
  createEmployee,
  createMachine,
  createMaterial,
  createSupplier,
  getCustomers,
} from '../../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function closeModalSafe() {
  useUIStore.getState().modal.closeModal();
  unlockDocumentUi();
}

function closeConfirmSafe() {
  useUIStore.getState().confirm.closeConfirm();
  unlockDocumentUi();
}

/** Lightweight modal — avoids Radix body pointer-events lock that freezes the app */
function AppModal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Never set pointer-events:none on body
    unlockDocumentUi();
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev || '';
      unlockDocumentUi();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 bg-black/55 border-0 cursor-pointer"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function EntityCreateForm({ type }: { type: string }) {
  const modalData = useUIStore((s) => s.modal.data);
  const queryClient = useQueryClient();
  const [name, setName] = useState(modalData?.name_ar || modalData?.full_name_ar || '');
  const [phone, setPhone] = useState(modalData?.phone || '');
  const [extra, setExtra] = useState('');
  const [amount, setAmount] = useState('');
  const [machineType, setMachineType] = useState(modalData?.machine_type || 'laser');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeRole, setEmployeeRole] = useState('worker');
  const [employeeSalary, setEmployeeSalary] = useState('');
  const [saving, setSaving] = useState(false);
  const customersQ = useQuery({
    queryKey: ['customers', 'mini'],
    queryFn: () => getCustomers({ limit: 50 }),
    enabled: type === 'CREATE_PAYMENT' || type === 'CREATE_INVOICE',
  });
  const customers = Array.isArray(customersQ.data?.data)
    ? customersQ.data.data
    : Array.isArray(customersQ.data)
      ? customersQ.data
      : [];
  const [customerId, setCustomerId] = useState(modalData?.customer_id || modalData?.id || '');

  const invalidateFor = (t: string) => {
    if (t === 'CREATE_MATERIAL') queryClient.invalidateQueries({ queryKey: ['materials'] });
    if (t === 'CREATE_SUPPLIER') queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    if (t === 'CREATE_EMPLOYEE') queryClient.invalidateQueries({ queryKey: ['employees'] });
    if (t === 'CREATE_MACHINE') queryClient.invalidateQueries({ queryKey: ['machines'] });
    if (t === 'CREATE_PAYMENT') {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && type !== 'CREATE_PAYMENT') {
      toast.error('أدخل الاسم');
      return;
    }
    setSaving(true);
    try {
      if (type === 'CREATE_MATERIAL') {
        await createMaterial({
          name_ar: name.trim(),
          sku: `MAT-${Date.now().toString().slice(-6)}`,
          unit: extra || 'قطعة',
          current_stock: 0,
          min_stock_level: 0,
          unit_cost: 0,
        });
      } else if (type === 'CREATE_SUPPLIER') {
        await createSupplier({ name_ar: name.trim(), phone: phone || undefined });
      } else if (type === 'CREATE_EMPLOYEE') {
        if (!employeeEmail.trim()) {
          toast.error('أدخل البريد الإلكتروني');
          setSaving(false);
          return;
        }
        const res = await createEmployee({
          full_name_ar: name.trim(),
          employee_number: `EMP-${Date.now().toString().slice(-5)}`,
          position: extra.trim() || 'موظف',
          phone: phone.trim() || undefined,
          email: employeeEmail.trim(),
          password: employeePassword.trim() || undefined,
          role: employeeRole,
          monthly_salary: employeeSalary ? Number(employeeSalary) : undefined,
          is_active: true,
        });
        const cred = (res as any)?.data ?? res;
        const loginEmail = cred?.email || cred?.login_email || employeeEmail.trim();
        const pwd = cred?.temporary_password || cred?.password;
        if (pwd) {
          toast.message('احفظ بيانات الدخول', {
            description: `${loginEmail} / ${pwd}`,
            duration: 20000,
          });
        }
      } else if (type === 'CREATE_MACHINE') {
        await createMachine({
          name_ar: name.trim(),
          code: `MAC-${Date.now().toString().slice(-5)}`,
          machine_type: machineType || 'other',
          cost_per_minute: 0,
          daily_capacity_minutes: 480,
          operational_status: 'operational',
          is_active: true,
        });
      } else if (type === 'CREATE_PAYMENT') {
        if (!customerId || !amount || Number(amount) <= 0) {
          toast.error('اختر عميلاً وأدخل مبلغاً صالحاً');
          setSaving(false);
          return;
        }
        const { addPayment } = await import('../../services/api');
        await addPayment(customerId, Number(amount), 'cash', name || 'دفعة من لوحة الأدمن');
      } else {
        toast.info('هذه الإضافة تُدار من صفحتها المخصصة');
        closeModalSafe();
        setSaving(false);
        return;
      }
      invalidateFor(type);
      closeModalSafe();
      toast.success('تم الحفظ بنجاح');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'تعذر الحفظ';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      unlockDocumentUi();
    } finally {
      setSaving(false);
    }
  };

  if (type === 'CREATE_PAYMENT') {
    return (
      <form onSubmit={onSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="text-sm font-bold mb-1 block">العميل</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3"
            required
          >
            <option value="">اختر عميلاً</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name_ar} · {c.phone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">المبلغ (د.ج)</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">ملاحظة</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اختياري" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={closeModalSafe}>
            إلغاء
          </Button>
          <Button type="submit" className="bg-[#0F766E] text-white" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'تسجيل الدفعة'}
          </Button>
        </div>
      </form>
    );
  }

  if (type === 'CREATE_EMPLOYEE') {
    return (
      <form onSubmit={onSubmit} className="space-y-4" dir="rtl">
        <div>
          <label className="text-sm font-bold mb-1 block">الاسم</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">المسمى الوظيفي</label>
          <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="مثال: عامل إنتاج" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">الهاتف</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">البريد (تسجيل الدخول)</label>
          <Input type="email" value={employeeEmail} onChange={(e) => setEmployeeEmail(e.target.value)} required dir="ltr" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">كلمة المرور</label>
          <Input
            type="password"
            value={employeePassword}
            onChange={(e) => setEmployeePassword(e.target.value)}
            placeholder="اتركها فارغة لتوليد تلقائي"
            dir="ltr"
          />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">الدور</label>
          <select
            value={employeeRole}
            onChange={(e) => setEmployeeRole(e.target.value)}
            className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3"
          >
            <option value="worker">عامل</option>
            <option value="seller">بائع</option>
            <option value="manager">مدير</option>
            <option value="admin">مدير نظام</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">الراتب الشهري (د.ج)</label>
          <Input type="number" value={employeeSalary} onChange={(e) => setEmployeeSalary(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={closeModalSafe}>
            إلغاء
          </Button>
          <Button type="submit" className="bg-[#0F766E] text-white" disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="text-sm font-bold mb-1 block">الاسم</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      {type === 'CREATE_SUPPLIER' && (
        <div>
          <label className="text-sm font-bold mb-1 block">الهاتف</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      )}
      {type === 'CREATE_MATERIAL' && (
        <div>
          <label className="text-sm font-bold mb-1 block">الوحدة</label>
          <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="قطعة / متر..." />
        </div>
      )}
      {type === 'CREATE_MACHINE' && (
        <div>
          <label className="text-sm font-bold mb-1 block">نوع الآلة</label>
          <select
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3"
          >
            <option value="laser">ليزر</option>
            <option value="cnc">CNC</option>
            <option value="printer">طابعة</option>
            <option value="uv_printer">UV</option>
            <option value="plotter">بلوتر</option>
            <option value="assembly_bench">طاولة تجميع</option>
            <option value="other">أخرى</option>
          </select>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={closeModalSafe}>
          إلغاء
        </Button>
        <Button type="submit" className="bg-[#0F766E] text-white" disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </form>
  );
}

export function GlobalModals() {
  const navigate = useNavigate();
  const location = useLocation();
  const modalOpen = useUIStore((s) => s.modal.isOpen);
  const modalType = useUIStore((s) => s.modal.type);
  const modalData = useUIStore((s) => s.modal.data);
  const confirmOpen = useUIStore((s) => s.confirm.isOpen);
  const confirmTitle = useUIStore((s) => s.confirm.title);
  const confirmDescription = useUIStore((s) => s.confirm.description);
  const confirmText = useUIStore((s) => s.confirm.confirmText);
  const cancelText = useUIStore((s) => s.confirm.cancelText);
  const confirmVariant = useUIStore((s) => s.confirm.variant);
  const onConfirm = useUIStore((s) => s.confirm.onConfirm);
  const onCancel = useUIStore((s) => s.confirm.onCancel);

  // Always clear locks + close modals on route change
  useEffect(() => {
    unlockDocumentUi();
    const st = useUIStore.getState();
    if (st.modal.isOpen) st.modal.closeModal();
    if (st.confirm.isOpen) st.confirm.closeConfirm();
  }, [location.pathname]);

  // Route some "create" actions to real pages instead of modals
  useEffect(() => {
    if (!modalOpen || !modalType) return;
    const redirects: Record<string, { path: string; msg?: string }> = {
      CREATE_ORDER: { path: '/orders/create' },
      CREATE_CUSTOMER: { path: '/customers/new' },
      CREATE_EMPLOYEE: { path: '/employees/new' },
      CREATE_DESIGN: { path: '/designs', msg: 'أضف تصميماً من صفحة التصاميم' },
      CREATE_INVOICE: { path: '/invoices', msg: 'أنشئ الفاتورة من صفحة الفواتير أو من طلب العميل' },
      CREATE_TASK: { path: '/tasks', msg: 'المهام مرتبطة بالطلبات — افتح طلباً لإضافة مهمة إنتاج' },
      CREATE_PURCHASE: { path: '/purchases', msg: 'افتح صفحة المشتريات لإدارة أوامر الشراء' },
    };
    const hit = redirects[modalType];
    // Customer edit still uses modal (has id)
    if (modalType === 'CREATE_CUSTOMER' && modalData?.id) return;
    if (!hit) return;
    closeModalSafe();
    navigate(hit.path);
    if (hit.msg) toast.message(hit.msg);
  }, [modalOpen, modalType, modalData, navigate]);

  useEffect(() => {
    if (!modalOpen && !confirmOpen) unlockDocumentUi();
  }, [modalOpen, confirmOpen]);

  const getModalTitle = () => {
    switch (modalType) {
      case 'CREATE_CUSTOMER':
        return modalData?.id ? 'تعديل العميل' : 'إضافة عميل جديد';
      case 'CREATE_MACHINE':
        return 'إضافة آلة جديدة';
      case 'CREATE_EMPLOYEE':
        return 'إضافة موظف جديد';
      case 'CREATE_PAYMENT':
        return 'تسجيل دفعة';
      case 'CREATE_SUPPLIER':
        return 'إضافة مورد جديد';
      case 'CREATE_MATERIAL':
        return 'إضافة مادة جديدة';
      default:
        return 'نافذة';
    }
  };

  const showCustomerEdit = modalOpen && modalType === 'CREATE_CUSTOMER' && !!modalData?.id;
  const showEntityForm =
    modalOpen &&
    !!modalType &&
    ['CREATE_MACHINE', 'CREATE_PAYMENT', 'CREATE_SUPPLIER', 'CREATE_MATERIAL'].includes(modalType);

  return (
    <>
      <AppModal
        open={showCustomerEdit || showEntityForm}
        title={getModalTitle()}
        onClose={closeModalSafe}
        wide
      >
        {modalType === 'CREATE_CUSTOMER' ? (
          <CustomerForm
            defaultValues={modalData || {}}
            onSuccess={closeModalSafe}
            onCancel={closeModalSafe}
          />
        ) : (
          <EntityCreateForm key={modalType || 'x'} type={modalType || ''} />
        )}
      </AppModal>

      <AppModal open={confirmOpen} title={
        <span className="flex items-center gap-2">
          {confirmVariant === 'danger' && <AlertTriangle className="w-5 h-5 text-[var(--color-danger)]" />}
          {confirmVariant === 'warning' && <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />}
          {confirmVariant === 'info' && <Info className="w-5 h-5 text-[var(--color-primary-500)]" />}
          {confirmTitle}
        </span>
      } onClose={closeConfirmSafe}>
        <p className="text-[var(--color-text-muted)] mb-6">{confirmDescription}</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              closeConfirmSafe();
            }}
          >
            {cancelText}
          </Button>
          <Button
            className={
              confirmVariant === 'danger'
                ? 'bg-[var(--color-danger)] hover:bg-red-600 text-white'
                : confirmVariant === 'warning'
                  ? 'bg-[var(--color-warning)] hover:bg-orange-600 text-white'
                  : 'bg-[var(--color-primary-500)] text-white'
            }
            onClick={() => {
              onConfirm?.();
              closeConfirmSafe();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </AppModal>
    </>
  );
}
