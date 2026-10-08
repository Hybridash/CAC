import Fuse, { type IFuseOptions } from 'fuse.js';
import {
  CATEGORY_BY_ID,
  potentialReward,
  type CategoryId,
  type Concept,
  type ConceptProgress,
  type Difficulty,
} from '@bioplay/shared';

export interface SearchDoc {
  id: string;
  title: string;
  tags: string[];
  aliases: string[];
  category: string;
  summary: string;
}

const OPTIONS: IFuseOptions<SearchDoc> = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'aliases', weight: 2.5 },
    { name: 'tags', weight: 2 },
    { name: 'category', weight: 1 },
    { name: 'summary', weight: 0.7 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
};

export function createSearchIndex(concepts: Concept[]) {
  const docs: SearchDoc[] = concepts.map((c) => ({
    id: c.id,
    title: c.title,
    tags: c.tags,
    aliases: c.aliases,
    category: CATEGORY_BY_ID[c.category].name,
    summary: c.summary,
  }));
  const fuse = new Fuse(docs, OPTIONS);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  return {
    /** Ranked concepts for a free-text query (empty query → no results). */
    search(query: string, limit = 50): Concept[] {
      const q = query.trim();
      if (q.length < 2) return [];
      return fuse
        .search(q, { limit })
        .map((r) => byId.get(r.item.id))
        .filter((c): c is Concept => !!c);
    },
  };
}

export type SearchIndex = ReturnType<typeof createSearchIndex>;

export type SortKey = 'relevance' | 'alpha' | 'difficulty' | 'atp';
export type CompletionFilter = 'all' | 'done' | 'todo';

export interface LibraryFilters {
  categories: CategoryId[];
  difficulties: Difficulty[];
  completion: CompletionFilter;
  rarity: 'all' | 'common' | 'obscure';
  sort: SortKey;
}

export const DEFAULT_FILTERS: LibraryFilters = {
  categories: [],
  difficulties: [],
  completion: 'all',
  rarity: 'all',
  sort: 'relevance',
};

/** Apply library filters and sorting. `concepts` should already be in relevance order. */
export function filterConcepts(
  concepts: Concept[],
  f: LibraryFilters,
  progress: Record<string, ConceptProgress>,
): Concept[] {
  const out = concepts.filter((c) => {
    if (f.categories.length && !f.categories.includes(c.category)) return false;
    if (f.difficulties.length && !f.difficulties.includes(c.difficulty)) return false;
    if (f.rarity !== 'all' && c.rarity !== f.rarity) return false;
    const done = !!progress[c.id]?.completedAt;
    if (f.completion === 'done' && !done) return false;
    if (f.completion === 'todo' && done) return false;
    return true;
  });
  const byTitle = (a: Concept, b: Concept) => a.title.localeCompare(b.title);
  switch (f.sort) {
    case 'alpha':
      return out.sort(byTitle);
    case 'difficulty':
      return out.sort((a, b) => a.difficulty - b.difficulty || byTitle(a, b));
    case 'atp':
      return out.sort(
        (a, b) =>
          potentialReward(b.difficulty, b.rarity) - potentialReward(a.difficulty, a.rarity) ||
          byTitle(a, b),
      );
    default:
      return out;
  }
}
