import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Bell, X } from 'lucide-react';

const UpdateNotification = () => {
  const [show, setShow] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // For testing/mocking in development environment
    if (!import.meta.env.PROD) {
      (window as any).__triggerUpdateNotification = () => {
        setShow(true);
      };
    }

    if (!('serviceWorker' in navigator)) return;

    // Listen to when a new controller starts taking over (after skipWaiting is done)
    const handleControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Get the registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      const checkWaiting = (registration: ServiceWorkerRegistration) => {
        // If there's already a waiting worker, show the update prompt
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShow(true);
        }
      };

      // Initial check
      checkWaiting(reg);

      // Listen for updates
      const onUpdateFound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            // New worker is ready and waiting to take over
            if (navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShow(true);
            }
          }
        });
      };

      reg.addEventListener('updatefound', onUpdateFound);

      // Check for updates periodically (every 1 minute for faster detection)
      const updateInterval = setInterval(() => {
        reg.update().catch((err) => console.log('Error updating SW:', err));
      }, 60000);

      // Check for updates when user refocuses the tab
      const onFocus = () => {
        reg.update().catch((err) => console.log('Error updating SW on focus:', err));
      };
      window.addEventListener('focus', onFocus);

      return () => {
        clearInterval(updateInterval);
        window.removeEventListener('focus', onFocus);
        reg.removeEventListener('updatefound', onUpdateFound);
      };
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleRefresh = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 p-4 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur border border-gray-200 dark:border-gray-800 shadow-2xl dark:shadow-black/70 flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">
                Update Website Tersedia!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Administrator baru saja melakukan pembaruan pada website. Silakan muat ulang halaman untuk mendapatkan versi terbaru.
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={() => setShow(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleRefresh}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              Muat Ulang
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
