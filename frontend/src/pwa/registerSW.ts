export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Avoid caching Vite HMR assets during local development
  if (!import.meta.env.PROD) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Ready SW helps Chrome enable «تثبيت وإضافة اختصار»
        navigator.serviceWorker.ready.catch(() => {});
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('PWA service worker registration failed', err);
      });
  };

  // Register ASAP (don't wait for full window load)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    register();
  } else {
    document.addEventListener('DOMContentLoaded', register, { once: true });
  }
}
