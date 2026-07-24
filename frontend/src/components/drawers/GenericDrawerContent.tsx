import React from 'react';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';

export const GenericDrawerContent = ({ title }: { title?: string }) => {
  const { drawer } = useUIStore();
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg text-center text-[var(--color-text-muted)]">
        <p className="mb-2">لا توجد بيانات مفصلة لعرضها حالياً.</p>
        <p className="text-sm">يمكنك إضافة المزيد من المعلومات لاحقاً.</p>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
        <Button variant="outline" className="border-[var(--color-border)] w-full" onClick={drawer.closeDrawer}>إغلاق</Button>
      </div>
    </div>
  );
};
