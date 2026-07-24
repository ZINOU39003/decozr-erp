import React from 'react';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { PackageSearch, Users, Activity, Settings, FileText, CheckCircle2, Box, PenTool } from 'lucide-react';

export interface EntityDrawerData {
  entityType: 'ORDER' | 'CUSTOMER' | 'EMPLOYEE' | 'MACHINE' | 'INVOICE' | 'SUPPLIER' | 'INVENTORY' | 'TASK' | 'DESIGN';
  entityId: string;
  title: string;
  [key: string]: any;
}

export const EntityDrawer = ({ data }: { data: EntityDrawerData }) => {
  if (!data) return null;

  const renderContent = () => {
    switch (data.entityType) {
      case 'ORDER':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-sm font-bold">رقم الطلب</span>
              <span className="text-[var(--color-text-main)] font-bold">{data.entityId}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-sm font-bold">العميل</span>
              <span className="text-[var(--color-text-main)] font-bold">{data.customerName || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-sm font-bold">الحالة</span>
              <span className="px-2 py-1 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-md text-sm font-bold">{data.status || 'N/A'}</span>
            </div>
            <Button className="w-full mt-6 bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]">فتح مساحة عمل الطلب</Button>
          </div>
        );
      case 'EMPLOYEE':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <div className="w-20 h-20 bg-[var(--color-primary-500)]/20 text-[var(--color-primary-500)] flex items-center justify-center rounded-full mb-4">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">{data.name || 'اسم الموظف'}</h3>
              <p className="text-[var(--color-text-muted)]">{data.role || 'الدور'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-bg-main)] rounded-xl border border-[var(--color-border)]">
                <span className="block text-xs text-[var(--color-text-muted)] mb-1">القسم</span>
                <span className="font-bold text-[var(--color-text-main)]">{data.department || 'N/A'}</span>
              </div>
              <div className="p-4 bg-[var(--color-bg-main)] rounded-xl border border-[var(--color-border)]">
                <span className="block text-xs text-[var(--color-text-muted)] mb-1">الحالة</span>
                <span className="font-bold text-[var(--color-success)]">{data.status || 'نشط'}</span>
              </div>
            </div>
          </div>
        );
      case 'MACHINE':
        return (
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] text-sm font-bold">رقم الآلة</span>
              <span className="text-[var(--color-text-main)] font-bold">{data.entityId}</span>
            </div>
            <div className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[var(--color-text-muted)] text-sm font-bold">OEE</span>
                 <span className="text-[var(--color-success)] font-bold">85%</span>
               </div>
               <div className="w-full h-2 bg-[var(--color-bg-main)] rounded-full overflow-hidden">
                 <div className="h-full bg-[var(--color-success)] w-[85%]"></div>
               </div>
            </div>
            <Button className="w-full mt-6 bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]">إدارة الماكينة</Button>
          </div>
        )
      case 'CUSTOMER':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <div className="w-20 h-20 bg-[var(--color-primary-500)]/20 text-[var(--color-primary-500)] flex items-center justify-center rounded-full mb-4">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)]">{data.name || 'عميل'}</h3>
              <p className="text-[var(--color-text-muted)] flex items-center gap-2 mt-2">
                <span dir="ltr">{data.phone || 'N/A'}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-bg-main)] rounded-xl border border-[var(--color-border)] flex flex-col items-center text-center">
                <span className="text-xs text-[var(--color-text-muted)] mb-1">الرصيد</span>
                <span className={`font-bold ${data.balance > 0 ? 'text-[var(--color-danger)]' : data.balance < 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-main)]'}`}>
                  {data.balance ? data.balance.toLocaleString() : 0} د.ج
                </span>
              </div>
              <div className="p-4 bg-[var(--color-bg-main)] rounded-xl border border-[var(--color-border)] flex flex-col items-center text-center">
                <span className="text-xs text-[var(--color-text-muted)] mb-1">عدد الطلبات</span>
                <span className="font-bold text-[var(--color-text-main)]">12</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Button className="w-full bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]">
                إنشاء طلب جديد
              </Button>
              <Button className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]">
                سجل الفواتير
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
            <PackageSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-bold">جارِ تحميل بيانات الكيان...</p>
            <p className="text-sm mt-2 opacity-70">المعرف: {data.entityId}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};
