import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { GitMerge, Plus, Trash2, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkflowTemplates,
  addWorkflowStage,
  deleteWorkflowStage,
  updateWorkflowTemplate,
} from '../../services/api';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

export const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStage, setNewStage] = useState({ name_ar: '', slug: '', color: '#60a5fa' });

  const { data: templatesRaw, isLoading } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: getWorkflowTemplates,
  });

  const templates = unwrapList(templatesRaw);

  useEffect(() => {
    if (!selectedId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) || templates[0];
      setSelectedId(def.id);
    }
  }, [templates, selectedId]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId]
  );

  const stages = useMemo(() => {
    const list = selected?.stages || [];
    return [...list].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [selected]);

  const addStageMutation = useMutation({
    mutationFn: (payload: { name_ar: string; slug: string; color?: string; sort_order: number }) =>
      addWorkflowStage(selectedId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('تمت إضافة المرحلة');
      setNewStage({ name_ar: '', slug: '', color: '#60a5fa' });
    },
    onError: () => toast.error('فشل إضافة المرحلة'),
  });

  const deleteStageMutation = useMutation({
    mutationFn: deleteWorkflowStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('تم حذف المرحلة');
    },
    onError: () => toast.error('فشل حذف المرحلة'),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      updateWorkflowTemplate(selectedId!, {
        name_ar: selected?.name_ar,
        is_default: selected?.is_default ?? true,
      }),
    onSuccess: () => toast.success('تم حفظ مسار العمل'),
    onError: () => toast.error('فشل الحفظ'),
  });

  const handleAddStage = () => {
    if (!selectedId) return;
    if (!newStage.name_ar.trim() || !newStage.slug.trim()) {
      toast.error('اسم المرحلة و slug مطلوبان');
      return;
    }
    addStageMutation.mutate({
      name_ar: newStage.name_ar.trim(),
      slug: newStage.slug.trim(),
      color: newStage.color,
      sort_order: stages.length + 1,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-[var(--color-primary-500)]" />
            منشئ مسارات العمل (Workflow Builder)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">مراحل الإنتاج مرتبة حسب مسار العمل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[var(--color-border)]" onClick={() => navigate('/settings')}>
            إلغاء
          </Button>
          <Button
            className="bg-[var(--color-primary-600)] text-white"
            disabled={!selectedId || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            حفظ المسار
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-bold text-[var(--color-text-main)] mb-4">القوالب</h3>
              {isLoading && <p className="text-sm text-[var(--color-text-muted)]">جاري التحميل...</p>}
              {!isLoading && templates.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)]">لا توجد قوالب</p>
              )}
              {templates.map((t: any) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-right p-3 rounded border text-sm transition-colors ${
                    selectedId === t.id
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-text-main)]'
                  }`}
                >
                  <div className="font-bold">{t.name_ar}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {t.slug}
                    {t.is_default ? ' · افتراضي' : ''}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-[var(--color-text-main)]">إضافة مرحلة</h3>
              <Input
                placeholder="الاسم (عربي)"
                value={newStage.name_ar}
                onChange={(e) => setNewStage((s) => ({ ...s, name_ar: e.target.value }))}
                className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
              />
              <Input
                placeholder="slug (مثلاً in_cutting)"
                value={newStage.slug}
                onChange={(e) => setNewStage((s) => ({ ...s, slug: e.target.value }))}
                className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
              />
              <Input
                type="color"
                value={newStage.color}
                onChange={(e) => setNewStage((s) => ({ ...s, color: e.target.value }))}
                className="h-10 bg-[var(--color-bg-main)] border-[var(--color-border)]"
              />
              <Button
                className="w-full bg-[var(--color-primary-600)] text-white gap-2"
                disabled={!selectedId || addStageMutation.isPending}
                onClick={handleAddStage}
              >
                <Plus className="w-4 h-4" /> إضافة
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-main)] min-h-[600px] relative">
            <CardContent className="p-8 flex flex-col items-center">
              {!selected && !isLoading && (
                <p className="text-[var(--color-text-muted)]">اختر قالباً لعرض مراحله</p>
              )}
              {stages.map((stage: any, index: number) => (
                <React.Fragment key={stage.id}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-lg relative group"
                  >
                    <div
                      className="absolute top-0 left-0 w-2 h-full rounded-r-xl"
                      style={{ backgroundColor: stage.color || 'var(--color-primary-500)' }}
                    />
                    <div className="p-4 pl-6 flex items-center justify-between">
                      <div>
                        <div
                          className="text-xs font-bold uppercase mb-1"
                          style={{ color: stage.color || 'var(--color-primary-500)' }}
                        >
                          #{stage.sort_order} · {stage.slug}
                        </div>
                        <h4 className="font-bold text-[var(--color-text-main)]">{stage.name_ar}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100"
                        onClick={() => deleteStageMutation.mutate(stage.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                  {index < stages.length - 1 && (
                    <div className="h-10 w-px bg-[var(--color-border)] flex items-center justify-center my-1">
                      <ArrowDown className="w-4 h-4 text-[var(--color-text-muted)] translate-y-2 bg-[var(--color-bg-main)]" />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {selected && stages.length === 0 && (
                <p className="text-[var(--color-text-muted)]">لا توجد مراحل — أضف مرحلة من القائمة الجانبية</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
