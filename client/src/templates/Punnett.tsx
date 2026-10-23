import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { punnett, type PunnettConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, PanelTitle, Progress, Prompt } from './framework/ui';
import { useStage } from './framework/stage';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const pct = (p: number) => `${Math.round(p * 100)}%`;
const BROOD = 8;

type Pheno = { label: string; color: string; emoji?: string };

/** Pick parents, cross them, and hatch offspring to see traits and probabilities. */
export function Punnett({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<PunnettConfig>) {
  const { gene } = config;
  const [mother, setMother] = useState(config.mothers[0]);
  const [father, setFather] = useState(config.fathers[0]);
  const [brood, setBrood] = useState<{ n: number; genotypes: string[] } | null>(null);
  const [cIndex, setCIndex] = useState(0);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const completed = useRef(alreadyDone);
  const { immersive } = useStage();
  const result = useMemo(() => punnett(gene, mother, father), [gene, mother, father]);
  const xl = gene.inheritance === 'x-linked';
  const challenge = config.challenges[cIndex];

  const breed = () => {
    sfx.sparkle();
    const flat = result.grid.flat();
    setBrood({
      n: Date.now(),
      genotypes: Array.from({ length: BROOD }, () => flat[Math.floor(Math.random() * 4)]),
    });
    onStage?.(2);
    if (
      challenge &&
      Math.abs((result.phenotypes[challenge.phenotype] ?? 0) - challenge.probability) < 1e-9
    ) {
      setTimeout(() => sfx.correct(), 700);
      setMsg({ text: challenge.explain, good: true });
      setCIndex((c) => c + 1);
    } else if (challenge) {
      setMsg({
        text: `This cross gives ${pct(result.phenotypes[challenge.phenotype] ?? 0)} ${challenge.phenotype}. The challenge wants ${pct(challenge.probability)} — try other parents!`,
        good: false,
      });
    }
  };

  const done = cIndex >= config.challenges.length;
  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const pheno = (g: string): Pheno => gene.phenotypes[g] ?? { label: g, color: '#e5e7eb' };
  const pick = (set: (g: string) => void) => (g: string) => {
    sfx.pop();
    set(g);
    setBrood(null);
    onStage?.(1);
  };

  const cell = immersive ? 'h-24 w-24' : 'h-20 w-20';

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>

      {challenge && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 ring-2 ring-amber-300">
          <span className="glow-pulse grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200">
            <Icon name="target" size={24} />
          </span>
          <p className="font-bold text-amber-950">
            <span className="block text-xs font-extrabold tracking-wider text-amber-700 uppercase">
              Challenge {cIndex + 1} of {config.challenges.length}
            </span>
            {challenge.prompt} <span className="font-normal">(choose parents, then hatch)</span>
          </p>
        </div>
      )}

      {/* Parents */}
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <ParentCard
          title={xl ? '♀ Mother' : 'Parent 1'}
          tone="pink"
          options={config.mothers}
          value={mother}
          onChange={pick(setMother)}
          pheno={pheno}
        />
        <motion.span
          key={`${mother}${father}`}
          initial={{ scale: 0.5, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-2xl font-extrabold text-white shadow-lg"
          aria-hidden
        >
          ×
        </motion.span>
        <ParentCard
          title={xl ? '♂ Father' : 'Parent 2'}
          tone="sky"
          options={config.fathers}
          value={father}
          onChange={pick(setFather)}
          pheno={pheno}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[auto_1fr]">
        {/* The Punnett square */}
        <div className="mx-auto rounded-3xl bg-white p-3 ring-2 ring-black/5">
          <PanelTitle icon="dna">Punnett square</PanelTitle>
          <table
            className="border-separate border-spacing-1.5 text-center"
            aria-label="Punnett square"
          >
            <thead>
              <tr>
                <th />
                {result.fatherGametes.map((g, i) => (
                  <th key={i} scope="col">
                    <motion.span
                      key={`${father}${i}`}
                      initial={{ y: -16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-sky-200 font-mono text-lg font-extrabold text-sky-950 shadow-[0_3px_0_#7dd3fc]"
                    >
                      {g}
                    </motion.span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.grid.map((row, r) => (
                <tr key={r}>
                  <th scope="row">
                    <motion.span
                      key={`${mother}${r}`}
                      initial={{ x: -16, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: r * 0.1 }}
                      className="grid h-11 w-11 place-items-center rounded-full bg-pink-200 font-mono text-lg font-extrabold text-pink-950 shadow-[0_3px_0_#f9a8d4]"
                    >
                      {result.motherGametes[r]}
                    </motion.span>
                  </th>
                  {row.map((g, c) => (
                    <motion.td
                      key={`${mother}${father}${r}${c}`}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + (r * 2 + c) * 0.1, type: 'spring' }}
                      className={`${cell} rounded-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)] ring-2 ring-black/10`}
                      style={{ background: pheno(g).color }}
                    >
                      <div className="text-2xl leading-none" aria-hidden>
                        {pheno(g).emoji}
                      </div>
                      <div className="font-mono text-lg font-extrabold">{g}</div>
                      <div className="text-[10px] leading-tight font-bold">{pheno(g).label}</div>
                    </motion.td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Odds and the nursery */}
        <div className="flex flex-col gap-3">
          <div className="rounded-3xl bg-white p-3 ring-2 ring-black/5">
            <PanelTitle icon="dice">Chances for each baby</PanelTitle>
            <div className="flex flex-col gap-2">
              {Object.entries(result.phenotypes).map(([label, p]) => {
                const g = Object.values(gene.phenotypes).find((v) => v.label === label);
                const got = brood?.genotypes.filter((x) => pheno(x).label === label).length ?? 0;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-32 truncate text-sm font-bold">
                      {g?.emoji} {label}
                    </span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className="sheen h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${g?.color ?? '#a5b4fc'}, ${g?.color ?? '#a5b4fc'}aa)`,
                          boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)',
                        }}
                        animate={{ width: pct(p) }}
                      />
                    </div>
                    <span className="w-12 text-right font-extrabold">{pct(p)}</span>
                    {brood && (
                      <span className="w-10 text-right text-xs font-bold text-ink-soft">
                        {got}/{BROOD}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-lime-50 p-3 ring-2 ring-amber-100">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <PanelTitle icon="egg">Nursery</PanelTitle>
              <motion.button whileTap={{ scale: 0.92 }} className="btn-primary" onClick={breed}>
                <Icon name="egg" size={22} /> Hatch {BROOD} offspring
              </motion.button>
            </div>
            <div className="flex min-h-14 flex-wrap gap-1.5" aria-live="polite">
              {brood
                ? brood.genotypes.map((g, i) => (
                    <Baby key={`${brood.n}-${i}`} pheno={pheno(g)} genotype={g} delay={i * 0.08} />
                  ))
                : Array.from({ length: BROOD }, (_, i) => (
                    <span
                      key={i}
                      className="grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-amber-200 text-lg opacity-60"
                      aria-hidden
                    >
                      🥚
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <Feedback text={msg?.text ?? null} tone={msg ? (msg.good ? 'good' : 'info') : 'info'} />
      <Progress value={cIndex} max={config.challenges.length} label="challenges" />
    </div>
  );
}

/** An egg that wobbles, cracks, and reveals the baby's phenotype. */
function Baby({ pheno, genotype, delay }: { pheno: Pheno; genotype: string; delay: number }) {
  const [hatched, setHatched] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHatched(true), 450 + delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <span
      className="relative grid h-12 w-12 place-items-center"
      title={`${genotype}: ${pheno.label}`}
    >
      <AnimatePresence mode="wait">
        {hatched ? (
          <motion.span
            key="baby"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
            className="grid h-full w-full place-items-center rounded-full text-xl shadow ring-2 ring-white"
            style={{ background: pheno.color }}
          >
            {pheno.emoji ?? '●'}
            <span className="sr-only">{pheno.label}</span>
          </motion.span>
        ) : (
          <motion.span
            key="egg"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -12, 12, -8, 0] }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="text-2xl"
            aria-hidden
          >
            🥚
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function ParentCard({
  title,
  tone,
  options,
  value,
  onChange,
  pheno,
}: {
  title: string;
  tone: 'pink' | 'sky';
  options: string[];
  value: string;
  onChange: (g: string) => void;
  pheno: (g: string) => Pheno;
}) {
  const p = pheno(value);
  const ring = tone === 'pink' ? 'ring-pink-200' : 'ring-sky-200';
  const head = tone === 'pink' ? 'text-pink-700' : 'text-sky-700';
  return (
    <fieldset className={`rounded-3xl bg-white p-3 ring-2 ${ring}`}>
      <legend className={`px-1 text-sm font-extrabold ${head}`}>{title}</legend>
      <div className="flex items-center gap-3">
        <motion.span
          key={value}
          initial={{ scale: 0.6, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-3xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] ring-4 ring-white"
          style={{ background: p.color }}
          aria-hidden
        >
          {p.emoji ?? '●'}
        </motion.span>
        <div>
          <p className="font-mono text-2xl font-extrabold">{value}</p>
          <p className="text-sm font-bold text-ink-soft">{p.label}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup">
        {options.map((g) => (
          <button
            key={g}
            role="radio"
            aria-checked={value === g}
            onClick={() => onChange(g)}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 ring-2 transition ${value === g ? 'ring-indigo-500 shadow-[0_3px_0_#4f46e5]' : 'ring-black/10 hover:-translate-y-0.5'}`}
            style={{ background: pheno(g).color }}
          >
            <span className="font-mono font-extrabold">{g}</span>
            <span className="text-xs font-bold">
              {pheno(g).emoji} {pheno(g).label}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
