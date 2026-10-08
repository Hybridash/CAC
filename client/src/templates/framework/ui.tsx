import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** The instruction banner at the top of every interaction. */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-900">
      <span aria-hidden>👉 </span>
      {children}
    </p>
  );
}

export type FeedbackTone = 'info' | 'good' | 'hint';

/** Short feedback line: celebratory on success, gentle on mistakes. */
export function Feedback({ text, tone = 'info' }: { text: string | null; tone?: FeedbackTone }) {
  const styles = {
    info: 'bg-white text-ink ring-black/10',
    good: 'bg-emerald-50 text-emerald-900 ring-emerald-200',
    hint: 'bg-amber-50 text-amber-900 ring-amber-200',
  }[tone];
  const icon = { info: '💬', good: '🎉', hint: '💡' }[tone];
  return (
    <div aria-live="polite" className="min-h-12">
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl px-4 py-2.5 font-semibold ring-1 ${styles}`}
          >
            <span aria-hidden>{icon} </span>
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small progress pill like "3 / 5 matched". */
export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-ink-soft">
      <div
        className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
      {Math.min(value, max)} / {max} {label}
    </div>
  );
}
