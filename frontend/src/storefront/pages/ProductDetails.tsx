import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Layers,
  Ruler,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDesignById, mediaUrl } from '../../services/api';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [activeImage, setActiveImage] = useState(0);

  const { data: design, isLoading } = useQuery({
    queryKey: ['design', id],
    queryFn: () => getDesignById(id!),
    enabled: !!id,
  });

  const images = useMemo(() => {
    if (!design) return [];
    const gallery = Array.isArray(design.gallery_images) ? design.gallery_images : [];
    const list = [design.image_url, ...gallery]
      .filter(Boolean)
      .map((p) => mediaUrl(String(p)))
      .filter(Boolean) as string[];
    return [...new Set(list)];
  }, [design]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[var(--color-bg-main)]">
        <Loader2 className="w-12 h-12 text-[var(--color-primary-500)] animate-spin" />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-bg-main)]">
        <h2 className="text-3xl font-bold mb-4">المنتج غير موجود</h2>
        <Button onClick={() => navigate('/catalog')}>العودة للكتالوج</Button>
      </div>
    );
  }

  const displayImage =
    images[activeImage] ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000';
  const activeVersion =
    design.versions?.find((v: any) => v.id === design.current_version_id) ||
    design.versions?.[0];
  const displayPrice =
    activeVersion?.priceRules?.[0]?.base_price ||
    design.retail_price ||
    design.base_price ||
    0;

  const handleAddToCart = () => {
    addItem({
      designId: design.id,
      designVersionId: activeVersion?.id,
      code: design.code,
      name_ar: design.name_ar,
      image_url: design.image_url || images[0] || null,
      unit_price: Number(displayPrice) || 0,
      quantity: 1,
      options: {},
    });
    toast.success(`تمت إضافة "${design.name_ar}" إلى السلة`, {
      description: 'يمكنك متابعة التسوق أو إتمام طلب التنفيذ',
      action: {
        label: 'عرض السلة',
        onClick: () => navigate('/cart'),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] pb-24">
      <div className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <button onClick={() => navigate('/')} className="hover:text-[var(--color-primary-400)]">
              الرئيسية
            </button>
            <ChevronLeft className="w-4 h-4" />
            <button onClick={() => navigate('/catalog')} className="hover:text-[var(--color-primary-400)]">
              الكتالوج
            </button>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[var(--color-text-main)] font-medium">{design.name_ar}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="w-full aspect-[4/3] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-xl">
              <img
                src={displayImage}
                alt={design.name_ar}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                      activeImage === idx
                        ? 'border-[var(--color-primary-500)]'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8 border-b border-[var(--color-border)] pb-8">
              <div className="text-[var(--color-primary-400)] font-bold mb-2">
                {design.category?.name_ar || 'تصميم ورشة'}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
                {design.name_ar}
              </h1>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                {design.description_ar ||
                  'تصميم قابل للتخصيص حسب المقاس والمادة واللون من ورشة DecoZR.'}
              </p>
            </div>

            <div className="mb-8">
              <div className="text-sm text-[var(--color-text-muted)] mb-2">السعر التقديري</div>
              <div className="text-4xl font-bold text-[var(--color-primary-400)]">
                {Number(displayPrice) > 0
                  ? `${Number(displayPrice).toLocaleString()} د.ج`
                  : 'حسب المواصفات'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] rounded-lg">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)]">الأبعاد</div>
                  <div className="font-bold text-sm">قابلة للتخصيص</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-muted)]">المواد</div>
                  <div className="font-bold text-sm">خيارات متعددة</div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 py-6 text-lg rounded-2xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white font-bold"
                onClick={handleAddToCart}
              >
                أضف إلى السلة <ShoppingCart className="w-5 h-5 mr-2" />
              </Button>
              <Button
                variant="outline"
                className="py-6 px-8 text-lg rounded-2xl border-[var(--color-border)]"
                onClick={() => window.print()}
              >
                <FileText className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-8 p-4 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
              <p>
                الأسعار تقديرية للتصميم الأساسي. السعر النهائي يعتمد على المواد والأبعاد والتخصيص.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
