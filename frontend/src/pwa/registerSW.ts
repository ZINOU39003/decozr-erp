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
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('PWA service worker registration failed', err);
      });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
}
