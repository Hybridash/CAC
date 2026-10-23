import { OLY_TOPICS, type OlyQuestion, type OlyTestSpec } from '../../olympiad';
import { CELL } from './cell';
import { PLANTS } from './plants';
import { ANIMALS } from './animals';
import { GENETICS } from './genetics';
import { ECOLOGY } from './ecology';
import { ETHOLOGY } from './ethology';
import { SYSTEMATICS } from './systematics';

/** Questions whose options read in a natural order (sizes, rising values), so must not be reordered. */
const ORDERED = new Set(['ecology-2', 'ethology-3', 'ethology-6', 'animals-22']);
const numeric = (options: string[]) => options.every((o) => /^[−+-]?\d/.test(o));

/**
 * Spread the correct answers evenly over A–E, so guessing a favorite letter never pays.
 * Options with a natural order are left alone; for the rest only the right answer moves.
 */
function balance(questions: OlyQuestion[]): OlyQuestion[] {
  let k = 0;
  return questions.map((q) => {
    if (q.format !== 'single' || ORDERED.has(q.id) || numeric(q.options)) return q;
    const slot = k++ % q.options.length;
    const options = [...q.options];
    const [right] = options.splice(q.answer, 1);
    options.splice(slot, 0, right);
    return { ...q, options, answer: slot };
  });
}

/** Every Bio Olympiad practice question. */
export const OLY_QUESTIONS: OlyQuestion[] = balance([
  ...CELL,
  ...PLANTS,
  ...ANIMALS,
  ...GENETICS,
  ...ECOLOGY,
  ...ETHOLOGY,
  ...SYSTEMATICS,
]);

export const OLY_BY_ID: Record<string, OlyQuestion> = Object.fromEntries(
  OLY_QUESTIONS.map((q) => [q.id, q]),
);

/** Ready-made practice tests, from a quick warm-up to a full first-round mock exam. */
export const OLY_TESTS: OlyTestSpec[] = [
  {
    id: 'quick-10',
    title: 'Quick 10',
    blurb: 'Ten mixed questions from every topic. A good daily warm-up.',
    count: 10,
    minutes: 15,
    filter: {},
  },
  {
    id: 'open-mock',
    title: 'Open Round Mock Exam',
    blurb:
      'A full first-round style exam: 50 multiple-choice questions across the whole syllabus, about a minute each.',
    count: 50,
    minutes: 60,
    filter: { formats: ['single'], levels: [1, 2] },
    weighted: true,
  },
  {
    id: 'semifinal',
    title: 'Semifinal Challenge',
    blurb: 'Harder questions, true/false sets and data tables, mixed like a second-round paper.',
    count: 20,
    minutes: 45,
    filter: { levels: [2, 3] },
    weighted: true,
  },
  {
    id: 'data-drill',
    title: 'Data Interpretation Drill',
    blurb:
      'Every question comes with a table of results to analyze. Read carefully, then calculate.',
    count: 15,
    minutes: 35,
    filter: { skills: ['data'] },
  },
  {
    id: 'tf-gauntlet',
    title: 'True/False Gauntlet',
    blurb:
      'International-style statement sets. Each statement you judge correctly earns a quarter point.',
    count: 12,
    minutes: 30,
    filter: { formats: ['truefalse'] },
  },
  // One focused test per topic.
  ...OLY_TOPICS.map((t): OlyTestSpec => ({
    id: `topic-${t.id}`,
    title: t.name,
    blurb: `Focus on ${t.name.toLowerCase()} only.`,
    count: 10,
    minutes: 18,
    filter: { topics: [t.id] },
  })),
];

export const OLY_TEST_BY_ID: Record<string, OlyTestSpec> = Object.fromEntries(
  OLY_TESTS.map((t) => [t.id, t]),
);
