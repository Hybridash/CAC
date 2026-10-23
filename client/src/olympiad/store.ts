import { create } from 'zustand';
import { gradeOly, OLY_BY_ID, scoreOly, type OlyAnswer } from '@bioplay/shared';
import { storage } from '../lib/api';

/** A finished practice test. */
export interface OlyAttempt {
  id: string;
  testId: string;
  title: string;
  /** Search string that rebuilds a custom test (so it can be retaken). */
  query?: string;
  questionIds: string[];
  answers: Record<string, OlyAnswer>;
  startedAt: number;
  finishedAt: number;
  minutes: number | null;
  timedOut: boolean;
  points: number;
  max: number;
}

/** The test currently being taken; kept in storage so a refresh never loses it. */
export interface OlyActive {
  testId: string;
  title: string;
  query?: string;
  questionIds: string[];
  answers: Record<string, OlyAnswer>;
  flagged: string[];
  index: number;
  startedAt: number;
  minutes: number | null;
  /** When time runs out (ms since epoch), or null for untimed tests. */
  deadline: number | null;
}

interface Saved {
  /** Latest practice result per question. */
  practice: Record<string, { correct: boolean; at: number }>;
  bookmarks: string[];
  attempts: OlyAttempt[];
  active: OlyActive | null;
}

interface OlyState extends Saved {
  recordPractice: (id: string, correct: boolean) => void;
  toggleBookmark: (id: string) => void;
  start: (a: Omit<OlyActive, 'answers' | 'flagged' | 'index' | 'startedAt' | 'deadline'>) => void;
  update: (patch: Partial<OlyActive>) => void;
  /** Grade the active test, save it to history and return it. */
  finish: (timedOut?: boolean) => OlyAttempt | null;
  discard: () => void;
}

const KEY = 'biobites.olympiad';
const MAX_ATTEMPTS = 60;

function load(): Saved {
  const empty: Saved = { practice: {}, bookmarks: [], attempts: [], active: null };
  try {
    const raw = storage.get(KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Saved>) } : empty;
  } catch {
    return empty;
  }
}

export const useOlympiad = create<OlyState>((set, get) => ({
  ...load(),

  recordPractice: (id, correct) =>
    set((s) => ({ practice: { ...s.practice, [id]: { correct, at: Date.now() } } })),

  toggleBookmark: (id) =>
    set((s) => ({
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((b) => b !== id)
        : [...s.bookmarks, id],
    })),

  start: (a) =>
    set({
      active: {
        ...a,
        answers: {},
        flagged: [],
        index: 0,
        startedAt: Date.now(),
        deadline: a.minutes ? Date.now() + a.minutes * 60_000 : null,
      },
    }),

  update: (patch) => set((s) => (s.active ? { active: { ...s.active, ...patch } } : {})),

  finish: (timedOut = false) => {
    const a = get().active;
    if (!a) return null;
    const questions = a.questionIds.map((id) => OLY_BY_ID[id]).filter(Boolean);
    const score = scoreOly(questions, a.answers);
    const attempt: OlyAttempt = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      testId: a.testId,
      title: a.title,
      query: a.query,
      questionIds: a.questionIds,
      answers: a.answers,
      startedAt: a.startedAt,
      finishedAt: Date.now(),
      minutes: a.minutes,
      timedOut,
      points: score.points,
      max: score.max,
    };
    // Answered test questions count as practice too, so "got wrong" filters include them.
    const practice = { ...get().practice };
    for (const q of questions) {
      const ans = a.answers[q.id];
      if (ans === undefined || ans === null) continue;
      practice[q.id] = { correct: gradeOly(q, ans) === 1, at: attempt.finishedAt };
    }
    set((s) => ({
      active: null,
      practice,
      attempts: [attempt, ...s.attempts].slice(0, MAX_ATTEMPTS),
    }));
    return attempt;
  },

  discard: () => set({ active: null }),
}));

useOlympiad.subscribe((s) => {
  const saved: Saved = {
    practice: s.practice,
    bookmarks: s.bookmarks,
    attempts: s.attempts,
    active: s.active,
  };
  storage.set(KEY, JSON.stringify(saved));
});
