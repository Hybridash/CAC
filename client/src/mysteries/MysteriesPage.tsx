import { Link } from 'react-router-dom';
import {
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
          Bio Mysteries
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
      <ul className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
        {MYSTERIES.map((m) => {
          const unlocked = isMysteryUnlocked(m, done);
          const isSolved = solved.has(m.id);
          return (
            <li key={m.id}>
              <Link
                to={`/mysteries/${m.id}`}
                className={`group flex h-full gap-4 border-t border-line pt-4 pb-2 ${unlocked ? '' : 'opacity-85'}`}
                aria-label={`${m.title}. ${isSolved ? 'Solved' : unlocked ? 'Unlocked' : 'Locked'}`}
              >
                <span className="mt-0.5 shrink-0" aria-hidden>
                  {unlocked ? (
                    <CategoryIcon id={m.category} size={48} />
                  ) : (
                    <Icon name="lock" size={44} />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2 className="text-xl leading-snug font-extrabold group-hover:underline">
                    {m.title}
                  </h2>
                  <span className="line-clamp-3 text-sm text-ink-soft">{m.scenario}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span
                      className={`font-semibold ${isSolved ? 'text-emerald-700' : unlocked ? 'text-brand-dark' : 'text-ink-soft'}`}
                    >
                      {isSolved ? 'Solved' : unlocked ? 'Open case' : 'Locked'}
                    </span>
                    <Stars difficulty={m.difficulty} />
                    <AtpAmount amount={mysteryReward(m.difficulty)} prefix="+" />
                  </span>
                  {!isSolved && (
                    <span className="text-sm text-ink-soft">
                      Needs:{' '}
                      {m.requires.map((id, i) => (
                        <span key={id} className={done(id) ? 'text-emerald-700' : ''}>
                          {i > 0 && ', '}
                          {CONCEPT_BY_ID[id]?.title}
                          {done(id) && ' (done)'}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
