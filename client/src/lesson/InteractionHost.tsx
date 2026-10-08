import type { Concept } from '@bioplay/shared';
import { TEMPLATES } from '../templates/registry';
import { FLAGSHIPS } from '../flagships/registry';

/** Picks the right template (or flagship component) for a concept and renders it. */
export function InteractionHost({
  concept,
  onComplete,
  onStage,
  alreadyDone,
}: {
  concept: Concept;
  onComplete: () => void;
  onStage: (i: number) => void;
  alreadyDone: boolean;
}) {
  const it = concept.interaction;
  const Component =
    it.template === 'flagship' ? FLAGSHIPS[it.config.component] : TEMPLATES[it.template];
  if (!Component) {
    return <p className="text-rose-700">Missing interaction template “{it.template}”.</p>;
  }
  return (
    <Component
      config={it.config}
      concept={concept}
      onComplete={onComplete}
      onStage={onStage}
      alreadyDone={alreadyDone}
    />
  );
}
