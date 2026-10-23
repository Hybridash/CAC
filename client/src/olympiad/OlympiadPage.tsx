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
import { useOlympiad } from './store';
import { fmtPoints, pctOf, TOPIC_ICON } from './QuestionView';

const FEATURED = ['quick-10', 'open-mock', 'semifinal', 'data-drill', 'tf-gauntlet'];
const FEATURED_STYLE: Record<string, string> = {
  'quick-10': 'from-emerald-500 to-teal-600',
  'open-mock': 'from-indigo-600 to-violet-700',
  semifinal: 'from-fuchsia-600 to-rose-600',
  'data-drill': 'from-sky-500 to-indigo-600',
  'tf-gauntlet': 'from-amber-500 to-orange-600',
};

export function OlympiadPage() {
  const practice = useOlympiad((s) => s.practice);
  const attempts = useOlympiad((s) => s.attempts);
  const active = useOlympiad((s) => s.active);
  const tried = Object.keys(practice).length;
  const right = Object.values(practice).filter((p) => p.correct).length;
  const best = attempts.reduce((m, a) => Math.max(m, pctOf(a.points, a.max)), 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-violet-800 to-amber-600 px-5 py-8 text-white sm:px-8">
        <motion.span
          className="absolute -top-6 right-4 opacity-25 sm:right-10"
          animate={{ rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          aria-hidden
        >
          <Icon name="medal" size={180} />
        </motion.span>
        <span className="chip bg-white/15 text-white ring-1 ring-white/25">
          <Icon name="trophy" size={18} /> Competition prep
        </span>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Bio Olympiad</h1>
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
          className="card flex items-center gap-3 bg-amber-50 p-4 ring-2 ring-amber-300 transition hover:-translate-y-0.5"
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
        <section className="card flex flex-col gap-3 p-5" aria-labelledby="practice-h">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="practice-h" className="flex items-center gap-2 text-2xl font-extrabold">
                <Icon name="target" size={30} /> Practice questions
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
          <ul className="grid gap-2 sm:grid-cols-2">
            {OLY_TOPICS.map((t) => {
              const qs = OLY_QUESTIONS.filter((q) => q.topic === t.id);
              const done = qs.filter((q) => practice[q.id]?.correct).length;
              return (
                <li key={t.id}>
                  <Link
                    to={`/olympiad/practice?topic=${t.id}`}
                    className="flex items-center gap-2 rounded-2xl p-2 ring-1 ring-black/5 transition hover:ring-black/15"
                    style={{ background: t.tint }}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70">
                      <Icon name={TOPIC_ICON[t.id]} size={26} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-sm font-extrabold"
                        style={{ color: t.color }}
                      >
                        {t.name}
                      </span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/80">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${pctOf(done, qs.length)}%`, background: t.color }}
                        />
                      </span>
                    </span>
                    <span className="text-xs font-extrabold text-ink-soft">
                      {done}/{qs.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card flex flex-col gap-3 p-5" aria-labelledby="rounds-h">
          <h2 id="rounds-h" className="flex items-center gap-2 text-2xl font-extrabold">
            <Icon name="book" size={30} /> How olympiad exams work
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
          <Icon name="clock" size={34} /> Practice tests
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OLY_TESTS.filter((t) => FEATURED.includes(t.id)).map((t) => {
            const n = Math.min(t.count, filterOly(OLY_QUESTIONS, t.filter).length);
            const last = attempts.find((a) => a.testId === t.id);
            return (
              <li key={t.id}>
                <Link
                  to={`/olympiad/test/${t.id}`}
                  className={`flex h-full flex-col gap-2 rounded-3xl bg-gradient-to-br ${FEATURED_STYLE[t.id]} p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
                >
                  <h3 className="text-2xl font-extrabold">{t.title}</h3>
                  <p className="flex-1 text-sm text-white/85">{t.blurb}</p>
                  <div className="flex flex-wrap gap-1.5 text-sm">
                    <span className="chip bg-white/20 text-white">{n} questions</span>
                    <span className="chip bg-white/20 text-white">
                      {t.minutes ? `${t.minutes} min` : 'Untimed'}
                    </span>
                    {last && (
                      <span className="chip bg-white text-ink">
                        Last: {pctOf(last.points, last.max)}%
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <div className="card flex h-full flex-col gap-3 p-5">
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
          <ul className="card divide-y divide-black/5">
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
    <div className="rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/20">
      <p className="text-[11px] font-extrabold tracking-wider text-white/70 uppercase">{label}</p>
      <p className="font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Round({ level, text }: { level: OlyLevel; text: string }) {
  return (
    <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-600 font-display font-extrabold text-white">
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
      className="card grid gap-x-8 gap-y-3 p-5 ring-2 ring-indigo-100 md:grid-cols-2"
      data-testid="oly-custom"
    >
      <h3 className="flex items-center gap-2 text-2xl font-extrabold md:col-span-2">
        <Icon name="flask" size={28} /> Build your own test
      </h3>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-extrabold tracking-wider text-ink-soft uppercase">
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
                className={`chip py-1 text-xs ring-1 ring-black/10 ${on ? 'bg-indigo-600 text-white' : 'bg-white'}`}
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
