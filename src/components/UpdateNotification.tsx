import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Bell, X } from 'lucide-react';
import { getContentSignature } from '../services/apiClient';

declare global {
  interface Window {
    __triggerUpdateNotification?: () => void;
    __triggerContentNotification?: () => void;
  }
}

const UpdateNotification = () => {
  const [show, setShow] = useState(false);
  const [updateReason, setUpdateReason] = useState<'app' | 'content' | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Detect service-worker updates and expose manual dev triggers for testing the notification UI.
  useEffect(() => {
    // Dev-only hooks let QA trigger update banners without publishing a real service worker.
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.PROD) || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');
    if (isDev) {
      window.__triggerUpdateNotification = () => {
        setUpdateReason('app');
        setShow(true);
      };
      window.__triggerContentNotification = () => {
        setUpdateReason('content');
        setShow(true);
      };
    }

    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      const checkWaiting = (registration: ServiceWorkerRegistration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateReason('app');
          setShow(true);
        }
      };

      checkWaiting(reg);

      const onUpdateFound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setUpdateReason('app');
              setShow(true);
            }
          }
        });
      };

      reg.addEventListener('updatefound', onUpdateFound);

      const updateInterval = setInterval(() => {
        reg.update().catch((err) => console.warn('Error updating SW:', err));
      }, 60000);

      const onFocus = () => {
        reg.update().catch((err) => console.warn('Error updating SW on focus:', err));
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

  // Poll a lightweight backend signature so users can reload when published content changes.
  useEffect(() => {
    let active = true;
    let signature = "";

    const checkContentUpdates = async (initialSignature?: string) => {
      try {
        const response = await getContentSignature();
        const currentSignature = response.signature;

        if (initialSignature && active) {
          if (currentSignature !== initialSignature) {
            setUpdateReason('content');
            setShow(true);
            return currentSignature;
          }
        }
        return currentSignature;
      } catch (err) {
        console.error('Error checking content updates:', err);
      }
    };

    // Capture the baseline signature once, then compare future checks against it.
    const initSignature = async () => {
      const sig = await checkContentUpdates();
      if (sig && active) {
        signature = sig;
      }
    };
    initSignature();

    // Poll periodically while the tab stays open.
    const interval = setInterval(async () => {
      if (signature) {
        const nextSig = await checkContentUpdates(signature);
        if (nextSig && active) {
          signature = nextSig;
        }
      }
    }, 60000);

    // Re-check immediately when users return to the tab.
    const handleFocus = async () => {
      if (signature) {
        const nextSig = await checkContentUpdates(signature);
        if (nextSig && active) {
          signature = nextSig;
        }
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleRefresh = () => {
    if (updateReason === 'app' && waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
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
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">
                {updateReason === 'content' ? 'New Content Available!' : 'Website Update Available!'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {updateReason === 'content'
                  ? 'Articles, categories, or tags have just been updated. Please reload the page to see the latest updates.'
                  : 'The website has been updated to a newer version. Please reload the page to apply the updates.'}
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={() => setShow(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={handleRefresh}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              Reload
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateNotification;
