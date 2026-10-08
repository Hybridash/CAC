/**
 * Small builders that keep concept data files short and readable.
 * Everything they produce is plain data that matches the Concept schema.
 */
import type {
  AssemblyConfig,
  CauseEffectConfig,
  LabelQuestion,
  LockKeyConfig,
  LockShape,
  McQuestion,
  PredictQuestion,
  SceneElement,
  SliderConfig,
  SortingConfig,
  TimelineConfig,
  ZoomConfig,
  Interaction,
  LessonStep,
} from '../../types';

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const steps = (...s: [title: string, text: string][]): LessonStep[] =>
  s.map(([title, text]) => ({ title, text }));

export const mc = (
  prompt: string,
  options: string[],
  answer: number,
  explain: string,
): McQuestion => ({ kind: 'mc', prompt, options, answer, explain });

export const predict = (
  scenario: string,
  prompt: string,
  options: string[],
  answer: number,
  explain: string,
): PredictQuestion => ({
  kind: 'predict',
  scenario,
  prompt,
  options,
  answer,
  explain,
});

export const label = (
  prompt: string,
  pairs: [term: string, definition: string][],
  explain: string,
): LabelQuestion => ({
  kind: 'label',
  prompt,
  pairs: pairs.map(([term, definition]) => ({ term, definition })),
  explain,
});

/** Sorting: bins as [label, emoji, description]; items as [label, emoji, binIndex, explain]. */
export function sorting(
  prompt: string,
  bins: [label: string, emoji: string, description: string][],
  items: [label: string, emoji: string, bin: number, explain: string][],
): Interaction {
  const config: SortingConfig = {
    prompt,
    bins: bins.map(([l, emoji, description]) => ({ id: slug(l), label: l, emoji, description })),
    items: items.map(([l, emoji, bin, explain]) => ({
      id: slug(l),
      label: l,
      emoji,
      bin: slug(bins[bin][0]),
      explain,
    })),
  };
  return { template: 'sorting', config };
}

/** Assembly line: parts in the correct order as [label, emoji, description]. */
export function assembly(
  prompt: string,
  parts: [label: string, emoji: string, description: string][],
  successMessage: string,
  opts: {
    layout?: 'line' | 'cycle';
    distractors?: [label: string, emoji: string, description: string][];
  } = {},
): Interaction {
  const toPart = ([l, emoji, description]: [string, string, string]) => ({
    id: slug(l),
    label: l,
    emoji,
    description,
  });
  const config: AssemblyConfig = {
    prompt,
    parts: parts.map(toPart),
    distractors: opts.distractors?.map(toPart),
    layout: opts.layout ?? 'line',
    successMessage,
  };
  return { template: 'assembly-line', config };
}

/** Cause & effect: nodes as [label, emoji, text, brokenText?]; nodes with brokenText are breakable. */
export function cascade(
  prompt: string,
  trigger: [label: string, emoji: string],
  nodes: [label: string, emoji: string, text: string, brokenText?: string][],
  normalOutcome: string,
): Interaction {
  const config: CauseEffectConfig = {
    prompt,
    trigger: { label: trigger[0], emoji: trigger[1] },
    nodes: nodes.map(([l, emoji, text, brokenText]) => ({
      id: slug(l),
      label: l,
      emoji,
      text,
      brokenText,
    })),
    breakable: nodes.filter((n) => n[3]).map((n) => slug(n[0])),
    normalOutcome,
  };
  return { template: 'cause-effect', config };
}

/** Lock & key: receptors [label, shape, color, description]; molecules [label, shape, color, fitsIndex|null, message, effect?]. */
export function lockKey(
  prompt: string,
  receptors: [label: string, shape: LockShape, color: string, description: string][],
  molecules: [
    label: string,
    shape: LockShape,
    color: string,
    fits: number | null,
    message: string,
    effect?: 'activate' | 'block',
  ][],
): Interaction {
  const config: LockKeyConfig = {
    prompt,
    receptors: receptors.map(([l, shape, color, description]) => ({
      id: slug(l),
      label: l,
      shape,
      color,
      description,
    })),
    molecules: molecules.map(([l, shape, color, fits, message, effect]) => ({
      id: `m-${slug(l)}`,
      label: l,
      shape,
      color,
      fits: fits === null ? null : slug(receptors[fits][0]),
      message,
      effect,
    })),
  };
  return { template: 'lock-and-key', config };
}

export function slider(config: SliderConfig): Interaction {
  return { template: 'slider-sim', config };
}

/** Timeline: frames as [label, text, elements, time?]; checkpoints as [prompt, frameIndex]. */
export function timeline(
  prompt: string,
  frames: [label: string, text: string, elements: SceneElement[], time?: string][],
  checkpoints: [prompt: string, frame: number][],
  background?: string,
): Interaction {
  const ids = frames.map(([l]) => slug(l));
  const config: TimelineConfig = {
    prompt,
    background,
    frames: frames.map(([l, text, elements, time], i) => ({
      id: ids[i],
      label: l,
      text,
      elements,
      time,
    })),
    checkpoints: checkpoints.map(([p, i]) => ({ prompt: p, frame: ids[i] })),
  };
  return { template: 'timeline', config };
}

export function zoom(config: ZoomConfig): Interaction {
  return { template: 'zoom-explorer', config };
}

/** Scene element shorthands. */
export const em = (
  id: string,
  emoji: string,
  x: number,
  y: number,
  size = 1,
  extra: Partial<SceneElement> = {},
): SceneElement => ({ id, emoji, x, y, size, ...extra });
export const sh = (
  id: string,
  shape: SceneElement['shape'],
  color: string,
  x: number,
  y: number,
  size = 1,
  extra: Partial<SceneElement> = {},
): SceneElement => ({ id, shape, color, x, y, size, ...extra });
