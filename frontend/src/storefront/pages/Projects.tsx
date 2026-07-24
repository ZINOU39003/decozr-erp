import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Projects = () => {
  const [filter, setFilter] = useState('all');

  // Mock projects data
  const projects = [
    {
      id: 1,
      title: 'تأثيث فيلا سكنية فاخرة',
      category: 'residential',
      categoryName: 'سكني',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000',
    },
    {
      id: 2,
      title: 'تصميم مساحات عمل حديثة',
      category: 'commercial',
      categoryName: 'تجاري',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    },
    {
      id: 3,
      title: 'تصميم وتجهيز كافيه',
      category: 'commercial',
      categoryName: 'تجاري',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000',
    },
    {
      id: 4,
      title: 'تأثيث فندق خمس نجوم',
      category: 'hospitality',
      categoryName: 'ضيافة',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000',
    },
    {
      id: 5,
      title: 'تصميم مطبخ حديث متكامل',
      category: 'residential',
      categoryName: 'سكني',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000',
    },
    {
      id: 6,
      title: 'خزائن وغرف ملابس مخصصة',
      category: 'residential',
      categoryName: 'سكني',
      image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&q=80&w=1000',
    }
  ];

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden bg-[var(--color-bg-main)] border-b border-[var(--color-border)] min-h-[50vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2500" 
            alt="Luxury Projects" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-main)] via-[var(--color-bg-main)]/80 to-[var(--color-bg-main)]" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center glass-panel p-10 lg:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/10 to-transparent opacity-50"></div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--color-primary-200)]">معرض المشاريع</h1>
            <p className="text-lg lg:text-xl text-[var(--color-text-muted)] leading-relaxed relative z-10">
              اكتشف مجموعة من أبرز أعمالنا السابقة في التصميم الداخلي وتجهيز المساحات الفاخرة. 
              نحن نحرص على تقديم الجودة والفخامة في كل زاوية لتجربة استثنائية.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 container mx-auto px-4 lg:px-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'residential', label: 'مشاريع سكنية' },
            { id: 'commercial', label: 'مشاريع تجارية' },
            { id: 'hospitality', label: 'ضيافة وفنادق' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                filter === cat.id 
                  ? 'bg-[var(--color-primary-600)] text-white shadow-lg shadow-[var(--color-primary-500)]/20' 
                  : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/50 hover:text-[var(--color-text-main)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl overflow-hidden aspect-square bg-[var(--color-bg-card)] border border-[var(--color-border)] cursor-pointer"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-3 py-1 bg-[var(--color-primary-500)] text-white text-xs font-bold rounded-lg mb-3">
                      {project.categoryName}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-white">
                      استعراض التفاصيل <ArrowLeft className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
};
