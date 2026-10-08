import { CONCEPTS, conceptOfTheDay, utcDay } from '@bioplay/shared';
import { createSearchIndex } from './search';

export const searchIndex = createSearchIndex(CONCEPTS);

export const todaysConceptId = () =>
  CONCEPTS.length
    ? conceptOfTheDay(
        utcDay(new Date()),
        CONCEPTS.map((c) => c.id),
      )
    : null;
