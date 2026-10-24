import { useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_BY_ID, potentialReward } from '@bioplay/shared';
import { searchIndex } from '../lib/library';
import { AtpAmount } from './Atp';
import { Stars } from './ConceptBits';
import { CategoryIcon } from './Icon';
import { UiIcon } from './UiIcon';

/** Accessible combobox with live fuzzy autocomplete. */
export function SearchBox({
  size = 'md',
  autoFocus = false,
}: {
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchIndex.search(q, 8), [q]);

  const go = (id: string) => {
    setOpen(false);
    setQ('');
    inputRef.current?.blur();
    navigate(`/learn/${id}`);
  };
  const seeAll = () => {
    setOpen(false);
    navigate(`/library?q=${encodeURIComponent(q.trim())}`);
  };

  const big = size === 'lg';
  return (
    <div className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[active]) go(results[active].id);
          else if (q.trim()) seeAll();
        }}
      >
        <label className="sr-only" htmlFor={`${listId}-input`}>
          Search biology concepts
        </label>
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${big ? 'left-4' : 'left-2.5'}`}
        >
          <UiIcon name="search" size={big ? 22 : 18} className="text-ink-soft" />
        </span>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={q}
          placeholder={
            big ? 'Search 154 concepts' : 'Search concepts…'
          }
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Escape') setOpen(false);
          }}
          className={`w-full rounded-lg bg-surface font-medium text-ink ring-1 ring-ink/20 placeholder:font-normal placeholder:text-slate-500 focus:ring-2 focus:ring-brand focus:outline-none ${
            big
              ? 'py-3.5 pr-5 pl-14 text-lg'
              : 'py-2.5 pr-3 pl-9 text-base'
          }`}
        />
      </form>
      {open && q.trim().length >= 2 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-[70vh] w-full min-w-72 overflow-auto rounded-2xl bg-surface p-1.5 shadow-xl ring-1 ring-black/10"
        >
          {results.length === 0 && (
            <li className="p-3 text-sm text-ink-soft">No matches yet — try another word.</li>
          )}
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(c.id)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl p-2.5 ${i === active ? 'bg-indigo-50' : ''}`}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl"
                style={{ background: CATEGORY_BY_ID[c.category].tint }}
                aria-hidden
              >
                <CategoryIcon id={c.category} size={26} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{c.title}</span>
                <span className="flex items-center gap-2 text-xs text-ink-soft">
                  <Stars difficulty={c.difficulty} />
                  <span className="truncate">{CATEGORY_BY_ID[c.category].name}</span>
                </span>
              </span>
              <span className="text-sm">
                <AtpAmount amount={potentialReward(c.difficulty, c.rarity)} />
              </span>
            </li>
          ))}
          {results.length > 0 && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={seeAll}
                className="w-full rounded-xl p-2 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-50"
              >
                See all results for “{q.trim()}” →
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
