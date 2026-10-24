import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  filterOly,
  OLY_LEVEL_LABEL,
  OLY_QUESTIONS,
  OLY_TESTS,
  OLY_TOPICS,
  type OlyLevel,
  type OlyTopic,
} from '@bioplay/shared';
import { Icon } from '../components/Icon';
import { inkFor } from '../lib/color';
import { useOlympiad } from './store';
import { fmtPoints, pctOf, TOPIC_ICON } from './QuestionView';

const FEATURED = ['quick-10', 'open-mock', 'semifinal', 'data-drill', 'tf-gauntlet'];

export function OlympiadPage() {
  const practice = useOlympiad((s) => s.practice);
  const attempts = useOlympiad((s) => s.attempts);
  const active = useOlympiad((s) => s.active);
  const tried = Object.keys(practice).length;
  const right = Object.values(practice).filter((p) => p.correct).length;
  const best = attempts.reduce((m, a) => Math.max(m, pctOf(a.points, a.max)), 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-3xl bg-night px-5 py-8 text-white sm:px-8">
        <motion.span
          className="absolute -top-6 right-4 opacity-25 sm:right-10"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          aria-hidden
        >
          <Icon name="medal" size={180} />
        </motion.span>
        <h1 className="text-4xl font-extrabold sm:text-5xl">Bio Olympiad</h1>
        <p className="mt-2 max-w-2xl text-lg text-white/85">
          Train for biology olympiad exams with {OLY_QUESTIONS.length} challenging questions across
          the full syllabus: multiple choice, true/false statement sets and data analysis, each with
          a full explanation.
        </p>
        <div className="relative mt-5 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat label="Questions tried" value={`${tried}/${OLY_QUESTIONS.length}`} />
          <HeroStat label="Accuracy" value={tried ? `${pctOf(right, tried)}%` : '—'} />
          <HeroStat label="Tests taken" value={String(attempts.length)} />
          <HeroStat label="Best score" value={attempts.length ? `${best}%` : '—'} />
        </div>
      </header>

      {active && (
        <Link
          to={`/olympiad/test/${active.testId}${active.query ? `?${active.query}` : ''}`}
          className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 transition-colors hover:bg-amber-100"
          data-testid="oly-resume"
        >
          <Icon name="clock" size={36} />
          <span className="flex-1">
            <span className="block font-extrabold">Resume “{active.title}”</span>
            <span className="text-sm text-ink-soft">
              {Object.keys(active.answers).length} of {active.questionIds.length} answered
            </span>
          </span>
          <span className="btn-primary">Resume →</span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="flex min-w-0 flex-col gap-3 border-t border-line pt-5" aria-labelledby="practice-h">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="practice-h" className="flex items-center gap-2 text-2xl font-extrabold">
                Practice questions
              </h2>
              <p className="text-ink-soft">
                Filter by topic, level, format or skill. Answer at your own pace with instant
                feedback.
              </p>
            </div>
            <Link
              to="/olympiad/practice"
              className="btn-primary shrink-0"
              data-testid="oly-practice"
            >
              Practice →
            </Link>
          </div>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {OLY_TOPICS.map((t) => {
              const qs = OLY_QUESTIONS.filter((q) => q.topic === t.id);
              const done = qs.filter((q) => practice[q.id]?.correct).length;
              return (
                <li key={t.id}>
                  <Link
                    to={`/olympiad/practice?topic=${t.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
                      style={{ background: t.tint }}
                    >
                      <Icon name={TOPIC_ICON[t.id]} size={26} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-sm font-semibold"
                        style={{ color: inkFor(t.color) }}
                      >
                        {t.name}
                      </span>
                      <span
                        className="scale mt-1.5 block"
                        style={{
                          ['--v' as string]: `${pctOf(done, qs.length)}%`,
                          ['--scale-color' as string]: t.color,
                        }}
                      >
                        <i />
                      </span>
                    </span>
                    <span className="text-xs font-medium text-ink-soft tabular-nums">
                      {done}/{qs.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-3 border-t border-line pt-5" aria-labelledby="rounds-h">
          <h2 id="rounds-h" className="flex items-center gap-2 text-2xl font-extrabold">
            How olympiad exams work
          </h2>
          <ol className="flex flex-col gap-2 text-sm">
            <Round
              level={1}
              text="A first-round open exam: lots of multiple-choice questions across the whole syllabus, roughly a minute each. Breadth matters most."
            />
            <Round
              level={2}
              text="A harder semifinal: deeper reasoning, multi-statement true/false sets and experimental data to interpret."
            />
            <Round
              level={3}
              text="International level: long theory papers built on unfamiliar experiments, plus hands-on practical exams."
            />
          </ol>
          <p className="text-xs text-ink-soft">
            Exact formats vary by country and year. The syllabus weights used here follow the usual
            pattern: animal and cell biology largest, then genetics, plants, ecology, behavior and
            systematics.
          </p>
        </section>
      </div>

      <section aria-labelledby="tests-h" className="flex flex-col gap-3">
        <h2 id="tests-h" className="flex items-center gap-2 text-3xl font-extrabold">
          Practice tests
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OLY_TESTS.filter((t) => FEATURED.includes(t.id)).map((t) => {
            const n = Math.min(t.count, filterOly(OLY_QUESTIONS, t.filter).length);
            const last = attempts.find((a) => a.testId === t.id);
            return (
              <li key={t.id}>
                <Link
                  to={`/olympiad/test/${t.id}`}
                  className="group flex h-full flex-col gap-2 border-t border-line pt-4 transition-colors"
                >
                  <h3 className="text-2xl font-extrabold group-hover:underline">{t.title}</h3>
                  <p className="flex-1 text-sm text-ink-soft">{t.blurb}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-ink-soft">
                    <span>{n} questions</span>
                    <span>
                      {t.minutes ? `${t.minutes} min` : 'Untimed'}
                    </span>
                    {last && (
                      <span className="font-semibold text-brand-dark">
                        Last: {pctOf(last.points, last.max)}%
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <div className="flex h-full flex-col gap-3 border-t border-line pt-4">
              <h3 className="text-2xl font-extrabold">Topic tests</h3>
              <p className="text-sm text-ink-soft">10 questions on one area · 18 min</p>
              <div className="flex flex-wrap gap-1.5">
                {OLY_TOPICS.map((t) => (
                  <Link
                    key={t.id}
                    to={`/olympiad/test/topic-${t.id}`}
                    className="chip py-1.5 ring-1 ring-black/5 transition hover:-translate-y-0.5"
                    style={{ background: t.tint, color: t.color }}
                  >
                    <Icon name={TOPIC_ICON[t.id]} size={18} /> {t.short}
                  </Link>
                ))}
              </div>
            </div>
          </li>
        </ul>
        <CustomBuilder />
      </section>

      {attempts.length > 0 && (
        <section aria-labelledby="history-h">
          <h2 id="history-h" className="mb-3 text-3xl font-extrabold">
            Your results
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {attempts.slice(0, 8).map((a) => {
              const pct = pctOf(a.points, a.max);
              return (
                <li key={a.id}>
                  <Link
                    to={`/olympiad/review/${a.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold text-white ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    >
                      {pct}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">{a.title}</span>
                      <span className="text-sm text-ink-soft">
                        {fmtPoints(a.points)} / {a.max} points ·{' '}
                        {new Date(a.finishedAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-indigo-700">Review →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-ink-soft">
        All questions are original, written for Bio Bites in the style of biology olympiad exams.
        Bio Bites is not affiliated with any olympiad organization.
      </p>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-white/70">{label}</p>
      <p className="font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Round({ level, text }: { level: OlyLevel; text: string }) {
  return (
    <li className="flex gap-3 py-1">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-display font-extrabold text-white">
        {level}
      </span>
      <span>
        <b>{OLY_LEVEL_LABEL[level]}.</b> {text}
      </span>
    </li>
  );
}

function CustomBuilder() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<OlyTopic[]>([]);
  const [levels, setLevels] = useState<OlyLevel[]>([]);
  const [count, setCount] = useState(15);
  const [minutes, setMinutes] = useState(25);
  const pool = filterOly(OLY_QUESTIONS, { topics, levels }).length;
  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const go = () => {
    const p = new URLSearchParams();
    if (topics.length) p.set('topic', topics.join(','));
    if (levels.length) p.set('level', levels.join(','));
    p.set('n', String(count));
    if (minutes) p.set('min', String(minutes));
    navigate(`/olympiad/test/custom?${p}`);
  };

  return (
    <div
      className="grid gap-x-8 gap-y-3 border-t border-line pt-5 md:grid-cols-2"
      data-testid="oly-custom"
    >
      <h3 className="flex items-center gap-2 text-2xl font-extrabold md:col-span-2">
        Build your own test
      </h3>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-extrabold text-ink-soft">
          Topics & levels (none = all)
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Topics">
          {OLY_TOPICS.map((t) => {
            const on = topics.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTopics(toggle(topics, t.id))}
                className="chip py-1 text-xs ring-1 ring-black/10"
                style={on ? { background: t.color, color: 'white' } : { background: 'white' }}
              >
                {t.short}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Levels">
          {([1, 2, 3] as const).map((l) => {
            const on = levels.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                onClick={() => setLevels(toggle(levels, l))}
                className={`chip py-1 text-xs ring-1 ring-black/10 ${on ? 'bg-indigo-600 text-white' : 'bg-surface'}`}
              >
                {OLY_LEVEL_LABEL[l]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 text-sm font-bold">
          <span className="w-24">Questions</span>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-8 text-right">{count}</span>
        </label>
        <label className="flex items-center gap-3 text-sm font-bold">
          <span className="w-24">Time limit</span>
          <select
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="flex-1 rounded-xl bg-slate-50 px-2 py-1.5 ring-1 ring-black/10"
          >
            <option value={0}>Untimed</option>
            {[10, 15, 25, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-ink-soft">
          {pool} questions match{pool < count ? `, so the test will have ${pool}` : ''}.
        </p>
        <button className="btn-primary mt-auto" disabled={!pool} onClick={go}>
          Start custom test
        </button>
      </div>
    </div>
  );
}
