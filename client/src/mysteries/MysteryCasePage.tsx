import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AVATAR_BY_ID,
  CATEGORY_BY_ID,
  CONCEPT_BY_ID,
  evalExpr,
  isMysteryUnlocked,
  MYSTERY_BY_ID,
  mysteryReward,
  type Clue,
  type Mystery,
  type MysterySolveResponse,
} from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { Stars } from '../components/ConceptBits';
import { AtpAmount } from '../components/Atp';
import { AvatarCard } from '../components/AvatarCard';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

export function MysteryCasePage() {
  const { id = '' } = useParams();
  const m = MYSTERY_BY_ID[id];
  if (!m) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-3xl font-extrabold">Case not found</h1>
        <Link to="/mysteries" className="btn-primary mt-4">
          Back to the case files
        </Link>
      </div>
    );
  }
  return <Case key={m.id} m={m} />;
}

function Case({ m }: { m: Mystery }) {
  const player = usePlayer((s) => s.player);
  const solve = usePlayer((s) => s.solveMystery);
  const [examined, setExamined] = useState<Set<string>>(new Set());
  const [explanation, setExplanation] = useState<number | null>(null);
  const [evidence, setEvidence] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<MysterySolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const done = (cid: string) => !!player?.progress[cid]?.completedAt;
  const unlocked = isMysteryUnlocked(m, done);
  const solvedBefore = player?.mysteriesSolved.includes(m.id);
  const cat = CATEGORY_BY_ID[m.category];
  const allExamined = examined.size === m.clues.length;

  const markExamined = (cid: string) => setExamined((s) => (s.has(cid) ? s : new Set(s).add(cid)));

  const submit = async () => {
    if (explanation === null) return;
    setBusy(true);
    setError(null);
    try {
      const r = await solve(m.id, { explanation, evidence: [...evidence] });
      setResult(r);
      if (r.correct) sfx.fanfare();
      else sfx.nope();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center">
        <Icon name="lock" size={72} />
        <h1 className="text-3xl font-extrabold">{m.title}</h1>
        <p className="text-ink-soft">
          This case file is sealed. Complete these concepts to unlock it:
        </p>
        <ul className="flex flex-col gap-2">
          {m.requires.map((cid) => (
            <li key={cid}>
              <Link
                to={`/learn/${cid}`}
                className={`chip py-1.5 text-base ${done(cid) ? 'bg-emerald-100 text-emerald-800' : 'bg-white ring-1 ring-black/10'}`}
              >
                <Icon name={done(cid) ? 'check' : 'todo'} size={18} /> {CONCEPT_BY_ID[cid]?.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/mysteries" className="btn-ghost">
          ← All cases
        </Link>
      </div>
    );
  }

  return (
    <article className="flex flex-col gap-5">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#3b2f2a] p-6 text-amber-50">
        <div className="absolute -top-4 -right-4 opacity-20" aria-hidden>
          <Icon name="mystery" size={170} />
        </div>
        <p className="text-sm font-bold tracking-widest text-amber-300 uppercase">
          Case file · {cat.name}
        </p>
        <h1 className="text-4xl font-extrabold">{m.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Stars difficulty={m.difficulty} />
          <span className="chip bg-amber-100 text-amber-900">
            <AtpAmount amount={mysteryReward(m.difficulty)} prefix="+" />
          </span>
          {solvedBefore && <span className="chip bg-amber-300 text-amber-950">✓ Solved</span>}
        </div>
        <p className="relative mt-3 max-w-3xl text-lg leading-relaxed">{m.scenario}</p>
      </header>

      <section aria-labelledby="clues-h">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="clues-h" className="text-2xl font-extrabold">
            Clues
          </h2>
          <span className="chip bg-slate-100">
            {examined.size}/{m.clues.length} examined
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {m.clues.map((c) => (
            <ClueCard
              key={c.id}
              clue={c}
              examined={examined.has(c.id)}
              onExamined={() => markExamined(c.id)}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="solve-h" className="card p-5">
        <h2 id="solve-h" className="text-2xl font-extrabold">
          Solve the case
        </h2>
        {!allExamined && (
          <p className="text-sm font-bold text-amber-800">
            Examine every clue before you make your final call.
          </p>
        )}
        <fieldset className="mt-3" disabled={!allExamined || !!result?.correct}>
          <legend className="mb-2 font-bold">{m.question}</legend>
          <div className="grid gap-2" role="radiogroup">
            {m.explanations.map((e, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-2 ${explanation === i ? 'bg-indigo-50 ring-indigo-400' : 'bg-white ring-black/10'}`}
              >
                <input
                  type="radio"
                  name="explanation"
                  className="mt-1 h-4 w-4 accent-indigo-600"
                  checked={explanation === i}
                  onChange={() => setExplanation(i)}
                />
                <span className="font-semibold">{e}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-4" disabled={!allExamined || !!result?.correct}>
          <legend className="mb-2 font-bold">
            Which clues support your explanation? (Pick every supporting clue — and only those.)
          </legend>
          <div className="grid gap-2 md:grid-cols-2">
            {m.evidence.map((e, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-2 ${evidence.has(i) ? 'bg-emerald-50 ring-emerald-400' : 'bg-white ring-black/10'}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-emerald-600"
                  checked={evidence.has(i)}
                  onChange={() =>
                    setEvidence((s) => {
                      const n = new Set(s);
                      if (n.has(i)) n.delete(i);
                      else n.add(i);
                      return n;
                    })
                  }
                />
                <span className="text-sm font-semibold">{e.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="mt-3 font-bold text-amber-800">{error}</p>}
        {!result?.correct && (
          <button
            className="btn-primary mt-4"
            onClick={submit}
            disabled={!allExamined || explanation === null || evidence.size === 0 || busy}
          >
            {busy ? 'Checking…' : 'Close the case'}
          </button>
        )}
        <AnimatePresence>{result && <Verdict m={m} result={result} />}</AnimatePresence>
      </section>
    </article>
  );
}

function Verdict({ m, result }: { m: Mystery; result: MysterySolveResponse }) {
  if (!result.correct) {
    const hint = !result.explanationCorrect
      ? 'Your explanation doesn’t fit all the clues yet. Which explanation would make every important clue make sense?'
      : 'Right explanation! But check your evidence: include every clue that supports it, and leave out details that don’t really matter.';
    return (
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-2xl bg-amber-50 p-4 font-semibold text-amber-900 ring-1 ring-amber-200"
        role="status"
      >
        <Icon name="bulb" size={22} className="mr-1 -mt-0.5" />
        {hint} No penalty — try again!
      </motion.p>
    );
  }
  const prize = result.exclusiveAvatar ? AVATAR_BY_ID[result.exclusiveAvatar] : null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 flex flex-col gap-3 rounded-3xl bg-emerald-50 p-5 ring-2 ring-emerald-300"
      role="status"
      data-testid="case-solved"
    >
      <h3 className="flex items-center gap-2 text-2xl font-extrabold text-emerald-900">
        <Icon name="party" size={34} /> Case closed!
      </h3>
      <p className="leading-relaxed text-emerald-950">{m.resolution}</p>
      {result.total > 0 ? (
        <p className="font-bold">
          Reward: <AtpAmount amount={result.total} prefix="+" />
        </p>
      ) : (
        result.alreadySolved && (
          <p className="text-sm text-emerald-800">
            You solved this case before, so there’s no new reward — but great detective work!
          </p>
        )
      )}
      {prize && (
        <motion.div
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="w-40">
            <AvatarCard avatar={prize} />
          </div>
          <div>
            <p className="text-lg font-extrabold">Mystery-exclusive avatar unlocked!</p>
            <p className="text-sm text-ink-soft">{prize.fact}</p>
            <Link to="/collection" className="btn-ghost mt-2 py-1.5 text-sm">
              See your collection →
            </Link>
          </div>
        </motion.div>
      )}
      <Link to="/mysteries" className="btn-ghost self-start">
        ← Back to case files
      </Link>
    </motion.div>
  );
}

function ClueCard({
  clue,
  examined,
  onExamined,
}: {
  clue: Clue;
  examined: boolean;
  onExamined: () => void;
}) {
  return (
    <div
      className={`card flex flex-col gap-2 p-4 ring-2 ${examined ? 'ring-emerald-300' : 'ring-transparent'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">{clue.title}</h3>
        {examined && <span className="chip bg-emerald-100 text-emerald-800">✓ examined</span>}
      </div>
      {clue.kind === 'test' && <TestClue clue={clue} onExamined={onExamined} />}
      {clue.kind === 'zoom' && <ZoomClue clue={clue} onExamined={onExamined} />}
      {clue.kind === 'slider' && <SliderClue clue={clue} onExamined={onExamined} />}
      {clue.kind === 'observe' && <ObserveClue clue={clue} onExamined={onExamined} />}
    </div>
  );
}

function TestClue({
  clue,
  onExamined,
}: {
  clue: Extract<Clue, { kind: 'test' }>;
  onExamined: () => void;
}) {
  const [run, setRun] = useState<Record<number, 'running' | 'done'>>({});
  const finished = useRef(0);
  const start = (i: number) => {
    if (run[i]) return;
    sfx.pop();
    setRun((r) => ({ ...r, [i]: 'running' }));
    setTimeout(() => {
      setRun((r) => ({ ...r, [i]: 'done' }));
      finished.current += 1;
      if (finished.current === clue.tests.length) onExamined();
    }, 650);
  };
  return (
    <>
      <p className="text-sm text-ink-soft">{clue.intro} Run every test.</p>
      <ul className="flex flex-col gap-1.5">
        {clue.tests.map((t, i) => (
          <li key={i} className="rounded-xl bg-slate-50 p-2">
            <button
              className="flex w-full items-center gap-2 text-left font-bold"
              onClick={() => start(i)}
              aria-expanded={run[i] === 'done'}
            >
              <Icon name="flask" size={22} /> {t.label}
              {!run[i] && (
                <span className="ml-auto chip bg-indigo-600 text-xs text-white">Run test</span>
              )}
              {run[i] === 'running' && (
                <motion.span
                  className="ml-auto text-sm"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  testing…
                </motion.span>
              )}
            </button>
            {run[i] === 'done' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1 text-sm font-semibold text-indigo-900"
                aria-live="polite"
              >
                → {t.result}
              </motion.p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function ZoomClue({
  clue,
  onExamined,
}: {
  clue: Extract<Clue, { kind: 'zoom' }>;
  onExamined: () => void;
}) {
  const [level, setLevel] = useState(0);
  const lv = clue.levels[level];
  return (
    <>
      <p className="text-sm text-ink-soft">{clue.intro}</p>
      <div className="scene-bg flex items-center gap-4 rounded-2xl bg-sky-50 p-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={level}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-5xl"
            aria-hidden
          >
            {lv.emoji}
          </motion.span>
        </AnimatePresence>
        <div aria-live="polite">
          <p className="text-xs font-extrabold text-ink-soft uppercase">
            Zoom {level + 1}/{clue.levels.length}: {lv.label}
          </p>
          <p className="font-semibold">{lv.text}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="btn-ghost py-1 text-sm"
          disabled={level === 0}
          onClick={() => setLevel(level - 1)}
        >
          Zoom out
        </button>
        <button
          className="btn-primary py-1 text-sm"
          disabled={level === clue.levels.length - 1}
          onClick={() => {
            const n = level + 1;
            setLevel(n);
            sfx.whoosh();
            if (n === clue.levels.length - 1) onExamined();
          }}
        >
          <Icon name="mystery" size={18} /> Zoom in
        </button>
      </div>
    </>
  );
}

function SliderClue({
  clue,
  onExamined,
}: {
  clue: Extract<Clue, { kind: 'slider' }>;
  onExamined: () => void;
}) {
  const [x, setX] = useState(clue.input.start);
  const [moved, setMoved] = useState(0);
  const value = evalExpr(clue.expr, { x });
  const fmt = (v: number) =>
    Math.abs(v) >= 100 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString();
  return (
    <>
      <p className="text-sm text-ink-soft">{clue.intro}</p>
      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-sm font-bold">
          {clue.input.label}
          <span className="text-indigo-700">
            {fmt(x)} {clue.input.unit}
          </span>
        </span>
        <input
          type="range"
          min={clue.input.min}
          max={clue.input.max}
          step={clue.input.step}
          value={x}
          onChange={(e) => {
            setX(Number(e.target.value));
            const n = moved + 1;
            setMoved(n);
            if (n === 4) onExamined();
          }}
          className="h-8 accent-indigo-600"
        />
      </label>
      <p className="rounded-xl bg-indigo-50 px-3 py-2 font-bold text-indigo-900" aria-live="polite">
        {clue.outputLabel}: {fmt(value)} {clue.outputUnit}
      </p>
      <p className="text-xs text-ink-soft">ℹ️ {clue.note}</p>
    </>
  );
}

function ObserveClue({
  clue,
  onExamined,
}: {
  clue: Extract<Clue, { kind: 'observe' }>;
  onExamined: () => void;
}) {
  const [open, setOpen] = useState(false);
  return open ? (
    <p className="flex gap-3 rounded-2xl bg-amber-50 p-3 font-semibold">
      <Icon name="clipboard" size={36} />
      {clue.text}
    </p>
  ) : (
    <button
      className="btn-ghost self-start"
      onClick={() => {
        setOpen(true);
        sfx.pop();
        onExamined();
      }}
    >
      <Icon name="clipboard" size={20} /> Read the note
    </button>
  );
}
