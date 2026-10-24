import { motion } from 'framer-motion';
import {
  gradeOly,
  OLY_FORMAT_LABEL,
  OLY_LEVEL_LABEL,
  OLY_SKILL_LABEL,
  OLY_TOPIC_BY_ID,
  type OlyAnswer,
  type OlyLevel,
  type OlyQuestion,
  type OlyTable,
  type OlyTopic,
} from '@bioplay/shared';
import { Icon, type IconName } from '../components/Icon';

const LETTERS = 'ABCDE';

export const TOPIC_ICON: Record<OlyTopic, IconName> = {
  cell: 'microscope',
  plants: 'sprout',
  animals: 'heart',
  genetics: 'dna',
  ecology: 'globe',
  ethology: 'brain',
  systematics: 'microbe',
};

export function TopicChip({ topic }: { topic: OlyTopic }) {
  const t = OLY_TOPIC_BY_ID[topic];
  return (
    <span className="chip" style={{ background: t.tint, color: t.color }}>
      <Icon name={TOPIC_ICON[topic]} size={16} /> {t.short}
    </span>
  );
}

export function LevelChip({ level }: { level: OlyLevel }) {
  const style = {
    1: 'bg-sky-100 text-sky-900',
    2: 'bg-violet-100 text-violet-900',
    3: 'bg-amber-200 text-amber-950',
  }[level];
  return (
    <span className={`chip ${style}`} title={`Difficulty: ${OLY_LEVEL_LABEL[level]}`}>
      {'●'.repeat(level)}
      <span className="opacity-30">{'●'.repeat(3 - level)}</span> {OLY_LEVEL_LABEL[level]}
    </span>
  );
}

/** Topic, level, format and skill chips for a question. */
export function QuestionMeta({ q }: { q: OlyQuestion }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      <TopicChip topic={q.topic} />
      <LevelChip level={q.level} />
      <span className="chip bg-slate-100 text-ink-soft">{OLY_FORMAT_LABEL[q.format]}</span>
      <span className="chip bg-slate-100 text-ink-soft">{OLY_SKILL_LABEL[q.skill]}</span>
    </div>
  );
}

