import type { ComponentType } from 'react';
import type { TemplateId } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { FeedObserve } from './FeedObserve';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTemplate = ComponentType<TemplateProps<any>>;

export const TEMPLATES: Partial<Record<TemplateId, AnyTemplate>> = {
  'feed-and-observe': FeedObserve,
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
