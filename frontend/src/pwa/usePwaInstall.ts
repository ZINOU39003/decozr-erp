import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true
  );
}

/** Call once near app root so we never miss beforeinstallprompt. */
export function bindPwaInstallCapture() {
  if (typeof window === 'undefined') return () => {};

  const onBeforeInstall = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  };

  const onInstalled = () => {
    deferredPrompt = null;
    notify();
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstall);
  window.addEventListener('appinstalled', onInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    window.removeEventListener('appinstalled', onInstalled);
  };
}

export function usePwaInstall() {
  const [, tick] = useState(0);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    const unsub = () => listeners.delete(rerender);
    const rerender = () => tick((n) => n + 1);
    listeners.add(rerender);
    return unsub;
  }, []);

  const canNativeInstall = !!deferredPrompt && !standalone;

  const install = useCallback(async () => {
    if (!deferredPrompt) return { ok: false as const, reason: 'unavailable' as const };
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return { ok: choice.outcome === 'accepted', reason: choice.outcome };
  }, []);

  return { standalone, canNativeInstall, install };
}
