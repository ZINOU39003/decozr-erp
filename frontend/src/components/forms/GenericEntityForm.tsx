import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';
import { EventBus } from '../../core/events/EventBus';
import { createMaterial, createSupplier } from '../../services/api';
import { useUIStore } from '../../store/uiStore';

export const GenericEntityForm = ({ title }: { title?: string }) => {
  const { modal } = useUIStore();
  const [formData, setFormData] = React.useState({ name: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.type === 'CREATE_MATERIAL') {
      await createMaterial({ 
        name_ar: formData.name,
        sku: `MAT-${Math.floor(Math.random() * 100000)}`,
        unit: 'قطعة',
        current_stock: 0,
        min_stock_level: 0,
        unit_cost: 0
      });
    } else if (modal.type === 'CREATE_SUPPLIER') {
      await createSupplier({ name: formData.name });
    } else {
      EventBus.emit(`${modal.type}_CREATED`, formData);
    }
    toast.success('تم الحفظ بنجاح');
    modal.closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-[var(--color-text-main)] mb-1.5 block">الاسم / العنوان</label>
          <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-[var(--color-bg-main)] border-[var(--color-border)]" placeholder="أدخل البيانات هنا..." />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-[var(--color-text-main)] mb-1.5 block">معلومات إضافية</label>
          <Input className="bg-[var(--color-bg-main)] border-[var(--color-border)]" placeholder="اختياري..." />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <Button type="button" variant="outline" className="border-[var(--color-border)]" onClick={modal.closeModal}>إلغاء</Button>
        <Button type="submit" className="bg-[var(--color-primary-600)] text-white">حفظ البيانات</Button>
      </div>
    </form>
  );
};
