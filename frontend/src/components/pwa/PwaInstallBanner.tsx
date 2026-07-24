import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, ShieldCheck, X, MoreVertical, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getPublicStorefront } from '../../services/api';
import {
  getDeferredInstallPrompt,
  triggerNativeInstall,
  usePwaInstall,
} from '../../pwa/usePwaInstall';

/** Kept for App.tsx compatibility — capture starts in main.tsx */
export const PwaInstallCapture = () => null;

/**
 * Fixed bottom CTA.
 * Real Android WebAPK (no Chrome badge) requires HTTPS.
 * On HTTP we send the user to the secure public URL first.
 */
export const HomeInstallAppButton = () => {
  const { standalone } = usePwaInstall();
  const [hintOpen, setHintOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: sf } = useQuery({
    queryKey: ['public', 'storefront', 'install'],
    queryFn: async () => {
      const res = await getPublicStorefront();
      return ((res as any).data || res) as Record<string, any>;
    },
    staleTime: 60_000,
  });

  const isSecure = typeof window !== 'undefined' && window.isSecureContext;
  const httpsUrl = String(sf?.public_https_url || '').replace(/\/$/, '');
  const needsHttpsRedirect = !isSecure && !!httpsUrl;

  const buttonLabel = useMemo(() => {
    if (needsHttpsRedirect) return 'تثبيت كتطبيق (APK)';
    return 'تثبيت كتطبيق';
  }, [needsHttpsRedirect]);

  if (standalone) return null;

  const runNativeInstall = async () => {
    if (!getDeferredInstallPrompt()) {
      setHintOpen(true);
      return;
    }
    setBusy(true);
    try {
      const res = await triggerNativeInstall();
      if (res.ok) {
        toast.success('تم تثبيت DecoZR كتطبيق على جهازك');
        setHintOpen(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const onClick = async () => {
    // HTTP → open HTTPS origin (Cloudflare) so Chrome can mint a real WebAPK
    if (needsHttpsRedirect) {
      const target = `${httpsUrl}/?source=pwa-install`;
      window.location.href = target;
      return;
    }
    await runNativeInstall();
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] pointer-events-none">
      <div className="mx-auto max-w-lg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-auto space-y-2">
        {!isSecure && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2 text-[11px] leading-relaxed font-bold">
            الرابط الحالي HTTP — كروم يثبّته كاختصار بشعار المتصفح.
            {httpsUrl
              ? ' اضغط الزر للانتقال للنسخة الآمنة وتثبيت تطبيق حقيقي بدون شارة كروم.'
              : ' يلزم رابط HTTPS لتثبيت تطبيق WebAPK حقيقي.'}
          </div>
        )}

        {hintOpen && isSecure && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl p-4 text-sm relative">
            <button
              type="button"
              className="absolute top-2 left-2 p-1.5 rounded-lg text-[var(--color-text-muted)]"
              onClick={() => setHintOpen(false)}
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="font-black text-[var(--color-text-main)] mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary-600)]" />
              تثبيت كتطبيق مستقل
            </p>
            <ol className="space-y-2 text-[var(--color-text-muted)] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--color-bg-main)] border border-[var(--color-border)] shrink-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </span>
                <span>افتح قائمة المتصفح (⋮)</span>
              </li>
              <li>
                اختر <strong className="text-[var(--color-text-main)]">تثبيت التطبيق</strong> أو{' '}
                <strong className="text-[var(--color-text-main)]">تثبيت وإضافة اختصار</strong>
              </li>
              <li>بعد التثبيت من رابط HTTPS لن تظهر شارة كروم على الأيقونة</li>
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] disabled:opacity-70 text-white font-black text-base py-3.5 shadow-[0_-4px_24px_rgba(15,118,110,0.35)] border border-[var(--color-primary-500)] transition-colors"
        >
          {needsHttpsRedirect ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          {busy ? 'جاري التثبيت…' : buttonLabel}
        </button>
      </div>
    </div>
  );
};
