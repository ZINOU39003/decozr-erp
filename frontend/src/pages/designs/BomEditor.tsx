import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Calculator, Settings, Trash2 } from 'lucide-react';
import { getDesignById } from '../../services/api';

export const BomEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bomMaterials, setBomMaterials] = useState<any[]>([]);
  const [bomLabor, setBomLabor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDesignById(id!)
      .then(data => {
        if (data?.versions?.length > 0) {
          const currentVersion = data.versions.find((v: any) => v.status === 'active') || data.versions[0];
          setBomMaterials(currentVersion.bomMaterials || []);
          setBomLabor(currentVersion.bomLabor || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/designs/${id}`)} className="p-2 bg-[var(--color-bg-main)] text-[var(--color-text-muted)] rounded-full hover:bg-[var(--color-border)] transition border border-[var(--color-border)]">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">محرر الـ BOM وحساب التكلفة</h1>
            <p className="text-[var(--color-text-muted)] mt-1">إعداد المواد المستخدمة، وقت الآلات، وقواعد التسعير الديناميكية</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materials */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Settings className="text-[var(--color-primary-500)]" size={20} />
              المواد (Materials)
            </h2>
            <button className="text-[var(--color-primary-500)] text-sm font-semibold flex items-center gap-1 hover:underline" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Plus size={16} /> إضافة مادة
            </button>
          </div>
          <div className="space-y-3">
            {bomMaterials.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg shadow-sm">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-main)]">{m.material?.name_ar || 'مادة غير معروفة'}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">الكمية: {m.quantity} {m.unit_of_measure} | شرط: {m.condition_expr || 'دائماً'}</p>
                </div>
                <button className="text-[var(--color-danger)] hover:text-red-700 transition p-1" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {bomMaterials.length === 0 && <p className="text-sm text-[var(--color-text-muted)] text-center py-4">لا يوجد مواد مدرجة.</p>}
          </div>
        </div>

        {/* Labor & Machines */}
        <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Settings className="text-[var(--color-primary-500)]" size={20} />
              الآلات والعمل (Labor)
            </h2>
            <button className="text-[var(--color-primary-500)] text-sm font-semibold flex items-center gap-1 hover:underline" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              <Plus size={16} /> إضافة آلة
            </button>
          </div>
          <div className="space-y-3">
            {bomLabor.map((l) => (
              <div key={l.id} className="flex justify-between items-center p-3 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg shadow-sm">
                <div>
                  <h4 className="font-semibold text-[var(--color-text-main)]">{l.machine?.name_ar || 'آلة غير معروفة'}</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">الوقت: {l.time_minutes} دقيقة | شرط: {l.condition_expr || 'دائماً'}</p>
                </div>
                <button className="text-[var(--color-danger)] hover:text-red-700 transition p-1" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {bomLabor.length === 0 && <p className="text-sm text-[var(--color-text-muted)] text-center py-4">لا يوجد آلات مدرجة.</p>}
          </div>
        </div>
      </div>

      {/* Price Rules Simulator */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2 mb-6">
          <Calculator className="text-[var(--color-primary-500)]" size={20} />
          محاكاة التسعير الديناميكي
        </h2>
        <div className="bg-[var(--color-bg-main)] p-4 rounded-xl border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">هذه الأداة تحاكي واجهة المستخدم عند اختيار التصميم بناءً على قواعد الـ BOM والأسعار.</p>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg hover:bg-[var(--color-border)] transition shadow-sm" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
              تشغيل المحاكاة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
