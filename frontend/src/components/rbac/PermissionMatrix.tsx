import React from 'react';
import { PERMISSION_GROUPS, type Permission } from '../../lib/permissions';
import { cn } from '../../lib/utils';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export function PermissionMatrix({ value, onChange, disabled, className }: Props) {
  const set = new Set(value);

  const toggle = (slug: string) => {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange([...next].sort());
  };

  const toggleGroup = (slugs: string[], allOn: boolean) => {
    if (disabled) return;
    const next = new Set(set);
    for (const s of slugs) {
      if (allOn) next.delete(s);
      else next.add(s);
    }
    onChange([...next].sort());
  };

  return (
    <div className={cn('space-y-4', className)} dir="rtl">
      {PERMISSION_GROUPS.map((group) => {
        const slugs = group.permissions.map((p) => p.slug);
        const allOn = slugs.every((s) => set.has(s));
        return (
          <div
            key={group.module}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[var(--color-text-main)]">{group.label}</h4>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleGroup(slugs, allOn)}
                className="text-xs text-[var(--color-primary-600)] hover:underline disabled:opacity-50"
              >
                {allOn ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {group.permissions.map((p) => {
                const checked = set.has(p.slug);
                return (
                  <label
                    key={p.slug}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
                      checked
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]',
                      disabled && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-[var(--color-primary-600)]"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(p.slug)}
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function defaultPermissionsForRole(
  roleSlug: string,
  rolePermissionsMap?: Record<string, string[]>,
): Permission[] {
  if (rolePermissionsMap?.[roleSlug]) return rolePermissionsMap[roleSlug] as Permission[];
  return [];
}
