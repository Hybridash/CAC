import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { shuffled } from '../../templates/framework/shuffle';
import { sfx } from '../../lib/sound';
import { GoalItem, Icon, type IconName } from '../../components/Icon';

const CHAIN = [
  {
    id: 'grass',
    label: 'Grass',
    icon: 'grass' as IconName,
    role: 'Producer',
    note: 'Grass makes its own food from sunlight. It’s a producer.',
  },
  {
    id: 'grasshopper',
    label: 'Grasshopper',
    icon: 'grasshopper' as IconName,
    role: 'Primary consumer',
    note: 'Grasshoppers eat plants: a primary consumer (herbivore).',
  },
  {
    id: 'frog',
    label: 'Frog',
    icon: 'frog' as IconName,
    role: 'Secondary consumer',
    note: 'Frogs eat insects: a secondary consumer.',
  },
  {
    id: 'snake',
    label: 'Snake',
    icon: 'snake' as IconName,
    role: 'Tertiary consumer',
    note: 'Snakes eat frogs: a tertiary consumer.',
  },
  {
    id: 'hawk',
    label: 'Hawk',
    icon: 'hawk' as IconName,
    role: 'Top predator',
    note: 'Hawks eat snakes. Nothing here eats hawks: they’re the top predator.',
  },
];
const DECOMPOSER = {
  id: 'mushroom',
  label: 'Mushroom',
  icon: 'mushroom' as IconName,
  role: 'Decomposer',
};

type Phase = 'build' | 'energy' | 'break' | 'done';

