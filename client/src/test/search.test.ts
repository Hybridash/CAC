import { describe, expect, it } from 'vitest';
import type { Concept } from '@bioplay/shared';
import { createSearchIndex, DEFAULT_FILTERS, filterConcepts } from '../lib/search';

const mk = (p: Partial<Concept> & Pick<Concept, 'id' | 'title'>): Concept =>
  ({
    category: 'cell',
    tags: [],
    aliases: [],
    difficulty: 2,
    rarity: 'common',
    summary: '',
    steps: [],
    interaction: { template: 'flagship', config: { component: 'x' } },
    goDeeper: '',
    quiz: [] as unknown as Concept['quiz'],
    relatedConcepts: [],
    funFact: '',
    ...p,
  }) as Concept;

const concepts = [
  mk({
    id: 'insulin',
    title: 'How Insulin Works',
    category: 'physiology',
    difficulty: 3,
    tags: ['hormones', 'blood sugar', 'pancreas'],
    aliases: ['glucose homeostasis'],
  }),
  mk({
    id: 'transposons',
    title: 'Transposons',
    category: 'genetics',
    difficulty: 4,
    rarity: 'obscure',
    tags: ['DNA'],
    aliases: ['jumping genes'],
  }),
  mk({
    id: 'mitochondria',
    title: 'Mitochondria & Cellular Respiration',
    difficulty: 2,
    tags: ['ATP', 'energy'],
  }),
  mk({ id: 'osmosis', title: 'Osmosis', difficulty: 1, tags: ['water'] }),
];
const index = createSearchIndex(concepts);

describe('search', () => {
  it('finds by tag: "blood sugar" → insulin', () => {
    expect(index.search('blood sugar')[0].id).toBe('insulin');
  });
  it('finds by alias: "jumping genes" → transposons', () => {
    expect(index.search('jumping genes')[0].id).toBe('transposons');
  });
  it('tolerates misspellings: "mitocondria"', () => {
    expect(index.search('mitocondria')[0].id).toBe('mitochondria');
  });
  it('searches category names', () => {
    expect(index.search('physiology').map((c) => c.id)).toContain('insulin');
  });
  it('ignores 1-character queries', () => {
    expect(index.search('a')).toEqual([]);
  });
});

describe('filters', () => {
  it('filters by difficulty and rarity', () => {
    expect(
      filterConcepts(concepts, { ...DEFAULT_FILTERS, rarity: 'obscure' }, {}).map((c) => c.id),
    ).toEqual(['transposons']);
    expect(filterConcepts(concepts, { ...DEFAULT_FILTERS, difficulties: [1, 2] }, {}).length).toBe(
      2,
    );
  });
  it('filters by completion', () => {
    const progress = { osmosis: { completedAt: 'x' } as never };
    expect(
      filterConcepts(concepts, { ...DEFAULT_FILTERS, completion: 'done' }, progress).map(
        (c) => c.id,
      ),
    ).toEqual(['osmosis']);
    expect(
      filterConcepts(concepts, { ...DEFAULT_FILTERS, completion: 'todo' }, progress),
    ).toHaveLength(3);
  });
  it('sorts by most ATP (obscure bonus counts)', () => {
    expect(
      filterConcepts(concepts, { ...DEFAULT_FILTERS, sort: 'atp' }, {}).map((c) => c.id),
    ).toEqual(['transposons', 'insulin', 'mitochondria', 'osmosis']);
  });
  it('sorts alphabetically', () => {
    expect(filterConcepts(concepts, { ...DEFAULT_FILTERS, sort: 'alpha' }, {})[0].id).toBe(
      'insulin',
    );
  });
});
