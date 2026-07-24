import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { useUIStore } from '../../store/uiStore';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomer, updateCustomer, getPriceLists } from '../../services/api';

export const CustomerForm = ({
  defaultValues = {},
  onSuccess,
  onCancel,
}: {
  defaultValues?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name_ar: defaultValues.name_ar || '',
      phone: defaultValues.phone || '',
      email: defaultValues.email || '',
      type: defaultValues.customer_type === 'company' ? 'شركة'
        : defaultValues.customer_type === 'distributor' ? 'حكومي'
        : 'فرد',
      notes: defaultValues.notes || '',
      price_list_id: defaultValues.price_list_id || '',
      enable_portal: true,
    },
  });
  const { modal } = useUIStore();
  const queryClient = useQueryClient();
  const emailValue = watch('email');

  const { data: priceListsRaw } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => getPriceLists(),
  });
  const priceLists = Array.isArray(priceListsRaw)
    ? priceListsRaw
    : Array.isArray((priceListsRaw as any)?.data)
      ? (priceListsRaw as any).data
      : [];

  const mutation = useMutation({
    mutationFn: (data: any) =>
      defaultValues.id ? updateCustomer(defaultValues.id, data) : createCustomer(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(defaultValues.id ? 'تم تعديل العميل بنجاح' : 'تم إضافة العميل بنجاح');
      if (res?.portal?.temporary_password) {
        toast.message('بيانات بوابة العميل', {
          description: `${res.portal.email} / ${res.portal.temporary_password}`,
          duration: 15000,
        });
      }
      modal.closeModal();
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'حدث خطأ أثناء حفظ العميل';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    },
  });

  const onSubmit = (data: any) => {
    const typeMapping: Record<string, string> = {
      فرد: 'individual',
      شركة: 'company',
      حكومي: 'distributor',
    };

    const retail =
      priceLists.find((p: any) => p.list_type === 'retail') || priceLists[0];

    const payload = {
      name_ar: String(data.name_ar || '').trim(),
      phone: String(data.phone || '').trim(),
      email: data.email?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      customer_type: typeMapping[data.type] || 'individual',
      price_list_id: data.price_list_id || retail?.id,
      enable_portal: !defaultValues.id && !!data.enable_portal && !!data.email?.trim(),
    };

    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--color-text-main)]">الاسم</label>
          <input
            {...register('name_ar', { required: 'مطلوب' })}
            className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
          />
          {errors.name_ar && (
            <span className="text-xs text-[var(--color-danger)]">
              {errors.name_ar.message as string}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--color-text-main)]">رقم الهاتف</label>
          <input
            {...register('phone', { required: 'مطلوب' })}
            className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
            dir="ltr"
          />
          {errors.phone && (
            <span className="text-xs text-[var(--color-danger)]">
              {errors.phone.message as string}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--color-text-main)]">البريد الإلكتروني</label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--color-text-main)]">نوع العميل</label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
          >
            <option value="فرد">فرد</option>
            <option value="شركة">شركة</option>
            <option value="حكومي">حكومي / موزع</option>
          </select>
        </div>
        {priceLists.length > 0 && (
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-bold text-[var(--color-text-main)]">قائمة الأسعار</label>
            <select
              {...register('price_list_id')}
              className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
            >
              {priceLists.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name_ar} ({p.list_type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--color-text-main)]">ملاحظات</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-md text-[var(--color-text-main)] outline-none focus:border-[var(--color-primary-500)]"
        />
      </div>

      {!defaultValues.id && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('enable_portal')} disabled={!emailValue} />
          <span className={!emailValue ? 'text-[var(--color-text-muted)]' : ''}>
            تفعيل بوابة العميل (يتطلب بريدًا إلكترونيًا)
          </span>
        </label>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
        <Button type="button" variant="outline" onClick={() => {
          modal.closeModal();
          onCancel?.();
        }}>
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-[var(--color-primary-500)] text-white"
        >
          {mutation.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
        </Button>
      </div>
    </form>
  );
};
