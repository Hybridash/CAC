import { Link } from 'react-router-dom';
import {
  CATEGORY_BY_ID,
  DIFFICULTY_LABEL,
  potentialReward,
  type Concept,
  type Difficulty,
} from '@bioplay/shared';
import { AtpAmount } from './Atp';
import { usePlayer } from '../store/player';
import { CategoryIcon, Icon } from './Icon';

export function Stars({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className="inline-flex text-[0.95em] leading-none"
      title={`Difficulty: ${DIFFICULTY_LABEL[difficulty]}`}
      aria-label={`Difficulty ${difficulty} of 5, ${DIFFICULTY_LABEL[difficulty]}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden className={i <= difficulty ? 'text-amber-400' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function CategoryChip({ id }: { id: Concept['category'] }) {
  const c = CATEGORY_BY_ID[id];
  return (
    <span className="inline-flex items-center gap-1.5">
      <CategoryIcon id={id} size={18} /> {c.name}
    </span>
  );
}

/**
 * A concept in a catalog: a plain row with a hairline above it, no box. The category is shown in
 * the meta line, not as a label over the title.
 */
export function ConceptCard({ concept, badge }: { concept: Concept; badge?: string }) {
  const progress = usePlayer((s) => s.player?.progress[concept.id]);
  const cat = CATEGORY_BY_ID[concept.category];
  const done = !!progress?.completedAt;
  return (
    <Link
      to={`/learn/${concept.id}`}
      className="group flex gap-4 border-t border-line pt-4 pb-2 transition-colors"
    >
      <span className="mt-0.5 shrink-0">
        <CategoryIcon id={concept.category} size={48} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-lg group-hover:underline">{concept.title}</h3>
        <span className="line-clamp-2 text-sm text-ink-soft">{concept.summary}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          <span className="font-medium">{cat.name}</span>
          <Stars difficulty={concept.difficulty} />
          {done ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <Icon name="check" size={16} /> Done
            </span>
          ) : (
            <AtpAmount
              amount={potentialReward(concept.difficulty, concept.rarity)}
              prefix="up to "
            />
          )}
          {badge && <span className="font-semibold text-amber-800">{badge}</span>}
          {concept.flagship && (
            <span className="inline-flex items-center gap-1">
              <Icon name="sparkle" size={14} /> Flagship
            </span>
          )}
          {concept.rarity === 'obscure' && (
            <span className="inline-flex items-center gap-1 text-fuchsia-800">
              <Icon name="gem" size={14} /> Obscure
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