function DataTable({ table }: { table: OlyTable }) {
  return (
    <figure className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-black/10">
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="bg-slate-50 px-3 py-2 text-left text-xs font-extrabold text-ink-soft">
          <Icon name="clipboard" size={16} className="-mt-0.5 mr-1" />
          {table.caption}
        </caption>
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="border-b-2 border-slate-200 px-3 py-2 text-left font-extrabold"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className="odd:bg-slate-50/60">
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-3 py-1.5 text-left font-bold">
                    {cell}
                  </th>
                ) : (
                  <td
                    key={j}
                    className={`px-3 py-1.5 ${typeof cell === 'number' ? 'font-mono' : ''}`}
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/**
 * One olympiad question. In answer mode the player picks options; with `reveal` it shows what was
 * right, what the player chose, and the explanation.
 */
export function QuestionView({
  q,
  answer,
  onAnswer,
  reveal = false,
  number,
}: {
  q: OlyQuestion;
  answer: OlyAnswer;
  onAnswer?: (a: OlyAnswer) => void;
  reveal?: boolean;
  number?: number;
}) {
  const locked = reveal || !onAnswer;
  const points = gradeOly(q, answer);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-lg leading-relaxed font-semibold">
        {q.stem.split('\n\n').map((p, i) => (
          <p key={i}>
            {i === 0 && number !== undefined && (
              <span className="mr-2 font-display font-extrabold text-indigo-700">{number}.</span>
            )}
            {p}
          </p>
        ))}
      </div>
      {q.table && <DataTable table={q.table} />}

      {q.format === 'single' ? (
        <div
          className="grid gap-2"
          role="radiogroup"
          aria-label={`Question ${number ?? ''} options`}
        >
          {q.options.map((opt, i) => {
            const chosen = answer === i;
            const right = reveal && i === q.answer;
            const wrong = reveal && chosen && i !== q.answer;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={chosen}
                disabled={locked}
                onClick={() => onAnswer?.(chosen ? null : i)}
                className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 text-left font-semibold ring-2 transition disabled:cursor-default ${
                  right
                    ? 'bg-emerald-50 ring-emerald-400'
                    : wrong
                      ? 'bg-rose-50 ring-rose-300'
                      : chosen
                        ? 'bg-indigo-50 ring-indigo-400'
                        : 'bg-surface ring-black/10 enabled:hover:ring-indigo-200'
                }`}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display font-extrabold ${
                    right
                      ? 'bg-emerald-500 text-white'
                      : wrong
                        ? 'bg-rose-400 text-white'
                        : chosen
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-ink-soft'
                  }`}
                >
                  {right ? <Icon name="check" size={20} /> : LETTERS[i]}
                </span>
                <span className="self-center">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {q.statements.map((s, i) => {
            const a = Array.isArray(answer) ? answer[i] : null;
            const right = reveal && a === s.answer;
            const wrong = reveal && a !== null && a !== s.answer;
            const set = (v: boolean) => {
              const next = Array.isArray(answer) ? [...answer] : q.statements.map(() => null);
              next[i] = next[i] === v ? null : v;
              onAnswer?.(next);
            };
            return (
              <li
                key={i}
                className={`flex flex-col gap-2 rounded-2xl p-3 ring-2 sm:flex-row sm:items-center ${
                  right
                    ? 'bg-emerald-50 ring-emerald-300'
                    : wrong
                      ? 'bg-rose-50 ring-rose-200'
                      : 'bg-surface ring-black/10'
                }`}
              >
                <p className="flex-1 font-semibold">
                  <span className="mr-2 font-display font-extrabold text-indigo-700">
                    {['i', 'ii', 'iii', 'iv'][i]}.
                  </span>
                  {s.text}
                </p>
                <div
                  className="flex shrink-0 gap-1.5"
                  role="radiogroup"
                  aria-label={`Statement ${i + 1}: ${s.text}`}
                >
                  {[true, false].map((v) => {
                    const on = a === v;
                    const isAnswer = reveal && s.answer === v;
                    return (
                      <button
                        key={String(v)}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={locked}
                        onClick={() => set(v)}
                        className={`min-w-20 rounded-xl px-3 py-1.5 text-sm font-extrabold ring-2 transition disabled:cursor-default ${
                          on
                            ? v
                              ? 'bg-emerald-600 text-white ring-emerald-600'
                              : 'bg-rose-600 text-white ring-rose-600'
                            : 'bg-surface text-ink-soft ring-black/10 enabled:hover:ring-indigo-200'
                        } ${isAnswer && !on ? 'ring-emerald-500 ring-dashed' : ''}`}
                      >
                        {v ? 'True' : 'False'}
                      </button>
                    );
                  })}
                </div>
                {reveal && (
                  <span
                    className={`text-xs font-extrabold sm:w-24 sm:text-right ${right ? 'text-emerald-700' : 'text-rose-700'}`}
                  >
                    {right ? '✓ ' : a === null ? 'Blank · ' : '✗ '}
                    {s.answer ? 'True' : 'False'}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {reveal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 ring-2 ${
            points === 1
              ? 'bg-emerald-50 ring-emerald-200'
              : points > 0
                ? 'bg-amber-50 ring-amber-200'
                : 'bg-slate-50 ring-slate-200'
          }`}
          role="status"
        >
          <p className="mb-1 flex items-center gap-2 font-display text-lg font-extrabold">
            <Icon name={points === 1 ? 'party' : 'bulb'} size={24} />
            {points === 1
              ? 'Correct!'
              : points > 0
                ? `Partly right: ${points * 4} of 4 statements`
                : answer === null
                  ? 'Not answered'
                  : 'Not quite'}
            <span className="ml-auto text-sm text-ink-soft">
              {points % 1 ? points.toFixed(2) : points} / 1 point
            </span>
          </p>
          <p className="leading-relaxed text-ink-soft">{q.explain}</p>
        </motion.div>
      )}
    </div>
  );
}

/** A circular percentage dial. */
export function ScoreRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${pct}%`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct / 100) }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fill="#1e1b2e"
        fontFamily="Newsreader, Georgia, serif"
      >
        {pct}%
      </text>
    </svg>
  );
}

export const pctOf = (points: number, max: number) => (max ? Math.round((points / max) * 100) : 0);

export const fmtPoints = (p: number) => (Number.isInteger(p) ? String(p) : p.toFixed(2));
