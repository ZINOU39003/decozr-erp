import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, LayoutGrid, LayoutList, Loader2, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDesigns, getDesignCategories, mediaUrl } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const Catalog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['design-categories'],
    queryFn: getDesignCategories
  });

  const { data: rawDesigns = [], isLoading: loadingDesigns, isError, error, refetch } = useQuery({
    queryKey: ['designs', 'catalog'],
    queryFn: () => getDesigns({ catalog: true }),
  });

  const designs = Array.isArray(rawDesigns)
    ? rawDesigns
    : Array.isArray((rawDesigns as any)?.data)
      ? (rawDesigns as any).data
      : [];
  const loading = loadingCats || loadingDesigns;

  const filteredDesigns = designs.filter((design: any) => {
    const matchesCategory = activeCategory === 'all' || design.category_id === activeCategory;
    if (!matchesCategory) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const hay = `${design.name_ar || ''} ${design.code || ''} ${design.sku || ''}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Page Header */}
      <div className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black mb-4">الكتالوج</h1>
            <p className="text-[var(--color-text-muted)] text-lg max-w-2xl">
              تصفح مجموعتنا الواسعة من التصاميم الجاهزة القابلة للتخصيص لتناسب احتياجات مشروعك بدقة.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-[var(--color-primary-500)]" />
                البحث
              </h3>
              <input 
                type="text" 
                placeholder="ابحث عن تصميم..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
            </div>

            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[var(--color-primary-500)]" />
                الفئات
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`text-right px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    activeCategory === 'all' 
                      ? 'bg-[var(--color-primary-600)] text-white' 
                      : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-right px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                      activeCategory === cat.id 
                        ? 'bg-[var(--color-primary-600)] text-white' 
                        : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {cat.name_ar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-[var(--color-text-muted)] font-medium">
                عرض <span className="text-[var(--color-text-main)] font-bold">{filteredDesigns.length}</span> تصميم
              </p>
              <div className="flex gap-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-bg-hover)] text-[var(--color-primary-400)]' : 'text-[var(--color-text-muted)]'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-bg-hover)] text-[var(--color-primary-400)]' : 'text-[var(--color-text-muted)]'}`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-10 h-10 text-[var(--color-primary-500)] animate-spin" />
              </div>
            ) : isError ? (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-16 text-center">
                <Grid className="w-16 h-16 text-[var(--color-danger)] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">تعذر تحميل التصاميم</h3>
                <p className="text-[var(--color-text-muted)] mb-4">
                  {(error as any)?.message || 'تحقق من تشغيل الخادم ثم أعد المحاولة'}
                </p>
                <Button onClick={() => refetch()} className="bg-[#0F766E] text-white">
                  إعادة المحاولة
                </Button>
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-16 text-center">
                <Grid className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
                <p className="text-[var(--color-text-muted)]">لم نتمكن من العثور على تصاميم تطابق بحثك.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-6'}>
                {filteredDesigns.map((design: any, index: number) => {
                  const gallery = Array.isArray(design.gallery_images) ? design.gallery_images : [];
                  const displayImage =
                    mediaUrl(design.image_url) ||
                    mediaUrl(gallery[0]) ||
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800';
                  const displayPrice =
                    design.versions?.[0]?.priceRules?.[0]?.base_price ||
                    design.retail_price ||
                    design.base_price ||
                    design.price;

                  return (
                    <motion.div
                      key={design.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-primary-500)]/50 transition-all group cursor-pointer flex ${viewMode === 'list' ? 'flex-row h-48' : 'flex-col'}`}
                      onClick={() => navigate(`/catalog/${design.id}`)}
                    >
                      <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full aspect-[4/3]'} bg-[var(--color-bg-main)] relative overflow-hidden flex items-center justify-center`}>
                        <img 
                          src={displayImage} 
                          alt={design.name_ar} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white font-bold flex items-center gap-2">عرض التفاصيل <ArrowLeft className="w-4 h-4" /></span>
                        </div>
                      </div>
                      <div className={`p-6 flex flex-col justify-between flex-1`}>
                        <div>
                          <div className="text-xs text-[var(--color-primary-400)] font-bold mb-2">
                            {design.category?.name_ar || 'تصميم أثاث و ديكور'}
                          </div>
                          <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--color-primary-400)] transition-colors">
                            {design.name_ar}
                          </h3>
                          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                            {design.description_ar || 'تصميم فاخر وعالي الجودة من DecoZR.'}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                          <span className="text-sm font-mono text-[var(--color-text-muted)]">{design.code || design.sku || 'DES-001'}</span>
                          <span className="font-bold text-[var(--color-primary-400)] text-lg">
                            {displayPrice ? `${Number(displayPrice).toLocaleString()} د.ج` : '15,000 د.ج'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
