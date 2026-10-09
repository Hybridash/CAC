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
import { inkFor } from '../lib/color';
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
    <span className="chip" style={{ background: c.tint, color: inkFor(c.color) }}>
      <CategoryIcon id={id} size={18} /> {c.name}
    </span>
  );
}

export function ConceptCard({ concept, badge }: { concept: Concept; badge?: string }) {
  const progress = usePlayer((s) => s.player?.progress[concept.id]);
  const cat = CATEGORY_BY_ID[concept.category];
  const done = !!progress?.completedAt;
  return (
    <Link
      to={`/learn/${concept.id}`}
      className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-20 items-center justify-between px-4" style={{ background: cat.tint }}>
        <span className="transition group-hover:scale-110">
          <CategoryIcon id={concept.category} size={48} />
        </span>
        <div className="flex flex-col items-end gap-1">
          {badge && <span className="chip bg-amber-300 text-amber-950 shadow-sm">{badge}</span>}
          {concept.flagship && (
            <span className="chip bg-white/80 text-ink">
              <Icon name="sparkle" size={16} /> Flagship
            </span>
          )}
          {concept.rarity === 'obscure' && (
            <span className="chip bg-fuchsia-100 text-fuchsia-800">
              <Icon name="gem" size={16} /> Obscure
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-lg font-bold">{concept.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-ink-soft">{concept.summary}</p>
        <div className="mt-2 flex items-center justify-between">
          <Stars difficulty={concept.difficulty} />
          {done ? (
            <span className="chip bg-emerald-100 text-emerald-800">
              <Icon name="check" size={16} /> Done
            </span>
          ) : (
            <AtpAmount
              amount={potentialReward(concept.difficulty, concept.rarity)}
              prefix="up to "
            />
          )}
        </div>
      </div>
    </Link>
  );
}
