import type { ComponentType } from 'react';
import type { TemplateProps } from '../templates/framework/types';
import { InsulinLesson } from './insulin/InsulinLesson';

/** Hand-built flagship lessons, keyed by the `component` name in concept data. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FLAGSHIPS: Record<string, ComponentType<TemplateProps<any>>> = {
  insulin: InsulinLesson,
};
