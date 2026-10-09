import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  // Chrome/Edge/Android fire this when the app is installable; keep it for our own button.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** “Install app” button: native prompt where supported, Add-to-Home-Screen steps on iPhone/iPad. */
export function InstallApp({ className = '' }: { className?: string }) {
  const [, rerender] = useState(0);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  if (isStandalone()) return null;
  const ios = isIOS();
  if (!deferred && !ios) return null;

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      rerender((n) => n + 1);
    } else setShowIOSHelp(true);
  };

  return (
    <>
      <button className={`btn-ghost ${className}`} onClick={install}>
        📲 Install app
      </button>
      <AnimatePresence>
        {showIOSHelp && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-end bg-black/40 p-4 sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIOSHelp(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Install BioPlay"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="card w-full max-w-sm p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-extrabold">Install BioPlay</h2>
              <ol className="mt-3 flex flex-col gap-2 font-semibold">
                <li>
                  1. Tap the <b>Share</b> button <span aria-hidden>⬆️</span> in Safari’s toolbar.
                </li>
                <li>
                  2. Scroll down and tap <b>Add to Home Screen</b> <span aria-hidden>➕</span>.
                </li>
                <li>
                  3. Tap <b>Add</b>. BioPlay opens full-screen from its icon!
                </li>
              </ol>
              <button
                className="btn-primary mt-4 w-full"
                onClick={() => setShowIOSHelp(false)}
                autoFocus
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
