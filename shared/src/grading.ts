import type { Mystery, QuizAnswer, QuizQuestion } from './types';

export function isAnswerCorrect(q: QuizQuestion, a: QuizAnswer | undefined): boolean {
  if (a === undefined) return false;
  if (q.kind === 'label') {
    return Array.isArray(a) && a.length === q.pairs.length && a.every((term, def) => term === def);
  }
  return a === q.answer;
}

export function gradeQuiz(quiz: QuizQuestion[], answers: QuizAnswer[]) {
  const results = quiz.map((q, i) => isAnswerCorrect(q, answers[i]));
  return { results, score: results.filter(Boolean).length, outOf: quiz.length };
}

/** A mystery is solved when the right explanation is chosen AND exactly the supporting evidence is selected. */
export function gradeMystery(m: Mystery, explanation: number, evidence: number[]) {
  const chosen = new Set(evidence);
  const explanationCorrect = explanation === m.answer;
  const evidenceCorrect =
    m.evidence.every((e, i) => e.supports === chosen.has(i)) &&
    [...chosen].every((i) => i >= 0 && i < m.evidence.length);
  return { explanationCorrect, evidenceCorrect, correct: explanationCorrect && evidenceCorrect };
}
