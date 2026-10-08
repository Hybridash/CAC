import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlayer } from '../store/player';
import { AtpIcon, NucleotideIcon } from './Atp';
import { sfx } from '../lib/sound';

/** Floating "+20 ATP" celebrations for every reward the server grants. */
export function RewardToasts() {
  const toasts = usePlayer((s) => s.toasts);
  const dismiss = usePlayer((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    sfx.coin();
    const t = setTimeout(() => dismiss(toasts[0].id), 4200);
    return () => clearTimeout(t);
  }, [toasts, dismiss]);

  return (
    <div
      className="pointer-events-none fixed top-20 right-3 z-[60] flex w-72 flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.slice(0, 3).map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pointer-events-auto card p-3"
            onClick={() => dismiss(t.id)}
          >
            {t.lines.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-ink-soft">{l.reason}</span>
                <span className="flex items-center gap-1 font-extrabold text-atp-dark">
                  +{l.amount}
                  {l.currency === 'atp' ? <AtpIcon size={16} /> : <NucleotideIcon size={16} />}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
