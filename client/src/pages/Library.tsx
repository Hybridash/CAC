import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CATEGORIES,
  CONCEPTS,
  DIFFICULTY_LABEL,
  type CategoryId,
  type Difficulty,
} from '@bioplay/shared';
import { ConceptCard } from '../components/ConceptBits';
import { searchIndex } from '../lib/library';
import { DEFAULT_FILTERS, filterConcepts, type LibraryFilters, type SortKey } from '../lib/search';
import { usePlayer } from '../store/player';

const toggle = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const initialCat = params.get('cat') as CategoryId | null;
  const [filters, setFilters] = useState<LibraryFilters>({
    ...DEFAULT_FILTERS,
    categories: initialCat ? [initialCat] : [],
    sort: q ? 'relevance' : 'alpha',
  });
  const progress = usePlayer((s) => s.player?.progress ?? {});

  const results = useMemo(() => {
    const base = q.trim().length >= 2 ? searchIndex.search(q, 500) : CONCEPTS;
    const sort: SortKey = !q && filters.sort === 'relevance' ? 'alpha' : filters.sort;
    return filterConcepts(base, { ...filters, sort }, progress);
  }, [q, filters, progress]);

  const set = (patch: Partial<LibraryFilters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Library</h1>
          <p className="text-ink-soft">{CONCEPTS.length} hands-on concepts across 12 categories.</p>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setParams(v ? { q: v } : {}, { replace: true });
              if (v && filters.sort === 'alpha') set({ sort: 'relevance' });
            }}
            placeholder="Search by name, topic, or nickname…"
            className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </label>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold">Category</legend>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const on = filters.categories.includes(c.id);
              return (
                <button
                  key={c.id}
                  aria-pressed={on}
                  onClick={() => set({ categories: toggle(filters.categories, c.id) })}
                  className="chip py-1 ring-2 transition"
                  style={{
                    background: on ? c.color : c.tint,
                    color: on ? 'white' : c.color,
                    ['--tw-ring-color' as string]: on ? c.color : 'transparent',
                  }}
                >
                  <span aria-hidden>{c.emoji}</span> {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <fieldset>
            <legend className="mb-1.5 text-sm font-bold">Difficulty</legend>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as Difficulty[]).map((d) => {
                const on = filters.difficulties.includes(d);
                return (
                  <button
                    key={d}
                    aria-pressed={on}
                    title={DIFFICULTY_LABEL[d]}
                    onClick={() => set({ difficulties: toggle(filters.difficulties, d) })}
                    className={`chip py-1 ${on ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-ink-soft'}`}
                  >
                    {d}★<span className="sr-only"> {DIFFICULTY_LABEL[d]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Select
            label="Progress"
            value={filters.completion}
            onChange={(v) => set({ completion: v as LibraryFilters['completion'] })}
            options={[
              ['all', 'All'],
              ['todo', 'Not completed'],
              ['done', 'Completed'],
            ]}
          />
          <Select
            label="Type"
            value={filters.rarity}
            onChange={(v) => set({ rarity: v as LibraryFilters['rarity'] })}
            options={[
              ['all', 'All'],
              ['common', 'Well-known'],
              ['obscure', 'Obscure 🔮'],
            ]}
          />
          <Select
            label="Sort by"
            value={filters.sort}
            onChange={(v) => set({ sort: v as SortKey })}
            options={[
              ...(q ? [['relevance', 'Best match'] as [string, string]] : []),
              ['alpha', 'A → Z'],
              ['difficulty', 'Difficulty'],
              ['atp', 'Most ATP'],
            ]}
          />
          <button
            className="self-end text-sm font-bold text-indigo-700 underline"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Reset filters
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
        {results.length} concept{results.length === 1 ? '' : 's'}
        {q && <> matching “{q}”</>}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((c) => (
          <ConceptCard key={c.id} concept={c} />
        ))}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-slate-50 px-3 py-1.5 font-semibold ring-1 ring-black/10"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
