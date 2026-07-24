import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Phone, ExternalLink, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getPortalWhatsapp } from '../../services/api';
import { Button } from '../../components/ui/Button';

const QUICK = [
  'مرحباً، أريد استفساراً عن طلبي',
  'أحتاج موعد زيارة / قياس',
  'أريد عرض سعر لتصميم خاص',
  'استفسار عن دفعة / فاتورة',
];

export const PortalWhatsapp = () => {
  const [draft, setDraft] = useState('');
  const waQ = useQuery({ queryKey: ['portal', 'whatsapp'], queryFn: getPortalWhatsapp });

  const openWhatsApp = (text?: string) => {
    const phone = String(waQ.data?.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('رقم واتساب الورشة غير متوفر');
      return;
    }
    const msg = encodeURIComponent(
      (text || draft).trim() ||
        `مرحباً، أنا ${waQ.data?.customer_name || 'عميل'} وأتواصل من بوابة DecoZR`,
    );
    // wa.me يفتح تطبيق واتساب الحقيقي على الهاتف تلقائياً
    window.location.href = `https://wa.me/${phone}?text=${msg}`;
    toast.success('جاري فتح واتساب...');
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 overflow-x-hidden" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] p-6 text-white shadow-lg">
        <Sparkles className="absolute left-4 top-4 w-8 h-8 opacity-30" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black">واتساب الورشة</h1>
            <p className="text-sm text-white/85 mt-0.5">يُفتح تطبيق واتساب الحقيقي مباشرة</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/15 backdrop-blur p-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white text-[#075E54] flex items-center justify-center font-black">
            DZ
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold truncate">{waQ.data?.workshop_name || 'ورشة DecoZR'}</p>
            <p className="text-xs text-white/80 flex items-center gap-1" dir="ltr">
              <Phone className="w-3 h-3" /> +{waQ.data?.phone || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E6ECF2] bg-white p-5 space-y-4 shadow-sm">
        <p className="text-sm text-[#64748B] leading-relaxed">
          اكتب رسالتك هنا ثم اضغط الإرسال — ستُفتح مباشرة في{' '}
          <strong className="text-[#075E54]">تطبيق واتساب</strong> على هاتفك نحو رقم الورشة.
        </p>

        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setDraft(q)}
              className="text-xs font-bold px-3 py-2 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
            >
              {q}
            </button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="اكتب رسالتك للورشة..."
          className="w-full rounded-2xl border border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
        />

        <div className="grid sm:grid-cols-2 gap-2">
          <Button
            className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2 h-12 font-bold"
            onClick={() => openWhatsApp()}
            disabled={waQ.isLoading}
          >
            <Send className="w-4 h-4" /> إرسال عبر واتساب
          </Button>
          <Button
            variant="outline"
            className="border-[#25D366]/40 text-[#075E54] gap-2 h-12"
            onClick={() => openWhatsApp(draft || undefined)}
          >
            <ExternalLink className="w-4 h-4" /> فتح محادثة الورشة
          </Button>
        </div>
      </div>
    </div>
  );
};
