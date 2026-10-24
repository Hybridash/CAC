import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import { expose, newPerson, SICK_AT, stepPerson, vaccinate, type Person } from './model';
import { GoalItem, Icon, type IconName } from '../../components/Icon';

const DAYS = 21;
/** Real milliseconds per simulated day. */
const DAY_MS = 550;

type Stage = 'setup' | 'running' | 'finished';

export function VaccineLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const [sam, setSam] = useState<Person>(newPerson);
  const [alex, setAlex] = useState<Person>(newPerson);
  const [hist, setHist] = useState<{ sam: Person[]; alex: Person[] }>({ sam: [], alex: [] });
  const [stage, setStage] = useState<Stage>('setup');
  const [doses, setDoses] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'Sam and Alex are both healthy. Drag the vaccine onto ONE of them.',
    tone: 'info',
  });
  const [runs, setRuns] = useState(0);
  const completed = useRef(alreadyDone);
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });

  useEffect(() => {
    if (runs > 0 && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [runs, onComplete]);

  // Day-by-day outbreak playback.
  useEffect(() => {
    if (stage !== 'running') return;
    const start = performance.now();
    let raf = 0;
    let s = sam;
    let a = alex;
    let simDay = 0;
    const loop = (now: number) => {
      const target = Math.min(DAYS, (now - start) / DAY_MS);
      while (simDay < target) {
        s = stepPerson(s, 0.05);
        a = stepPerson(a, 0.05);
        simDay += 0.05;
        if (Math.round(simDay * 20) % 5 === 0)
          setHist((h) => ({ sam: [...h.sam, s], alex: [...h.alex, a] }));
      }
      setSam(s);
      setAlex(a);
      if (target >= DAYS) {
        setStage('finished');
        setRuns((r) => r + 1);
        onStage?.(5);
        const vaxed = s.memory > 0 ? 'Sam' : a.memory > 0 ? 'Alex' : null;
        const other = vaxed === 'Sam' ? a : s;
        say(
          vaxed
            ? `${vaxed}’s memory cells recognized the virus within days and wiped it out — no symptoms. The other person was sick for about ${Math.round(other.sickDays)} days before their slow first response kicked in. They have memory cells now too, but they paid for them by getting sick.`
            : 'Neither was vaccinated, so both were sick for about a week while their immune systems learned from scratch.',
          'good',
        );
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // Start values are captured once when the outbreak begins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const onDrop = (item: string, zone: string) => {
    if (stage === 'running') return;
    const who = zone === 'sam' ? 'Sam' : 'Alex';
    const setP = zone === 'sam' ? setSam : setAlex;
    const p = zone === 'sam' ? sam : alex;
    if (item === 'vaccine') {
      if (stage === 'finished') reset(false);
      sfx.sparkle();
      setP(vaccinate(p));
      setDoses((d) => d + 1);
      onStage?.(p.memory > 0 ? 6 : 2);
      say(
        p.memory > 0
          ? `Booster! ${who}’s immune system reviews the “wanted poster” and makes even more memory cells.`
          : `The vaccine shows ${who}’s immune system a harmless piece of the virus. Over 1–2 weeks it makes antibodies and long-lived MEMORY cells.`,
        'good',
      );
    } else if (item === 'virus') {
      startOutbreak();
    }
  };

  const startOutbreak = () => {
    if (stage === 'running') return;
    const freshSam =
      stage === 'finished'
        ? { ...newPerson(), memory: sam.memory, baseline: sam.baseline, antibodies: sam.baseline }
        : sam;
    const freshAlex =
      stage === 'finished'
        ? {
            ...newPerson(),
            memory: alex.memory,
            baseline: alex.baseline,
            antibodies: alex.baseline,
          }
        : alex;
    const s = expose({ ...freshSam, day: 0 });
    const a = expose({ ...freshAlex, day: 0 });
    setSam(s);
    setAlex(a);
    setHist({ sam: [s], alex: [a] });
    setStage('running');
    sfx.whoosh();
    onStage?.(3);
    say(
      'The real virus is spreading and reaches both of them! Watch the next three weeks…',
      'hint',
    );
  };

  const reset = (all = true) => {
    setStage('setup');
    setHist({ sam: [], alex: [] });
    if (all) {
      setSam(newPerson());
      setAlex(newPerson());
      setDoses(0);
      say('Reset. Nobody is vaccinated.');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Vaccinate one person, then release the virus on both. Who stays healthy, and why?
      </Prompt>
      <DndArena onDrop={onDrop}>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2">
          <Draggable id="vaccine" label="Vaccine" disabled={stage === 'running'}>
            <span className="flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 font-bold shadow ring-1 ring-black/10">
              <Icon name="syringe" size={28} />
              Vaccine{' '}
              {doses > 0 && <span className="text-xs text-ink-soft">(drop again = booster)</span>}
            </span>
          </Draggable>
          <Draggable id="virus" label="Real virus" disabled={stage === 'running'}>
            <span className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 font-bold shadow ring-1 ring-rose-200">
              <Icon name="virus" size={28} />
              Real virus
            </span>
          </Draggable>
          <button
            className="btn-ghost ml-auto py-1.5 text-sm"
            onClick={startOutbreak}
            disabled={stage === 'running'}
          >
            <Icon name="globe" size={18} /> Start outbreak
          </button>
          <button
            className="btn-ghost py-1.5 text-sm"
            onClick={() => reset()}
            disabled={stage === 'running'}
          >
            ↺ Reset
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <PersonCard
            id="sam"
            name="Sam"
            icon="kidA"
            p={sam}
            hist={hist.sam}
            running={stage !== 'setup'}
          />
          <PersonCard
            id="alex"
            name="Alex"
            icon="kidB"
            p={alex}
            hist={hist.alex}
            running={stage !== 'setup'}
          />
        </div>
      </DndArena>
      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={doses > 0}>Vaccinate someone</Goal>
        <Goal done={stage !== 'setup' || runs > 0}>Release the virus</Goal>
        <Goal done={runs > 0}>Watch all 3 weeks</Goal>
      </ul>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function PersonCard({
  id,
  name,
  icon,
  p,
  hist,
  running,
}: {
  id: string;
  name: string;
  icon: IconName;
  p: Person;
  hist: Person[];
  running: boolean;
}) {
  const sick = p.virus >= SICK_AT;
  const memoryCells = Math.round(p.memory * 4);
  const viruses = Math.min(18, Math.round(p.virus / 6));
  const abs = Math.min(18, Math.round(p.antibodies / 6));
  return (
    <DropZone id={id} label={name} className="rounded-3xl">
      {({ isOver, armed }) => (
        <div
          className={`flex flex-col gap-2 rounded-3xl bg-surface p-3 ring-2 transition ${isOver ? 'ring-indigo-400' : armed ? 'ring-indigo-300 ring-dashed' : sick ? 'ring-rose-300' : 'ring-black/10'}`}
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="relative text-6xl"
              aria-hidden
              animate={sick ? { rotate: [0, -4, 4, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <Icon name={icon} size={64} />
              <span className="absolute -right-2 -bottom-1">
                <Icon name={sick ? 'faceSick' : p.virus > 0 ? 'faceOk' : 'faceHappy'} size={30} />
              </span>
            </motion.span>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold">{name}</h3>
              <p className="text-sm font-semibold text-ink-soft">
                {p.baseline === 0
                  ? p.memory > 0
                    ? 'Recovered (natural immunity)'
                    : 'Not vaccinated'
                  : p.memory > 1
                    ? 'Vaccinated + booster'
                    : 'Vaccinated'}
                {running && <> · Day {Math.min(21, Math.floor(p.day))}</>}
              </p>
              <p
                className={`text-sm font-extrabold ${sick ? 'text-rose-600' : 'text-emerald-700'}`}
              >
                {sick ? 'Sick with fever' : p.virus > 0 ? 'Fighting it off' : 'Healthy'}
              </p>
            </div>
            <div
              className="flex flex-col items-end gap-0.5"
              aria-label={`${memoryCells} memory cells`}
            >
              <span className="text-xs font-extrabold text-violet-700">
                Memory cells
              </span>
              <span className="flex gap-0.5">
                {memoryCells === 0 ? (
                  <span className="text-xs text-slate-400">none</span>
                ) : (
                  Array.from({ length: memoryCells }, (_, i) => (
                    <Icon key={i} name="brain" size={18} />
                  ))
                )}
              </span>
            </div>
          </div>
          <div
            className="scene-bg relative h-16 overflow-hidden rounded-2xl bg-rose-50"
            aria-hidden
          >
            <AnimatePresence>
              {Array.from({ length: viruses }, (_, i) => (
                <motion.span
                  key={`v${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute"
                  style={{ left: `${(i * 37) % 92}%`, top: `${(i * 23) % 60}%` }}
                >
                  <Icon name="virus" size={22} />
                </motion.span>
              ))}
              {Array.from({ length: abs }, (_, i) => (
                <motion.span
                  key={`a${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute text-sm font-black text-sky-600"
                  style={{ left: `${(i * 53 + 11) % 94}%`, top: `${(i * 31 + 20) % 70}%` }}
                >
                  Y
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <Chart hist={hist} />
        </div>
      )}
    </DropZone>
  );
}

function Chart({ hist }: { hist: Person[] }) {
  const W = 300;
  const H = 110;
  const x = (d: number) => 24 + (d / DAYS) * (W - 30);
  const y = (v: number) => H - 16 - (v / 110) * (H - 26);
  const line = (key: 'virus' | 'antibodies') =>
    hist.map((p) => `${x(p.day)},${y(p[key])}`).join(' ');
  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Virus and antibody levels over 21 days"
      >
        <rect x="24" y={y(110)} width={W - 30} height={y(SICK_AT) - y(110)} fill="#ffe4e6" />
        <text
          x={W - 8}
          y={y(SICK_AT) - 4}
          textAnchor="end"
          fontSize="9"
          fill="#e11d48"
          fontWeight="700"
        >
          sick zone
        </text>
        <line x1="24" x2={W - 6} y1={H - 16} y2={H - 16} stroke="#cbd5e1" />
        {[0, 7, 14, 21].map((d) => (
          <text
            key={d}
            x={x(d)}
            y={H - 4}
            fontSize="9"
            textAnchor={d === 21 ? 'end' : 'middle'}
            fill="#64748b"
          >
            day {d}
          </text>
        ))}
        <polyline points={line('virus')} fill="none" stroke="#e11d48" strokeWidth="2.5" />
        <polyline points={line('antibodies')} fill="none" stroke="#0284c7" strokeWidth="2.5" />
      </svg>
      <figcaption className="flex gap-3 text-xs font-bold">
        <span className="text-rose-600">━ virus</span>
        <span className="text-sky-700">━ antibodies</span>
      </figcaption>
    </figure>
  );
}
