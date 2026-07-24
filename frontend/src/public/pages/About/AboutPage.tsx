import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Users, Lightbulb, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="flex flex-col gap-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[var(--color-bg-main)]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm mb-6 border border-blue-500/20">
            عن الشركة
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight tracking-tight">
            نحن نصنع <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">الإلهام</span> في مساحتك
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-3xl mx-auto">
            تأسست DecoZR برؤية واضحة: إحداث ثورة في صناعة الأثاث والديكور في المملكة العربية السعودية من خلال دمج التصميم الإبداعي مع أحدث تقنيات التصنيع.
          </p>
        </div>
      </section>

      {/* Story & Vision */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
              alt="Our Team" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="text-3xl font-black text-white mb-2">15+ سنة</div>
                <div className="text-white/80">من التميز والابتكار في خدمة أكثر من 500 عميل من كبرى الشركات والمؤسسات.</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black mb-6">قصتنا</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4">
                بدأت رحلتنا كورشة صغيرة بطموح كبير، واليوم أصبحنا من الشركات الرائدة في قطاع تأثيث المشاريع التجارية والسكنية الفاخرة. نؤمن بأن المساحة التي تعيش أو تعمل فيها تؤثر بشكل مباشر على إبداعك وإنتاجيتك.
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                لذلك، حرصنا على توفير حلول متكاملة تبدأ من الفكرة والتصميم مروراً بالتصنيع الدقيق وانتهاءً بالتركيب والخدمة ما بعد البيع.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">رؤيتنا</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">أن نكون الخيار الأول والوجهة الموثوقة لكل من يبحث عن التميز والابتكار في عالم الديكور والأثاث.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">رسالتنا</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">تقديم تصاميم عصرية بجودة لا تضاهى، تلبي تطلعات عملائنا وتتجاوز توقعاتهم.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Numbers */}
      <section className="bg-[var(--color-bg-elevated)] py-20 border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-x-reverse divide-[var(--color-border)]">
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center border border-[var(--color-border)] mb-6 shadow-lg shadow-blue-500/5 text-blue-500">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black mb-2 text-[var(--color-text-main)]">15+</div>
              <div className="text-[var(--color-text-secondary)] font-bold">جوائز التميز</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center border border-[var(--color-border)] mb-6 shadow-lg shadow-emerald-500/5 text-emerald-500">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black mb-2 text-[var(--color-text-main)]">120+</div>
              <div className="text-[var(--color-text-secondary)] font-bold">موظف وخبير</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center border border-[var(--color-border)] mb-6 shadow-lg shadow-purple-500/5 text-purple-500">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black mb-2 text-[var(--color-text-main)]">500+</div>
              <div className="text-[var(--color-text-secondary)] font-bold">مشروع منجز</div>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-main)] flex items-center justify-center border border-[var(--color-border)] mb-6 shadow-lg shadow-amber-500/5 text-amber-500">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div className="text-4xl font-black mb-2 text-[var(--color-text-main)]">50K+</div>
              <div className="text-[var(--color-text-secondary)] font-bold">قطعة أثاث مصنعة</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 w-full text-center">
        <h2 className="text-3xl lg:text-4xl font-black mb-6">هل ترغب في الانضمام إلى قائمة عملائنا المتميزين؟</h2>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-2xl mx-auto">
          فريقنا جاهز لدراسة مشروعك وتقديم أفضل الحلول بأسعار تنافسية وجودة عالية.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/request-quote">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-xl text-lg shadow-xl shadow-blue-500/20">
              اطلب عرض سعر
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]">
              شاهد أعمالنا
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};
