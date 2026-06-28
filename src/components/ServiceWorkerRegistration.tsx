'use client';

import { useEffect } from 'react';

const SHOULD_REGISTER_SERVICE_WORKER = process.env.NODE_ENV === 'production';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!SHOULD_REGISTER_SERVICE_WORKER || !('serviceWorker' in navigator)) return;

    let cancelled = false;
    let removeUpdateFoundListener: (() => void) | undefined;

    const promoteWaitingWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        if (cancelled) return;

        promoteWaitingWorker(registration);
        await registration.update();
        promoteWaitingWorker(registration);

        const handleUpdateFound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              installingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        };

        registration.addEventListener('updatefound', handleUpdateFound);
        removeUpdateFoundListener = () => {
          registration.removeEventListener('updatefound', handleUpdateFound);
        };
      } catch (error) {
        console.warn('Service worker registration failed.', error);
      }
    };

    const startRegistration = () => {
      void registerServiceWorker();
    };

    if (document.readyState === 'complete') {
      startRegistration();
    } else {
      window.addEventListener('load', startRegistration, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', startRegistration);
      removeUpdateFoundListener?.();
    };
  }, []);

  return null;
}
