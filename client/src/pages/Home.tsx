import { Link, useNavigate } from 'react-router-dom';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  CONCEPT_BY_ID,
  CONCEPTS,
  potentialReward,
} from '@bioplay/shared';
import { SearchBox } from '../components/SearchBox';
import { AtpAmount } from '../components/Atp';
import { InstallApp } from '../components/InstallApp';
import { AccountCard } from '../components/AccountCard';
import { todaysConceptId } from '../lib/library';
import { usePlayer } from '../store/player';
import { inkFor } from '../lib/color';
import { CategoryIcon } from '../components/Icon';
import { UiIcon } from '../components/UiIcon';

export function HomePage() {
  const player = usePlayer((s) => s.player);
  const navigate = useNavigate();
  const cotd = todaysConceptId();
  const cotdConcept = cotd ? CONCEPT_BY_ID[cotd] : null;

  // "Continue learning": started but unfinished first, then recently finished concepts' relatives.
  const progress = player?.progress ?? {};
  const inProgress = Object.entries(progress)
    .filter(([, p]) => !p.completedAt)
    .map(([id]) => CONCEPT_BY_ID[id])
    .filter(Boolean);
  const nextUp = Object.entries(progress)
    .filter(([, p]) => p.completedAt)
    .flatMap(([id]) => CONCEPT_BY_ID[id]?.relatedConcepts ?? [])
    .filter((id) => !progress[id]?.completedAt)
    .map((id) => CONCEPT_BY_ID[id])
    .filter(Boolean);
  const continueList = [...new Set([...inProgress, ...nextUp])].slice(0, 4);
  const starters = CONCEPTS.filter((c) => c.flagship).slice(0, 4);
  const completed = Object.values(progress).filter((p) => p.completedAt).length;
  // The path: the latest finished lesson, then what to do next.
  const lastDone = Object.entries(progress)
    .filter(([, p]) => p.completedAt)
    .sort(([, a], [, b]) => String(b.completedAt).localeCompare(String(a.completedAt)))
    .map(([id]) => CONCEPT_BY_ID[id])
    .find(Boolean);
  const upNext = (continueList.length ? continueList : starters).slice(0, 4);
  const path = [...(lastDone ? [lastDone] : []), ...upNext];

  const random = () => {
    const pool = CONCEPTS.filter((c) => !progress[c.id]?.completedAt);
    const pick = (pool.length ? pool : CONCEPTS)[
      Math.floor(Math.random() * (pool.length || CONCEPTS.length))
    ];
    if (pick) navigate(`/learn/${pick.id}`);
  };

  const cotdCat = cotdConcept ? CATEGORY_BY_ID[cotdConcept.category] : null;

  return (
    <div className="flex flex-col gap-14">
      <section className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <div>
          <h1 className="enter text-[clamp(2.4rem,5.4vw,4rem)] leading-[1.02] font-extrabold">
            Biology is not hard, you just have to learn it.
          </h1>
          <p className="enter mt-4 max-w-[52ch] text-lg text-ink-soft" style={{ ['--d' as string]: '70ms' }}>
            Every lesson is a short experiment you can touch, followed by a three-question quiz.
            Finish them to earn ATP for card packs.
          </p>
          <div className="enter mt-7 max-w-xl" style={{ ['--d' as string]: '130ms' }}>
            <SearchBox size="lg" />
          </div>
          <div className="enter mt-4 flex flex-wrap gap-2" style={{ ['--d' as string]: '180ms' }}>
            <button className="btn-ghost" onClick={random}>
              <UiIcon name="dice" size={20} /> Random concept
            </button>
            <Link to="/library/high-school" className="btn-ghost">
              <UiIcon name="flask" size={20} /> High school biology
            </Link>
            <InstallApp />
          </div>
        </div>

        {cotdConcept && cotdCat && (
          <aside aria-labelledby="cotd" className="enter border-t-2 border-ink pt-5" style={{ ['--d' as string]: '110ms' }}>
            <h2 id="cotd" className="text-sm font-semibold text-ink-soft">
              Concept of the day
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <CategoryIcon id={cotdConcept.category} size={64} />
              <span className="text-sm font-semibold text-ink-soft">{cotdCat.name}</span>
            </div>
            <p className="mt-4 font-display text-2xl leading-tight">
              {cotdConcept.title}
            </p>
            <p className="mt-2 line-clamp-3 text-ink-soft">{cotdConcept.summary}</p>
            <p className="mt-3 text-sm font-semibold text-atp-dark">Worth 1.5× ATP today</p>
            <Link to={`/learn/${cotdConcept.id}`} className="btn-primary mt-5">
              Start lesson
            </Link>
          </aside>
        )}
      </section>

      {/* Once a guest has something worth keeping, offer to save it. */}
      {player && !player.account && Object.keys(player.progress).length > 0 && (
        <AccountCard compact />
      )}

      <section aria-labelledby="cont">
        <div className="wave-rule mb-6" aria-hidden />
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="cont" className="text-2xl">
            {continueList.length ? 'Your path' : 'Start here'}
          </h2>
          <div className="w-full max-w-60 sm:w-60">
            <p className="mb-1.5 text-sm font-medium text-ink-soft">
              {completed} of {CONCEPTS.length} concepts done
            </p>
            <div
              className="scale"
              role="progressbar"
              aria-label="Concepts completed"
              aria-valuemin={0}
              aria-valuemax={CONCEPTS.length}
              aria-valuenow={completed}
              style={{ ['--v' as string]: `${(completed / CONCEPTS.length) * 100}%` }}
            >
              <i />
            </div>
          </div>
        </div>
        <ol className="max-w-3xl">
          {path.map((c, i) => {
            const done = !!progress[c.id]?.completedAt;
            const current = !done && path.findIndex((x) => !progress[x.id]?.completedAt) === i;
            const last = i === path.length - 1;
            const cat = CATEGORY_BY_ID[c.category];
            return (
              <li key={c.id} className="relative flex gap-4 pb-7 last:pb-0">
                {!last && (
                  <span
                    aria-hidden
                    className={`path-line absolute top-8 bottom-0 left-[13px] w-0 border-l-2 ${done ? 'border-brand' : 'border-dashed border-slate-300'}`}
                    style={{ ['--d' as string]: `${260 + i * 110}ms` }}
                  />
                )}
                <span
                  aria-hidden
                  style={{ ['--d' as string]: `${300 + i * 110}ms` }}
                  className={`node-pop relative z-10 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    done
                      ? 'bg-brand text-white'
                      : current
                        ? 'bg-night text-white ring-4 ring-brand-tint'
                        : 'bg-paper text-ink-soft ring-2 ring-slate-300'
                  }`}
                >
                  {done ? <UiIcon name="check" size={16} /> : <span className="text-xs">{i + (lastDone ? 0 : 1)}</span>}
                </span>
                <Link
                  to={`/learn/${c.id}`}
                  className="enter group flex min-w-0 flex-1 gap-4"
                  style={{ ['--d' as string]: `${340 + i * 110}ms` }}
                >
                  <span className="grid w-14 shrink-0 place-items-start">
                    <CategoryIcon id={c.category} size={current ? 56 : 44} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <h3 className={`group-hover:underline ${current ? 'text-xl' : 'text-lg'}`}>
                      {c.title}
                    </h3>
                    <span className="mt-0.5 line-clamp-2 block text-sm text-ink-soft">
                      {c.summary}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                      <span className="font-medium">{cat.name}</span>
                      {done ? (
                        <span className="font-semibold text-brand-dark">Done</span>
                      ) : (
                        <AtpAmount amount={potentialReward(c.difficulty, c.rarity)} prefix="up to " />
                      )}
                    </span>
                    {current && (
                      <span className="btn-primary mt-3">
                        {progress[c.id] ? 'Continue' : 'Start'}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="cats">
        <div className="wave-rule mb-6" aria-hidden />
        <div className="mb-2 flex items-end justify-between gap-4">
          <h2 id="cats" className="text-2xl">
            Topics
          </h2>
          <Link to="/library" className="text-sm font-semibold text-brand-dark underline">
            See the full library
          </Link>
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const all = CONCEPTS.filter((x) => x.category === c.id);
            const done = all.filter((x) => progress[x.id]?.completedAt).length;
            return (
              <li key={c.id} className="border-b border-line">
                <Link
                  to={`/library?cat=${c.id}`}
                  className="group flex items-center gap-3 py-3.5 transition-colors hover:bg-white/70"
                >
                  <span className="shrink-0">
                    <CategoryIcon id={c.id} size={40} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate leading-tight font-semibold group-hover:underline"
                      style={{ color: inkFor(c.color) }}
                    >
                      {c.name}
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span
                        className="scale flex-1"
                        style={{
                          ['--v' as string]: `${(done / all.length) * 100}%`,
                          ['--scale-color' as string]: c.color,
                        }}
                      >
                        <i />
                      </span>
                      <span className="text-xs font-medium text-ink-soft tabular-nums">
                        {done}/{all.length}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
