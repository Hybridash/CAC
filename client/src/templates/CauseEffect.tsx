import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CauseEffectConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Prompt } from './framework/ui';
import { sfx } from '../lib/sound';

/** Trigger a cascade; break a link to see what goes wrong. */
export function CauseEffect({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<CauseEffectConfig>) {
  const [broken, setBroken] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [ranNormal, setRanNormal] = useState(false);
  const [ranBroken, setRanBroken] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completed = useRef(alreadyDone);
  const stopAt = broken ? config.nodes.findIndex((n) => n.id === broken) : -1;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (ranNormal && ranBroken && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [ranNormal, ranBroken, onComplete]);

  const run = () => {
    timers.current.forEach(clearTimeout);
    setRunning(true);
    setOutcome(null);
    setLit(-1);
    sfx.whoosh();
    const last = stopAt >= 0 ? stopAt : config.nodes.length - 1;
    for (let i = 0; i <= last; i++) {
      timers.current.push(
        setTimeout(
          () => {
            setLit(i);
            sfx.pop();
            onStage?.(Math.min(2, Math.floor((i / config.nodes.length) * 3)));
          },
          300 + i * 850,
        ),
      );
    }
    timers.current.push(
      setTimeout(
        () => {
          setRunning(false);
          if (stopAt >= 0) {
            sfx.nope();
            setOutcome(config.nodes[stopAt].brokenText ?? 'The chain stops here.');
            setRanBroken(true);
          } else {
            sfx.correct();
            setOutcome(config.normalOutcome);
            setRanNormal(true);
            onStage?.(3);
          }
        },
        300 + (last + 1) * 850,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={run} disabled={running}>
          <span aria-hidden>{config.trigger.emoji}</span> {config.trigger.label}
        </button>
        {broken && (
          <button className="btn-ghost text-sm" onClick={() => setBroken(null)} disabled={running}>
            🔧 Repair all links
          </button>
        )}
      </div>
      <ol className="flex flex-col gap-2">
        {config.nodes.map((n, i) => {
          const isLit = i <= lit;
          const isBroken = n.id === broken;
          const after = stopAt >= 0 && i > stopAt;
          const canBreak = config.breakable.includes(n.id);
          return (
            <li key={n.id} className="flex flex-col items-stretch">
              <motion.div
                animate={isLit ? { scale: [1, 1.03, 1] } : {}}
                className={`flex items-center gap-3 rounded-2xl p-3 ring-2 transition ${
                  isBroken && isLit
                    ? 'bg-rose-50 ring-rose-400'
                    : isLit
                      ? 'bg-amber-50 ring-amber-400 shadow'
                      : after
                        ? 'bg-slate-50 opacity-50 ring-slate-200'
                        : 'bg-white ring-black/10'
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {n.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="leading-tight font-extrabold">{n.label}</h3>
                  <AnimatePresence>
                    {isLit && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-ink-soft"
                      >
                        {isBroken ? n.brokenText : n.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                {canBreak && (
                  <button
                    onClick={() => setBroken(isBroken ? null : n.id)}
                    disabled={running}
                    aria-pressed={isBroken}
                    className={`chip shrink-0 py-1 text-xs ${isBroken ? 'bg-rose-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-rose-100'}`}
                  >
                    {isBroken ? '💥 Broken' : '✂️ Break'}
                  </button>
                )}
              </motion.div>
              {i < config.nodes.length - 1 && (
                <span
                  aria-hidden
                  className={`self-center text-lg ${i < lit ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  {isBroken ? '✖' : '⬇'}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <Feedback text={outcome} tone={outcome && broken ? 'hint' : 'good'} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold">
        <li
          className={`chip py-1 ${ranNormal ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-ink-soft'}`}
        >
          {ranNormal ? '✅' : '⬜'} Run the healthy cascade
        </li>
        <li
          className={`chip py-1 ${ranBroken ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-ink-soft'}`}
        >
          {ranBroken ? '✅' : '⬜'} Break a link and run it again
        </li>
      </ul>
    </div>
  );
}
