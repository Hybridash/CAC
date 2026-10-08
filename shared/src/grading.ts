import type { QuizAnswer, QuizQuestion } from './types';

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
