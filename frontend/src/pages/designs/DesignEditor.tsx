import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowRight, Settings, Image as ImageIcon, Box, Plus, X } from 'lucide-react';
import {
  getDesignById,
  createDesign,
  updateDesign,
  getDesignCategories,
  createDesignCategory,
  uploadDesignImages,
  mediaUrl,
} from '../../services/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { compressImageFile } from '../../lib/compressImage';

const MAX_IMAGES = 8;
const MAX_INPUT_SIZE = 20 * 1024 * 1024; // accept up to 20MB then compress

export const DesignEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    code: '',
    name_ar: '',
    category_id: '',
    description: '',
    image_url: '',
    gallery_images: [] as string[],
    retail_price: '',
    wholesale_price: '',
    cost_price: '',
    library_status: 'public',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
    if (!isNew && id) {
      getDesignById(id)
        .then((data: any) => {
          const gallery = Array.isArray(data.gallery_images) ? data.gallery_images : [];
          setFormData({
            code: data.code || '',
            name_ar: data.name_ar || '',
            category_id: data.category_id || '',
            description: data.description_ar || data.description || '',
            image_url: data.image_url || gallery[0] || '',
            gallery_images: gallery.length ? gallery : data.image_url ? [data.image_url] : [],
            retail_price: String(data.versions?.[0]?.priceRules?.[0]?.base_price || ''),
            wholesale_price: '',
            cost_price: '',
            library_status: data.library_status || 'public',
          });
          setLoading(false);
        })
        .catch(() => {
          toast.error('تعذر تحميل التصميم');
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const loadCategories = async () => {
    try {
      const data: any = await getDesignCategories();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch {
      toast.error('تعذر تحميل التصنيفات');
    }
  };

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const remaining = MAX_IMAGES - formData.gallery_images.length;
    if (remaining <= 0) {
      toast.error(`الحد الأقصى ${MAX_IMAGES} صور`);
      e.target.value = '';
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    const toastId = toast.loading('جاري ضغط ورفع الصور...');

    try {
      for (const file of selected) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} ليس صورة`);
          continue;
        }
        if (file.size > MAX_INPUT_SIZE) {
          toast.error(`${file.name} أكبر من 20MB`);
          continue;
        }
      }

      const compressed = await Promise.all(
        selected
          .filter((f) => f.type.startsWith('image/') && f.size <= MAX_INPUT_SIZE)
          .map((f) => compressImageFile(f, { maxWidth: 1600, maxBytes: 1.2 * 1024 * 1024 }))
      );

      if (!compressed.length) {
        toast.error('لم يتم رفع أي صورة صالحة', { id: toastId });
        return;
      }

      const result: any = await uploadDesignImages(compressed);
      const paths: string[] = result?.urls || result?.data?.urls || [];
      const absolute = paths.map((p) => mediaUrl(p));

      setFormData((prev) => {
        const merged = [...prev.gallery_images, ...absolute].slice(0, MAX_IMAGES);
        return {
          ...prev,
          gallery_images: merged,
          image_url: prev.image_url || merged[0] || '',
        };
      });

      toast.success(`تم رفع ${absolute.length} صورة بنجاح`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'فشل رفع الصور';
      toast.error(typeof msg === 'string' ? msg : 'فشل رفع الصور', { id: toastId });
    } finally {
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const gallery = prev.gallery_images.filter((_, i) => i !== index);
      return {
        ...prev,
        gallery_images: gallery,
        image_url: gallery[0] || '',
      };
    });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('الرجاء إدخال اسم التصنيف');
      return;
    }
    const catName = newCategoryName.trim();
    try {
      const newCat: any = await createDesignCategory({
        name_ar: catName,
        slug: catName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      });
      await loadCategories();
      setFormData((prev) => ({ ...prev, category_id: newCat?.id || newCat?.data?.id || '' }));
      setNewCategoryName('');
      setShowAddCategoryModal(false);
      toast.success('تمت إضافة التصنيف');
    } catch {
      toast.error('فشل إنشاء التصنيف');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name_ar.trim()) {
      toast.error('اسم التصميم مطلوب');
      return;
    }
    if (!formData.category_id) {
      toast.error('اختر تصنيفاً');
      return;
    }

    setSaving(true);
    const payload = {
      code: formData.code.trim() || `DSN-${Math.floor(1000 + Math.random() * 9000)}`,
      name_ar: formData.name_ar.trim(),
      category_id: formData.category_id,
      description_ar: formData.description,
      image_url: formData.image_url || formData.gallery_images[0] || null,
      gallery_images: formData.gallery_images,
      library_status: formData.library_status || 'public',
      visibility: 'public',
      retail_price: formData.retail_price,
      wholesale_price: formData.wholesale_price,
    };

    try {
      let saved: any;
      if (isNew) {
        saved = await createDesign(payload);
      } else {
        saved = await updateDesign(id!, payload);
      }
      await queryClient.invalidateQueries({ queryKey: ['designs'] });
      await queryClient.invalidateQueries({ queryKey: ['design-categories'] });
      toast.success('تم حفظ التصميم بنجاح — يظهر الآن في القائمة والكتالوج');
      const savedId = saved?.id || saved?.data?.id || id;
      navigate(savedId ? `/designs/${savedId}` : '/designs');
      if (isNew && savedId) {
        // stay on editor after create by replacing URL already done; also refresh list
        navigate('/designs');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'فشل حفظ التصميم على الخادم');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/designs')}
            className="p-2 bg-[var(--color-bg-main)] text-[var(--color-text-muted)] rounded-full border border-[var(--color-border)]"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">
              {isNew ? 'إنشاء تصميم جديد' : `تعديل: ${formData.name_ar}`}
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">المعلومات، الصور، والتسعير</p>
          </div>
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary-600)] text-white rounded-lg font-semibold disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl p-6 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Box className="text-[var(--color-primary-500)]" size={20} />
              معلومات التصميم
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1">كود التصميم</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] outline-none"
                    placeholder="LAN-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-muted)] mb-1">اسم التصميم *</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] outline-none"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-[var(--color-text-muted)]">التصنيف *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-xs text-[var(--color-primary-500)] font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> إضافة تصنيف
                  </button>
                </div>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">اختر التصنيف...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">حالة الظهور</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]"
                  value={formData.library_status}
                  onChange={(e) => setFormData({ ...formData, library_status: e.target.value })}
                >
                  <option value="public">عام (يظهر في الكتالوج)</option>
                  <option value="draft">مسودة</option>
                  <option value="private">خاص</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">الوصف</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] h-28 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <h2 className="text-xl font-bold mb-6">التسعير</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">سعر التجزئة</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]"
                  value={formData.retail_price}
                  onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">سعر الجملة</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]"
                  value={formData.wholesale_price}
                  onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">تكلفة تقديرية</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)]"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-6 border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImagesSelect}
              className="hidden"
            />
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <ImageIcon size={18} className="text-[var(--color-primary-500)]" />
              صور التصميم ({formData.gallery_images.length}/{MAX_IMAGES})
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              ارفع عدة صور (PNG/JPG/WEBP) — حتى 20MB لكل صورة، تُضغط تلقائيًا قبل الرفع
            </p>

            {formData.gallery_images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {formData.gallery_images.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--color-border)]">
                    <img src={mediaUrl(src)} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 right-1 text-[10px] bg-[var(--color-primary-600)] text-white px-1.5 py-0.5 rounded">
                        رئيسية
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 opacity-60">
                <ImageIcon size={40} className="mb-2" />
                <p className="text-sm text-center">لا توجد صور بعد</p>
              </div>
            )}

            <button
              type="button"
              disabled={formData.gallery_images.length >= MAX_IMAGES}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-[var(--color-primary-600)] text-white text-sm font-bold rounded-xl disabled:opacity-50"
            >
              إضافة صور
            </button>
          </div>

          {!isNew && (
            <div className="rounded-2xl p-6 border border-[var(--color-border)] bg-[var(--color-bg-card)] space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings size={18} className="text-[var(--color-primary-500)]" />
                إعدادات متقدمة
              </h2>
              <button type="button" onClick={() => navigate(`/designs/${id}/versions`)} className="w-full py-2.5 border rounded-xl text-sm">
                الإصدارات والملفات
              </button>
              <button type="button" onClick={() => navigate(`/designs/${id}/customization`)} className="w-full py-2.5 border rounded-xl text-sm">
                خيارات التخصيص
              </button>
              <button type="button" onClick={() => navigate(`/designs/${id}/bom`)} className="w-full py-2.5 border rounded-xl text-sm">
                محرر BOM
              </button>
            </div>
          )}
        </div>
      </form>

      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">إضافة تصنيف</h3>
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-main)] border border-[var(--color-border)] mb-4"
              placeholder="اسم التصنيف"
              autoFocus
            />
            <div className="flex gap-3">
              <button type="button" onClick={handleAddCategory} className="flex-1 py-2.5 bg-[var(--color-primary-600)] text-white rounded-xl font-bold">
                إضافة
              </button>
              <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-5 py-2.5 rounded-xl">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
