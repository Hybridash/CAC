import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CATEGORY_BY_ID,
  DIFFICULTY_LABEL,
  HS_UNIT_BY_ID,
  HS_UNITS,
  hsId,
  LESSON_BY_ID,
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
import { InteractiveStage } from './InteractiveStage';
import { Quiz } from './Quiz';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePlayer } from '../store/player';
import { todaysConceptId } from '../lib/library';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';
import { DiagramsCard, HighSchoolExtras } from '../highschool/HighSchoolExtras';
import { ChatPanel } from '../chat/ChatPanel';
import { LESSON_FIGURES } from './figures';

export function LessonPage() {
  const { id = '' } = useParams();
  const concept = LESSON_BY_ID[id];
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
  const figure = LESSON_FIGURES[concept.id];

  useEffect(() => {
    document.title = `${concept.title} · Bio Bites`;
    return () => {
      document.title = 'Bio Bites';
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
  const hs = concept.highSchool;
  const hsVersion = hs ? undefined : LESSON_BY_ID[hsId(concept.id)];
  return (
    <article className="flex flex-col gap-6">
      <header
        className="py-1"
      >
        <nav aria-label="Breadcrumb" className="mb-2 text-sm font-semibold text-ink-soft">
          <Link to="/library" className="hover:underline">
            Library
          </Link>{' '}
          /{' '}
          {hs ? (
            <>
              <Link to="/library/high-school" className="hover:underline">
                High School
              </Link>{' '}
              /{' '}
              <Link to={`/library/high-school#unit-${hs.unit}`} className="hover:underline">
                Unit {HS_UNITS.findIndex((u) => u.id === hs.unit) + 1}:{' '}
                {HS_UNIT_BY_ID[hs.unit].name}
              </Link>
            </>
          ) : (
            <Link to={`/library?cat=${cat.id}`} className="hover:underline">
              {cat.name}
            </Link>
          )}
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-[clamp(2.25rem,4.6vw,3.25rem)]">{concept.title}</h1>
            <p className="mt-2 text-lg text-ink-soft">{concept.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-ink-soft">
              <CategoryChip id={concept.category} />
              {hs && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="flask" size={16} /> High School
                </span>
              )}
              {concept.flagship && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="sparkle" size={16} /> Flagship
                </span>
              )}
              {concept.rarity === 'obscure' && (
                <span className="inline-flex items-center gap-1.5 text-fuchsia-800">
                  <Icon name="gem" size={16} /> Obscure
                </span>
              )}
              {isCotd && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-atp-dark">
                  <Icon name="sun" size={16} /> Concept of the day, 1.5× ATP
                </span>
              )}
            </div>
            <Prerequisites concept={concept} />
            {hsVersion && (
              <Link
                to={`/learn/${hsVersion.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark underline"
                data-testid="hs-version-link"
              >
                <Icon name="flask" size={18} /> Ready for more? Try the High School version
              </Link>
            )}
          </div>
          <div className="min-w-60 border-t border-line pt-3 text-sm">
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

      {figure ? (
        <>
          <section
            aria-labelledby="how-h"
            className="grid items-start gap-x-12 gap-y-6 border-t border-line pt-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          >
            <figure className="lg:sticky lg:top-20">
              <div data-theme="light" className="pebble mx-auto max-w-2xl bg-slate-100 p-3 sm:p-5">
                <figure.Figure step={step} />
              </div>
              <figcaption className="mt-2 text-sm text-ink-soft" aria-live="polite">
                {figure.captions[Math.min(step, figure.captions.length - 1)]}
              </figcaption>
            </figure>
            <div>
              <h2 id="how-h" className="text-3xl font-extrabold">
                How it works
              </h2>
              <ol className="mt-4 flex flex-col">
                {concept.steps.map((st, i) => {
                  const on = i === step;
                  return (
                    <li key={st.title} className="border-t border-line first:border-t-0">
                      <button
                        type="button"
                        onClick={() => setStep(i)}
                        aria-current={on ? 'step' : undefined}
                        aria-expanded={on}
                        className="flex w-full items-baseline gap-4 py-3 text-left"
                      >
                        <span
                          className={`w-8 shrink-0 font-display text-2xl font-extrabold tabular-nums transition-colors duration-200 ${on ? 'text-eosin' : 'text-slate-400'}`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`font-display text-xl font-bold transition-colors duration-200 ${on ? 'text-ink' : 'text-ink-soft'}`}
                        >
                          {st.title}
                        </span>
                      </button>
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        inert={!on}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-[56ch] pb-4 pl-12 text-ink-soft">{st.text}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-2">
                <AvatarCheer message={cheer} />
              </div>
            </div>
          </section>
          <InteractiveStage
            concept={concept}
            done={interactionDone}
            onQuiz={() => quizRef.current?.scrollIntoView({ behavior: 'smooth' })}
            guide={
              <div className="flex flex-col gap-3">
                <StepCards concept={concept} step={step} setStep={setStep} />
                <div className="hidden lg:block">
                  <AvatarCheer message={cheer} />
                </div>
              </div>
            }
          >
            <ErrorBoundary label="interaction">
              <InteractionHost
                concept={concept}
                onComplete={onComplete}
                onStage={onStage}
                alreadyDone={!!progress?.interactionDoneAt}
              />
            </ErrorBoundary>
          </InteractiveStage>
        </>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <aside
          className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start"
          aria-label="Explanation"
        >
          <StepCards concept={concept} step={step} setStep={setStep} />
          <AvatarCheer message={cheer} />
        </aside>
        <InteractiveStage
          concept={concept}
          done={interactionDone}
          onQuiz={() => quizRef.current?.scrollIntoView({ behavior: 'smooth' })}
          guide={
            <div className="flex flex-col gap-3">
              <StepCards concept={concept} step={step} setStep={setStep} />
              <div className="hidden lg:block">
                <AvatarCheer message={cheer} />
              </div>
            </div>
          }
        >
          <ErrorBoundary label="interaction">
            <InteractionHost
              concept={concept}
              onComplete={onComplete}
              onStage={onStage}
              alreadyDone={!!progress?.interactionDoneAt}
            />
          </ErrorBoundary>
        </InteractiveStage>
        </div>
      )}

      {hs ? (
        <HighSchoolExtras info={hs} />
      ) : (
        concept.diagrams && <DiagramsCard diagrams={concept.diagrams} />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <details className="group border-t border-line pt-4" data-testid="go-deeper">
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
        <div className="flex gap-3 border-t border-line pt-4">
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
          <div className="grid grid-cols-1 gap-x-10 gap-y-3 lg:grid-cols-2">
            {concept.relatedConcepts.map(
              (r) =>
                LESSON_BY_ID[r] && (
                  <ConceptCard
                    key={r}
                    concept={LESSON_BY_ID[r]}
                    badge={hs && r === hs.baseId ? 'Simpler version' : undefined}
                  />
                ),
            )}
          </div>
        </section>
      )}
      <ChatPanel concept={concept} />
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
        <span className="text-xs font-extrabold text-ink-soft">
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
      <div aria-live="polite" className="min-h-20">
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
  const prereqs = (concept.prerequisites ?? []).map((id) => LESSON_BY_ID[id]).filter(Boolean);
  if (!prereqs.length) return null;
  return (
    <p className="mt-4 max-w-[60ch] text-sm text-ink-soft">
      Worth knowing first:{' '}
      {prereqs.map((p, i) => (
        <span key={p.id}>
          {i > 0 && ', '}
          <Link to={`/learn/${p.id}`} className="font-semibold text-brand-dark underline">
            {p.title}
          </Link>
          {progress?.[p.id]?.completedAt && ' (done)'}
        </span>
      ))}
      . Optional; dive in if you like.
    </p>
  );
}
