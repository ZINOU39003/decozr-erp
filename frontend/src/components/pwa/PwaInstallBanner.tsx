import React, { useEffect, useState } from 'react';
import { Download, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'decozr-pwa-install-dismissed-v3';

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true
  );
}

export const PwaInstallBanner = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const insecure = typeof window !== 'undefined' && !window.isSecureContext;
  const isLanHttp =
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname);

  useEffect(() => {
    const alone = isStandaloneDisplay();
    setStandalone(alone);
    if (alone) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    navigator.serviceWorker?.ready.then(() => setSwReady(true)).catch(() => {});

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      setDeferred(null);
      localStorage.setItem(DISMISS_KEY, '1');
    });

    // Show guidance when install will become a Chrome shortcut
    if (insecure || isLanHttp) setVisible(true);

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) setVisible(true);

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [insecure, isLanHttp]);

  if (standalone || !visible) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setDeferred(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const blocked = insecure || isLanHttp;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm animate-fade-in">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl p-4 flex gap-3 items-start">
        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-600)] text-white flex items-center justify-center font-black shrink-0">
          D
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--color-text-main)]">تثبيت كتطبيق حقيقي</p>
          {blocked ? (
            <p className="text-xs text-[var(--color-danger)] mt-1 leading-relaxed flex gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              الرابط الحالي HTTP/شبكي محلي — كروم سيثبّته كاختصار بشعار Chrome. استخدم رابط النفق
              HTTPS (trycloudflare) ثم احذف الاختصارات القديمة وثبّت من جديد.
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
              {swReady ? (
                <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> جاهز للتثبيت كتطبيق مستقل
                </span>
              ) : (
                'جاري تجهيز التطبيق…'
              )}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {deferred && !blocked && (
              <Button size="sm" className="gap-1.5" onClick={install}>
                <Download className="w-3.5 h-3.5" /> تثبيت التطبيق
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              لاحقاً
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
