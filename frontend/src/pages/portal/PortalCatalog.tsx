import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Layers,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  LayoutGrid,
  List,
  Filter,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPortalCatalog,
  getPortalFavorites,
  mediaUrl,
  togglePortalFavorite,
} from '../../services/api';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const PortalCatalog = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc' | 'name'>('new');

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'catalog'],
    queryFn: getPortalCatalog,
  });
  const favQ = useQuery({
    queryKey: ['portal', 'favorites'],
    queryFn: getPortalFavorites,
  });
  const favIds = useMemo(() => {
    const list = Array.isArray(favQ.data) ? favQ.data : [];
    return new Set(list.map((f: any) => f.design_id || f.design?.id).filter(Boolean));
  }, [favQ.data]);

  const favMut = useMutation({
    mutationFn: (designId: string) => togglePortalFavorite(designId),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['portal', 'favorites'] });
      toast.success(res?.favorited ? 'أُضيف للمفضلة' : 'أُزيل من المفضلة');
    },
    onError: () => toast.error('تعذر تحديث المفضلة'),
  });

  const categories = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const d of list) {
      const id = d.category?.id || 'other';
      const name = d.category?.name_ar || 'أخرى';
      const prev = map.get(id);
      map.set(id, { id, name, count: (prev?.count || 0) + 1 });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [data]);

  const designs = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];
    if (category !== 'all') {
      list = list.filter((d: any) => (d.category?.id || 'other') === category);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (d: any) =>
          d.name_ar?.toLowerCase().includes(term) ||
          d.code?.toLowerCase().includes(term) ||
          d.category?.name_ar?.toLowerCase().includes(term) ||
          d.description_ar?.toLowerCase().includes(term)
      );
    }
    const priceOf = (d: any) =>
      Number(
        d.versions?.[0]?.priceRules?.[0]?.base_price || d.retail_price || d.base_price || 0
      );
    list.sort((a: any, b: any) => {
      if (sort === 'price_asc') return priceOf(a) - priceOf(b);
      if (sort === 'price_desc') return priceOf(b) - priceOf(a);
      if (sort === 'name') return String(a.name_ar || '').localeCompare(String(b.name_ar || ''), 'ar');
      return 0;
    });
    return list;
  }, [data, q, category, sort]);

  const handleAdd = (design: any) => {
    const version = design.versions?.[0];
    const price =
      version?.priceRules?.[0]?.base_price ||
      design.retail_price ||
      design.base_price ||
      0;
    addItem({
      designId: design.id,
      designVersionId: version?.id || design.current_version_id,
      code: design.code,
      name_ar: design.name_ar,
      image_url: design.image_url,
      unit_price: Number(price) || 0,
      quantity: 1,
    });
    toast.success(`تمت إضافة «${design.name_ar}» إلى السلة`, {
      action: { label: 'السلة', onClick: () => navigate('/cart') },
    });
  };

  return (
    <div className="space-y-5 overflow-x-hidden" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-[#E6ECF2] bg-white p-5 md:p-7 shadow-sm">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-[#0F766E]/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#0F766E] text-sm font-bold mb-2">
              <Sparkles className="w-4 h-4" /> كتالوج التصاميم
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#15202b]">
              اختر تصميمك التالي
            </h1>
            <p className="text-[#64748B] mt-2 text-sm">
              ابحث، صفِّ حسب التصنيف، واحفظ المفضلة أو اطلب تصميماً خاصاً.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/portal/custom-request')}
              className="gap-2 border-[#0F766E]/30 text-[#0F766E]"
            >
              <Sparkles className="w-4 h-4" /> طلب خاص
            </Button>
            <Button variant="outline" onClick={() => navigate('/portal/favorites')} className="gap-2">
              <Star className="w-4 h-4" /> المفضلة
            </Button>
            <Button variant="outline" onClick={() => navigate('/cart')} className="gap-2">
              <ShoppingCart className="w-4 h-4" /> السلة
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو الرمز أو التصنيف..."
            className="pr-10 bg-white border-[#E6ECF2]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-11 rounded-xl border border-[#E6ECF2] bg-white px-3 text-sm font-bold text-[#334155]"
          >
            <option value="new">الأحدث</option>
            <option value="price_asc">السعر ↑</option>
            <option value="price_desc">السعر ↓</option>
            <option value="name">الاسم</option>
          </select>
          <button
            type="button"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="h-11 w-11 rounded-xl border border-[#E6ECF2] bg-white flex items-center justify-center text-[#0F766E]"
            title="تبديل العرض"
          >
            {view === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border ${
            category === 'all'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-white text-[#475569] border-[#E6ECF2]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> الكل
          <span className="opacity-70">({Array.isArray(data) ? data.length : 0})</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold border ${
              category === c.id
                ? 'bg-[#0F766E] text-white border-[#0F766E]'
                : 'bg-white text-[#475569] border-[#E6ECF2]'
            }`}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-[#E6ECF2] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && designs.length === 0 && (
        <div className="text-center py-16 text-[#64748B] border border-dashed border-[#E6ECF2] rounded-2xl bg-white">
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
          لا توجد تصاميم مطابقة
          <div className="mt-4">
            <Button
              className="bg-[#0F766E] text-white"
              onClick={() => navigate('/portal/custom-request')}
            >
              اطلب تصميماً خاصاً
            </Button>
          </div>
        </div>
      )}

      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'space-y-3'
        }
      >
        {designs.map((design: any, idx: number) => {
          const img =
            mediaUrl(design.image_url) ||
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600';
          const price =
            design.versions?.[0]?.priceRules?.[0]?.base_price ||
            design.retail_price ||
            0;
          const isFav = favIds.has(design.id);
          if (view === 'list') {
            return (
              <motion.article
                key={design.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 rounded-2xl border border-[#E6ECF2] bg-white p-3 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[#F1F5F9]"
                  onClick={() => navigate(`/catalog/${design.id}`)}
                >
                  <img src={img} alt={design.name_ar} className="w-full h-full object-cover" />
                </button>
                <div className="min-w-0 flex-1 flex flex-col">
                  <p className="text-[10px] font-mono text-[#94A3B8]">{design.code}</p>
                  <h3 className="font-bold truncate text-[#15202b]">{design.name_ar}</h3>
                  <p className="text-xs text-[#64748B]">{design.category?.name_ar || 'عام'}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <p className="font-black text-[#0F766E] flex items-center gap-1 text-sm">
                      <Banknote className="w-3.5 h-3.5" />
                      {Number(price).toLocaleString()} د.ج
                    </p>
                    <Button
                      size="sm"
                      className="bg-[#0F766E] text-white"
                      onClick={() => handleAdd(design)}
                    >
                      أضف
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          }
          return (
            <motion.article
              key={design.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.3) }}
              className="group rounded-2xl overflow-hidden border border-[#E6ECF2] bg-white hover:border-[#0F766E]/40 transition-colors shadow-sm"
            >
              <div className="relative">
                <button
                  type="button"
                  className="block w-full text-right"
                  onClick={() => navigate(`/catalog/${design.id}`)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#F1F5F9]">
                    <img
                      src={img}
                      alt={design.name_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                  onClick={() => favMut.mutate(design.id)}
                  className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    isFav ? 'bg-[#0F766E] text-white' : 'bg-white/95 text-[#0F766E]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-white/95 text-[#0F766E]">
                  {design.category?.name_ar || 'عام'}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-mono text-[#94A3B8]">{design.code}</p>
                <h3 className="font-bold text-lg leading-snug text-[#15202b]">{design.name_ar}</h3>
                <p className="text-[#0F766E] font-black pt-1 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  {Number(price).toLocaleString()} د.ج
                </p>
              </div>
              <div className="px-4 pb-4">
                <Button
                  className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white gap-2"
                  onClick={() => handleAdd(design)}
                >
                  <ShoppingCart className="w-4 h-4" /> أضف للسلة
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};
