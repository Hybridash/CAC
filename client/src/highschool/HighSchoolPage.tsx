import { useEffect } from 'react';
import { HS_LESSONS, HS_UNITS, hsLessonsIn, CATEGORY_BY_ID } from '@bioplay/shared';
import { ConceptCard } from '../components/ConceptBits';
import { usePlayer } from '../store/player';
import { LibraryTabs } from './LibraryTabs';

/** The High School section: deeper versions of core topics, grouped into course units. */
export function HighSchoolPage() {
  const progress = usePlayer((s) => s.player?.progress);
  const done = HS_LESSONS.filter((l) => progress?.[l.id]?.completedAt).length;

  useEffect(() => {
    document.title = 'High School Biology · Bio Bites';
    return () => {
      document.title = 'Bio Bites';
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <LibraryTabs />
        <div>
          <h1 className="text-4xl font-extrabold">High School Biology</h1>
          <p className="max-w-3xl text-ink-soft">
            {HS_LESSONS.length} core topics from a high school biology course, taught in more depth:
            the same hands-on interactions, plus labeled diagrams, key vocabulary and exam-style
            questions. {done > 0 && `You’ve completed ${done} so far.`}
          </p>
        </div>
        <nav aria-label="Units" className="flex flex-wrap gap-1.5">
          {HS_UNITS.map((u, i) => (
            <a
              key={u.id}
              href={`#unit-${u.id}`}
              className="chip bg-white py-1 text-sm ring-1 ring-black/10 hover:ring-2"
              style={{ color: CATEGORY_BY_ID[u.category].color }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`unit-${u.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="font-extrabold text-ink">{i + 1}</span> {u.name}
            </a>
          ))}
        </nav>
      </div>

      {HS_UNITS.map((u, i) => {
        const lessons = hsLessonsIn(u.id);
        const cat = CATEGORY_BY_ID[u.category];
        const unitDone = lessons.filter((l) => progress?.[l.id]?.completedAt).length;
        return (
          <section
            key={u.id}
            id={`unit-${u.id}`}
            aria-labelledby={`unit-${u.id}-h`}
            className="scroll-mt-24"
          >
            <div
              className="mb-3 flex flex-wrap items-end justify-between gap-2 rounded-2xl px-4 py-3"
              style={{ background: cat.tint }}
            >
              <div>
                <p
                  className="text-xs font-extrabold tracking-wide uppercase"
                  style={{ color: cat.color }}
                >
                  Unit {i + 1}
                </p>
                <h2 id={`unit-${u.id}-h`} className="text-2xl font-extrabold">
                  {u.name}
                </h2>
                <p className="text-sm text-ink-soft">{u.blurb}</p>
              </div>
              <span className="chip bg-white text-ink">
                {unitDone} / {lessons.length} done
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {lessons.map((l) => (
                <ConceptCard key={l.id} concept={l} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
