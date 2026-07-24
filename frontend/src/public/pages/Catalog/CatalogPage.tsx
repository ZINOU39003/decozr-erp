import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ChevronDown, SlidersHorizontal, Star, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useProducts, useCategories } from '../../hooks/usePublicQueries';
import { ProductFilters } from '../../schemas/public.types';
import { Link } from 'react-router-dom';

export const CatalogPage = () => {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 12, sort: 'newest' });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts(filters);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">الكتالوج</h1>
        <Button variant="outline" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
          <Filter className="w-4 h-4 mr-2" />
          تصفية
        </Button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`w-full md:w-64 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
        <div className="sticky top-28 flex flex-col gap-8">
          
          <div className="hidden md:block">
            <h1 className="text-3xl font-black mb-2">المنتجات</h1>
            <p className="text-[var(--color-text-secondary)] text-sm">اكتشف أحدث تصاميمنا</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              type="text"
              placeholder="ابحث عن منتج..."
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-blue-500 transition-colors"
              onChange={(e) => {
                // simple debounce
                const val = e.target.value;
                setTimeout(() => handleFilterChange('search', val), 500);
              }}
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              الفئات
            </h3>
            {isLoadingCategories ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-5 bg-[var(--color-bg-elevated)] rounded-md animate-pulse"></div>)}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    className="accent-blue-600 w-4 h-4"
                    checked={!filters.category}
                    onChange={() => handleFilterChange('category', undefined)}
                  />
                  <span className={`text-sm ${!filters.category ? 'text-blue-500 font-bold' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-main)]'}`}>
                    الكل
                  </span>
                </label>
                {categories?.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      className="accent-blue-600 w-4 h-4"
                      checked={filters.category === cat.id}
                      onChange={() => handleFilterChange('category', cat.id)}
                    />
                    <span className={`text-sm ${filters.category === cat.id ? 'text-blue-500 font-bold' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-main)]'}`}>
                      {cat.name} <span className="text-[10px] text-[var(--color-text-muted)]">({cat.productCount})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div>
            <h3 className="font-bold mb-4">الترتيب حسب</h3>
            <select 
              className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl py-2.5 px-4 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">الأحدث</option>
              <option value="popular">الأكثر شعبية</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>

        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-elevated)] animate-pulse">
                <div className="h-60 bg-white/5"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-2/3"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : productsData?.data.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-[var(--color-border)]">
            <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
            <p className="text-[var(--color-text-secondary)]">جرب تغيير إعدادات البحث أو التصفية.</p>
            <Button className="mt-6" variant="outline" onClick={() => setFilters({ page: 1, limit: 12, sort: 'newest' })}>
              إعادة ضبط الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {productsData?.data.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/catalog/${product.id}`}
                  className="group rounded-3xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-elevated)] hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.isNew && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        جديد
                      </div>
                    )}
                    {product.originalPrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        تخفيض
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-[var(--color-text-muted)] mb-2 font-bold uppercase tracking-wider">
                      {product.categoryName}
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-4">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold">{product.rating}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">({product.reviewsCount})</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                      <div className="flex flex-col">
                        {product.originalPrice && (
                          <span className="text-xs text-[var(--color-text-muted)] line-through">
                            {product.originalPrice.toLocaleString()} ر.س
                          </span>
                        )}
                        <span className="font-black text-lg text-blue-500">
                          {product.price.toLocaleString()} ر.س
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-main)] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors border border-[var(--color-border)] group-hover:border-transparent">
                        <ChevronLeft className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination */}
            {productsData && productsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-[var(--color-border)]">
                <Button 
                  variant="outline" 
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                >
                  السابق
                </Button>
                
                <div className="flex items-center gap-1 text-sm font-bold px-4">
                  <span>{filters.page}</span>
                  <span className="text-[var(--color-text-muted)]">من</span>
                  <span>{productsData.meta.totalPages}</span>
                </div>

                <Button 
                  variant="outline" 
                  disabled={filters.page === productsData.meta.totalPages}
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};
