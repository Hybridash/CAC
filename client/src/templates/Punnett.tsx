import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { punnett, type PunnettConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt } from './framework/ui';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const pct = (p: number) => `${Math.round(p * 100)}%`;

/** Pick parents, breed, and see offspring traits and probabilities. */
export function Punnett({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<PunnettConfig>) {
  const { gene } = config;
  const [mother, setMother] = useState(config.mothers[0]);
  const [father, setFather] = useState(config.fathers[0]);
  const [babies, setBabies] = useState<string[]>([]);
  const [cIndex, setCIndex] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const completed = useRef(alreadyDone);
  const result = useMemo(() => punnett(gene, mother, father), [gene, mother, father]);
  const xl = gene.inheritance === 'x-linked';
  const challenge = config.challenges[cIndex];

  const breed = () => {
    sfx.sparkle();
    const flat = result.grid.flat();
    setBabies(Array.from({ length: 8 }, () => flat[Math.floor(Math.random() * 4)]));
    onStage?.(2);
    if (
      challenge &&
      Math.abs((result.phenotypes[challenge.phenotype] ?? 0) - challenge.probability) < 1e-9
    ) {
      sfx.correct();
      setMsg(challenge.explain);
      setCIndex((c) => c + 1);
    } else if (challenge) {
      setMsg(
        `This cross gives ${pct(result.phenotypes[challenge.phenotype] ?? 0)} ${challenge.phenotype}. The challenge wants ${pct(challenge.probability)} — try other parents!`,
      );
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

  const pheno = (g: string) => gene.phenotypes[g] ?? { label: g, color: '#e5e7eb' };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="grid gap-3 sm:grid-cols-2">
        <ParentPicker
          title={xl ? '♀ Mother' : 'Parent 1'}
          options={config.mothers}
          value={mother}
          onChange={(g) => {
            setMother(g);
            onStage?.(1);
          }}
          pheno={pheno}
        />
        <ParentPicker
          title={xl ? '♂ Father' : 'Parent 2'}
          options={config.fathers}
          value={father}
          onChange={(g) => {
            setFather(g);
            onStage?.(1);
          }}
          pheno={pheno}
        />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-[auto_1fr]">
        <table
          className="mx-auto border-separate border-spacing-1.5 text-center"
          aria-label="Punnett square"
        >
          <thead>
            <tr>
              <th />
              {result.fatherGametes.map((g, i) => (
                <th
                  key={i}
                  scope="col"
                  className="rounded-xl bg-sky-100 px-3 py-1 font-mono text-lg font-extrabold"
                >
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.grid.map((row, r) => (
              <tr key={r}>
                <th
                  scope="row"
                  className="rounded-xl bg-pink-100 px-3 py-1 font-mono text-lg font-extrabold"
                >
                  {result.motherGametes[r]}
                </th>
                {row.map((g, c) => (
                  <motion.td
                    key={`${mother}${father}${r}${c}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (r * 2 + c) * 0.08 }}
                    className="h-20 w-20 rounded-2xl ring-2 ring-black/10"
                    style={{ background: pheno(g).color }}
                  >
                    <div className="font-mono text-lg font-extrabold">{g}</div>
                    <div className="text-[11px] leading-tight font-bold">
                      {pheno(g).emoji} {pheno(g).label}
                    </div>
                  </motion.td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-2">
          <h3 className="font-extrabold">Chances for each baby</h3>
          {Object.entries(result.phenotypes).map(([label, p]) => {
            const g = Object.entries(gene.phenotypes).find(([, v]) => v.label === label)?.[1];
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="w-32 text-sm font-bold">
                  {g?.emoji} {label}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: g?.color ?? '#a5b4fc' }}
                    animate={{ width: pct(p) }}
                  />
                </div>
                <span className="w-12 text-right font-extrabold">{pct(p)}</span>
              </div>
            );
          })}
          <button className="btn-primary mt-2 self-start" onClick={breed}>
            <Icon name="egg" size={20} /> Breed 8 offspring
          </button>
          <div className="flex min-h-12 flex-wrap gap-1.5" aria-live="polite">
            <AnimatePresence>
              {babies.map((g, i) => (
                <motion.span
                  key={`${i}-${g}-${babies.join('')}`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="grid h-11 w-11 place-items-center rounded-full text-xl ring-2 ring-black/10"
                  style={{ background: pheno(g).color }}
                  title={`${g}: ${pheno(g).label}`}
                >
                  {pheno(g).emoji ?? '●'}
                  <span className="sr-only">{pheno(g).label}</span>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {challenge && (
        <p className="rounded-2xl bg-amber-50 p-3 font-bold text-amber-950 ring-1 ring-amber-200">
          <Icon name="target" size={20} className="mr-1" /> Challenge {cIndex + 1}:{' '}
          {challenge.prompt} <span className="font-normal">(choose parents, then breed)</span>
        </p>
      )}
      <Feedback text={msg} tone={done ? 'good' : 'info'} />
      <Progress value={cIndex} max={config.challenges.length} label="challenges" />
    </div>
  );
}

function ParentPicker({
  title,
  options,
  value,
  onChange,
  pheno,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (g: string) => void;
  pheno: (g: string) => { label: string; color: string; emoji?: string };
}) {
  return (
    <fieldset className="rounded-2xl bg-white p-3 ring-1 ring-black/10">
      <legend className="px-1 text-sm font-extrabold">{title}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {options.map((g) => (
          <button
            key={g}
            role="radio"
            aria-checked={value === g}
            onClick={() => onChange(g)}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 ring-2 transition ${value === g ? 'ring-indigo-500' : 'ring-black/10'}`}
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
