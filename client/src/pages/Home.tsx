import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, CONCEPT_BY_ID, CONCEPTS } from '@bioplay/shared';
import { SearchBox } from '../components/SearchBox';
import { ConceptCard } from '../components/ConceptBits';
import { AtpIcon } from '../components/Atp';
import { InstallApp } from '../components/InstallApp';
import { todaysConceptId } from '../lib/library';
import { usePlayer } from '../store/player';
import { inkFor } from '../lib/color';
import { CategoryIcon, Icon } from '../components/Icon';

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

  const random = () => {
    const pool = CONCEPTS.filter((c) => !progress[c.id]?.completedAt);
    const pick = (pool.length ? pool : CONCEPTS)[
      Math.floor(Math.random() * (pool.length || CONCEPTS.length))
    ];
    if (pick) navigate(`/learn/${pick.id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-200 via-teal-100 to-sky-200 px-5 py-10 text-center sm:px-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none opacity-30">
          <span className="animate-float absolute top-4 left-6">
            <Icon name="microbe" size={56} />
          </span>
          <span className="animate-float absolute top-10 right-10 [animation-delay:1s]">
            <Icon name="dna" size={56} />
          </span>
          <span className="animate-float absolute bottom-6 left-1/4 [animation-delay:.5s]">
            <Icon name="sprout" size={52} />
          </span>
          <span className="animate-float absolute right-1/4 bottom-4 [animation-delay:1.5s]">
            <Icon name="brain" size={52} />
          </span>
        </div>
        <h1 className="relative text-4xl font-extrabold sm:text-6xl">
          Biology you can <span className="text-brand-dark">play with</span>.
        </h1>
        <p className="relative mx-auto mt-3 max-w-xl text-lg text-ink-soft">
          Drag, drop, poke and break living systems to see how they really work. Earn ATP, open
          packs, collect critters.
        </p>
        <div className="relative mx-auto mt-6 max-w-2xl">
          <SearchBox size="lg" />
        </div>
        <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
          <button className="btn-ghost" onClick={random}>
            <Icon name="dice" size={22} /> Random concept
          </button>
          <Link to="/library" className="btn-ghost">
            <Icon name="book" size={22} /> Browse all {CONCEPTS.length}
          </Link>
          <InstallApp />
          <span className="chip bg-white/80 py-1.5 text-base text-amber-900">
            <AtpIcon /> {player?.atp ?? 0} ATP
          </span>
          {!!player?.streak && (
            <span className="chip bg-white/80 py-1.5 text-base text-orange-700">
              <Icon name="flame" size={20} /> {player.streak}-day streak
            </span>
          )}
        </div>
      </section>

      {cotdConcept && (
        <section aria-labelledby="cotd" className="grid items-center gap-4 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="cotd" className="text-2xl font-extrabold">
              <Icon name="sun" size={28} className="-mt-1 mr-1" />
              Concept of the Day
            </h2>
            <p className="text-ink-soft">All of today’s rewards for this one are worth 1.5× ATP.</p>
          </div>
          <div className="max-w-sm">
            <ConceptCard concept={cotdConcept} badge="×1.5 ATP today" />
          </div>
        </section>
      )}

      <section aria-labelledby="cont">
        <h2 id="cont" className="mb-3 text-2xl font-extrabold">
          {continueList.length ? 'Continue learning' : 'Great places to start'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(continueList.length ? continueList : starters).map((c) => (
            <ConceptCard key={c.id} concept={c} />
          ))}
        </div>
      </section>

      <section aria-labelledby="cats">
        <h2 id="cats" className="mb-3 text-2xl font-extrabold">
          Explore by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const all = CONCEPTS.filter((x) => x.category === c.id);
            const done = all.filter((x) => progress[x.id]?.completedAt).length;
            return (
              <Link
                key={c.id}
                to={`/library?cat=${c.id}`}
                className="card flex items-center gap-3 p-3 transition hover:-translate-y-0.5"
                style={{ background: c.tint }}
              >
                <CategoryIcon id={c.id} size={36} />
                <span className="min-w-0">
                  <span
                    className="block leading-tight font-bold"
                    style={{ color: inkFor(c.color) }}
                  >
                    {c.name}
                  </span>
                  <span className="text-xs font-semibold text-ink-soft">
                    {done}/{all.length} done
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
