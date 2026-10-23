import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  gradeOly,
  OLY_BY_ID,
  OLY_LEVEL_LABEL,
  OLY_TOPIC_BY_ID,
  OLY_TOPICS,
  scoreOly,
  type OlyLevel,
  type OlyTopic,
} from '@bioplay/shared';
import { Icon } from '../components/Icon';
import { useOlympiad } from './store';
import {
  fmtPoints,
  pctOf,
  QuestionMeta,
  QuestionView,
  ScoreRing,
  TOPIC_ICON,
} from './QuestionView';

export function ReviewPage() {
  const { attemptId = '' } = useParams();
  const attempt = useOlympiad((s) => s.attempts.find((a) => a.id === attemptId));
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const questions = useMemo(
    () => (attempt ? attempt.questionIds.map((id) => OLY_BY_ID[id]).filter(Boolean) : []),
    [attempt],
  );

  if (!attempt) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-3xl font-extrabold">Result not found</h1>
        <p className="text-ink-soft">Test results are saved on the device you took the test on.</p>
        <Link to="/olympiad" className="btn-primary mt-4">
          Back to Bio Olympiad
        </Link>
      </div>
    );
  }

  const score = scoreOly(questions, attempt.answers);
  const pct = pctOf(score.points, score.max);
  const mins = Math.max(1, Math.round((attempt.finishedAt - attempt.startedAt) / 60_000));
  const missed = questions.filter((q) => gradeOly(q, attempt.answers[q.id] ?? null) < 1);
  const shown = onlyMistakes ? missed : questions;
  const retake = `/olympiad/test/${attempt.testId}${attempt.query ? `?${attempt.query}` : ''}`;
  const verdict =
    pct >= 85
      ? 'Outstanding work!'
      : pct >= 70
        ? 'Strong result. Polish the topics below to push higher.'
        : pct >= 50
          ? 'Solid start. Review the explanations and try again.'
          : 'Every expert started here. Read the explanations, then retake it.';

  return (
    <div className="flex flex-col gap-5" data-testid="oly-review">
      <Link to="/olympiad" className="text-sm font-bold text-ink-soft hover:underline">
        ← Bio Olympiad
      </Link>
      <section className="card flex flex-col items-center gap-5 p-5 sm:flex-row sm:p-7">
        <ScoreRing pct={pct} size={140} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-extrabold tracking-wider text-ink-soft uppercase">
            {attempt.title} · {new Date(attempt.finishedAt).toLocaleDateString()}
          </p>
          <h1 className="text-4xl font-extrabold" data-testid="oly-score">
            {fmtPoints(score.points)} / {score.max} points
          </h1>
          <p className="mt-1 text-lg text-ink-soft">{verdict}</p>
          <p className="mt-2 flex flex-wrap justify-center gap-2 text-sm sm:justify-start">
            <span className="chip bg-slate-100">
              <Icon name="clock" size={16} /> {mins} min
              {attempt.minutes ? ` of ${attempt.minutes}` : ''}
            </span>
            {attempt.timedOut && (
              <span className="chip bg-rose-100 text-rose-800">Time ran out</span>
            )}
            <span className="chip bg-slate-100">{missed.length} to review</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link to={retake} className="btn-primary">
            ↺ Retake (new questions)
          </Link>
          {missed.length > 0 && (
            <Link
              to={`/olympiad/practice?ids=${missed.map((q) => q.id).join(',')}`}
              className="btn-ghost"
            >
              Practice the {missed.length} I missed
            </Link>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Breakdown
          title="By topic"
          rows={OLY_TOPICS.filter((t) => score.byTopic[t.id]).map(({ id: t }) => ({
            key: t,
            label: (
              <>
                <Icon name={TOPIC_ICON[t as OlyTopic]} size={18} />{' '}
                {OLY_TOPIC_BY_ID[t as OlyTopic].short}
              </>
            ),
            color: OLY_TOPIC_BY_ID[t as OlyTopic].color,
            ...score.byTopic[t]!,
          }))}
        />
        <Breakdown
          title="By level"
          rows={Object.entries(score.byLevel).map(([l, v]) => ({
            key: l,
            label: OLY_LEVEL_LABEL[Number(l) as OlyLevel],
            color: ['', '#0ea5e9', '#8b5cf6', '#f59e0b'][Number(l)],
            ...v!,
          }))}
        />
      </div>

      <section aria-labelledby="answers-h" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="answers-h" className="text-3xl font-extrabold">
            Answers & explanations
          </h2>
          <label className="ml-auto flex cursor-pointer items-center gap-2 font-bold">
            <input
              type="checkbox"
              checked={onlyMistakes}
              onChange={(e) => setOnlyMistakes(e.target.checked)}
              className="h-5 w-5 accent-indigo-600"
            />
            Only show mistakes
          </label>
        </div>
        {shown.length === 0 && (
          <p className="card p-6 text-center font-bold text-emerald-800">
            <Icon name="trophy" size={32} /> No mistakes. A perfect paper!
          </p>
        )}
        {shown.map((q) => {
          const i = questions.indexOf(q);
          return (
            <article key={q.id} className="card flex flex-col gap-3 p-4 sm:p-5">
              <QuestionMeta q={q} />
              <QuestionView q={q} number={i + 1} answer={attempt.answers[q.id] ?? null} reveal />
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: React.ReactNode; color: string; points: number; max: number }[];
}) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => {
          const pct = pctOf(r.points, r.max);
          return (
            <li key={r.key} className="flex items-center gap-2 text-sm">
              <span className="flex w-28 shrink-0 items-center gap-1 font-bold">{r.label}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: r.color }}
                />
              </span>
              <span className="w-20 text-right font-extrabold">
                {fmtPoints(r.points)}/{r.max}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
