/**
 * Bio Olympiad practice: question types, grading, filtering and test building.
 * The questions themselves live in data/olympiad. They are original, written in the style of
 * national and international biology olympiad exams (not copied from any real paper).
 */

export type OlyTopic =
  'cell' | 'plants' | 'animals' | 'genetics' | 'ecology' | 'ethology' | 'systematics';

/** 1 = first-round (open) exam, 2 = semifinal, 3 = international level. */
export type OlyLevel = 1 | 2 | 3;

/** What the question mainly tests. */
export type OlySkill = 'recall' | 'reasoning' | 'data';

/** A small data table shown with the question. */
export interface OlyTable {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}

interface OlyBase {
  id: string;
  topic: OlyTopic;
  level: OlyLevel;
  skill: OlySkill;
  /** The question text. Blank lines separate paragraphs. */
  stem: string;
  table?: OlyTable;
  /** Why the answer is right (and the tempting wrong answers are wrong). */
  explain: string;
}

/** Classic multiple choice: one best answer out of 4–5 options. */
export interface OlySingle extends OlyBase {
  format: 'single';
  options: string[];
  answer: number;
}

/** Multi-statement true/false: judge each statement (the semifinal / international format). */
export interface OlyTrueFalse extends OlyBase {
  format: 'truefalse';
  statements: { text: string; answer: boolean }[];
}

export type OlyQuestion = OlySingle | OlyTrueFalse;
export type OlyFormat = OlyQuestion['format'];

/** A player's answer: an option index, or one true/false judgement per statement. */
export type OlyAnswer = number | (boolean | null)[] | null;

export const OLY_TOPICS: {
  id: OlyTopic;
  name: string;
  short: string;
  color: string;
  tint: string;
  /** Approximate share of a full olympiad exam. Used to mix full-length practice tests. */
  weight: number;
}[] = [
  {
    id: 'cell',
    name: 'Cell & Molecular Biology',
    short: 'Cell',
    color: '#059669',
    tint: '#d1fae5',
    weight: 20,
  },
  {
    id: 'plants',
    name: 'Plant Anatomy & Physiology',
    short: 'Plants',
    color: '#65a30d',
    tint: '#ecfccb',
    weight: 15,
  },
  {
    id: 'animals',
    name: 'Animal Anatomy & Physiology',
    short: 'Animals',
    color: '#e11d48',
    tint: '#ffe4e6',
    weight: 25,
  },
  {
    id: 'genetics',
    name: 'Genetics & Evolution',
    short: 'Genetics',
    color: '#7c3aed',
    tint: '#ede9fe',
    weight: 20,
  },
  {
    id: 'ecology',
    name: 'Ecology',
    short: 'Ecology',
    color: '#0d9488',
    tint: '#ccfbf1',
    weight: 10,
  },
  {
    id: 'ethology',
    name: 'Animal Behavior',
    short: 'Behavior',
    color: '#ea580c',
    tint: '#ffedd5',
    weight: 5,
  },
  {
    id: 'systematics',
    name: 'Biosystematics',
    short: 'Systematics',
    color: '#2563eb',
    tint: '#dbeafe',
    weight: 5,
  },
];

export const OLY_TOPIC_BY_ID = Object.fromEntries(OLY_TOPICS.map((t) => [t.id, t])) as Record<
  OlyTopic,
  (typeof OLY_TOPICS)[number]
>;

export const OLY_LEVEL_LABEL: Record<OlyLevel, string> = {
  1: 'Open round',
  2: 'Semifinal',
  3: 'International',
};

export const OLY_SKILL_LABEL: Record<OlySkill, string> = {
  recall: 'Knowledge',
  reasoning: 'Reasoning',
  data: 'Data analysis',
};

export const OLY_FORMAT_LABEL: Record<OlyFormat, string> = {
  single: 'Multiple choice',
  truefalse: 'True / false set',
};

// ---------------------------------------------------------------- grading

/** Points a question is worth: every question is worth 1. */
export const OLY_MAX_POINTS = 1;

/**
 * Score one answer, from 0 to 1. Multiple choice is all or nothing.
 * True/false sets give a quarter point for each statement judged correctly (unanswered ones score 0).
 */
export function gradeOly(q: OlyQuestion, a: OlyAnswer): number {
  if (q.format === 'single') return a === q.answer ? 1 : 0;
  if (!Array.isArray(a)) return 0;
  const right = q.statements.filter((s, i) => a[i] === s.answer).length;
  return right / q.statements.length;
}

export const isAnswered = (q: OlyQuestion, a: OlyAnswer) =>
  q.format === 'single' ? typeof a === 'number' : Array.isArray(a) && a.every((x) => x !== null);

export interface OlyScore {
  points: number;
  max: number;
  byTopic: Partial<Record<OlyTopic, { points: number; max: number }>>;
  byLevel: Partial<Record<OlyLevel, { points: number; max: number }>>;
}

export function scoreOly(questions: OlyQuestion[], answers: Record<string, OlyAnswer>): OlyScore {
  const s: OlyScore = { points: 0, max: 0, byTopic: {}, byLevel: {} };
  for (const q of questions) {
    const p = gradeOly(q, answers[q.id] ?? null);
    s.points += p;
    s.max += OLY_MAX_POINTS;
    const t = (s.byTopic[q.topic] ??= { points: 0, max: 0 });
    t.points += p;
    t.max += OLY_MAX_POINTS;
    const l = (s.byLevel[q.level] ??= { points: 0, max: 0 });
    l.points += p;
    l.max += OLY_MAX_POINTS;
  }
  return s;
}

