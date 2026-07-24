import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Users, Trophy, ThumbsUp } from 'lucide-react';

export const About = () => {
  const stats = [
    { label: 'سنوات من الخبرة', value: '+10' },
    { label: 'مشروع منجز', value: '+500' },
    { label: 'عميل سعيد', value: '+300' },
    { label: 'خبير ومهندس', value: '50' },
  ];

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-[var(--color-primary-500)]" />,
      title: 'الجودة أولاً',
      description: 'نلتزم بأعلى معايير الجودة في كل تفصيلة، من اختيار المواد الخام إلى اللمسات النهائية.'
    },
    {
      icon: <Users className="w-8 h-8 text-[var(--color-primary-500)]" />,
      title: 'التركيز على العميل',
      description: 'نضع احتياجات ورغبات عملائنا في صميم عملنا لنضمن تجاوز توقعاتهم.'
    },
    {
      icon: <Trophy className="w-8 h-8 text-[var(--color-primary-500)]" />,
      title: 'التميز والابتكار',
      description: 'نسعى دائمًا لتقديم حلول مبتكرة وتصاميم عصرية تواكب أحدث الصيحات العالمية.'
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-[var(--color-primary-500)]" />,
      title: 'الموثوقية',
      description: 'نبني علاقات طويلة الأمد مبنية على الثقة والمصداقية والالتزام بالمواعيد.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden bg-[var(--color-bg-main)] border-b border-[var(--color-border)] min-h-[60vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2500" 
            alt="Interior Design" 
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
            <h1 className="text-4xl lg:text-6xl font-black mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--color-primary-200)]">من نحن</h1>
            <p className="text-lg lg:text-xl text-[var(--color-text-muted)] leading-relaxed relative z-10">
              DecoZR هي شركة رائدة في مجال التصميم الداخلي وتصنيع الأثاث والديكور. 
              نحن نؤمن بأن المساحات التي نعيش ونعمل فيها تؤثر بشكل عميق على حياتنا، 
              لذلك نسعى جاهدين لتحويل رؤيتك إلى واقع ملموس يفوق التوقعات وبمعايير عالمية للفخامة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--color-bg-card)] p-12 rounded-3xl border border-[var(--color-border)] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-[var(--color-primary-500)]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">رؤيتنا</h2>
            <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
              أن نكون الخيار الأول والأكثر موثوقية للعملاء الباحثين عن التميز والابتكار في عالم الأثاث والديكور على المستوى المحلي والإقليمي.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[var(--color-bg-card)] p-12 rounded-3xl border border-[var(--color-border)] shadow-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[var(--color-primary-500)]" />
            </div>
            <h2 className="text-3xl font-bold mb-4">رسالتنا</h2>
            <p className="text-[var(--color-text-muted)] text-lg leading-relaxed">
              تقديم حلول متكاملة وفريدة تلبي تطلعات عملائنا من خلال دمج الإبداع في التصميم مع الدقة في التنفيذ واستخدام أفضل المواد.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[var(--color-primary-600)] text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-[var(--color-primary-100)] font-medium text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">قيمنا الجوهرية</h2>
          <p className="text-[var(--color-text-muted)] text-lg">المبادئ التي تقودنا في كل خطوة نخطوها ومع كل مشروع ننفذه.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--color-bg-card)] p-8 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary-500)]/50 transition-colors"
            >
              <div className="mb-6">{value.icon}</div>
              <h3 className="text-xl font-bold mb-3">{value.title}</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
