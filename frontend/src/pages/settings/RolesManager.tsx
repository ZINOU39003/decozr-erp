import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus, Save, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { PermissionMatrix } from '../../components/rbac/PermissionMatrix';
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from '../../services/api';
import { usePermission } from '../../lib/permissions';

export const RolesManager = () => {
  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();
  const { data: rolesRaw, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
  const roles = Array.isArray(rolesRaw) ? rolesRaw : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => roles.find((r: any) => r.id === selectedId) || roles[0] || null,
    [roles, selectedId],
  );

  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  React.useEffect(() => {
    if (!selected || creating) return;
    setNameAr(selected.name_ar || '');
    setSlug(selected.slug || '');
    setPermissions(Array.isArray(selected.permissions) ? selected.permissions : []);
    if (!selectedId) setSelectedId(selected.id);
  }, [selected, creating, selectedId]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (creating) {
        return createRole({ name_ar: nameAr, slug, permissions });
      }
      return updateRole(selected.id, { name_ar: nameAr, permissions });
    },
    onSuccess: (res: any) => {
      toast.success('تم حفظ الدور');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setCreating(false);
      if (res?.id) setSelectedId(res.id);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر الحفظ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success('تم حذف الدور');
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر الحذف');
    },
  });

  if (!hasPermission('manage_roles')) {
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)]" dir="rtl">
        ليس لديك صلاحية إدارة الأدوار
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] mb-2"
          >
            <ArrowRight className="w-4 h-4" /> الإعدادات
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--color-primary-600)]" />
            الأدوار والصلاحيات
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            الأدوار قوالب جاهزة — ويمكن تخصيص صلاحيات كل موظف لاحقاً عند إنشائه أو تعديله
          </p>
        </div>
        <Button
          className="bg-[var(--color-primary-600)] text-white gap-2"
          onClick={() => {
            setCreating(true);
            setSelectedId(null);
            setNameAr('');
            setSlug('');
            setPermissions([]);
          }}
        >
          <Plus className="w-4 h-4" /> دور جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 border-[var(--color-border)]">
          <CardContent className="p-3 space-y-1 max-h-[70vh] overflow-y-auto">
            {isLoading && <p className="p-3 text-sm text-[var(--color-text-muted)]">جاري التحميل...</p>}
            {roles.map((r: any) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setCreating(false);
                  setSelectedId(r.id);
                }}
                className={`w-full text-right rounded-xl px-3 py-3 transition-colors ${
                  !creating && selected?.id === r.id
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
                    : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)]'
                }`}
              >
                <div className="font-bold">{r.name_ar}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {r.slug} · {r.permissions?.length || 0} صلاحية · {r.users_count || 0} مستخدم
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 border-[var(--color-border)]">
          <CardContent className="p-6 space-y-5">
            {!selected && !creating ? (
              <p className="text-[var(--color-text-muted)]">اختر دوراً أو أنشئ دوراً جديداً</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">الاسم بالعربية</label>
                    <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">المعرّف (slug)</label>
                    <Input
                      value={slug}
                      disabled={!creating}
                      onChange={(e) =>
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))
                      }
                      placeholder="designer"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">الصلاحيات الافتراضية للدور</h3>
                  <PermissionMatrix value={permissions} onChange={setPermissions} />
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  {!creating && selected && !selected.is_system && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 gap-2"
                      onClick={() => deleteMutation.mutate(selected.id)}
                    >
                      <Trash2 className="w-4 h-4" /> حذف
                    </Button>
                  )}
                  <Button
                    className="bg-[var(--color-primary-600)] text-white gap-2"
                    disabled={!nameAr.trim() || (creating && !slug.trim()) || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    <Save className="w-4 h-4" /> حفظ
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
