import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import {
  BARK_DARKNESS,
  birdsHunt,
  contrast,
  meanDarkness,
  mothColor,
  reproduce,
  startingPopulation,
  type Bark,
  type Moth,
} from './model';
import { GoalItem, Icon } from '../../components/Icon';

const ROUND_SECONDS = 8;
const MEALS = 12;

export function SelectionLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const [bark, setBark] = useState<Bark>('lichen');
  const [moths, setMoths] = useState<Moth[]>(() => startingPopulation());
  const [history, setHistory] = useState<{ gen: number; mean: number; bark: Bark }[]>(() => []);
  const [gen, setGen] = useState(1);
  const [hunting, setHunting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [eaten, setEaten] = useState(0);
  const [sootGens, setSootGens] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'You are a hungry bird. Press “Start hunting”, then tap every moth you can spot. Some are hard to see!',
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const startMean = useRef(meanDarkness(moths));
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });

  useEffect(() => {
    setHistory([{ gen: 1, mean: meanDarkness(moths), bark: 'lichen' }]);
    // Record the starting generation once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mean = meanDarkness(moths);
  const evolvedDark = bark === 'soot' && sootGens >= 2 && mean > startMean.current + 0.25;
  useEffect(() => {
    if (evolvedDark && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onStage?.(5);
      say(
        'Evolution in action! On sooty trees, dark moths survived more often and passed on their color. The population changed.',
        'good',
      );
      onComplete();
    }
  }, [evolvedDark, onComplete, onStage]);

  // Hunting timer.
  useEffect(() => {
    if (!hunting) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [hunting]);
  useEffect(() => {
    if (hunting && timeLeft <= 0) endRound(moths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, hunting]);

  const startHunt = () => {
    setEaten(0);
    setTimeLeft(ROUND_SECONDS);
    setHunting(true);
    onStage?.(1);
    say('Hunt! Tap the moths you can see. You can eat up to 12.', 'info');
  };

  const eat = (m: Moth) => {
    if (!hunting) return;
    sfx.pop();
    const left = moths.filter((x) => x.id !== m.id);
    setMoths(left);
    const n = eaten + 1;
    setEaten(n);
    if (n >= MEALS) endRound(left);
  };

  /** Birds that the player didn't catch: let the computer finish the meals by visibility. */
  const autoHunt = () => {
    const left = birdsHunt(moths, bark, MEALS);
    setMoths(left);
    setEaten(MEALS);
    endRound(left, true);
  };

  const endRound = (survivors: Moth[], auto = false) => {
    setHunting(false);
    const survivorMean = meanDarkness(survivors);
    const next = reproduce(survivors);
    const nextMean = meanDarkness(next);
    setMoths(next);
    setGen((g) => g + 1);
    setHistory((h) => [...h, { gen: h.length + 1, mean: nextMean, bark }]);
    if (bark === 'soot') setSootGens((n) => n + 1);
    onStage?.(3);
    sfx.whoosh();
    const camo = bark === 'lichen' ? 'pale' : 'dark';
    say(
      `${auto ? 'The birds' : 'You'} ate the moths that stood out. ${survivors.length} survivors (mostly ${survivorMean < 0.5 ? 'pale' : 'dark'}) had babies that look like them. The ${camo} form ${Math.abs(nextMean - BARK_DARKNESS[bark]) < 0.25 ? 'now dominates' : 'is gaining ground'}.`,
      'good',
    );
  };

  const switchBark = () => {
    const next: Bark = bark === 'lichen' ? 'soot' : 'lichen';
    setBark(next);
    sfx.whoosh();
    onStage?.(4);
    say(
      next === 'soot'
        ? 'The Industrial Revolution! Factory soot kills the pale lichen and blackens the trees. Pale moths now stick out…'
        : 'Clean-air laws! Lichen grows back and trees get lighter again. Which moths stand out now?',
      'hint',
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Be the bird. Hunt for a few generations, then change the environment and watch the moths
        evolve.
      </Prompt>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={startHunt} disabled={hunting}>
          <Icon name="hawk" size={20} />{' '}
          {hunting ? `Hunting… ${timeLeft}s` : `Start hunting (generation ${gen})`}
        </button>
        <button className="btn-ghost" onClick={autoHunt} disabled={hunting}>
          Let the birds hunt »
        </button>
        <button
          className={`btn text-sm ${bark === 'soot' ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-800 text-white'}`}
          onClick={switchBark}
          disabled={hunting}
        >
          {bark === 'lichen' ? 'Industrial Revolution (soot)' : 'Clean air returns'}
        </button>
        {hunting && (
          <span className="chip bg-amber-100 py-1 text-amber-900">
            {eaten}/{MEALS} eaten
          </span>
        )}
      </div>

      <div
        className="relative h-80 overflow-hidden rounded-3xl ring-1 ring-black/10 transition-colors duration-700"
        style={{
          background:
            bark === 'lichen'
              ? 'radial-gradient(circle at 20% 30%, #d9e4c8 0 8%, transparent 9%), radial-gradient(circle at 70% 60%, #cfd8c0 0 10%, transparent 11%), radial-gradient(circle at 40% 80%, #dfe7d3 0 7%, transparent 8%), repeating-linear-gradient(95deg, #d6d3cb 0 14px, #c9c5bb 14px 22px)'
              : 'radial-gradient(circle at 25% 35%, #18181b 0 9%, transparent 10%), radial-gradient(circle at 65% 70%, #27272a 0 11%, transparent 12%), repeating-linear-gradient(95deg, #3f3f46 0 14px, #2e2e33 14px 22px)',
        }}
        aria-label={`Tree bark (${bark === 'lichen' ? 'pale, lichen-covered' : 'dark, sooty'}) with ${moths.length} moths`}
        role="group"
      >
        <AnimatePresence>
          {moths.map((m) => (
            <motion.button
              key={m.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              onClick={() => eat(m)}
              disabled={!hunting}
              aria-label={`Moth (${contrast(m, bark) > 0.5 ? 'easy' : 'hard'} to see)`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 disabled:cursor-default"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <MothSvg color={mothColor(m.dark)} rot={m.rot} />
            </motion.button>
          ))}
        </AnimatePresence>
        {!hunting && (
          <div className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-white/85 px-3 py-1 text-sm font-bold shadow">
            Generation {gen} · {moths.length} moths
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Histogram moths={moths} />
        <Trend history={history} />
      </div>
      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={gen > 1}>Hunt one generation</Goal>
        <Goal done={bark === 'soot' || sootGens > 0}>Change the environment</Goal>
        <Goal done={evolvedDark || completed.current}>Watch the population turn dark</Goal>
      </ul>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function MothSvg({ color, rot }: { color: string; rot: number }) {
  return (
    <svg
      width="38"
      height="30"
      viewBox="0 0 38 30"
      style={{ transform: `rotate(${rot}deg)` }}
      aria-hidden
    >
      <path d="M19 15 C 8 2, 1 6, 3 14 C 4 22, 12 22, 19 17 Z" fill={color} />
      <path d="M19 15 C 30 2, 37 6, 35 14 C 34 22, 26 22, 19 17 Z" fill={color} />
      <ellipse cx="19" cy="16" rx="2" ry="7" fill={color} style={{ filter: 'brightness(0.8)' }} />
      <path d="M18 9 l-4 -6 M20 9 l4 -6" stroke={color} strokeWidth="1" />
    </svg>
  );
}

function Histogram({ moths }: { moths: Moth[] }) {
  const bins = [0, 0, 0, 0, 0];
  for (const m of moths) bins[Math.min(4, Math.floor(m.dark * 5))]++;
  const max = Math.max(1, ...bins);
  return (
    <figure className="rounded-2xl bg-white p-3 ring-1 ring-black/10">
      <figcaption className="mb-2 text-sm font-bold">This generation: moths by color</figcaption>
      <div
        className="flex h-28 items-end gap-2"
        role="img"
        aria-label={`Pale to dark counts: ${bins.join(', ')}`}
      >
        {bins.map((n, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-bold">{n}</span>
            <motion.div
              className="w-full rounded-t-lg ring-1 ring-black/20"
              animate={{ height: `${(n / max) * 80}px` }}
              style={{ background: mothColor(i / 4) }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span>pale</span>
        <span>dark</span>
      </div>
    </figure>
  );
}

function Trend({ history }: { history: { gen: number; mean: number; bark: Bark }[] }) {
  const W = 300;
  const H = 120;
  const n = Math.max(6, history.length);
  const x = (g: number) => 20 + ((g - 1) / (n - 1)) * (W - 30);
  const y = (v: number) => H - 14 - v * (H - 24);
  return (
    <figure className="rounded-2xl bg-white p-3 ring-1 ring-black/10">
      <figcaption className="mb-1 text-sm font-bold">Average darkness over generations</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Average darkness by generation: ${history.map((h) => Math.round(h.mean * 100)).join(', ')} percent`}
      >
        {history.map(
          (h, i) =>
            i > 0 && (
              <rect
                key={h.gen}
                x={x(h.gen - 1)}
                y="4"
                width={x(h.gen) - x(h.gen - 1)}
                height={H - 18}
                fill={history[i - 1].bark === 'soot' ? '#e4e4e7' : '#f0fdf4'}
              />
            ),
        )}
        <line x1="20" x2={W - 10} y1={H - 14} y2={H - 14} stroke="#cbd5e1" />
        <polyline
          points={history.map((h) => `${x(h.gen)},${y(h.mean)}`).join(' ')}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="3"
        />
        {history.map((h) => (
          <circle
            key={h.gen}
            cx={x(h.gen)}
            cy={y(h.mean)}
            r="4"
            fill={mothColor(h.mean)}
            stroke="#4c1d95"
            strokeWidth="1.5"
          />
        ))}
        <text x="4" y={y(1) + 4} fontSize="9" fill="#64748b">
          dark
        </text>
        <text x="4" y={y(0)} fontSize="9" fill="#64748b">
          pale
        </text>
      </svg>
    </figure>
  );
}