export function FoodChainLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const tray = useMemo(() => shuffled([...CHAIN, DECOMPOSER]), []);
  const [placed, setPlaced] = useState<string[]>([]);
  const [decomposer, setDecomposer] = useState(false);
  const [phase, setPhase] = useState<Phase>('build');
  const [energyStep, setEnergyStep] = useState(-1);
  const [removed, setRemoved] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'Who eats whom? Drag each living thing into the chain, starting with the one that uses sunlight.',
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (phase === 'done' && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [phase, onComplete]);

  const chainDone = placed.length === CHAIN.length && decomposer;
  useEffect(() => {
    if (chainDone && phase === 'build') {
      setPhase('energy');
      onStage?.(3);
      say(
        'Chain complete! The arrows show which way energy flows: from the eaten to the eater. Now send in some sunlight.',
        'good',
      );
    }
  }, [chainDone, phase, onStage]);

  const onDrop = useCallback(
    (id: string, zone: string) => {
      if (zone === 'decomposer') {
        if (id === DECOMPOSER.id) {
          sfx.correct();
          setDecomposer(true);
          onStage?.(6);
          say(
            'Mushrooms are decomposers: they break down dead plants and animals from EVERY level and return nutrients to the soil.',
            'good',
          );
        } else {
          sfx.nope();
          say('This spot is for the recycler that breaks down dead things.', 'hint');
        }
        return;
      }
      const slot = Number(zone.replace('slot-', ''));
      if (Number.isNaN(slot)) return;
      if (slot !== placed.length) {
        say('Build the chain in order, starting next to the sun.', 'hint');
        return;
      }
      if (id === DECOMPOSER.id) {
        sfx.nope();
        say(
          'Mushrooms don’t hunt or graze — they feed on dead things. Try the recycling spot below!',
          'hint',
        );
        return;
      }
      if (CHAIN[slot].id === id) {
        sfx.correct();
        setPlaced((p) => [...p, id]);
        onStage?.(slot === 0 ? 1 : 2);
        say(CHAIN[slot].note, 'good');
      } else {
        sfx.nope();
        const c = CHAIN.find((x) => x.id === id)!;
        const prev = CHAIN[slot - 1];
        say(
          slot === 0
            ? `${c.label} can’t make food from sunlight. What can?`
            : `Does a ${c.label.toLowerCase()} eat ${prev.label.toLowerCase()}s? Think about what hunts or grazes on ${prev.label.toLowerCase()}s.`,
          'hint',
        );
      }
    },
    [placed.length, onStage],
  );

  const sendEnergy = () => {
    timers.current.forEach(clearTimeout);
    setEnergyStep(0);
    sfx.whoosh();
    onStage?.(4);
    for (let i = 1; i <= CHAIN.length; i++) {
      timers.current.push(
        setTimeout(() => {
          setEnergyStep(i);
          sfx.pop();
        }, i * 900),
      );
    }
    timers.current.push(
      setTimeout(
        () => {
          setPhase('break');
          say(
            'Only about 10% of the energy makes it up each step — the rest is used for living and lost as heat. That’s why there are far fewer hawks than grasshoppers! Now tap an animal to remove it.',
            'good',
          );
        },
        (CHAIN.length + 1) * 900,
      ),
    );
  };

  const remove = (i: number) => {
    if (phase !== 'break' && phase !== 'done') return;
    setRemoved(i);
    sfx.nope();
    onStage?.(5);
    const c = CHAIN[i];
    const below = CHAIN[i - 1];
    const above = CHAIN[i + 1];
    const twoBelow = CHAIN[i - 2];
    say(
      `Without ${c.label.toLowerCase()}s: ${below ? `${below.label.toLowerCase()}s boom (no one eats them)` : 'everything above starves'}${twoBelow ? `, so more ${twoBelow.label.toLowerCase()} gets eaten` : ''}${above ? `, and ${above.label.toLowerCase()}s go hungry and decline` : ''}. One missing link ripples through the whole chain.`,
      'hint',
    );
    setPhase('done');
  };

  const energy = [1000, 100, 10, 1, 0.1];
  const effect = (i: number): 'gone' | 'up' | 'down' | 'same' => {
    if (removed === null) return 'same';
    if (i === removed) return 'gone';
    if (i === removed - 1) return 'up';
    if (i > removed) return 'down';
    if (i === removed - 2) return 'down';
    return 'same';
  };

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        {phase === 'build'
          ? 'Build a meadow food chain.'
          : phase === 'energy'
            ? 'Send sunlight through the chain and watch where the energy goes.'
            : 'Tap any animal or plant to remove it from the meadow.'}
      </Prompt>
      <DndArena onDrop={onDrop}>
        <div className="scene-bg flex flex-wrap items-center justify-center gap-1.5 rounded-3xl bg-gradient-to-b from-sky-100 to-lime-100 p-3 ring-1 ring-black/10">
          <div className="flex flex-col items-center">
            <motion.span
              className="inline-flex"
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              <Icon name="sun" size={52} />
            </motion.span>
            <span className="text-xs font-bold">Sun</span>
            {energyStep >= 0 && (
              <span className="text-xs font-extrabold text-amber-700">energy in</span>
            )}
          </div>
          {CHAIN.map((c, i) => {
            const isPlaced = placed.length > i;
            const fx = effect(i);
            return (
              <div key={c.id} className="flex items-center gap-1.5">
                <Arrow lit={energyStep > i} />
                {isPlaced ? (
                  <button
                    onClick={() => remove(i)}
                    disabled={phase !== 'break' && phase !== 'done'}
                    aria-label={`${c.label}, ${c.role}${phase === 'break' || phase === 'done' ? '. Remove from the meadow' : ''}`}
                    className={`relative flex w-24 flex-col items-center rounded-2xl p-2 ring-2 transition ${fx === 'gone' ? 'bg-slate-100 opacity-40 ring-slate-300' : energyStep > i ? 'bg-amber-50 ring-amber-400' : 'bg-surface ring-emerald-300'} ${phase === 'break' ? 'cursor-pointer hover:ring-rose-400' : ''}`}
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: fx === 'gone' ? 0.6 : 1 }}
                      className="inline-flex"
                      aria-hidden
                    >
                      <Icon name={c.icon} size={44} />
                    </motion.span>
                    <span className="text-xs font-extrabold">{c.label}</span>
                    <span className="text-xs leading-tight text-ink-soft">{c.role}</span>
                    <AnimatePresence>
                      {energyStep > i && (
                        <motion.span
                          initial={{ y: 8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="mt-0.5 rounded-full bg-amber-200 px-1.5 text-xs font-extrabold text-amber-900"
                        >
                          <Icon name="bolt" size={14} /> {energy[i]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {energyStep > i && i > 0 && (
                      <span
                        className="absolute -top-3 -right-1"
                        title="90% lost as heat"
                        aria-hidden
                      >
                        <Icon name="flame" size={22} />
                      </span>
                    )}
                    {fx === 'up' && (
                      <span className="absolute -top-2 -left-1 chip bg-emerald-500 text-xs text-white">
                        ▲ boom
                      </span>
                    )}
                    {fx === 'down' && (
                      <span className="absolute -top-2 -left-1 chip bg-rose-500 text-xs text-white">
                        ▼ fewer
                      </span>
                    )}
                  </button>
                ) : (
                  <DropZone
                    id={`slot-${i}`}
                    label={`food chain step ${i + 1}`}
                    className="rounded-2xl"
                  >
                    {({ isOver, armed }) => (
                      <div
                        className={`grid h-24 w-24 place-items-center rounded-2xl border-2 border-dashed text-sm font-bold ${isOver ? 'border-indigo-500 bg-indigo-50' : i === placed.length ? (armed ? 'border-indigo-400 bg-surface' : 'border-emerald-400 bg-surface/80 text-emerald-700') : 'border-slate-300 bg-white/50 text-slate-300'}`}
                      >
                        {i === placed.length ? 'next?' : '?'}
                      </div>
                    )}
                  </DropZone>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropZone id="decomposer" label="the decomposer spot" className="rounded-2xl">
            {({ isOver, armed }) => (
              <div
                className={`flex items-center gap-2 rounded-2xl p-2 ring-2 ${decomposer ? 'bg-amber-50 ring-amber-300' : isOver ? 'bg-indigo-50 ring-indigo-400' : armed ? 'bg-surface ring-indigo-300 ring-dashed' : 'bg-surface ring-dashed ring-slate-300'}`}
              >
                <span className="text-3xl" aria-hidden>
                  <Icon name={decomposer ? 'mushroom' : 'refresh'} size={34} />
                </span>
                <span className="text-sm font-bold">
                  {decomposer
                    ? 'Decomposers recycle dead things from every level'
                    : 'Recycler spot: who breaks down dead things?'}
                </span>
              </div>
            )}
          </DropZone>
          <div className="flex flex-wrap gap-2">
            {tray
              .filter((t) => !placed.includes(t.id) && !(t.id === DECOMPOSER.id && decomposer))
              .map((t) => (
                <Draggable key={t.id} id={t.id} label={t.label}>
                  <span className="flex flex-col items-center rounded-2xl bg-surface px-3 py-1.5 shadow ring-1 ring-black/10">
                    <Icon name={t.icon} size={38} />
                    <span className="text-xs font-bold">{t.label}</span>
                  </span>
                </Draggable>
              ))}
          </div>
        </div>
      </DndArena>

      {phase === 'energy' && (
        <button className="btn-primary self-start" onClick={sendEnergy} disabled={energyStep >= 0}>
          <Icon name="sun" size={20} /> Send 1000 units of sunlight energy
        </button>
      )}
      {phase !== 'build' && energyStep >= CHAIN.length && <EnergyPyramid />}
      {phase === 'done' && (
        <button
          className="btn-ghost self-start text-sm"
          onClick={() => {
            setRemoved(null);
            setPhase('break');
            say('Meadow restored. Try removing a different link!');
          }}
        >
          <Icon name="sprout" size={20} /> Restore the meadow
        </button>
      )}
      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={chainDone}>Build the food chain</Goal>
        <Goal done={energyStep >= CHAIN.length}>Follow the energy</Goal>
        <Goal done={removed !== null || phase === 'done'}>Remove a link</Goal>
      </ul>
    </div>
  );
}

function Arrow({ lit }: { lit: boolean }) {
  return (
    <motion.span
      aria-hidden
      className={`text-2xl font-black ${lit ? 'text-amber-500' : 'text-slate-300'}`}
      animate={lit ? { x: [0, 4, 0] } : {}}
      transition={{ repeat: Infinity, duration: 0.8 }}
    >
      →
    </motion.span>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function EnergyPyramid() {
  const levels = [...CHAIN].reverse();
  return (
    <figure className="rounded-2xl bg-surface p-3 ring-1 ring-black/10">
      <figcaption className="mb-2 text-sm font-bold">
        The energy pyramid: each level gets about 10% of the one below
      </figcaption>
      <div className="flex flex-col items-center gap-1">
        {levels.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ width: 0 }}
            animate={{ width: `${22 + (i / (levels.length - 1)) * 78}%` }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-center gap-1 rounded-lg py-1 text-xs font-bold text-white"
            style={{ background: ['#345a80', '#2563eb', '#0d9488', '#65a30d', '#16a34a'][i] }}
          >
            <Icon name={c.icon} size={16} /> {c.label}
          </motion.div>
        ))}
      </div>
    </figure>
  );
}
