import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  filterOly,
  gradeOly,
  isAnswered,
  OLY_FORMAT_LABEL,
  OLY_LEVEL_LABEL,
  OLY_QUESTIONS,
  OLY_SKILL_LABEL,
  OLY_TOPICS,
  type OlyAnswer,
  type OlyQuestion,
} from '@bioplay/shared';
import { Icon } from '../components/Icon';
import { sfx } from '../lib/sound';
import { useOlympiad } from './store';
import { readFilter, toggleParam, type OlyStatus } from './filters';
import { QuestionMeta, QuestionView, TOPIC_ICON } from './QuestionView';

const PAGE = 10;

const STATUS: { id: OlyStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'Not tried yet' },
  { id: 'wrong', label: 'Got wrong' },
  { id: 'right', label: 'Got right' },
  { id: 'saved', label: 'Bookmarked' },
];

export function PracticePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [shown, setShown] = useState(PAGE);
  const practice = useOlympiad((s) => s.practice);
  const bookmarks = useOlympiad((s) => s.bookmarks);
  const f = useMemo(() => readFilter(params), [params]);

  const results = useMemo(() => {
    const base = filterOly(OLY_QUESTIONS, f);
    return base.filter((q) => {
      const p = practice[q.id];
      switch (f.status) {
        case 'new':
          return !p;
        case 'wrong':
          return p && !p.correct;
        case 'right':
          return p?.correct;
        case 'saved':
          return bookmarks.includes(q.id);
        default:
          return true;
      }
    });
    // Practice results are read once per filter change, so answering doesn't make cards vanish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, bookmarks]);

  const update = (next: URLSearchParams) => {
    setShown(PAGE);
    setParams(next, { replace: true });
  };
  const toggle = (key: string, value: string) => update(toggleParam(params, key, value));
  const active = (key: string, value: string) => (params.get(key) ?? '').split(',').includes(value);
  const filtered = [...params.keys()].some((k) => k !== 'status') || f.status !== 'all';

  const testFromFilters = () => {
    const p = new URLSearchParams(params);
    if (f.status !== 'all') {
      p.delete('status');
      p.set('ids', results.map((q) => q.id).join(','));
    }
    p.set('n', String(Math.min(20, results.length)));
    p.set('min', String(Math.max(5, Math.ceil(Math.min(20, results.length) * 1.5))));
    navigate(`/olympiad/test/custom?${p}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <Link to="/olympiad" className="text-sm font-bold text-ink-soft hover:underline">
          ← Bio Olympiad
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-4xl font-extrabold">
          <Icon name="target" size={40} /> Practice questions
        </h1>
        <p className="max-w-2xl text-ink-soft">
          Filter the question bank, answer at your own pace and read the full explanation after each
          one. Your results are remembered, so you can come back to the ones you missed.
        </p>
      </header>

      <section className="card flex flex-col gap-3 p-4" aria-label="Filters">
        <label className="relative">
          <span className="sr-only">Search questions</span>
          <input
            type="search"
            value={params.get('q') ?? ''}
            onChange={(e) => {
              const p = new URLSearchParams(params);
              if (e.target.value) p.set('q', e.target.value);
              else p.delete('q');
              update(p);
            }}
            placeholder="Search: e.g. “Hardy-Weinberg”, “stomata”, “kidney”…"
            className="w-full rounded-2xl bg-slate-50 py-2.5 pr-4 pl-10 font-semibold ring-1 ring-black/10 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" aria-hidden>
            🔎
          </span>
        </label>
        <FilterRow label="Topic">
          {OLY_TOPICS.map((t) => (
            <Chip
              key={t.id}
              on={active('topic', t.id)}
              onClick={() => toggle('topic', t.id)}
              color={t.color}
            >
              <Icon name={TOPIC_ICON[t.id]} size={16} /> {t.short}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Level">
          {([1, 2, 3] as const).map((l) => (
            <Chip
              key={l}
              on={active('level', String(l))}
              onClick={() => toggle('level', String(l))}
            >
              {OLY_LEVEL_LABEL[l]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Format">
          {(['single', 'truefalse'] as const).map((x) => (
            <Chip key={x} on={active('format', x)} onClick={() => toggle('format', x)}>
              {OLY_FORMAT_LABEL[x]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Skill">
          {(['recall', 'reasoning', 'data'] as const).map((x) => (
            <Chip key={x} on={active('skill', x)} onClick={() => toggle('skill', x)}>
              {OLY_SKILL_LABEL[x]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Show">
          {STATUS.map((s) => (
            <Chip
              key={s.id}
              on={f.status === s.id}
              onClick={() => {
                const p = new URLSearchParams(params);
                if (s.id === 'all') p.delete('status');
                else p.set('status', s.id);
                update(p);
              }}
            >
              {s.label}
            </Chip>
          ))}
        </FilterRow>
        <div className="flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
          <p className="font-extrabold" aria-live="polite" data-testid="oly-count">
            {results.length} of {OLY_QUESTIONS.length} questions
          </p>
          {filtered && (
            <button
              className="btn-ghost px-3 py-1.5 text-sm"
              onClick={() => update(new URLSearchParams())}
            >
              Clear filters
            </button>
          )}
          <button
            className="btn-primary ml-auto px-3 py-1.5 text-sm"
            disabled={!results.length}
            onClick={testFromFilters}
          >
            <Icon name="clock" size={18} /> Timed test from these ({Math.min(20, results.length)})
          </button>
        </div>
      </section>

      {results.length ? (
        <ol className="flex flex-col gap-4">
          {results.slice(0, shown).map((q, i) => (
            <li key={q.id}>
              <PracticeCard q={q} number={i + 1} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="card p-8 text-center">
          <Icon name="microscope" size={56} />
          <p className="mt-2 text-lg font-extrabold">No questions match these filters.</p>
          <p className="text-ink-soft">Try removing a filter or two.</p>
        </div>
      )}
      {shown < results.length && (
        <button className="btn-ghost self-center" onClick={() => setShown((s) => s + PAGE)}>
          Show {Math.min(PAGE, results.length - shown)} more
        </button>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
      <span className="w-16 shrink-0 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  color = '#4f46e5',
  children,
}: {
  on: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="chip py-1 ring-1 transition"
      style={
        on
          ? { background: color, color: 'white', ['--tw-ring-color' as string]: color }
          : {
              background: 'white',
              color: '#4b4763',
              ['--tw-ring-color' as string]: 'rgba(0,0,0,0.1)',
            }
      }
    >
      {children}
    </button>
  );
}

function PracticeCard({ q, number }: { q: OlyQuestion; number: number }) {
  const [answer, setAnswer] = useState<OlyAnswer>(null);
  const [checked, setChecked] = useState(false);
  const last = useOlympiad((s) => s.practice[q.id]);
  const saved = useOlympiad((s) => s.bookmarks.includes(q.id));
  const record = useOlympiad((s) => s.recordPractice);
  const toggleBookmark = useOlympiad((s) => s.toggleBookmark);

  const check = () => {
    const correct = gradeOly(q, answer) === 1;
    if (correct) sfx.correct();
    else sfx.nope();
    record(q.id, correct);
    setChecked(true);
  };

  return (
    <article className="card flex flex-col gap-4 p-4 sm:p-5" data-testid="oly-question">
      <div className="flex flex-wrap items-center gap-2">
        <QuestionMeta q={q} />
        <span className="ml-auto flex items-center gap-2">
          {last && (
            <span
              className={`chip text-xs ${last.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
            >
              {last.correct ? '✓ Got it before' : '✗ Missed before'}
            </span>
          )}
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark this question'}
            onClick={() => toggleBookmark(q.id)}
            className={`grid h-9 w-9 place-items-center rounded-full text-lg ring-1 transition ${saved ? 'bg-amber-300 ring-amber-400' : 'bg-white ring-black/10 hover:bg-amber-50'}`}
          >
            {saved ? '★' : '☆'}
          </button>
        </span>
      </div>
      <QuestionView
        q={q}
        number={number}
        answer={answer}
        onAnswer={checked ? undefined : setAnswer}
        reveal={checked}
      />
      <div className="flex justify-end gap-2">
        <AnimatePresence mode="wait">
          {checked ? (
            <motion.button
              key="again"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="btn-ghost"
              onClick={() => {
                setAnswer(null);
                setChecked(false);
              }}
            >
              ↺ Try again
            </motion.button>
          ) : (
            <motion.button
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="btn-primary"
              disabled={!isAnswered(q, answer)}
              onClick={check}
            >
              Check answer
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
