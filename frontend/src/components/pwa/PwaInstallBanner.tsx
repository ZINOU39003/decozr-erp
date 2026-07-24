import React, { useState } from 'react';
import { Download, X, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  getDeferredInstallPrompt,
  triggerNativeInstall,
  usePwaInstall,
} from '../../pwa/usePwaInstall';

/** Kept for App.tsx compatibility — capture now starts in main.tsx */
export const PwaInstallCapture = () => null;

/**
 * Fixed bottom CTA — triggers Chrome's native «تثبيت وإضافة اختصار» when possible.
 */
export const HomeInstallAppButton = () => {
  const { standalone, canNativeInstall } = usePwaInstall();
  const [hintOpen, setHintOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (standalone) return null;

  const onClick = async () => {
    // Always read live module state (not stale React snapshot)
    if (getDeferredInstallPrompt()) {
      setBusy(true);
      try {
        const res = await triggerNativeInstall();
        if (res.ok) {
          toast.success('تمت إضافة الاختصار إلى الشاشة الرئيسية');
          setHintOpen(false);
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    setHintOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-[90] pointer-events-none">
        <div className="mx-auto max-w-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto space-y-2">
          {hintOpen && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl p-4 text-sm relative">
              <button
                type="button"
                className="absolute top-2 left-2 p-1.5 rounded-lg text-[var(--color-text-muted)]"
                onClick={() => setHintOpen(false)}
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-black text-[var(--color-text-main)] mb-2 pr-2">تثبيت وإضافة اختصار</p>
              <ol className="space-y-2 text-[var(--color-text-muted)] leading-relaxed list-decimal list-inside">
                <li className="flex items-start gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--color-bg-main)] border border-[var(--color-border)] shrink-0">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </span>
                  <span>افتح قائمة المتصفح (⋮) أعلى اليمين</span>
                </li>
                <li>
                  اختر <strong className="text-[var(--color-text-main)]">تثبيت وإضافة اختصار</strong>
                </li>
                <li>أكّد الإضافة لتظهر DecoZR على الشاشة الرئيسية</li>
              </ol>
              {canNativeInstall && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-[var(--color-primary-600)] text-white font-bold py-2.5"
                  onClick={onClick}
                >
                  فتح نافذة التثبيت الآن
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onClick}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] disabled:opacity-70 text-white font-black text-base py-3.5 shadow-[0_-4px_24px_rgba(15,118,110,0.35)] border border-[var(--color-primary-500)] transition-colors"
          >
            <Download className="w-5 h-5" />
            {busy ? 'جاري التثبيت…' : 'تثبيت وإضافة اختصار'}
          </button>
        </div>
      </div>
    </>
  );
};
