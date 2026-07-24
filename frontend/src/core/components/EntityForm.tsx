import React, { ReactNode } from 'react';
import { useForm, DefaultValues, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { Button } from '../../components/ui/Button';

export type FormMode = 'create' | 'edit' | 'readonly' | 'duplicate';

interface EntityFormProps<TFieldValues extends FieldValues> {
  schema: ZodSchema<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  mode?: FormMode;
  onSubmit: SubmitHandler<TFieldValues>;
  onCancel?: () => void;
  children: (methods: ReturnType<typeof useForm<TFieldValues>>) => ReactNode;
  isLoading?: boolean;
}

export function EntityForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  mode = 'create',
  onSubmit,
  onCancel,
  children,
  isLoading = false,
}: EntityFormProps<TFieldValues>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  const isReadOnly = mode === 'readonly';
  const submitDisabled = isLoading || isSubmitting || (!isDirty && mode === 'edit');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={isReadOnly} className="space-y-4">
        {children(methods)}
      </fieldset>

      {!isReadOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              إلغاء
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitDisabled}
            className="bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
          >
            {isLoading || isSubmitting ? 'جاري الحفظ...' : mode === 'edit' ? 'تحديث' : 'حفظ'}
          </Button>
        </div>
      )}
    </form>
  );
}
