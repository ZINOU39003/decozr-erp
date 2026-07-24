import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let captureBound = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

/** Bind ASAP (call from main.tsx) so we never miss beforeinstallprompt. */
export function bindPwaInstallCapture() {
  if (typeof window === 'undefined' || captureBound) {
    return () => {};
  }
  captureBound = true;

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
    captureBound = false;
  };
}

export async function triggerNativeInstall() {
  const ev = deferredPrompt;
  if (!ev) return { ok: false as const, reason: 'unavailable' as const };
  await ev.prompt();
  const choice = await ev.userChoice;
  deferredPrompt = null;
  notify();
  return {
    ok: choice.outcome === 'accepted',
    reason: choice.outcome as 'accepted' | 'dismissed',
  };
}

export function usePwaInstall() {
  const [, tick] = useState(0);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    const rerender = () => tick((n) => n + 1);
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const canNativeInstall = !!deferredPrompt && !standalone;

  const install = useCallback(() => triggerNativeInstall(), []);

  return { standalone, canNativeInstall, install, hasPrompt: !!deferredPrompt };
}
