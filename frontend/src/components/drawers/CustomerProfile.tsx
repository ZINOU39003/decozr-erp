import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { Phone, Mail, FileText, Activity, MapPin, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button';

export const CustomerProfile = ({ data }: { data: any }) => {
  const { drawer, modal } = useUIStore();

  if (!data) return <div className="text-center p-4">لم يتم اختيار عميل</div>;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary-500)]/10 flex items-center justify-center text-[var(--color-primary-500)] text-2xl font-bold">
          {data.name_ar?.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-main)]">{data.name_ar}</h2>
          <div className="flex gap-2 text-sm text-[var(--color-text-muted)] mt-1">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.phone}</span>
            {data.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.email}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[var(--color-bg-sidebar)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs mb-1">
            <DollarSign className="w-4 h-4" /> الرصيد الحالي
          </div>
          <div className={`font-bold text-lg ${data.balance > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
            {data.balance?.toLocaleString()} د.ج
          </div>
        </div>
        <div className="p-3 bg-[var(--color-bg-sidebar)] rounded-lg border border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs mb-1">
            <ShoppingCart className="w-4 h-4" /> عدد الطلبات
          </div>
          <div className="font-bold text-lg text-[var(--color-text-main)]">
            24 {/* Mock value */}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          className="flex-1 bg-[var(--color-primary-500)] text-white"
          onClick={() => {
            drawer.closeDrawer();
            modal.openModal('CREATE_ORDER', { customer_id: data.id });
          }}
        >
          <ShoppingCart className="w-4 h-4 ml-2" /> طلب جديد
        </Button>
        <Button 
          className="flex-1 bg-[var(--color-emerald-500)] text-white"
          onClick={() => modal.openModal('CREATE_PAYMENT', data)}
        >
          <DollarSign className="w-4 h-4 ml-2" /> تسجيل دفعة
        </Button>
      </div>

      {/* Tabs / Content */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <h3 className="font-bold text-[var(--color-text-main)] text-sm">النشاط الأخير</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[var(--color-bg-main)] rounded-lg border border-[var(--color-border)]">
              <div className="p-1.5 bg-[var(--color-info)]/10 rounded-full mt-0.5">
                <FileText className="w-4 h-4 text-[var(--color-info)]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--color-text-main)]">تم إصدار فاتورة #INV-00{i+1}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">منذ يومين</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
