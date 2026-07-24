import React, { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { mockDesigns } from '../../data/mockDatabase';
import { Search, SlidersHorizontal, Heart, Eye, PenTool } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useUIStore } from '../../store/uiStore';

export const PortalDesigns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { modal } = useUIStore();

  const categories = Array.from(new Set(mockDesigns.map(d => d.category)));

  const filteredDesigns = mockDesigns.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? d.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)]">معرض التصاميم</h1>
          <p className="text-sm text-[var(--color-text-muted)]">تصفح أحدث التصاميم المتاحة واطلب تخصيصها.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن تصميم..."
            className="w-full h-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl pr-12 pl-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all shadow-sm"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 border-[var(--color-border)] text-[var(--color-text-main)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)] rounded-2xl" onClick={() => toast.info('خيارات التصفية قريباً')}>
          <SlidersHorizontal className="w-5 h-5 ml-2" />
          خيارات التصفية
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
            selectedCategory === null 
              ? 'bg-[var(--color-text-main)] text-[var(--color-bg-main)] shadow-md' 
              : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)]'
          }`}
        >
          الكل
        </button>
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === cat 
                ? 'bg-[var(--color-text-main)] text-[var(--color-bg-main)] shadow-md' 
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {filteredDesigns.map((design) => (
            <motion.div
              key={design.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="aspect-[4/3] bg-[var(--color-bg-main)] relative overflow-hidden flex items-center justify-center">
                {design.thumbnail ? (
                  <img src={design.thumbnail} alt={design.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <PenTool className="w-12 h-12 text-[var(--color-text-muted)] opacity-20" />
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className="bg-black/50 backdrop-blur-md text-white border-0">{design.category}</Badge>
                </div>
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-all" onClick={() => toast.info('عرض التصميم: ' + design.name)}>
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[var(--color-danger)]/80 hover:bg-[var(--color-danger)] text-white flex items-center justify-center backdrop-blur-md transition-all" onClick={() => toast.success('تمت إضافة التصميم إلى المفضلة')}>
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[var(--color-text-main)] mb-1 truncate">{design.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">{design.id}</span>
                  <Button 
                    size="sm" 
                    onClick={() => modal.openModal('CREATE_ORDER')}
                    className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white h-8"
                  >
                    طلب التصميم
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredDesigns.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-[var(--color-bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
            <Search className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">لم يتم العثور على تصاميم</h3>
          <p className="text-[var(--color-text-muted)]">جرب البحث بكلمات مختلفة أو تغيير التصنيف.</p>
        </div>
      )}
    </div>
  );
};
