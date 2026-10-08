import type { ComponentType } from 'react';
import type { TemplateProps } from '../templates/framework/types';
import { InsulinLesson } from './insulin/InsulinLesson';
import { ActionPotentialLesson } from './neuron/ActionPotentialLesson';
import { PhotosynthesisLesson } from './photosynthesis/PhotosynthesisLesson';
import { TranslationLesson } from './translation/TranslationLesson';
import { MitosisLesson } from './mitosis/MitosisLesson';
import { VaccineLesson } from './vaccines/VaccineLesson';

/** Hand-built flagship lessons, keyed by the `component` name in concept data. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FLAGSHIPS: Record<string, ComponentType<TemplateProps<any>>> = {
  insulin: InsulinLesson,
  'action-potential': ActionPotentialLesson,
  photosynthesis: PhotosynthesisLesson,
  translation: TranslationLesson,
  mitosis: MitosisLesson,
  vaccines: VaccineLesson,
};
