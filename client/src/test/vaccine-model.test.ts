import { describe, expect, it } from 'vitest';
import { expose, newPerson, simulateDays, SICK_AT, vaccinate } from '../flagships/vaccines/model';

describe('vaccine model', () => {
  it('an unvaccinated person gets sick, then recovers after antibodies arrive', () => {
    const run = simulateDays(expose(newPerson()), 21);
    const end = run.at(-1)!;
    expect(end.peakVirus).toBeGreaterThan(SICK_AT);
    expect(end.sickDays).toBeGreaterThan(4);
    expect(end.virus).toBe(0);
  });

  it('a vaccinated person clears the virus without getting sick', () => {
    const end = simulateDays(expose(vaccinate(newPerson())), 21).at(-1)!;
    expect(end.peakVirus).toBeLessThan(SICK_AT);
    expect(end.sickDays).toBe(0);
  });

  it('a booster lowers the peak further', () => {
    const once = simulateDays(expose(vaccinate(newPerson())), 21).at(-1)!;
    const boosted = simulateDays(expose(vaccinate(vaccinate(newPerson()))), 21).at(-1)!;
    expect(boosted.peakVirus).toBeLessThan(once.peakVirus);
  });
});
