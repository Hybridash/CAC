import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../../components/Icon';

/** The mission banner at the top of every interaction. */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <div className="sheen flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-white shadow-[0_4px_0_#3730a3]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30">
        <Icon name="target" size={26} />
      </span>
      <div className="min-w-0">
        <span className="block text-[11px] font-extrabold tracking-[0.18em] text-white/75 uppercase">
          Your mission
        </span>
        <p className="leading-snug font-bold">{children}</p>
      </div>
    </div>
  );
}

export type FeedbackTone = 'info' | 'good' | 'hint';

/** Short feedback bubble: celebratory on success, gentle on mistakes. */
export function Feedback({ text, tone = 'info' }: { text: string | null; tone?: FeedbackTone }) {
  const styles = {
    info: { box: 'bg-white text-ink ring-indigo-200', badge: 'bg-indigo-100' },
    good: { box: 'bg-emerald-50 text-emerald-950 ring-emerald-300', badge: 'bg-emerald-200' },
    hint: { box: 'bg-amber-50 text-amber-950 ring-amber-300', badge: 'bg-amber-200' },
  }[tone];
  const icon = ({ info: 'chat', good: 'party', hint: 'bulb' } as const)[tone];
  return (
    <div aria-live="polite" className="min-h-14">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 font-semibold shadow-sm ring-2 ${styles.box}`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${styles.badge}`}
            >
              <Icon name={icon} size={22} />
            </span>
            <p className="self-center">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Chunky "XP bar" progress, segmented when there are only a few steps. */
export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const shown = Math.min(value, max);
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  const full = shown >= max;
  return (
    <div className="flex items-center gap-3 text-sm font-extrabold text-ink-soft">
      <div
        className="relative h-4 min-w-28 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner sm:max-w-64"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <motion.div
          className={`sheen h-full rounded-full ${full ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-400 to-fuchsia-500'}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {max > 1 && max <= 12 && (
          <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
            {Array.from({ length: max - 1 }, (_, i) => (
              <span key={i} className="flex-1 border-r-2 border-white/80" />
            ))}
            <span className="flex-1" />
          </div>
        )}
      </div>
      <span className={`whitespace-nowrap ${full ? 'text-emerald-700' : ''}`}>
        {full && <Icon name="check" size={18} className="mr-0.5 -mt-0.5" />}
        {shown} / {max} {label}
      </span>
    </div>
  );
}

/** A goal checklist pill. */
export function GoalChip({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <span
      className={`chip py-1 transition ${done ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' : 'bg-white text-ink-soft ring-1 ring-black/10'}`}
    >
      <Icon name={done ? 'check' : 'todo'} size={18} /> {children}
    </span>
  );
}

/** A bold panel heading with an icon, used for trays, readouts and side panels. */
export function PanelTitle({ icon, children }: { icon?: IconName; children: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold tracking-[0.14em] text-ink-soft uppercase">
      {icon && <Icon name={icon} size={18} />}
      {children}
    </h3>
  );
}

const BURST_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#22d3ee', '#a3e635'];

/**
 * A ring of particles that pops out from the middle of its (relatively positioned) parent.
 * Change `trigger` to fire it again.
 */
export function Burst({ trigger, emoji }: { trigger: number | string | null; emoji?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState<typeof trigger>(null);
  useEffect(() => {
    if (trigger === null || trigger === 0) return;
    setShown(trigger);
    const t = setTimeout(() => setShown(null), 900);
    return () => clearTimeout(t);
  }, [trigger]);
  if (reduce) return null;
  return (
    <AnimatePresence>
      {shown !== null && (
        <div key={String(shown)} className="pointer-events-none absolute inset-0 z-20" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const r = 60 + (i % 3) * 18;
            return (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2"
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                animate={{ x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
              >
                {emoji && i % 2 === 0 ? (
                  <span className="-ml-2 -mt-2 block text-lg">{emoji}</span>
                ) : (
                  <span
                    className="-ml-1 -mt-1 block h-2.5 w-2.5 rounded-full"
                    style={{ background: BURST_COLORS[i % BURST_COLORS.length] }}
                  />
                )}
              </motion.span>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

/** Falling confetti over the whole of its (relatively positioned) parent. */
export function Confetti({ run }: { run: boolean }) {
  const reduce = useReducedMotion();
  if (reduce || !run) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: 70 }, (_, i) => {
        const left = (i * 37) % 100;
        const w = 6 + (i % 4) * 2;
        return (
          <motion.span
            key={i}
            className="absolute top-0 block rounded-sm"
            style={{
              left: `${left}%`,
              width: w,
              height: w * (i % 2 ? 1.8 : 1),
              background: BURST_COLORS[i % BURST_COLORS.length],
            }}
            initial={{ y: -30, rotate: 0, opacity: 1 }}
            animate={{
              y: ['-5%', '110vh'],
              x: [0, (i % 2 ? 1 : -1) * (20 + (i % 5) * 12)],
              rotate: 360 + i * 25,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 2.4 + (i % 6) * 0.25, delay: (i % 10) * 0.07, ease: 'easeIn' }}
          />
        );
      })}
    </div>
  );
}

/** Pick a slider's --fill value. */
export const rangeFill = (v: number, min: number, max: number) =>
  ({ '--fill': `${((v - min) / (max - min || 1)) * 100}%` }) as React.CSSProperties;
