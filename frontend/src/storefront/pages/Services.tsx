import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Hammer, Wrench, HeadphonesIcon, Truck, Settings } from 'lucide-react';

export const Services = () => {
  const services = [
    {
      icon: <PenTool className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'التصميم الداخلي والهندسي',
      description: 'نقدم خدمات التصميم الداخلي الشاملة، من التخطيط المبدئي إلى الرسومات التنفيذية المعمارية وتصاميم 3D الواقعية لضمان رؤية واضحة قبل البدء.',
    },
    {
      icon: <Hammer className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'تصنيع الأثاث المخصص',
      description: 'نصنع أثاثاً مصمماً خصيصاً ليناسب مساحتك وذوقك، باستخدام أحدث الآلات وأجود أنواع الخشب والمعادن لضمان الدقة والمتانة.',
    },
    {
      icon: <Wrench className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'تركيب الديكور والأعمال الخشبية',
      description: 'فريقنا المتخصص يقوم بتركيب كافة الأعمال الخشبية والديكورات بدقة عالية لضمان مطابقة التنفيذ للتصميم المعتمد.',
    },
    {
      icon: <Settings className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'تجهيز المحلات التجارية والمكاتب',
      description: 'نقدم حلولاً متكاملة للشركات والمحلات التجارية، تشمل تصميم وتصنيع واجهات العرض ومكاتب العمل لبيئة عمل مثالية.',
    },
    {
      icon: <Truck className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'التوصيل والخدمات اللوجستية',
      description: 'خدمة توصيل آمنة وموثوقة لجميع منتجاتنا إلى موقع مشروعك لضمان وصولها في حالة ممتازة وفي الوقت المحدد.',
    },
    {
      icon: <HeadphonesIcon className="w-10 h-10 text-[var(--color-primary-500)]" />,
      title: 'الاستشارات والمتابعة',
      description: 'نوفر استشارات هندسية وفنية مستمرة، بالإضافة إلى خدمة ما بعد البيع لضمان رضاكم التام عن مشاريعنا.',
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden bg-[var(--color-bg-main)] border-b border-[var(--color-border)] min-h-[60vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=2500" 
            alt="Luxury Services" 
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
            <h1 className="text-4xl lg:text-6xl font-black mb-6 relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-[var(--color-primary-200)]">خدماتنا</h1>
            <p className="text-lg lg:text-xl text-[var(--color-text-muted)] leading-relaxed relative z-10">
              نقدم مجموعة متكاملة من الخدمات المتميزة لتلبية كافة احتياجاتك في مجال الأثاث والديكور. 
              من التصميم الأولي وحتى التنفيذ والتركيب، نحن معك في كل خطوة لضمان أعلى معايير الجودة والفخامة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-10 rounded-3xl hover:shadow-2xl hover:-translate-y-2 transition-all group"
            >
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary-500)]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 bg-[var(--color-primary-600)] text-white text-center">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="text-3xl lg:text-5xl font-black mb-6">هل لديك مشروع خاص وتحتاج إلى استشارة؟</h2>
          <p className="text-xl text-[var(--color-primary-100)] mb-10 leading-relaxed">
            فريق خبرائنا جاهز للاستماع إلى أفكارك وتحويلها إلى واقع ملموس بتصاميم حصرية وجودة لا مثيل لها.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-white text-black font-bold text-lg px-10 py-5 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
          >
            احجز استشارتك المجانية
          </a>
        </div>
      </section>
    </div>
  );
};
