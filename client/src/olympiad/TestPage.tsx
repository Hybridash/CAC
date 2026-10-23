import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  buildOlyTest,
  filterOly,
  isAnswered,
  OLY_BY_ID,
  OLY_QUESTIONS,
  OLY_TEST_BY_ID,
  type OlyAnswer,
  type OlyTestSpec,
} from '@bioplay/shared';
import { Icon } from '../components/Icon';
import { sfx } from '../lib/sound';
import { useOlympiad, type OlyActive } from './store';
import { readFilter } from './filters';
import { QuestionMeta, QuestionView } from './QuestionView';

/** A custom test described entirely by its URL query. */
function customSpec(params: URLSearchParams): OlyTestSpec {
  const filter = readFilter(params);
  const n = Number(params.get('n')) || 20;
  const min = Number(params.get('min'));
  return {
    id: 'custom',
    title: 'Custom test',
    blurb: 'Built from your own choice of topics and levels.',
    count: Math.max(1, Math.min(60, n)),
    minutes: min > 0 ? min : null,
    filter,
  };
}

export function TestPage() {
  const { testId = '' } = useParams();
  const [params] = useSearchParams();
  const query = testId === 'custom' ? params.toString() : undefined;
  const spec = useMemo(
    () => (testId === 'custom' ? customSpec(params) : OLY_TEST_BY_ID[testId]),
    [testId, params],
  );
  const active = useOlympiad((s) => s.active);
  const mine = !!active && active.testId === testId && active.query === query;

  useEffect(() => {
    if (spec) document.title = `${spec.title} · Bio Olympiad · Bio Bites`;
    return () => {
      document.title = 'Bio Bites';
    };
  }, [spec]);

  if (!spec) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-3xl font-extrabold">Test not found</h1>
        <Link to="/olympiad" className="btn-primary mt-4">
          Back to Bio Olympiad
        </Link>
      </div>
    );
  }
  return mine ? <Running active={active} /> : <Intro spec={spec} query={query} />;
}

