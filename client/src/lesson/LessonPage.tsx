import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CATEGORY_BY_ID,
  CONCEPT_BY_ID,
  DIFFICULTY_LABEL,
  interactionReward,
  obscureBonus,
  perfectQuizBonus,
  quizPassReward,
  type Concept,
} from '@bioplay/shared';
import { CategoryChip, ConceptCard, Stars } from '../components/ConceptBits';
import { AtpAmount } from '../components/Atp';
import { AvatarCheer } from '../components/AvatarCheer';
import { InteractionHost } from './InteractionHost';
import { Quiz } from './Quiz';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePlayer } from '../store/player';
import { todaysConceptId } from '../lib/library';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

export function LessonPage() {
  const { id = '' } = useParams();
  const concept = CONCEPT_BY_ID[id];
  if (!concept) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-3xl font-extrabold">Concept not found</h1>
        <Link to="/library" className="btn-primary mt-4">
          Browse the library
        </Link>
      </div>
    );
  }
  // Key by id so all lesson state resets when chaining to a related concept.
  return <Lesson key={concept.id} concept={concept} />;
}

function Lesson({ concept }: { concept: Concept }) {
  const progress = usePlayer((s) => s.player?.progress[concept.id]);
  const completeInteraction = usePlayer((s) => s.completeInteraction);
  const [step, setStep] = useState(0);
  const [interactionDone, setInteractionDone] = useState(!!progress?.interactionDoneAt);
  const [cheer, setCheer] = useState<string | null>(null);
  const quizRef = useRef<HTMLElement>(null);
  const cat = CATEGORY_BY_ID[concept.category];
  const isCotd = todaysConceptId() === concept.id;

  useEffect(() => {
    document.title = `${concept.title} · BioPlay`;
    return () => {
      document.title = 'BioPlay';
    };
  }, [concept.title]);

  const onComplete = useCallback(() => {
    setInteractionDone(true);
    setStep(concept.steps.length - 1);
    setCheer('You did it! Ready for the quiz?');
    sfx.fanfare();
    void completeInteraction(concept.id).catch(() => undefined);
  }, [completeInteraction, concept.id, concept.steps.length]);

  const onStage = useCallback(
    (i: number) => setStep((s) => Math.max(s, Math.min(i, concept.steps.length - 1))),
    [concept.steps.length],
  );

  const d = concept.difficulty;
  return (
    <article className="flex flex-col gap-6">
      <header
        className="overflow-hidden rounded-[2rem] p-5 sm:p-7"
        style={{ background: `linear-gradient(135deg, ${cat.tint}, #fff)` }}
      >
        <nav aria-label="Breadcrumb" className="mb-2 text-sm font-semibold text-ink-soft">
          <Link to="/library" className="hover:underline">
            Library
          </Link>{' '}
          /{' '}
          <Link to={`/library?cat=${cat.id}`} className="hover:underline">
            {cat.name}
          </Link>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap gap-2">
              <CategoryChip id={concept.category} />
              {concept.flagship && (
                <span className="chip bg-white text-ink">
                  <Icon name="sparkle" size={16} /> Flagship
                </span>
              )}
              {concept.rarity === 'obscure' && (
                <span className="chip bg-fuchsia-100 text-fuchsia-800">
                  <Icon name="gem" size={16} /> Obscure
                </span>
              )}
              {isCotd && (
                <span className="chip bg-amber-300 text-amber-950">
                  <Icon name="sun" size={16} /> Concept of the Day ×1.5
                </span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold sm:text-5xl">{concept.title}</h1>
            <p className="mt-2 text-lg text-ink-soft">{concept.summary}</p>
            <Prerequisites concept={concept} />
          </div>
          <div className="card min-w-60 p-4 text-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Stars difficulty={d} />
              <span className="font-bold">{DIFFICULTY_LABEL[d]}</span>
            </div>
            <RewardRow
              label="Interaction"
              amount={interactionReward(d)}
              done={!!progress?.interactionDoneAt || interactionDone}
            />
            <RewardRow
              label="Pass quiz (2/3)"
              amount={quizPassReward(d)}
              done={!!progress?.quizPassedAt}
            />
            <RewardRow
              label="Perfect quiz"
              amount={perfectQuizBonus(d)}
              done={!!progress?.quizPerfect}
            />
            {concept.rarity === 'obscure' && (
              <RewardRow
                label="Obscure bonus"
                amount={obscureBonus(d)}
                done={!!progress?.completedAt}
              />
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <aside
          className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start"
          aria-label="Explanation"
        >
          <StepCards concept={concept} step={step} setStep={setStep} />
          <AvatarCheer message={cheer} />
        </aside>
        <section aria-label="Interactive" className="card min-w-0 p-4 sm:p-5">
          <ErrorBoundary label="interaction">
            <InteractionHost
              concept={concept}
              onComplete={onComplete}
              onStage={onStage}
              alreadyDone={!!progress?.interactionDoneAt}
            />
          </ErrorBoundary>
          <AnimatePresence>
            {interactionDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200"
                data-testid="interaction-complete"
              >
                <span className="font-bold text-emerald-900">
                  <Icon name="check" size={22} className="mr-1 -mt-0.5" />
                  Interaction complete! Keep playing, or test yourself.
                </span>
                <button
                  className="btn-primary"
                  onClick={() => quizRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Take the quiz ↓
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <details className="card group p-5" data-testid="go-deeper">
          <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-extrabold">
            <span className="flex items-center gap-2">
              <Icon name="microscope" size={28} /> Go Deeper
            </span>
            <span className="transition group-open:rotate-180" aria-hidden>
              ⌄
            </span>
          </summary>
          <div className="mt-3 flex flex-col gap-3 leading-relaxed text-ink-soft">
            {concept.goDeeper.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </details>
        <div className="card flex gap-3 p-5" style={{ background: cat.tint }}>
          <Icon name="bulb" size={44} />
          <div>
            <h2 className="text-xl font-extrabold">Fun fact</h2>
            <p className="text-ink-soft">{concept.funFact}</p>
          </div>
        </div>
      </div>

      <section ref={quizRef} aria-labelledby="quiz-h" className="scroll-mt-24">
        <h2 id="quiz-h" className="mb-3 text-3xl font-extrabold">
          Quick quiz
        </h2>
        <Quiz
          concept={concept}
          onDone={(r) => setCheer(r.passed ? 'Brilliant!' : 'So close — you’ve got this!')}
        />
      </section>

      {concept.relatedConcepts.length > 0 && (
        <section aria-labelledby="related-h">
          <h2 id="related-h" className="mb-3 text-3xl font-extrabold">
            Keep exploring
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {concept.relatedConcepts.map(
              (r) => CONCEPT_BY_ID[r] && <ConceptCard key={r} concept={CONCEPT_BY_ID[r]} />,
            )}
          </div>
        </section>
      )}
    </article>
  );
}

function RewardRow({ label, amount, done }: { label: string; amount: number; done: boolean }) {
  return (
    <div className={`flex items-center justify-between py-0.5 ${done ? 'text-emerald-700' : ''}`}>
      <span className="font-semibold">
        {done ? '✓ ' : ''}
        {label}
      </span>
      <AtpAmount amount={amount} prefix="+" />
    </div>
  );
}

function StepCards({
  concept,
  step,
  setStep,
}: {
  concept: Concept;
  step: number;
  setStep: (n: number) => void;
}) {
  const s = concept.steps[step];
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-extrabold tracking-wide text-ink-soft uppercase">
          Step {step + 1} / {concept.steps.length}
        </span>
        <div className="flex gap-1" aria-hidden>
          {concept.steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i <= step ? 'bg-brand' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>
      <div aria-live="polite" className="min-h-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <h3 className="text-lg font-extrabold">{s.title}</h3>
            <p className="text-ink-soft">{s.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex justify-between">
        <button
          className="btn-ghost px-3 py-1.5 text-sm"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          ← Back
        </button>
        <button
          className="btn-ghost px-3 py-1.5 text-sm"
          disabled={step === concept.steps.length - 1}
          onClick={() => setStep(step + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function Prerequisites({ concept }: { concept: Concept }) {
  const progress = usePlayer((s) => s.player?.progress);
  const prereqs = (concept.prerequisites ?? []).map((id) => CONCEPT_BY_ID[id]).filter(Boolean);
  if (!prereqs.length) return null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
      <span className="font-bold text-ink-soft">Recommended first:</span>
      {prereqs.map((p) => (
        <Link
          key={p.id}
          to={`/learn/${p.id}`}
          className={`chip py-0.5 ${progress?.[p.id]?.completedAt ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-ink ring-1 ring-black/10'}`}
        >
          {progress?.[p.id]?.completedAt ? '✓ ' : ''}
          {p.title}
        </Link>
      ))}
      <span className="text-xs text-ink-soft">(optional — dive right in if you like!)</span>
    </p>
  );
}
