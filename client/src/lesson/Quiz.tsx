import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  isAnswerCorrect,
  type Concept,
  type LabelQuestion,
  type QuizAnswer,
  type QuizQuestion,
  type QuizSubmitResponse,
} from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from '../templates/framework/dnd';
import { usePlayer } from '../store/player';
import { sfx } from '../lib/sound';
import { AtpIcon } from '../components/Atp';
import { Icon } from '../components/Icon';

/** Three-question quiz: answer, check (instant gentle feedback), then the server grades & rewards. */
export function Quiz({
  concept,
  onDone,
}: {
  concept: Concept;
  onDone?: (r: QuizSubmitResponse) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(QuizAnswer | undefined)[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitQuiz = usePlayer((s) => s.submitQuiz);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // On phones the feedback lands below the options, out of sight: bring it into view.
  useEffect(() => {
    if (!checked) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    feedbackRef.current?.scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
  }, [checked]);

  const q = concept.quiz[index];
  const answer = answers[index];
  const correct = checked && isAnswerCorrect(q, answer);
  const ready =
    answer !== undefined &&
    (!Array.isArray(answer) ||
      (q.kind === 'label' && answer.filter((x) => x >= 0).length === q.pairs.length));

  // Show options in a random order per question; answers stay indexed by the original position.
  const optionOrder = useMemo(
    () => (q.kind === 'label' ? [] : shuffled(q.options.map((_, i) => i))),
    [q],
  );

  const setAnswer = (a: QuizAnswer) => {
    if (checked) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = a;
      return next;
    });
  };

  const check = () => {
    setChecked(true);
    if (isAnswerCorrect(q, answer)) sfx.correct();
    else sfx.nope();
  };

  const next = async () => {
    if (index < concept.quiz.length - 1) {
      setIndex(index + 1);
      setChecked(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await submitQuiz(concept.id, answers as QuizAnswer[]);
      setResult(r);
      if (r.passed) sfx.fanfare();
      onDone?.(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setAnswers([]);
    setChecked(false);
    setResult(null);
  };

  if (result) {
    const missed = concept.quiz
      .map((question, i) => ({ question, i, given: answers[i] }))
      .filter(({ i }) => !result.results[i]);
    return (
      <div
        className="card flex flex-col items-center gap-3 p-6 text-center"
        data-testid="quiz-result"
      >
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} aria-hidden>
          <Icon name={result.perfect ? 'trophy' : result.passed ? 'party' : 'sprout'} size={72} />
        </motion.div>
        <h3 className="text-2xl font-extrabold">
          {result.score} / {result.outOf} correct
        </h3>
        <p className="text-ink-soft">
          {result.perfect
            ? 'Perfect! You really get this.'
            : result.passed
              ? 'You passed! Nice work.'
              : 'Almost! Have another look at the interaction and try again — no penalty.'}
        </p>
        {result.total > 0 ? (
          <p className="chip bg-amber-100 py-1.5 text-lg text-amber-900">
            <AtpIcon /> +{result.total} ATP
          </p>
        ) : (
          result.passed && (
            <p className="text-sm text-ink-soft">
              You’ve already earned this quiz’s ATP. Come back after 24 hours for a review bonus!
            </p>
          )
        )}
        {missed.length > 0 && (
          <section
            className="mt-2 w-full border-t border-line pt-4 text-left"
            data-testid="quiz-review"
          >
            <h4 className="text-lg font-bold">Review what you missed</h4>
            <ol className="mt-3 grid gap-3">
              {missed.map(({ question, i, given }) => (
                <li key={i} className="rounded-2xl bg-amber-50 p-4 text-amber-950">
                  <p className="text-sm font-bold text-amber-900">Question {i + 1}</p>
                  <p className="mt-0.5 font-semibold">{question.prompt}</p>
                  <WhatWentWrong q={question} answer={given} />
                  <p className="mt-2">{question.explain}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        <button className="btn-ghost" onClick={restart}>
          ↺ Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="quiz">
      <div className="flex items-center justify-between text-sm font-bold text-ink-soft">
        <span>
          Question {index + 1} of {concept.quiz.length}
        </span>
        <span className="font-medium">
          {q.kind === 'mc'
            ? 'Multiple choice'
            : q.kind === 'predict'
              ? 'Predict the outcome'
              : 'Drag to label'}
        </span>
      </div>
      {q.kind === 'predict' && (
        <p className="rounded-2xl bg-violet-50 p-3 font-semibold text-violet-900">{q.scenario}</p>
      )}
      <h3 className="text-xl font-bold">{q.prompt}</h3>

      {q.kind === 'label' ? (
        <LabelQ
          q={q}
          value={(answer as number[]) ?? q.pairs.map(() => -1)}
          onChange={setAnswer}
          checked={checked}
        />
      ) : (
        <div className="grid gap-2" role="radiogroup" aria-label={q.prompt}>
          {optionOrder.map((i) => {
            const opt = q.options[i];
            const chosen = answer === i;
            const showRight = checked && i === q.answer;
            const showWrong = checked && chosen && i !== q.answer;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={chosen}
                disabled={checked}
                onClick={() => setAnswer(i)}
                className={`rounded-2xl px-4 py-3 text-left font-semibold ring-2 transition ${
                  showRight
                    ? 'bg-emerald-50 ring-emerald-400'
                    : showWrong
                      ? 'bg-amber-50 ring-amber-400'
                      : chosen
                        ? 'bg-indigo-50 ring-indigo-400'
                        : 'bg-surface ring-black/10 hover:ring-indigo-200'
                }`}
              >
                {showRight && <Icon name="check" size={20} className="mr-1.5 -mt-0.5" />}
                {showWrong && <Icon name="bulb" size={20} className="mr-1.5 -mt-0.5" />}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {checked && (
        <div
          ref={feedbackRef}
          role="status"
          className={`rounded-2xl p-4 ${correct ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`}
        >
          <p className="flex items-center gap-1.5 font-bold">
            <Icon name={correct ? 'party' : 'bulb'} size={20} />
            {correct ? 'Correct!' : 'Not quite.'}
          </p>
          {!correct && <WhatWentWrong q={q} answer={answer} />}
          <p className="mt-2">{q.explain}</p>
        </div>
      )}
      {error && <p className="text-rose-700">{error}</p>}
      <div className="flex justify-end">
        {!checked ? (
          <button className="btn-primary" disabled={!ready} onClick={check}>
            Check answer
          </button>
        ) : (
          <button className="btn-primary" disabled={busy} onClick={next}>
            {index < concept.quiz.length - 1
              ? 'Next question →'
              : busy
                ? 'Scoring…'
                : 'Finish quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

/** For a wrong answer: what the player chose next to the right answer, so the explanation has context. */
function WhatWentWrong({ q, answer }: { q: QuizQuestion; answer: QuizAnswer | undefined }) {
  if (q.kind === 'label') {
    const placed = Array.isArray(answer) ? answer : [];
    const right = q.pairs.filter((_, d) => placed[d] === d).length;
    return (
      <div className="mt-2 text-sm">
        <p>
          {right} of {q.pairs.length} matched correctly. The right pairs:
        </p>
        <ul className="mt-1 grid gap-0.5">
          {q.pairs.map((p, d) => (
            <li key={d}>
              <span className="font-bold">{p.term}</span> → {p.definition}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <dl className="mt-2 grid gap-1 text-sm">
      {typeof answer === 'number' && (
        <div>
          <dt className="inline font-bold">You chose: </dt>
          <dd className="inline">{q.options[answer]}</dd>
        </div>
      )}
      <div>
        <dt className="inline font-bold">Right answer: </dt>
        <dd className="inline">{q.options[q.answer]}</dd>
      </div>
    </dl>
  );
}

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function LabelQ({
  q,
  value,
  onChange,
  checked,
}: {
  q: LabelQuestion;
  value: number[];
  onChange: (v: number[]) => void;
  checked: boolean;
}) {
  // Shuffle terms once so their order doesn't give the answer away.
  const order = useMemo(() => {
    const idx = q.pairs.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [q]);

  const place = (termId: string, zoneId: string) => {
    const term = Number(termId.slice(5));
    const next = value.map((t) => (t === term ? -1 : t));
    if (zoneId.startsWith('def-')) next[Number(zoneId.slice(4))] = term;
    onChange(next);
  };

  const unplaced = order.filter((t) => !value.includes(t));
  return (
    <DndArena onDrop={place}>
      <div
        className="flex min-h-14 flex-wrap gap-2 rounded-2xl bg-slate-50 p-2"
        aria-label="Terms to place"
      >
        {unplaced.length === 0 && (
          <span className="p-2 text-sm text-ink-soft">All terms placed!</span>
        )}
        {unplaced.map((t) => (
          <Draggable key={t} id={`term-${t}`} label={q.pairs[t].term} disabled={checked}>
            <span className="block rounded-xl bg-surface px-3 py-2 font-bold shadow ring-1 ring-black/10">
              {q.pairs[t].term}
            </span>
          </Draggable>
        ))}
      </div>
      <ul className="grid gap-2">
        {q.pairs.map((p, d) => {
          const placed = value[d];
          const ok = checked && placed === d;
          return (
            <li key={d}>
              <DropZone id={`def-${d}`} label={p.definition} className="rounded-2xl">
                {({ isOver, armed }) => (
                  <div
                    className={`flex flex-wrap items-center gap-3 rounded-2xl p-3 ring-2 ${
                      checked
                        ? ok
                          ? 'bg-emerald-50 ring-emerald-400'
                          : 'bg-amber-50 ring-amber-400'
                        : isOver
                          ? 'bg-indigo-50 ring-indigo-400'
                          : armed
                            ? 'ring-indigo-200'
                            : 'bg-surface ring-black/10'
                    }`}
                  >
                    <span className="min-w-32 flex-1 font-semibold">{p.definition}</span>
                    {placed >= 0 ? (
                      <Draggable
                        id={`term-${placed}`}
                        label={q.pairs[placed].term}
                        disabled={checked}
                      >
                        <span className="block rounded-xl bg-indigo-100 px-3 py-1.5 font-bold text-indigo-900">
                          {q.pairs[placed].term}
                        </span>
                      </Draggable>
                    ) : (
                      <span className="rounded-xl border-2 border-dashed border-slate-300 px-6 py-1.5 text-sm text-slate-400">
                        drop here
                      </span>
                    )}
                    {checked && !ok && (
                      <span className="text-sm font-bold text-amber-900">→ {p.term}</span>
                    )}
                  </div>
                )}
              </DropZone>
            </li>
          );
        })}
      </ul>
    </DndArena>
  );
}
