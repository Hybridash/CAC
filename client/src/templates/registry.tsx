import type { ComponentType } from 'react';
import type { TemplateId } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { FeedObserve } from './FeedObserve';
import { AssemblyLine } from './AssemblyLine';
import { SliderSim } from './SliderSim';
import { LockKey } from './LockKey';
import { ZoomExplorer } from './ZoomExplorer';
import { CauseEffect } from './CauseEffect';
import { Sorting } from './Sorting';
import { Ecosystem } from './Ecosystem';
import { Punnett } from './Punnett';
import { Timeline } from './Timeline';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplate = ComponentType<TemplateProps<any>>;

export const TEMPLATES: Partial<Record<TemplateId, AnyTemplate>> = {
  'feed-and-observe': FeedObserve,
  'assembly-line': AssemblyLine,
  'slider-sim': SliderSim,
  'lock-and-key': LockKey,
  'zoom-explorer': ZoomExplorer,
  'cause-effect': CauseEffect,
  sorting: Sorting,
  ecosystem: Ecosystem,
  punnett: Punnett,
  timeline: Timeline,
};

export const TEMPLATE_LABEL: Record<TemplateId, string> = {
  'feed-and-observe': 'Feed & Observe',
  'assembly-line': 'Assembly Line',
  'slider-sim': 'Slider Simulation',
  'lock-and-key': 'Lock & Key',
  'zoom-explorer': 'Zoom Explorer',
  'cause-effect': 'Cause & Effect',
  sorting: 'Sorting',
  ecosystem: 'Ecosystem Sandbox',
  punnett: 'Genetics Lab',
  timeline: 'Timeline Scrubber',
  flagship: 'Flagship Lesson',
};