function Intro({ spec, query }: { spec: OlyTestSpec; query?: string }) {
  const active = useOlympiad((s) => s.active);
  const start = useOlympiad((s) => s.start);
  const discard = useOlympiad((s) => s.discard);
  const pool = filterOly(OLY_QUESTIONS, spec.filter);
  const count = Math.min(spec.count, pool.length);
  const hasTF = pool.some((q) => q.format === 'truefalse');

  const begin = () => {
    sfx.whoosh();
    const questions = buildOlyTest(spec, OLY_QUESTIONS);
    if (active) discard();
    start({
      testId: spec.id,
      title: spec.title,
      query,
      questionIds: questions.map((q) => q.id),
      minutes: spec.minutes,
    });
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/olympiad" className="text-sm font-bold text-ink-soft hover:underline">
        ← Bio Olympiad
      </Link>
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl sm:p-8">
        <span className="chip bg-white/15 text-white ring-1 ring-white/25">
          <Icon name="medal" size={18} /> Practice test
        </span>
        <h1 className="mt-3 text-4xl font-extrabold">{spec.title}</h1>
        <p className="mt-1 text-white/80">{spec.blurb}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Questions" value={String(count)} />
          <Stat label="Time limit" value={spec.minutes ? `${spec.minutes} min` : 'None'} />
          <Stat label="Wrong answers" value="No penalty" />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 text-xl font-extrabold">Rules</h2>
        <ul className="flex flex-col gap-1.5 text-ink-soft">
          <li>• Multiple choice: one best answer, worth 1 point.</li>
          {hasTF && (
            <li>
              • True/false sets: judge all four statements; each correct judgement earns ¼ point.
            </li>
          )}
          <li>• No points are taken off for wrong answers, so answer everything.</li>
          <li>• Flag questions to come back to them. Use ← → to move and A–E to choose.</li>
          {spec.minutes && <li>• The test submits itself when the time runs out.</li>}
          <li>• Leave at any time: your progress is saved on this device.</li>
        </ul>
      </section>

      {active && (
        <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900 ring-1 ring-amber-200">
          <Icon name="warning" size={18} className="-mt-0.5 mr-1" />
          You have an unfinished test (“{active.title}”). Starting this one will discard it.{' '}
          <Link
            className="underline"
            to={`/olympiad/test/${active.testId}${active.query ? `?${active.query}` : ''}`}
          >
            Resume it instead
          </Link>
        </p>
      )}
      <button
        className="btn-primary self-center px-8 py-3 text-lg"
        onClick={begin}
        disabled={!count}
        data-testid="oly-start"
      >
        <Icon name="play" size={24} /> Start the test
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
      <p className="text-xs font-extrabold tracking-wider text-white/70 uppercase">{label}</p>
      <p className="font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function useRemaining(deadline: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [deadline]);
  return deadline ? Math.max(0, deadline - now) : null;
}

const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function Running({ active }: { active: OlyActive }) {
  const update = useOlympiad((s) => s.update);
  const finish = useOlympiad((s) => s.finish);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const questions = useMemo(
    () => active.questionIds.map((id) => OLY_BY_ID[id]).filter(Boolean),
    [active.questionIds],
  );
  const index = Math.min(active.index, questions.length - 1);
  const q = questions[index];
  const remaining = useRemaining(active.deadline);
  const answered = questions.filter((x) => isAnswered(x, active.answers[x.id] ?? null)).length;
  const flagged = active.flagged.includes(q.id);

  const submit = useCallback(
    (timedOut = false) => {
      if (timedOut) sfx.nope();
      else sfx.fanfare();
      const attempt = finish(timedOut);
      if (attempt) navigate(`/olympiad/review/${attempt.id}`, { replace: true });
    },
    [finish, navigate],
  );

  useEffect(() => {
    if (remaining === 0) submit(true);
  }, [remaining, submit]);

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= questions.length) return;
      update({ index: i });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [questions.length, update],
  );
  const setAnswer = (a: OlyAnswer) => update({ answers: { ...active.answers, [q.id]: a } });

  // Keyboard: ← → to move, A–E to pick an option.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || confirming) return;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (q.format === 'single') {
        const i = 'abcde'.indexOf(e.key.toLowerCase());
        if (i >= 0 && i < q.options.length) {
          update({ answers: { ...active.answers, [q.id]: i } });
          sfx.pop();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, q, active.answers, update, confirming]);

  const low = remaining !== null && remaining < 5 * 60_000;
  const unanswered = questions.length - answered;

  return (
    <div className="flex flex-col gap-4" data-testid="oly-test">
      {/* Exam bar */}
      <div className="sticky top-[calc(3.6rem+env(safe-area-inset-top))] z-30 -mx-1 flex items-center gap-3 rounded-2xl bg-ink px-4 py-2.5 text-white shadow-lg">
        <span className="min-w-0 truncate font-display text-lg font-extrabold">{active.title}</span>
        <span className="hidden text-sm font-bold text-white/70 sm:inline">
          {answered} / {questions.length} answered
        </span>
        <span
          className={`ml-auto chip py-1 font-mono text-base ${low ? 'animate-pulse bg-rose-500 text-white' : 'bg-white/15 text-white'}`}
          role="timer"
          aria-label={remaining === null ? 'Untimed' : `${clock(remaining)} remaining`}
        >
          <Icon name="clock" size={18} /> {remaining === null ? 'Untimed' : clock(remaining)}
        </span>
        <button
          className="btn bg-amber-400 px-3 py-1.5 text-sm text-amber-950 shadow-[0_3px_0_#b45309]"
          onClick={() => setConfirming(true)}
        >
          Submit
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* No exit animation: an outgoing question must never catch a click meant for the next. */}
        <motion.section
          key={q.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          className="card flex flex-col gap-4 p-4 sm:p-6"
          aria-label={`Question ${index + 1} of ${questions.length}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-extrabold tracking-wider text-ink-soft uppercase">
              Question {index + 1} of {questions.length}
            </span>
            <QuestionMeta q={q} />
          </div>
          <QuestionView
            q={q}
            number={index + 1}
            answer={active.answers[q.id] ?? null}
            onAnswer={setAnswer}
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
            <button className="btn-ghost" onClick={() => go(index - 1)} disabled={index === 0}>
              ← Previous
            </button>
            <button
              className={`btn text-sm ring-1 ${flagged ? 'bg-amber-300 text-amber-950 ring-amber-400' : 'bg-white text-ink-soft ring-black/10'}`}
              aria-pressed={flagged}
              onClick={() =>
                update({
                  flagged: flagged
                    ? active.flagged.filter((f) => f !== q.id)
                    : [...active.flagged, q.id],
                })
              }
            >
              ⚑ {flagged ? 'Flagged' : 'Flag for review'}
            </button>
            {index < questions.length - 1 ? (
              <button className="btn-primary ml-auto" onClick={() => go(index + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn-primary ml-auto" onClick={() => setConfirming(true)}>
                Finish test
              </button>
            )}
          </div>
        </motion.section>

        <aside className="card p-4 lg:sticky lg:top-36" aria-label="Question navigator">
          <h2 className="mb-2 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
            Questions
          </h2>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-5">
            {questions.map((x, i) => {
              const done = isAnswered(x, active.answers[x.id] ?? null);
              const flag = active.flagged.includes(x.id);
              return (
                <button
                  key={x.id}
                  onClick={() => go(i)}
                  aria-label={`Question ${i + 1}${done ? ', answered' : ''}${flag ? ', flagged' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  className={`relative grid aspect-square place-items-center rounded-lg text-sm font-extrabold transition ${
                    done
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
                  } ${i === index ? 'ring-3 ring-amber-400 ring-offset-1' : ''}`}
                >
                  {i + 1}
                  {flag && <span className="absolute -top-1 -right-1 text-xs">⚑</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-ink-soft">
            <span>
              <span className="mr-1 inline-block h-3 w-3 rounded bg-indigo-600 align-middle" />
              Answered
            </span>
            <span>
              <span className="mr-1 inline-block h-3 w-3 rounded bg-slate-200 align-middle" />
              Not yet
            </span>
            <span>⚑ Flagged</span>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-ink/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirming(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-h"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="card w-full max-w-sm p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="clipboard" size={56} />
              <h2 id="submit-h" className="mt-2 text-2xl font-extrabold">
                Submit your test?
              </h2>
              <p className="mt-1 text-ink-soft">
                {unanswered
                  ? `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.`
                  : 'Every question is answered.'}
                {active.flagged.length > 0 && ` ${active.flagged.length} flagged for review.`}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button className="btn-ghost" onClick={() => setConfirming(false)} autoFocus>
                  Keep working
                </button>
                <button className="btn-primary" onClick={() => submit()} data-testid="oly-submit">
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