// ---------------------------------------------------------------- filtering

export interface OlyFilter {
  topics?: OlyTopic[];
  levels?: OlyLevel[];
  formats?: OlyFormat[];
  skills?: OlySkill[];
  /** Matches words in the question, its options, statements and explanation. */
  text?: string;
  /** Limit to these question ids (e.g. bookmarked or previously missed). */
  ids?: string[];
}

const searchable = (q: OlyQuestion) =>
  [
    q.stem,
    q.explain,
    q.table?.caption ?? '',
    ...(q.format === 'single' ? q.options : q.statements.map((s) => s.text)),
  ]
    .join(' ')
    .toLowerCase();

export function filterOly(questions: OlyQuestion[], f: OlyFilter): OlyQuestion[] {
  const words = (f.text ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const ids = f.ids ? new Set(f.ids) : null;
  return questions.filter(
    (q) =>
      (!f.topics?.length || f.topics.includes(q.topic)) &&
      (!f.levels?.length || f.levels.includes(q.level)) &&
      (!f.formats?.length || f.formats.includes(q.format)) &&
      (!f.skills?.length || f.skills.includes(q.skill)) &&
      (!ids || ids.has(q.id)) &&
      (!words.length || words.every((w) => searchable(q).includes(w))),
  );
}

// ---------------------------------------------------------------- tests

export interface OlyTestSpec {
  id: string;
  title: string;
  blurb: string;
  /** How many questions (fewer if the pool is smaller). */
  count: number;
  /** Time limit in minutes, or null for untimed. */
  minutes: number | null;
  filter: OlyFilter;
  /** Mix topics in proportion to their exam weight instead of picking at random. */
  weighted?: boolean;
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A small seeded random generator, so a test can be rebuilt (and unit tested) from its seed. */
export function seededRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Pick the questions for one sitting of a test. */
export function buildOlyTest(
  spec: OlyTestSpec,
  bank: OlyQuestion[],
  rng: () => number = Math.random,
): OlyQuestion[] {
  const pool = shuffle(filterOly(bank, spec.filter), rng);
  const n = Math.min(spec.count, pool.length);
  if (!spec.weighted) return pool.slice(0, n);

  // Share the questions out by topic weight (largest remainder), then top up from whatever is left.
  const topics = OLY_TOPICS.filter((t) => pool.some((q) => q.topic === t.id));
  const total = topics.reduce((s, t) => s + t.weight, 0);
  const quota = topics.map((t) => ({ id: t.id, exact: (n * t.weight) / total }));
  const take = Object.fromEntries(quota.map((q) => [q.id, Math.floor(q.exact)]));
  let left = n - Object.values(take).reduce((s, v) => s + v, 0);
  for (const q of [...quota].sort((a, b) => (b.exact % 1) - (a.exact % 1))) {
    if (left-- <= 0) break;
    take[q.id]++;
  }
  const picked: OlyQuestion[] = [];
  for (const t of topics) picked.push(...pool.filter((q) => q.topic === t.id).slice(0, take[t.id]));
  const chosen = new Set(picked.map((q) => q.id));
  picked.push(...pool.filter((q) => !chosen.has(q.id)).slice(0, n - picked.length));
  return shuffle(picked, rng);
}

// ---------------------------------------------------------------- validation

/** Problems with a question, as readable strings (empty when it is fine). */
export function validateOly(q: OlyQuestion): string[] {
  const e: string[] = [];
  if (!/^[a-z]+-\d+$/.test(q.id)) e.push(`${q.id}: id should look like "cell-1"`);
  if (!OLY_TOPIC_BY_ID[q.topic]) e.push(`${q.id}: unknown topic ${q.topic}`);
  if (![1, 2, 3].includes(q.level)) e.push(`${q.id}: bad level`);
  if (q.stem.trim().length < 15) e.push(`${q.id}: stem too short`);
  if (q.explain.trim().length < 30) e.push(`${q.id}: explanation too short`);
  if (q.skill === 'data' && !q.table) e.push(`${q.id}: data questions need a table`);
  if (q.table) {
    const w = q.table.columns.length;
    if (w < 2) e.push(`${q.id}: table needs 2+ columns`);
    if (!q.table.rows.length) e.push(`${q.id}: table has no rows`);
    for (const r of q.table.rows) if (r.length !== w) e.push(`${q.id}: ragged table row`);
  }
  if (q.format === 'single') {
    if (q.options.length < 4 || q.options.length > 5) e.push(`${q.id}: needs 4–5 options`);
    if (new Set(q.options).size !== q.options.length) e.push(`${q.id}: duplicate options`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      e.push(`${q.id}: answer out of range`);
    if (q.options.some((o) => /\b(all|none) of the above\b/i.test(o)))
      e.push(`${q.id}: avoid "all/none of the above"`);
  } else {
    if (q.statements.length !== 4) e.push(`${q.id}: true/false sets have 4 statements`);
    const t = q.statements.filter((s) => s.answer).length;
    if (t === 0 || t === q.statements.length) e.push(`${q.id}: mix true and false statements`);
  }
  return e;
}
