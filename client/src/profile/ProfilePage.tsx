import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AVATARS,
  CATEGORIES,
  CONCEPTS,
  DIFFICULTY_LABEL,
  MYSTERIES,
  STREAK_BONUS_CAP,
  streakBonus,
  utcDay,
  type Difficulty,
} from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { AtpIcon, NucleotideIcon } from '../components/Atp';
import { InstallApp } from '../components/InstallApp';
import { CategoryIcon, Icon, type IconName } from '../components/Icon';
import type { ReactNode } from 'react';

export function ProfilePage() {
  const player = usePlayer((s) => s.player);
  const rename = usePlayer((s) => s.rename);
  const [name, setName] = useState(player?.displayName ?? '');
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!player) return <p className="card p-6">Loading your lab notebook…</p>;

  const done = (id: string) => !!player.progress[id]?.completedAt;
  const completed = CONCEPTS.filter((c) => done(c.id));
  const owned = AVATARS.filter((a) => player.inventory[a.id]).length;
  const today = utcDay(new Date());
  const activeToday = player.lastActiveDay === today;
  const nextBonus = streakBonus(
    activeToday ? player.streak + 1 : player.lastActiveDay ? player.streak + 1 : 1,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="card flex flex-wrap items-center gap-5 p-5">
        <PlayerAvatar size={96} />
        <div className="min-w-48 flex-1">
          {editing ? (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                rename(name)
                  .then(() => (setEditing(false), setErr(null)))
                  .catch((x: Error) => setErr(x.message));
              }}
            >
              <label className="sr-only" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-slate-50 px-3 py-2 font-bold ring-1 ring-black/10"
                autoFocus
              />
              <button className="btn-primary py-2">Save</button>
            </form>
          ) : (
            <h1 className="flex items-center gap-2 text-4xl font-extrabold">
              {player.displayName}
              <button
                className="text-base text-indigo-700 underline"
                onClick={() => setEditing(true)}
              >
                edit
              </button>
            </h1>
          )}
          {err && <p className="text-sm text-amber-800">{err}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip bg-amber-100 py-1 text-amber-900">
              <AtpIcon /> {player.atp} ATP
            </span>
            <span className="chip bg-violet-100 py-1 text-violet-900">
              <NucleotideIcon /> {player.nucleotides} nucleotides
            </span>
            <InstallApp className="py-1 text-sm" />
            <span className="chip bg-sky-100 py-1 text-sky-900">
              🃏 {owned}/{AVATARS.length} avatars
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          big={`${completed.length}`}
          label={`of ${CONCEPTS.length} concepts completed`}
          icon="book"
        />
        <div className="card flex flex-col gap-1 p-5" data-testid="streak-card">
          <Icon name="flame" size={44} />
          <span className="text-4xl font-extrabold">{player.streak}-day streak</span>
          <span className="text-sm text-ink-soft">
            Longest: {player.longestStreak} day{player.longestStreak === 1 ? '' : 's'}
          </span>
          <span className="text-sm font-semibold text-orange-700">
            {activeToday
              ? `Done for today! Come back tomorrow for +${nextBonus} ATP.`
              : `Learn something today to keep it going (+${nextBonus} ATP, up to ${STREAK_BONUS_CAP}).`}
          </span>
        </div>
        <Stat
          big={`${player.mysteriesSolved.length}`}
          label={`of ${MYSTERIES.length || 15} Bio Mysteries solved`}
          icon="mystery"
          link="/mysteries"
        />
      </div>

      <section className="card p-5" aria-labelledby="diff-h">
        <h2 id="diff-h" className="mb-3 text-2xl font-extrabold">
          By difficulty
        </h2>
        <div className="flex flex-col gap-2">
          {([1, 2, 3, 4, 5] as Difficulty[]).map((d) => {
            const all = CONCEPTS.filter((c) => c.difficulty === d);
            const n = all.filter((c) => done(c.id)).length;
            return (
              <Bar
                key={d}
                label={`${'★'.repeat(d)} ${DIFFICULTY_LABEL[d]}`}
                n={n}
                total={all.length}
                color="#f59e0b"
              />
            );
          })}
        </div>
      </section>

      <section className="card p-5" aria-labelledby="cat-h">
        <h2 id="cat-h" className="mb-3 text-2xl font-extrabold">
          By category
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          {CATEGORIES.map((c) => {
            const all = CONCEPTS.filter((x) => x.category === c.id);
            const n = all.filter((x) => done(x.id)).length;
            return (
              <Link
                key={c.id}
                to={`/library?cat=${c.id}`}
                className="rounded-xl p-1 hover:bg-slate-50"
              >
                <Bar
                  icon={<CategoryIcon id={c.id} size={20} />}
                  badge={
                    player.achievements.includes(`category:${c.id}`) ? (
                      <Icon name="medal" size={20} label="Category complete" />
                    ) : null
                  }
                  label={c.name}
                  n={n}
                  total={all.length}
                  color={c.color}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({
  big,
  label,
  icon,
  link,
}: {
  big: string;
  label: string;
  icon: IconName;
  link?: string;
}) {
  const inner = (
    <>
      <Icon name={icon} size={44} />
      <span className="text-4xl font-extrabold">{big}</span>
      <span className="text-sm text-ink-soft">{label}</span>
    </>
  );
  return link ? (
    <Link to={link} className="card flex flex-col gap-1 p-5 hover:-translate-y-0.5">
      {inner}
    </Link>
  ) : (
    <div className="card flex flex-col gap-1 p-5">{inner}</div>
  );
}

function Bar({
  label,
  icon,
  badge,
  n,
  total,
  color,
}: {
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  n: number;
  total: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm font-bold">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
          {badge}
        </span>
        <span>
          {n}/{total}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={n}
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${(n / Math.max(1, total)) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
