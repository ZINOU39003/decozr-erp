import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, Shield, Clock, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 max-w-7xl mx-auto w-full pt-10 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="flex flex-col gap-6"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm w-fit">
              <Star className="w-4 h-4" />
              الخيار الأول للشركات في المملكة
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              نصنع <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">الإبداع</span> بلمسة احترافية
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              اكتشف أحدث تصاميم الأثاث والديكور الداخلي التي تجمع بين الجمال، الجودة، والدقة. نحن نلبي احتياجات الأفراد والشركات بمقاييس عالمية.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4 mt-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg h-14 px-8 shadow-xl shadow-blue-500/25 rounded-2xl"
                onClick={() => navigate('/catalog')}
              >
                تصفح الكتالوج
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg h-14 px-8 rounded-2xl border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
                onClick={() => navigate('/projects')}
              >
                شاهد أعمالنا
              </Button>
            </motion.div>
            
            <motion.div variants={fadeIn} className="flex items-center gap-8 mt-8 pt-8 border-t border-[var(--color-border)]">
              <div>
                <div className="text-3xl font-black">500+</div>
                <div className="text-[var(--color-text-muted)] text-sm mt-1">مشروع منجز</div>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]"></div>
              <div>
                <div className="text-3xl font-black text-blue-500">100%</div>
                <div className="text-[var(--color-text-muted)] text-sm mt-1">رضا العملاء</div>
              </div>
              <div className="w-px h-12 bg-[var(--color-border)]"></div>
              <div>
                <div className="text-3xl font-black">15+</div>
                <div className="text-[var(--color-text-muted)] text-sm mt-1">سنة خبرة</div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Hero Image / 3D Element Placeholder */}
          <motion.div 
            className="relative lg:h-[600px] rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl glass-panel group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-700"></div>
            <img 
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
              alt="DecoZR Modern Interior" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            {/* Floating Badge */}
            <div className="absolute bottom-8 right-8 z-20 glass-dark px-6 py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Star className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="text-white font-bold">جودة عالمية</div>
                  <div className="text-white/60 text-sm">تصاميم حائزة على جوائز</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black mb-4">تسوق حسب الفئة</h2>
            <p className="text-[var(--color-text-secondary)]">اكتشف مجموعتنا الواسعة من الأثاث والديكور</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex" onClick={() => navigate('/catalog')}>
            عرض الكل <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { name: 'أثاث مكتبي', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600' },
            { name: 'غرف نوم', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=600' },
            { name: 'مطابخ', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600' },
            { name: 'ديكورات حائط', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600' },
          ].map((cat, idx) => (
            <motion.div 
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-[var(--color-border)]"
              whileHover={{ y: -5 }}
              onClick={() => navigate('/catalog')}
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-xl">{cat.name}</h3>
                <span className="text-white/70 text-sm mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  تصفح الآن <ChevronLeft className="w-4 h-4 mr-1" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[var(--color-bg-elevated)] py-20 border-y border-[var(--color-border)]">
        <div className="px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-4">لماذا تختار DecoZR؟</h2>
            <p className="text-[var(--color-text-secondary)]">نحن نقدم تجربة متكاملة تبدأ من التصميم المبتكر وحتى الإنتاج والتسليم.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8 text-blue-500" />, title: 'جودة مضمونة', desc: 'نستخدم أفضل المواد الخام مع ضمان شامل على جميع منتجاتنا.' },
              { icon: <Clock className="w-8 h-8 text-purple-500" />, title: 'سرعة التنفيذ', desc: 'نلتزم بالمواعيد المحددة مع تتبع دقيق لكل مراحل الإنتاج.' },
              { icon: <TrendingUp className="w-8 h-8 text-emerald-500" />, title: 'أسعار تنافسية', desc: 'نقدم أفضل قيمة مقابل السعر مع خيارات مرنة تناسب ميزانيتك.' },
            ].map((feature, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-3xl border border-[var(--color-border)] hover:border-blue-500/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-main)] flex items-center justify-center shadow-lg border border-[var(--color-border)] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden border border-[var(--color-border)] glass-dark flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          
          <div className="flex-1 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">هل لديك مشروع قادم؟</h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl">
              فريقنا مستعد لتحويل أفكارك إلى واقع. اطلب عرض سعر الآن واحصل على استشارة مجانية لتصميمك.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={() => navigate('/request-quote')}
              >
                طلب عرض سعر
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                onClick={() => navigate('/contact')}
              >
                تواصل معنا
              </Button>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1600607688969-a5bfcd64bdde?auto=format&fit=crop&q=80&w=800" 
              alt="Project Planning" 
              className="rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
