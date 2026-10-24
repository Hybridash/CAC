import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import { counts, dose, grow, immune, newInfection, SICK_THRESHOLD, type Bacterium } from './model';
import { GoalItem, Icon } from '../../components/Icon';

const COURSE = 7;
const R_COLOR = ['#22c55e', '#facc15', '#ef4444'];
const R_LABEL = ['Killed easily', 'Partly resistant', 'Resistant'];

interface DayLog {
  day: number;
  c: number[];
  dosed: boolean;
}

export function ResistanceLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const [pop, setPop] = useState<Bacterium[]>(() => newInfection());
  const [day, setDay] = useState(0);
  const [dosesTaken, setDosesTaken] = useState(0);
  const [dosedToday, setDosedToday] = useState(false);
  /** Consecutive days the drug has been taken; drug levels build up over a course. */
  const [streak, setStreak] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [log, setLog] = useState<DayLog[]>(() => []);
  const [round, setRound] = useState(1);
  const [goals, setGoals] = useState({ firstDose: false, comeback: false, cured: false });
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'A bacterial infection! Give the patient their daily antibiotic: drag a pill onto the dish.',
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });
  const c = counts(pop);
  const sick = pop.length >= SICK_THRESHOLD;
  const done = goals.firstDose && goals.comeback && goals.cured;

  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const takeDose = () => {
    if (dosedToday || pop.length === 0) return;
    const before = counts(pop);
    const after = dose(pop, streak + 1);
    setStreak((n) => n + 1);
    setPop(after);
    setDosedToday(true);
    setDosesTaken((n) => n + 1);
    sfx.drop();
    const ac = counts(after);
    if (!goals.firstDose) {
      setGoals((g) => ({ ...g, firstDose: true }));
      onStage?.(1);
    }
    if (round > 1 && after.length > before.reduce((a, b) => a + b, 0) * 0.4) {
      setGoals((g) => ({ ...g, comeback: true }));
      onStage?.(4);
      say(
        'The antibiotic barely works now! The survivors from last time were the toughest ones, and their offspring inherited that toughness. This is antibiotic resistance.',
        'hint',
      );
    } else {
      say(
        `Killed ${before[0] - ac[0]} easy-to-kill bacteria, but ${ac[1] + ac[2]} tougher ones survived. Notice which colors are left…`,
        'info',
      );
    }
  };

  const nextDay = () => {
    const survived = immune(pop);
    const grown = grow(survived, sharing);
    setLog((l) => [...l, { day: day + 1, c: counts(grown), dosed: dosedToday }]);
    setDay((d) => d + 1);
    if (!dosedToday) setStreak(0);
    setDosedToday(false);
    setPop(grown);
    sfx.whoosh();
    if (grown.length === 0) {
      setGoals((g) => ({ ...g, cured: true }));
      onStage?.(5);
      say(
        dosesTaken >= COURSE
          ? 'Cured! Finishing the full course wiped out even the tougher bacteria, and your immune system mopped up the rest.'
          : 'Cured! Every bacterium is gone.',
        'good',
      );
    } else if (grown.length < SICK_THRESHOLD && dosesTaken > 0 && dosesTaken < COURSE) {
      onStage?.(2);
      say(
        'The patient feels better! But the course isn’t finished. Stop now, or keep taking the pills?',
        'hint',
      );
    } else if (!dosedToday && grown.length >= SICK_THRESHOLD && dosesTaken > 0 && round === 1) {
      onStage?.(3);
      say(
        'The infection is coming back — and look at the colors. The survivors were the tougher ones.',
        'hint',
      );
    }
  };

  const reinfect = () => {
    // A new round starts from whatever survived: that's what makes resistance build up.
    setRound((r) => r + 1);
    setDosesTaken(0);
    setStreak(0);
    setDay(0);
    setLog([]);
    say(
      'Round 2: the same patient (or someone they infected) is sick again — with the descendants of the survivors. Try the antibiotic now.',
      'hint',
    );
  };

  const restart = () => {
    setPop(newInfection());
    setRound(1);
    setDay(0);
    setDosesTaken(0);
    setStreak(0);
    setDosedToday(false);
    setLog([]);
    say('Fresh infection. This time, try finishing the whole 7-day course.', 'info');
  };

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Treat the infection day by day. What happens if you stop as soon as you feel better?
      </Prompt>
      <DndArena onDrop={(id, zone) => id === 'pill' && zone === 'dish' && takeDose()}>
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <DropZone id="dish" label="the petri dish" className="rounded-full">
            {({ isOver, armed }) => (
              <div
                className={`relative mx-auto aspect-square w-full max-w-md rounded-full bg-gradient-to-br from-amber-50 to-amber-100 shadow-inner ring-8 transition ${isOver ? 'ring-indigo-400' : armed ? 'ring-indigo-300' : 'ring-slate-200'}`}
                role="img"
                aria-label={`Petri dish with ${pop.length} bacteria: ${c[0]} easily killed, ${c[1]} partly resistant, ${c[2]} resistant.`}
              >
                <AnimatePresence>
                  {pop.map((b) => (
                    <motion.span
                      key={b.id}
                      initial={{ scale: 0, rotate: (b.id * 47) % 180 }}
                      animate={{ scale: 1, rotate: (b.id * 47) % 180 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="absolute h-3 w-6 rounded-full ring-1 ring-black/30"
                      style={{
                        left: `${50 + b.x * 44}%`,
                        top: `${50 + b.y * 44}%`,
                        background: R_COLOR[b.r],
                      }}
                    />
                  ))}
                </AnimatePresence>
                {pop.length === 0 && (
                  <span className="absolute inset-0 grid place-items-center text-2xl font-extrabold text-emerald-700">
                    <Icon name="sparkle" size={28} /> Clear!
                  </span>
                )}
              </div>
            )}
          </DropZone>
          <div className="flex flex-col gap-2">
            <div
              className={`rounded-2xl p-3 text-center ring-2 ${sick ? 'bg-rose-50 ring-rose-300' : 'bg-emerald-50 ring-emerald-300'}`}
            >
              <div className="text-4xl" aria-hidden>
                <Icon
                  name={sick ? 'faceSick' : pop.length > 0 ? 'faceOk' : 'faceHappy'}
                  size={48}
                />
              </div>
              <p className="font-extrabold">
                {sick ? 'Patient feels sick' : pop.length > 0 ? 'Feels better…' : 'Cured!'}
              </p>
              <p className="text-sm text-ink-soft">
                Round {round} · Day {day} · Pills taken {dosesTaken}/{COURSE}
              </p>
              <div
                className="mt-1 flex items-center gap-1 text-xs font-bold"
                title="Drug level builds up with each day in a row"
              >
                Drug level
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <span
                    className="block h-full rounded-full bg-sky-500"
                    style={{ width: `${Math.min(100, (streak / 5) * 100)}%` }}
                  />
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-1 text-sm font-bold">
              {[0, 1, 2].map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span
                    className="h-3 w-6 rounded-full ring-1 ring-black/30"
                    style={{ background: R_COLOR[r] }}
                  />
                  {R_LABEL[r]}: {c[r]}
                </li>
              ))}
            </ul>
            <Draggable id="pill" label="Antibiotic pill" disabled={dosedToday || pop.length === 0}>
              <span className="flex items-center justify-center gap-2 rounded-2xl bg-surface px-3 py-2 font-bold shadow ring-1 ring-black/10">
                <Icon name="pill" size={28} />
                {dosedToday ? 'Taken today ✓' : 'Antibiotic pill'}
              </span>
            </Draggable>
            <button className="btn-primary" onClick={nextDay} disabled={pop.length === 0}>
              <Icon name="sun" size={20} /> Next day{' '}
              {!dosedToday && dosesTaken > 0 && pop.length > 0 ? '(skip pill)' : ''}
            </button>
            <button
              className={`chip justify-center py-1.5 text-sm ${sharing ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-ink-soft'}`}
              aria-pressed={sharing}
              onClick={() => {
                setSharing(!sharing);
                if (!sharing)
                  say(
                    'Gene sharing on: resistant bacteria can pass resistance genes on tiny DNA rings (plasmids) to their neighbors.',
                    'info',
                  );
              }}
            >
              <Icon name="dna" size={18} /> Gene sharing (plasmids) {sharing ? 'on' : 'off'}
            </button>
          </div>
        </div>
      </DndArena>

      {log.length > 0 && <History log={log} />}

      <div className="flex flex-wrap gap-2">
        {round === 1 && pop.length > 0 && day >= 3 && (
          <button className="btn-ghost text-sm" onClick={reinfect}>
            <Icon name="refresh" size={18} /> It came back: start round 2 with the survivors
          </button>
        )}
        <button className="btn-ghost text-sm" onClick={restart}>
          <Icon name="microbe" size={18} /> New infection
        </button>
      </div>
      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={goals.firstDose}>Give the first dose</Goal>
        <Goal done={goals.comeback}>See an antibiotic fail (stop early, then round 2)</Goal>
        <Goal done={goals.cured}>Cure an infection</Goal>
      </ul>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function History({ log }: { log: DayLog[] }) {
  const max = 90;
  return (
    <figure className="rounded-2xl bg-surface p-3 ring-1 ring-black/10">
      <figcaption className="mb-2 text-sm font-bold">
        Bacteria at the end of each day (● = pill taken)
      </figcaption>
      <div
        className="flex h-28 items-end gap-1.5"
        role="img"
        aria-label={log.map((l) => `Day ${l.day}: ${l.c.join('/')}`).join('; ')}
      >
        {log.map((l) => (
          <div key={l.day} className="flex w-8 flex-col items-center">
            <div
              className="flex w-full flex-col-reverse overflow-hidden rounded-t-md"
              style={{ height: `${((l.c[0] + l.c[1] + l.c[2]) / max) * 90}px` }}
            >
              {[0, 1, 2].map((r) => (
                <div
                  key={r}
                  style={{
                    height: `${(l.c[r] / Math.max(1, l.c[0] + l.c[1] + l.c[2])) * 100}%`,
                    background: R_COLOR[r],
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-bold">{l.dosed ? '●' : '·'}</span>
            <span className="text-xs text-ink-soft">d{l.day}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
