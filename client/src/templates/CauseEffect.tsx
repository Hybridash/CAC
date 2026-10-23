import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CauseEffectConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Burst, GoalChip, Prompt } from './framework/ui';
import { useStage } from './framework/stage';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const STEP_MS = 850;

/** Trigger a cascade; cut a link to see what goes wrong. */
export function CauseEffect({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<CauseEffectConfig>) {
  const [broken, setBroken] = useState<string | null>(null);
  const [lit, setLit] = useState(-1);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<{ text: string; ok: boolean } | null>(null);
  const [ranNormal, setRanNormal] = useState(false);
  const [ranBroken, setRanBroken] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completed = useRef(alreadyDone);
  const { immersive } = useStage();
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
          300 + i * STEP_MS,
        ),
      );
    }
    timers.current.push(
      setTimeout(
        () => {
          setRunning(false);
          if (stopAt >= 0) {
            sfx.nope();
            setOutcome({
              text: config.nodes[stopAt].brokenText ?? 'The chain stops here.',
              ok: false,
            });
            setRanBroken(true);
          } else {
            sfx.correct();
            setOutcome({ text: config.normalOutcome, ok: true });
            setRanNormal(true);
            onStage?.(3);
          }
        },
        300 + (last + 1) * STEP_MS,
      ),
    );
  };

  const toggleBreak = (id: string) => {
    sfx.pop();
    setLit(-1);
    setOutcome(null);
    setBroken((b) => (b === id ? null : id));
  };

  const finished = !running && outcome !== null;

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5">
        <div className="scene-bg absolute inset-0 opacity-30" />
        <div className="relative flex flex-wrap items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className={`btn relative bg-gradient-to-b from-amber-300 to-orange-500 px-5 py-3 text-lg text-amber-950 shadow-[0_5px_0_#9a3412] disabled:opacity-60 ${running ? '' : 'glow-pulse'}`}
            onClick={run}
            disabled={running}
          >
            <span className="text-2xl" aria-hidden>
              {config.trigger.emoji}
            </span>{' '}
            {config.trigger.label}
          </motion.button>
          {broken && (
            <button
              className="btn bg-white/10 text-sm text-white ring-1 ring-white/25 hover:bg-white/20"
              onClick={() => setBroken(null)}
              disabled={running}
            >
              <Icon name="refresh" size={18} /> Repair all links
            </button>
          )}
          <span className="ml-auto text-xs font-extrabold tracking-wider text-white/60 uppercase">
            {running ? 'Signal travelling…' : broken ? 'A link is cut' : 'All links intact'}
          </span>
        </div>

        <ol className={`relative mt-4 grid gap-0 ${immersive ? 'lg:grid-cols-2 lg:gap-x-6' : ''}`}>
          {config.nodes.map((n, i) => {
            const isLit = i <= lit;
            const isBroken = n.id === broken;
            const after = stopAt >= 0 && i > stopAt;
            const canBreak = config.breakable.includes(n.id);
            const isHead = i === lit && running;
            const last = i === config.nodes.length - 1;
            return (
              <li key={n.id} className="grid grid-cols-[3.25rem_1fr] gap-3">
                {/* The wire rail with its node bead. */}
                <div className="relative flex flex-col items-center">
                  <motion.span
                    animate={isHead ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative z-10 grid h-13 w-13 shrink-0 place-items-center rounded-full text-2xl ring-4 transition ${
                      isBroken && isLit
                        ? 'bg-rose-500 ring-rose-300'
                        : isLit
                          ? 'bg-amber-300 ring-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.9)]'
                          : after
                            ? 'bg-slate-700 opacity-50 ring-slate-600'
                            : 'bg-slate-700 ring-slate-500'
                    }`}
                  >
                    <Burst trigger={isHead ? lit : null} />
                    <span aria-hidden>{n.emoji}</span>
                  </motion.span>
                  {!last && (
                    <span className="relative w-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                      <motion.span
                        className={`absolute inset-x-0 top-0 rounded-full ${isBroken ? 'bg-rose-500' : 'bg-gradient-to-b from-amber-300 to-orange-500'}`}
                        initial={false}
                        animate={{ height: i < lit ? '100%' : '0%' }}
                        transition={{ duration: STEP_MS / 1000 - 0.15, ease: 'easeInOut' }}
                      />
                      {isBroken && (
                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-base">
                          <Icon name="scissors" size={18} />
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="pb-3">
                  <motion.div
                    animate={isHead ? { x: [0, 6, 0] } : {}}
                    className={`flex items-start gap-3 rounded-2xl p-3 ring-2 transition ${
                      isBroken && isLit
                        ? 'bg-rose-50 ring-rose-400'
                        : isLit
                          ? 'bg-amber-50 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                          : after
                            ? 'bg-slate-800/60 text-slate-400 ring-slate-700'
                            : 'bg-white/95 ring-white/20'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="leading-tight font-extrabold">
                        {n.label}
                        {after && (
                          <span className="ml-2 text-xs font-bold text-slate-400">
                            · signal lost
                          </span>
                        )}
                      </h3>
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
                        onClick={() => toggleBreak(n.id)}
                        disabled={running}
                        aria-pressed={isBroken}
                        aria-label={
                          isBroken ? `${n.label} link is cut. Repair it` : `Cut the ${n.label} link`
                        }
                        className={`chip shrink-0 py-1 text-xs transition ${isBroken ? 'bg-rose-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-rose-100 hover:text-rose-800'}`}
                      >
                        {isBroken ? (
                          'Cut ✕'
                        ) : (
                          <>
                            <Icon name="scissors" size={16} /> Cut
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                </div>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite">
          <AnimatePresence>
            {finished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`relative mt-1 flex items-center gap-3 rounded-2xl p-3 font-bold ring-2 ${outcome.ok ? 'bg-emerald-400/15 text-emerald-100 ring-emerald-400' : 'bg-rose-400/15 text-rose-100 ring-rose-400'}`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${outcome.ok ? 'bg-emerald-400' : 'bg-rose-400'}`}
                >
                  <Icon name={outcome.ok ? 'check' : 'warning'} size={26} />
                </span>
                <span>
                  <span className="block text-xs font-extrabold tracking-wider uppercase opacity-80">
                    {outcome.ok ? 'Result: success' : 'Result: the chain broke'}
                  </span>
                  {outcome.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <GoalChip done={ranNormal}>Run the healthy cascade</GoalChip>
        <GoalChip done={ranBroken}>Cut a link and run it again</GoalChip>
      </div>
    </div>
  );
}
