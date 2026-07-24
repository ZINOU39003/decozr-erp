import React from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ContactPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl lg:text-5xl font-black mb-6">تواصل معنا</h1>
        <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
          نحن هنا للإجابة على جميع استفساراتك. فريقنا متواجد دائماً لتقديم الدعم والمساعدة التي تحتاجها بأسرع وقت ممكن.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div className="glass-panel p-8 rounded-3xl border border-[var(--color-border)]">
          <h2 className="text-2xl font-black mb-8">أرسل لنا رسالة</h2>
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-text-secondary)]">الاسم الكامل</label>
                <input 
                  type="text" 
                  className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors w-full"
                  placeholder="محمد أحمد"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[var(--color-text-secondary)]">رقم الجوال</label>
                <input 
                  type="tel" 
                  className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors w-full text-left"
                  placeholder="05X XXX XXXX"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-text-secondary)]">البريد الإلكتروني</label>
              <input 
                type="email" 
                className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors w-full text-left"
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-text-secondary)]">الموضوع</label>
              <select className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors w-full appearance-none">
                <option>استفسار عام</option>
                <option>طلب عرض سعر</option>
                <option>دعم فني</option>
                <option>شكاوى واقتراحات</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--color-text-secondary)]">الرسالة</label>
              <textarea 
                rows={5}
                className="bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors w-full resize-none"
                placeholder="اكتب رسالتك هنا..."
              ></textarea>
            </div>

            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white mt-2 h-14 rounded-xl text-lg shadow-xl shadow-blue-500/20">
              <Send className="w-5 h-5 ml-2" />
              إرسال الرسالة
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-3xl border border-[var(--color-border)] flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">اتصل بنا</h3>
                <p className="text-[var(--color-text-secondary)] mb-2 text-sm">نحن متاحون للرد على اتصالاتك</p>
                <p className="font-black text-lg" dir="ltr">+966 50 123 4567</p>
              </div>
            </div>
            
            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-3xl border border-[var(--color-border)] flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">راسلنا</h3>
                <p className="text-[var(--color-text-secondary)] mb-2 text-sm">أرسل لنا بريداً إلكترونياً</p>
                <p className="font-black text-lg">info@decozr.com</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-3xl border border-[var(--color-border)] flex flex-col gap-4 sm:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">المركز الرئيسي</h3>
                <p className="text-[var(--color-text-secondary)] mb-2 text-sm">تفضل بزيارة معرضنا الرئيسي</p>
                <p className="font-black text-lg">المملكة العربية السعودية، الرياض، طريق الملك فهد، برج الفيصلية</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-elevated)] p-6 rounded-3xl border border-[var(--color-border)] flex flex-col gap-4 sm:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">ساعات العمل</h3>
                <p className="text-[var(--color-text-secondary)] mb-2 text-sm">أوقات استقبال العملاء</p>
                <p className="font-bold text-lg text-amber-500">الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-80 bg-[var(--color-bg-elevated)] rounded-3xl border border-[var(--color-border)] overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] flex-col gap-4">
              <MapPin className="w-10 h-10" />
              <span>خريطة الموقع</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
