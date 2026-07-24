import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, FileText, Upload, Trash2, Edit3 } from 'lucide-react';
import { getDesignById } from '../../services/api';
import { toast } from 'sonner';
import { mockDesigns } from '../../data/mockDatabase';

export const VersionsManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDesignById(id!).then(data => {
      setDesign(data);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, [id]);

  const handleCreateVersion = () => {
    const newVersion = {
      id: `VER-${Date.now()}`,
      version_number: (design?.versions?.length || 0) + 1,
      changelog: 'إصدار جديد',
      created_at: new Date().toISOString(),
      files: []
    };
    const updatedVersions = [...(design?.versions || []), newVersion];
    
    // Update local MockDatabase directly to bypass complex repo logic
    const idx = mockDesigns.findIndex(d => d.id === id);
    if (idx > -1) {
      mockDesigns[idx].versions = updatedVersions;
    }
    
    setDesign({ ...design, versions: updatedVersions });
    toast.success('تم إنشاء إصدار جديد');
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/designs/${id}`)} className="p-2 bg-[var(--color-bg-main)] text-[var(--color-text-muted)] rounded-full hover:bg-[var(--color-border)] transition border border-[var(--color-border)]">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">إدارة الإصدارات والملفات</h1>
            <p className="text-[var(--color-text-muted)] mt-1">إدارة الإصدارات المختلفة لتصميمك والملفات المرتبطة بها</p>
          </div>
        </div>
        <button onClick={handleCreateVersion} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-500)] transition shadow-lg font-semibold">
          <Plus size={18} />
          <span>إصدار جديد</span>
        </button>
      </div>

      <div className="space-y-6">
        {design?.versions?.length ? design.versions.map((version: any) => (
          <div key={version.id} className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-[var(--color-text-main)]">
                    الإصدار {version.version_number}.0
                  </h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${version.status === 'active' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-[var(--color-bg-sidebar)] text-[var(--color-text-muted)]'}`}>
                    {version.status === 'active' ? 'نشط (الافتراضي)' : 'مسودة'}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] font-mono">{version.id}</span>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm">{version.changelog || 'لا توجد ملاحظات الإصدار'}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary-500)] transition hover:bg-[var(--color-primary-500)]/10 rounded-lg" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                  <Edit3 size={18} />
                </button>
              </div>
            </div>
            
            <div className="bg-[var(--color-bg-main)] rounded-xl border border-[var(--color-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-main)]/50 flex justify-between items-center">
                <h3 className="font-semibold text-[var(--color-text-main)] flex items-center gap-2">
                  <FileText size={16} className="text-[var(--color-primary-500)]" />
                  الملفات المرفقة
                </h3>
              </div>
              <div className="p-4">
                {version.files?.length > 0 ? (
                  <div className="space-y-2">
                    {version.files.map((file: any) => (
                      <div key={file.id} className="flex justify-between items-center bg-[var(--color-bg-card)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-[var(--color-text-main)] text-sm font-bold">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[var(--color-text-muted)]">
                    <p className="text-sm">لا توجد ملفات في هذا الإصدار</p>
                  </div>
                )}
                <button className="w-full mt-4 flex flex-col items-center justify-center p-4 bg-[var(--color-bg-main)] border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] transition" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                  <Upload size={20} className="mb-2" />
                  <span className="text-sm font-medium">رفع ملف جديد</span>
                </button>
              </div>
            </div>
          </div>
        )) : <div className="text-center p-8 text-[var(--color-text-muted)] bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">لا توجد إصدارات مسجلة بعد. انقر على 'إصدار جديد' للبدء.</div>}
      </div>
    </div>
  );
};
