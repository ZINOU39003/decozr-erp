import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Scissors, Search, Box, Ruler, CheckCircle2, Factory } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOffcuts, createOffcut, getMaterials, updateOffcut } from '../../services/api';

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

export const OffcutsManager = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    material_id: '',
    width_cm: '',
    height_cm: '',
    location: '',
  });

  const { data: offcutsRaw, isLoading } = useQuery({
    queryKey: ['offcuts'],
    queryFn: () => getOffcuts(),
  });

  const { data: materialsRaw } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const offcuts = unwrapList(offcutsRaw);
  const materials = unwrapList(materialsRaw);

  const createMutation = useMutation({
    mutationFn: createOffcut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offcuts'] });
      toast.success('تم تسجيل القصاصة');
      setShowForm(false);
      setForm({ material_id: '', width_cm: '', height_cm: '', location: '' });
    },
    onError: () => toast.error('فشل تسجيل القصاصة'),
  });

  const reserveMutation = useMutation({
    mutationFn: (id: string) => updateOffcut(id, { status: 'reserved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offcuts'] });
      toast.success('تم حجز القصاصة');
    },
    onError: () => toast.error('فشل الحجز'),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offcuts;
    return offcuts.filter((o) => {
      const materialName = o.material?.name_ar || '';
      return (
        o.id?.toLowerCase().includes(q) ||
        materialName.toLowerCase().includes(q) ||
        (o.location || '').toLowerCase().includes(q)
      );
    });
  }, [offcuts, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.material_id || !form.width_cm || !form.height_cm) {
      toast.error('المادة والأبعاد مطلوبة');
      return;
    }
    createMutation.mutate({
      material_id: form.material_id,
      width_cm: parseFloat(form.width_cm),
      height_cm: parseFloat(form.height_cm),
      location: form.location || undefined,
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)] flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[var(--color-primary-500)]" />
            إدارة القصاصات (Offcuts)
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">إعادة استخدام القطع المتبقية وتقليل الهدر</p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[var(--color-primary-600)] text-white gap-2 shadow-[0_0_15px_var(--color-primary-500)]/20"
        >
          <Factory className="w-4 h-4" /> {showForm ? 'إلغاء' : 'تسجيل قصاصة جديدة'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">المادة</label>
                <select
                  value={form.material_id}
                  onChange={(e) => setForm((f) => ({ ...f, material_id: e.target.value }))}
                  className="w-full h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3 text-sm text-[var(--color-text-main)]"
                >
                  <option value="">اختر مادة...</option>
                  {materials.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name_ar || m.name || m.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">العرض (سم)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.width_cm}
                  onChange={(e) => setForm((f) => ({ ...f, width_cm: e.target.value }))}
                  className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">الارتفاع (سم)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.height_cm}
                  onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                  className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-1 block">الموقع</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="رف A-12"
                  className="bg-[var(--color-bg-main)] border-[var(--color-border)]"
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="bg-[var(--color-primary-600)] text-white">
                حفظ
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--color-text-muted)] mb-2 block">بحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
                  <Input
                    placeholder="بحث بالمعرف أو المادة..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-4 pr-10 bg-[var(--color-bg-main)] border-[var(--color-border)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{filtered.length} قصاصة</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
              لا توجد قصاصات مسجلة
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((offcut: any, i: number) => {
                const available = offcut.status === 'available';
                return (
                  <motion.div
                    key={offcut.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className={`border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary-500)]/50 transition-colors ${
                        !available && 'opacity-50 grayscale'
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Badge
                              variant="outline"
                              className="border-[var(--color-border)] text-[var(--color-text-muted)] mb-2 bg-[var(--color-bg-main)]"
                            >
                              {offcut.id?.slice(0, 8)}
                            </Badge>
                            <h3 className="font-bold text-[var(--color-text-main)] truncate max-w-[150px]">
                              {offcut.material?.name_ar || 'مادة'}
                            </h3>
                          </div>
                          {available ? (
                            <Badge variant="success">متاح</Badge>
                          ) : (
                            <Badge variant="secondary">{offcut.status === 'reserved' ? 'محجوز' : 'مستخدم'}</Badge>
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <Ruler className="w-4 h-4 text-[var(--color-primary-400)]" />
                            <span className="font-bold text-[var(--color-text-main)]">
                              {offcut.width_cm} × {offcut.height_cm} سم
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            <Box className="w-4 h-4" />
                            المكان: <span className="font-medium text-white">{offcut.location || '—'}</span>
                          </div>
                          {offcut.sourceOrder && (
                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                              <Scissors className="w-4 h-4" />
                              المصدر: <span className="font-medium text-white">{offcut.sourceOrder.order_number || offcut.source_order_id}</span>
                            </div>
                          )}
                        </div>

                        {available ? (
                          <Button
                            className="w-full bg-[var(--color-primary-600)]/20 hover:bg-[var(--color-primary-600)] text-[var(--color-primary-400)] hover:text-white transition-colors gap-2"
                            onClick={() => reserveMutation.mutate(offcut.id)}
                            disabled={reserveMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" /> حجز للإنتاج
                          </Button>
                        ) : (
                          <Button className="w-full bg-[var(--color-bg-main)] text-[var(--color-text-muted)] cursor-not-allowed" disabled>
                            غير متاح حالياً
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
