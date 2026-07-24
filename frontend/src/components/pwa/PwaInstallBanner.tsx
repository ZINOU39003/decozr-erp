import React, { useEffect, useState } from 'react';
import { Download, X, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'decozr-pwa-install-dismissed-v4';
const DELAY_MS = 45_000;

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
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const alone = isStandaloneDisplay();
    setStandalone(alone);
    if (alone) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    let delayTimer: number | undefined;
    let deferredEvent: BeforeInstallPromptEvent | null = null;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredEvent = e as BeforeInstallPromptEvent;
      setDeferred(deferredEvent);
      // Soft delay — don't interrupt first visit
      delayTimer = window.setTimeout(() => {
        if (localStorage.getItem(DISMISS_KEY) !== '1') setVisible(true);
      }, DELAY_MS);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      setDeferred(null);
      localStorage.setItem(DISMISS_KEY, '1');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (delayTimer) window.clearTimeout(delayTimer);
    };
  }, []);

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

  // Compact corner chip — expands on click
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setCompact(false)}
        className="fixed bottom-4 left-4 z-[100] md:left-auto md:right-6 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-lg px-3 py-2 text-xs font-bold text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] transition-colors"
        aria-label="تثبيت التطبيق"
      >
        <Smartphone className="w-4 h-4 text-[var(--color-primary-600)]" />
        تثبيت التطبيق
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-6 md:max-w-sm animate-fade-in">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-xl p-4 flex gap-3 items-start">
        <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-600)] text-white flex items-center justify-center font-black shrink-0">
          D
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--color-text-main)]">تثبيت كتطبيق</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
            وصول أسرع من الشاشة الرئيسية
          </p>
          <div className="flex gap-2 mt-3">
            {deferred && (
              <Button size="sm" className="gap-1.5" onClick={install}>
                <Download className="w-3.5 h-3.5" /> تثبيت
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
