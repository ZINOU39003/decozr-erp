import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, HelpCircle, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { getPublicStorefront } from '../../services/api';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const { data: sf } = useQuery({
    queryKey: ['public', 'storefront'],
    queryFn: async () => {
      const res = await getPublicStorefront();
      return ((res as any).data || res) as Record<string, string>;
    },
    staleTime: 60_000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const faqs = [
    {
      q: 'ما هي مواعيد العمل الرسمية؟',
      a: sf?.working_hours_ar || 'نعمل من السبت إلى الخميس حسب ساعات العمل المعتمدة.',
    },
    { q: 'هل تقدمون خدمات التصميم فقط دون التنفيذ؟', a: 'نعم، يمكننا تقديم خدمات التصميم بشكل مستقل.' },
    { q: 'كم يستغرق تنفيذ مشروع؟', a: 'تختلف المدة حسب حجم المشروع، وعادة بين أيام قليلة إلى أسابيع.' },
    { q: 'هل توفرون ضماناً على المنتجات؟', a: 'نعم، نوفر ضماناً على عيوب الصناعة حسب نوع المنتج.' },
  ];

  const address =
    [sf?.address_ar, sf?.city].filter(Boolean).join('، ') ||
    'المنطقة الصناعية، الجزائر العاصمة، الجزائر';
  const phone = sf?.phone || sf?.whatsapp || '+213 555 000 000';
  const email = sf?.email || 'contact@decozr.com';

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      <section className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">تواصل معنا</h1>
            <p className="text-lg lg:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
              نحن هنا للإجابة على استفساراتك وتحويل أفكارك إلى واقع.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[var(--color-bg-card)] p-8 rounded-3xl border border-[var(--color-border)]"
            >
              <h3 className="text-2xl font-bold mb-8">معلومات التواصل</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[var(--color-primary-500)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">العنوان</h4>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">{address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[var(--color-primary-500)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">رقم الهاتف</h4>
                    <p className="text-[var(--color-text-muted)]" dir="ltr">{phone}</p>
                    {sf?.whatsapp && sf.whatsapp !== phone ? (
                      <p className="text-xs text-[var(--color-text-muted)] mt-1" dir="ltr">
                        واتساب: {sf.whatsapp}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-500)]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[var(--color-primary-500)]" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">البريد الإلكتروني</h4>
                    <p className="text-[var(--color-text-muted)]">{email}</p>
                  </div>
                </div>
                {sf?.working_hours_ar ? (
                  <p className="text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4">
                    ساعات العمل: {sf.working_hours_ar}
                  </p>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--color-bg-card)] p-8 rounded-3xl border border-[var(--color-border)]"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary-500)]" /> الأسئلة الشائعة
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <h4 className="font-bold text-sm mb-2">{faq.q}</h4>
                    <p className="text-[var(--color-text-muted)] text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 bg-[var(--color-bg-card)] p-8 lg:p-12 rounded-3xl border border-[var(--color-border)]"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-[var(--color-primary-500)]" />
                أرسل رسالة
              </h2>
              <p className="text-[var(--color-text-muted)]">يسعدنا سماع رأيك. املأ النموذج وسنقوم بالرد عليك قريباً.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-muted)]">الاسم الكامل</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-muted)]">رقم الهاتف</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-muted)]">البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-muted)]">الموضوع</label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-text-muted)]">رسالتك</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary-500)] transition-colors resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto py-4 px-10 text-lg rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white font-bold"
              >
                إرسال الرسالة <Send className="w-5 h-5 mr-2" />
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
