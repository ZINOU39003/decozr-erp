import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { bindPwaInstallCapture, usePwaInstall } from '../../pwa/usePwaInstall';

/** Invisible: captures install event as early as possible */
export const PwaInstallCapture = () => {
  useEffect(() => bindPwaInstallCapture(), []);
  return null;
};

/**
 * Fixed bottom CTA on the public home page — always visible (unless already installed).
 */
export const HomeInstallAppButton = () => {
  const { standalone, canNativeInstall, install } = usePwaInstall();

  if (standalone) return null;

  const onClick = async () => {
    if (canNativeInstall) {
      const res = await install();
      if (res.ok) {
        toast.success('تم تثبيت التطبيق');
        return;
      }
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      toast.message('تنزيل التطبيق على آيفون', {
        description: 'اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية»',
        duration: 8000,
      });
      return;
    }

    toast.message('تنزيل التطبيق', {
      description:
        'من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». إن لم يظهر الخيار، افتح الموقع عبر HTTPS.',
      duration: 8000,
    });
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] pointer-events-none">
      <div className="mx-auto max-w-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto">
        <button
          type="button"
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white font-black text-base py-3.5 shadow-[0_-4px_24px_rgba(15,118,110,0.35)] border border-[var(--color-primary-500)] transition-colors"
        >
          <Download className="w-5 h-5" />
          تنزيل التطبيق
        </button>
      </div>
    </div>
  );
};
