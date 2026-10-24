import { useState } from 'react';
import type { Diagram, HighSchoolInfo } from '@bioplay/shared';
import { DiagramView } from './DiagramView';

/** High School lesson extras: labeled diagrams and key vocabulary side by side. */
export function HighSchoolExtras({ info }: { info: HighSchoolInfo }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
      <DiagramsCard diagrams={info.diagrams} />
      <section aria-labelledby="terms-h" className="border-t border-line pt-4 lg:self-start">
        <h2 id="terms-h" className="mb-2 flex items-center gap-2 text-2xl font-extrabold">
          Key terms
        </h2>
        <dl className="flex flex-col gap-2.5">
          {info.keyTerms.map((t) => (
            <div key={t.term}>
              <dt className="font-extrabold">{t.term}</dt>
              <dd className="text-sm text-ink-soft">{t.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/** A lesson's labeled diagrams, one at a time, with tabs when there are several. */
export function DiagramsCard({ diagrams }: { diagrams: Diagram[] }) {
  const [current, setCurrent] = useState(0);
  const many = diagrams.length > 1;
  return (
    <section aria-labelledby="diagrams-h" className="min-w-0 border-t border-line pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="diagrams-h" className="flex items-center gap-2 text-2xl font-extrabold">
          {many ? 'Diagrams' : 'Diagram'}
        </h2>
        {many && (
          <div
            role="tablist"
            aria-label="Diagrams"
            className="flex gap-1 rounded-xl bg-slate-100 p-1"
          >
            {diagrams.map((d, i) => (
              <button
                key={d.title}
                role="tab"
                aria-selected={i === current}
                onClick={() => setCurrent(i)}
                className={`rounded-lg px-3 py-1 text-sm font-bold ${i === current ? 'bg-surface shadow' : 'text-ink-soft'}`}
              >
                {i + 1}. {d.title}
              </button>
            ))}
          </div>
        )}
      </div>
      <DiagramView key={current} diagram={diagrams[current]} />
    </section>
  );
}
