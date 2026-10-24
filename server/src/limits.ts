import type { Limit } from './security.js';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/**
 * Every abuse limit in one place. Limits are per client IP unless noted. They are deliberately
 * roomy for real use (a classroom sharing one school IP must still work) and tight for abuse.
 * Behind a reverse proxy, set TRUST_PROXY so the IP is the real client's, not the proxy's.
 */
export const LIMITS = {
  /** Every /api request. A lesson makes a handful of calls; this only stops floods. */
  global: { max: 600, windowMs: MIN } satisfies Limit,
  /** State-changing requests (POST/PATCH/...), on top of the global limit. */
  writes: { max: 120, windowMs: MIN } satisfies Limit,
  /** Creating anonymous players. Each one gets its own Bio Bot quota, so this must stay bounded. */
  session: [
    { max: 40, windowMs: 10 * MIN },
    { max: 300, windowMs: DAY },
  ] satisfies Limit[],
  auth: {
    register: [{ max: 30, windowMs: HOUR }] satisfies Limit[],
    login: [{ max: 60, windowMs: 15 * MIN }] satisfies Limit[],
    oauth: [{ max: 60, windowMs: 15 * MIN }] satisfies Limit[],
  },
  /** Wrong passwords from one IP across all accounts. */
  loginFailuresPerIp: { max: 30, windowMs: 15 * MIN } satisfies Limit,
  chat: {
    perIp: [
      { max: 12, windowMs: MIN },
      { max: 200, windowMs: DAY },
    ] satisfies Limit[],
    /** One player can't fire questions faster than this, whatever their daily quota is. */
    perUserBurst: { max: 6, windowMs: MIN } satisfies Limit,
    /** Hard ceiling on total questions per UTC day across all players (CHAT_GLOBAL_DAILY_LIMIT). */
    globalDaily: 3000,
    /** Simultaneous AI calls: overall, and per player. */
    concurrency: { total: 8, perUser: 1 },
  },
};
