import type { OlyFilter, OlyFormat, OlyLevel, OlySkill, OlyTopic } from '@bioplay/shared';

export type OlyStatus = 'all' | 'new' | 'wrong' | 'right' | 'saved';

const list = (p: URLSearchParams, key: string) => (p.get(key) ?? '').split(',').filter(Boolean);

/** Read question filters from a URL query (shared by the practice page and custom tests). */
export function readFilter(p: URLSearchParams): OlyFilter & { status: OlyStatus } {
  const ids = list(p, 'ids');
  return {
    topics: list(p, 'topic') as OlyTopic[],
    levels: list(p, 'level').map(Number) as OlyLevel[],
    formats: list(p, 'format') as OlyFormat[],
    skills: list(p, 'skill') as OlySkill[],
    text: p.get('q') ?? '',
    ids: ids.length ? ids : undefined,
    status: (p.get('status') as OlyStatus) || 'all',
  };
}

/** Toggle one value in a comma-separated query parameter. */
export function toggleParam(p: URLSearchParams, key: string, value: string) {
  const cur = list(p, key);
  const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
  const out = new URLSearchParams(p);
  if (next.length) out.set(key, next.join(','));
  else out.delete(key);
  return out;
}
