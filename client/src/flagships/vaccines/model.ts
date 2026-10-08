/**
 * Toy infection model for the vaccine lesson (days as the time unit).
 * Virus grows logistically and is cleared by antibodies; antibody production starts
 * after a lag that is much shorter when memory cells exist.
 */
export interface Person {
  day: number;
  virus: number;
  antibodies: number;
  /** Immune memory strength: 0 = none, 1 = vaccinated, ~1.6 = boosted. */
  memory: number;
  infectedOn: number | null;
  /** Antibody level left over after vaccination ("baseline protection"). */
  baseline: number;
  peakVirus: number;
  sickDays: number;
}

export const SICK_AT = 30;

export const newPerson = (): Person => ({
  day: 0,
  virus: 0,
  antibodies: 0,
  memory: 0,
  infectedOn: null,
  baseline: 0,
  peakVirus: 0,
  sickDays: 0,
});

/** A vaccine dose: the primary (or booster) response builds memory and leaves some antibodies. */
export function vaccinate(p: Person): Person {
  const memory = p.memory === 0 ? 1 : Math.min(2, p.memory + 0.6);
  const baseline = p.memory === 0 ? 10 : 18;
  return { ...p, memory, baseline, antibodies: baseline };
}

export const expose = (p: Person): Person => ({
  ...p,
  virus: 1,
  infectedOn: p.day,
  peakVirus: 1,
  sickDays: 0,
});

export function stepPerson(p: Person, dt: number): Person {
  let { virus, antibodies } = p;
  const since = p.infectedOn === null ? -1 : p.day - p.infectedOn;
  // Antibodies: start after a lag (7 days the first time, ~2 with memory), then rise toward a ceiling.
  const lag = p.memory > 0 ? 2 : 7;
  const rate = p.memory > 0 ? 22 * p.memory : 9;
  const ceiling = p.memory > 0 ? 70 + 20 * p.memory : 70;
  if (since >= lag && (virus > 0.5 || antibodies < ceiling * 0.6)) {
    antibodies = Math.min(ceiling, antibodies + rate * dt);
  }
  if (virus > 0) {
    virus += (1.2 * virus * (1 - virus / 100) - 0.08 * antibodies * virus) * dt;
    if (virus < 0.3) virus = 0;
  }
  const sick = virus >= SICK_AT;
  // Surviving an infection also leaves memory cells behind (natural immunity).
  const recovered = p.virus > 0 && virus === 0 && p.memory === 0;
  return {
    ...p,
    memory: recovered ? 1 : p.memory,
    day: p.day + dt,
    virus,
    antibodies,
    peakVirus: Math.max(p.peakVirus, virus),
    sickDays: p.sickDays + (sick ? dt : 0),
  };
}

export function simulateDays(p: Person, days: number, dt = 0.05): Person[] {
  const out = [p];
  for (let i = 0; i < days / dt; i++) out.push((p = stepPerson(p, dt)));
  return out;
}
