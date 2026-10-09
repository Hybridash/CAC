import { Link } from 'react-router-dom';
import {
  CATEGORY_BY_ID,
  CONCEPT_BY_ID,
  isMysteryUnlocked,
  MYSTERIES,
  mysteryReward,
} from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { Stars } from '../components/ConceptBits';
import { AtpAmount } from '../components/Atp';
import { CategoryIcon, Icon } from '../components/Icon';

export function MysteriesPage() {
  const player = usePlayer((s) => s.player);
  const done = (id: string) => !!player?.progress[id]?.completedAt;
  const solved = new Set(player?.mysteriesSolved ?? []);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="flex items-center gap-2 text-4xl font-extrabold">
          <Icon name="mystery" size={44} /> Bio Mysteries
        </h1>
        <p className="max-w-2xl text-ink-soft">
          Real-world puzzles that combine what you’ve learned. Examine the clues, pick an
          explanation and back it up with evidence. Cases unlock when you’ve completed their
          concepts. Your first solve wins a guaranteed mystery-exclusive avatar!
        </p>
        <p className="mt-1 text-sm font-bold">
          {solved.size} of {MYSTERIES.length} cases solved
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MYSTERIES.map((m) => {
          const unlocked = isMysteryUnlocked(m, done);
          const isSolved = solved.has(m.id);
          const cat = CATEGORY_BY_ID[m.category];
          return (
            <li key={m.id}>
              <Link
                to={`/mysteries/${m.id}`}
                className={`card relative flex h-full flex-col gap-2 overflow-hidden p-4 transition hover:-translate-y-1 ${unlocked ? '' : 'opacity-90'}`}
                aria-label={`${m.title}. ${isSolved ? 'Solved' : unlocked ? 'Unlocked' : 'Locked'}`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ background: cat.tint }}
                    aria-hidden
                  >
                    {unlocked ? (
                      <CategoryIcon id={m.category} size={38} />
                    ) : (
                      <Icon name="lock" size={34} />
                    )}
                  </span>
                  <span
                    className={`chip ${isSolved ? 'bg-amber-300 text-amber-950' : unlocked ? 'bg-violet-100 text-violet-900' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {isSolved ? '✓ Solved' : unlocked ? 'Open case' : 'Locked'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold">{m.title}</h2>
                <p className="line-clamp-3 text-sm text-ink-soft">{m.scenario}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <Stars difficulty={m.difficulty} />
                  <AtpAmount amount={mysteryReward(m.difficulty)} prefix="+" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.requires.map((id) => (
                    <span
                      key={id}
                      className={`chip text-[11px] ${done(id) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {done(id) ? '✓' : '○'} {CONCEPT_BY_ID[id]?.title}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
