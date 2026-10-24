/**
 * Server-side abuse and hardening helpers: rate limits, a concurrency gate, security headers and
 * a security event log. Everything here is enforced on the server; nothing relies on the client.
 *
 * Storage note: limits live in this process's memory. That is correct for the single-instance
 * SQLite deployment this app ships with. If you ever run several instances, swap `RateLimiter`'s
 * map for a shared store (for example Redis) behind the same `consume` method.
 */
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './http.js';
import type { Clock } from './time.js';

// ---------------------------------------------------------------------------------- event log

/**
 * One JSON line per security-relevant event (failed logins, rate limits, denied access).
 * Never pass passwords, tokens or API keys here; emails are logged only as a short hash.
 */
export function securityLog(event: string, fields: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV === 'test' || process.env.SECURITY_LOG === 'off') return;
  console.warn(JSON.stringify({ t: new Date().toISOString(), level: 'security', event, ...fields }));
}

// ---------------------------------------------------------------------------------- limiter

export interface Limit {
  /** Requests allowed per window. */
  max: number;
  windowMs: number;
}

export interface Consumed {
  ok: boolean;
  /** Seconds until the oldest hit leaves the window (only meaningful when `ok` is false). */
  retryAfter: number;
  remaining: number;
}

/**
 * A sliding-window counter per key. Memory is bounded: expired keys are pruned as the map grows,
 * and past `maxKeys` the oldest keys are dropped so a flood of unique keys can't exhaust memory.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(
    private clock: Clock,
    private maxKeys = 50_000,
  ) {}

  consume(key: string, limit: Limit): Consumed {
    const now = this.clock().getTime();
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < limit.windowMs);
    if (list.length >= limit.max) {
      this.hits.set(key, list);
      return {
        ok: false,
        retryAfter: Math.max(1, Math.ceil((list[0] + limit.windowMs - now) / 1000)),
        remaining: 0,
      };
    }
    list.push(now);
    this.hits.delete(key); // re-insert so Map order tracks recency
    this.hits.set(key, list);
    if (this.hits.size > this.maxKeys) this.prune(now, limit.windowMs);
    return { ok: true, retryAfter: 0, remaining: limit.max - list.length };
  }

  /** Count recent hits without recording one (for "failures so far" checks). */
  peek(key: string, limit: Limit): number {
    const now = this.clock().getTime();
    return (this.hits.get(key) ?? []).filter((t) => now - t < limit.windowMs).length;
  }

  clear(key: string) {
    this.hits.delete(key);
  }

  private prune(now: number, windowMs: number) {
    for (const [k, list] of this.hits) {
      if (!list.length || now - list[list.length - 1] >= windowMs) this.hits.delete(k);
    }
    // Still too big: drop the least recently used keys.
    for (const k of this.hits.keys()) {
      if (this.hits.size <= this.maxKeys) break;
      this.hits.delete(k);
    }
  }
}

/** Short, non-reversible tag for logs ("who", without storing the email itself). */
export const tag = (value: string) => {
  let h = 0;
  for (const ch of value) h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0;
  return (h >>> 0).toString(36);
};

/** Express middleware: per-IP limit for a route group. Answers 429 with Retry-After. */
export function rateLimit(
  limiter: RateLimiter,
  name: string,
  ...limits: Limit[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const ip = req.ip ?? 'unknown';
    let worst: Consumed | null = null;
    for (const [i, limit] of limits.entries()) {
      const c = limiter.consume(`${name}:${i}:${ip}`, limit);
      if (!c.ok) {
        worst = c;
        break;
      }
    }
    if (worst) {
      securityLog('rate_limited', { route: name, ip, path: req.path });
      res.setHeader('Retry-After', String(worst.retryAfter));
      return next(new HttpError(429, 'Too many requests. Please slow down and try again shortly.'));
    }
    next();
  };
}

// ---------------------------------------------------------------------------------- concurrency

/** Caps simultaneous expensive operations (like AI calls), globally and per key. */
export class ConcurrencyGate {
  private total = 0;
  private perKey = new Map<string, number>();
  constructor(
    private maxTotal: number,
    private maxPerKey: number,
  ) {}
  /** Returns a release function, or null if the caller must wait or be refused. */
  enter(key: string): (() => void) | null {
    const mine = this.perKey.get(key) ?? 0;
    if (this.total >= this.maxTotal || mine >= this.maxPerKey) return null;
    this.total++;
    this.perKey.set(key, mine + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.total--;
      const left = (this.perKey.get(key) ?? 1) - 1;
      if (left <= 0) this.perKey.delete(key);
      else this.perKey.set(key, left);
    };
  }
}

// ---------------------------------------------------------------------------------- headers

/**
 * Content Security Policy for the built app. Scripts only from this origin (plus Google/Apple
 * sign-in); styles allow inline because React and framer-motion set style attributes.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' https://accounts.google.com https://appleid.cdn-apple.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://accounts.google.com https://appleid.apple.com",
  'frame-src https://accounts.google.com https://appleid.apple.com',
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export function securityHeaders(production: boolean) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    // HSTS only makes sense (and is only honoured) over HTTPS in production.
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}

/** API responses must never be cached by browsers or shared proxies. */
export function noStoreApi(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

/**
 * How many reverse proxies sit in front of this server (TRUST_PROXY=1 behind one load balancer).
 * Default 0: X-Forwarded-For is ignored, so a client can't spoof its IP to dodge per-IP limits.
 */
export function trustProxyHops(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number.parseInt(env.TRUST_PROXY ?? '0', 10);
  return Number.isFinite(n) && n > 0 && n <= 5 ? n : 0;
}

export const isLoopback = (ip: string | undefined) =>
  !!ip && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');
