import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Shield, Zap, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { getPublicStorefront } from '../../services/api';

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2500';

export const Home = () => {
  const navigate = useNavigate();
  const { data: sf } = useQuery({
    queryKey: ['public', 'storefront'],
    queryFn: async () => {
      const res = await getPublicStorefront();
      return ((res as any).data || res) as Record<string, string>;
    },
    staleTime: 60_000,
  });

  const brand = sf?.brand_name || 'DecoZR';
  const heroTitle = sf?.hero_title_ar || 'صمم مساحتك المثالية';
  const heroSub =
    sf?.hero_subtitle_ar ||
    'تصاميم جاهزة، تنفيذ دقيق، ومتابعة واضحة من الطلب حتى التسليم — بأسلوب بسيط ومريح.';
  const tagline = sf?.tagline_ar || 'ورشة تصميم وتصنيع بلمسة عصرية';
  const heroImage = sf?.hero_image_url || DEFAULT_HERO;
  const about = sf?.about_ar;

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-[var(--color-primary-600)]" />,
      title: 'جودة لا تضاهى',
      description: 'نستخدم أفضل المواد الخام وأحدث التقنيات لضمان منتجات تدوم طويلاً.',
    },
    {
      icon: <Zap className="w-8 h-8 text-[var(--color-warning)]" />,
      title: 'سرعة التنفيذ',
      description: 'نلتزم بالمواعيد المحددة مع الحفاظ على أعلى معايير الجودة والدقة.',
    },
    {
      icon: <Package className="w-8 h-8 text-[var(--color-success)]" />,
      title: 'تنوع في التصاميم',
      description: 'آلاف التصاميم الجاهزة أو إمكانية تفصيل تصميمك الخاص بحرية كاملة.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden flex items-center justify-center min-h-[88vh]">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt={brand} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-main)]/75 via-[var(--color-bg-main)]/55 to-[var(--color-bg-main)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--color-bg-main)_95%)]" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[18%] left-[12%] w-40 h-40 rounded-full bg-[var(--color-primary-500)]/15 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[22%] right-[10%] w-52 h-52 rounded-full bg-[var(--color-info)]/10 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-card)]/90 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,40,50,0.1)] p-8 lg:p-14">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-500)]/10 text-[var(--color-primary-700)] font-bold text-sm mb-6 border border-[var(--color-primary-500)]/20">
                <Star className="w-4 h-4 fill-current" /> {tagline}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.15] text-[var(--color-text-main)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              {heroTitle}
              <span className="block mt-2 text-[var(--color-primary-600)]">مع {brand}</span>
            </motion.h1>

            <motion.p
              className="text-base lg:text-lg text-[var(--color-text-muted)] mb-10 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              {heroSub}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <Button
                className="w-full sm:w-auto px-8 py-6 text-base rounded-2xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-600)]/25"
                onClick={() => navigate('/catalog')}
              >
                تصفح الكتالوج <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-base rounded-2xl border-[var(--color-border)] bg-[var(--color-bg-card)]"
                onClick={() => navigate('/contact')}
              >
                طلب عرض سعر
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {about ? (
        <section className="py-16 container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">عن {brand}</h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">{about}</p>
          </div>
        </section>
      ) : null}

      <section className="py-20 bg-[var(--color-bg-card)] border-y border-[var(--color-border)]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">لماذا تختار {brand}؟</h2>
            <p className="text-[var(--color-text-muted)]">خبرة تصنيع واضحة، تواصل سلس، ونتيجة تليق بمساحتك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-7 rounded-3xl bg-[var(--color-bg-main)] border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/40 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-[var(--color-primary-500)]/10 via-transparent to-[var(--color-info)]/8" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">جاهز للبدء؟</h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
            ابدأ من الكتالوج أو تواصل معنا لعرض سعر مخصص لمشروعك.
          </p>
          <Button
            className="px-10 py-6 text-base rounded-2xl bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-500)] font-bold shadow-lg shadow-[var(--color-primary-600)]/20"
            onClick={() => navigate('/contact')}
          >
            تواصل معنا الآن
          </Button>
        </div>
      </section>
    </div>
  );
};
