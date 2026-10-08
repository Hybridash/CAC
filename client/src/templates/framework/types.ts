import type { Concept } from '@bioplay/shared';

/** Props every interaction template (and flagship lesson) receives. */
export interface TemplateProps<C> {
  config: C;
  concept: Concept;
  /** Call once when the player has done enough to "complete" the interaction. */
  onComplete: () => void;
  /** Optional: tell the lesson which explanation card matches what's on screen. */
  onStage?: (stepIndex: number) => void;
  /** Whether this interaction was already completed before (so templates can relax goals). */
  alreadyDone: boolean;
}
