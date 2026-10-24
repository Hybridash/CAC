# Security

This file records the security audit of Bio Bites, what was fixed, what was tested, and what still
needs attention. It is honest about limits: **this app has been hardened and tested, not proven
secure.** An independent review is still worth doing before it handles real student data at scale.

Audited: 2026-10-23, the whole repository (server, shared logic, client, build and CI config).

## How the app is built (so the findings make sense)

- One Node/Express API (`server/`) with a SQLite file, and a React app (`client/`) served by that
  server in production. There is no Supabase, no ORM and no separate admin area.
- Every player starts as an anonymous guest with a random 256-bit bearer token (stored hashed).
  They can later attach an email + password, Google, or Apple sign-in.
- All reward amounts, quiz grading, pack odds and purchases are computed on the server.
- The only paid third-party call is Bio Bot (Google Gemini), made from the server with a key that
  never reaches the browser.

## Audit findings (original severity) and status

| # | Severity | Finding | Where | Status |
|---|---|---|---|---|
| 1 | **High** | Unlimited anonymous players: `POST /api/session` had no limit, and each new player gets its own Bio Bot quota. A script could mint players to bypass the per-player quota and run up the AI bill, bloat the database, and farm rewards. | `routes/player.ts`, `routes/chat.ts` | **Fixed**: per-IP limits on creating players, per-IP and per-player limits on chat, a server-wide daily question ceiling (`CHAT_GLOBAL_DAILY_LIMIT`), and a concurrency cap on AI calls. |
| 2 | **High** | No rate limiting on login, registration or sign-in. The only brake was an in-memory per-email counter: no per-IP limit (credential stuffing across emails), unbounded memory growth, lost on restart. | `routes/auth.ts`, `accounts.ts` | **Fixed**: per-IP limits on each auth route, per-email and per-IP wrong-password lockouts (429 + `Retry-After`), bounded memory. |
| 3 | **High** | Two known-vulnerable dependencies: `body-parser` (denial of service) and `zod` (memory exhaustion on large inputs). | `package-lock.json` | **Fixed** with `npm audit fix`. 3 *moderate* findings remain in `@capacitor/cli` (a dev-only build tool for the iOS app, not part of the server or website). Fixing needs a breaking upgrade; see Remaining risks. |
| 4 | **High** (when deployed) | The demo account (`demo@gmail.com` / `demo123`) was created by default, with a password published in the README. On a public server anyone could log in to it. | `index.ts`, `accounts.ts` | **Fixed**: off by default in production; on only if `DEMO_ACCOUNT=on` is set deliberately (the server warns loudly). |
| 5 | Medium | Sessions never expired and never could be revoked everywhere; one player could accumulate unlimited tokens. A stolen token worked forever. | `repo.ts`, `db.ts` | **Fixed**: 90-day idle / 365-day absolute expiry, a cap of 20 sessions per player, `POST /api/auth/sign-out-all`, hourly cleanup. |
| 6 | Medium | No security headers: no Content-Security-Policy, HSTS, clickjacking or MIME-sniffing protection; `X-Powered-By: Express` revealed the framework. | `app.ts` | **Fixed**: strict CSP (no inline scripts, no dynamic-code evaluation), HSTS in production, `nosniff`, `X-Frame-Options: DENY`, referrer/permissions policies, `Cache-Control: no-store` on all API responses. The theme bootstrap script moved to a file so the CSP can forbid inline scripts. |
| 7 | Medium | Password hashing used synchronous scrypt (blocks the whole server per login, a denial-of-service lever) and unknown emails skipped hashing (timing revealed which emails have accounts). | `accounts.ts` | **Fixed**: async scrypt (stronger cost, old hashes still verify), dummy hash for unknown emails, absurd stored parameters refused. |
| 8 | Medium | Weak password rules: 6 characters, `password123` accepted. | `accounts.ts`, client form | **Fixed**: 8+ characters; common, repeated and email-derived passwords rejected (server-enforced). |
| 9 | Medium | No server timeouts or concurrency control. Slow clients could hold connections open; AI calls were unbounded. | `index.ts`, `routes/chat.ts` | **Fixed**: request/header/keep-alive timeouts; AI concurrency gate. |
| 10 | Low-Medium | Malformed or oversized JSON produced a logged 500 (log flooding, inconsistent errors). | `http.ts` | **Fixed**: 400 / 413 with safe messages; no stack traces to clients. |
| 11 | Low-Medium | Development landing page inserted the request path into HTML unescaped (reflected HTML injection; development mode only). | `app.ts` | **Fixed**: path filtered and escaped. |
| 12 | Low | `/api/health` exposed the process id and start time to anyone. | `app.ts` | **Fixed**: shown only to the local machine (needed by the launch scripts). |
| 13 | Low | IP limits are only meaningful if the real client IP is known; no proxy setting existed. | `security.ts` | **Fixed**: `TRUST_PROXY` (default 0: `X-Forwarded-For` is ignored so it cannot be forged). |
| 14 | Low | Database file and folder were created with default (world-readable) permissions; no backup procedure. | `db.ts` | **Fixed**: folder `700`, file `600`. `npm run backup` makes a verified snapshot (integrity-checked, 14 kept). |
| 15 | Low | No security event logging. | server | **Fixed**: JSON log lines for failed logins, lockouts, rate limits, denied access, session revocations, quota hits. Emails are logged only as a short hash; no passwords, tokens or keys. Client IP addresses are logged (needed to respond to abuse), so keep these logs private and delete them after about 30 days. |
| 16 | Info | `.env.example` was referenced by the README but missing. | repo root | **Fixed**: added, with every variable documented. |
| 17 | Info / by design | Quiz answers ship inside the client bundle, and "I finished the interaction" is the client's word. A technical player can claim rewards without learning. ATP has no cash value, and rewards are per-concept one-time, so this is bounded. | `services/progress.ts` | **Accepted** (see Remaining risks). |

### Checked and found OK

- **Secrets:** no API keys, tokens or passwords in the source or build output. `.env` is git-ignored
  and currently holds no real secrets (`GEMINI_API_KEY`, Google and Apple IDs are all empty). The
  project is not a git repository, so there is no history to scrub. The client reads only four
  public settings (`VITE_API_URL` and three OAuth client IDs, which are public by design). The
  production bundle has no source maps and no secret patterns.
- **SQL injection:** every query is parameterized (`better-sqlite3` prepared statements). The one
  dynamic column name in `credit()` is chosen from a two-value type, never from input.
- **Broken access control / IDOR:** every data query is scoped by the authenticated user's id taken
  from the token. The only client-supplied identifiers (`avatarId`, concept and mystery ids) are
  checked against the caller's own inventory or a fixed catalog. There are no admin routes.
- **XSS:** the React client uses none of the raw-HTML injection APIs (no HTML-string insertion, no
  dynamic code evaluation). Bio Bot replies are rendered by a small formatter that builds React
  elements, not HTML.
- **CSRF:** not applicable to this design. Authentication is a bearer token in the `Authorization`
  header, never a cookie, so another site cannot make the browser send it.
- **Open redirects / SSRF / uploads / deserialization:** none of these features exist. The server
  makes one outbound call, to a fixed Gemini URL.
- **Race conditions:** purchases, rewards and quota counters run in SQLite transactions or single
  atomic statements. A test confirms two simultaneous registrations of one email yield one winner.
- **Google/Apple tokens:** signature, issuer, audience and expiry are verified against the
  providers' published keys.

## Tests

`server/test/security.test.ts` (75 tests) covers: every protected endpoint without a token; bad
Authorization headers; player A reaching player B's data and client-supplied roles/balances;
session expiry, revocation and the session cap; every rate limit, its reset, and spoofed
`X-Forwarded-For`; Bio Bot cost layers (burst, per-IP, daily ceiling with refunds, concurrency,
per-player quota); oversized, malformed and wrongly typed input; SQL injection, path traversal and
script text; password rules, hashing format and legacy hashes; unknown-email login behaviour; OAuth
rejection paths; security headers, HSTS, CORS allowlist and error disclosure; database file
permissions; and secrets in the production bundle.

Run them: `npm run test:security` (build the client first so the bundle scan runs).

Not covered by automated tests, because they don't apply or can't run here: Row Level Security
(no Supabase), storage-bucket permissions, file-upload limits (no uploads), real Google/Apple
sign-in (tested with a fake verifier), the end-to-end Playwright suite (needs a browser download),
and the GitHub Actions workflow (written, never run).

## Credentials that need rotation

**None.** No live secret was ever present in the project files. If you later set `GEMINI_API_KEY`
and then share the folder, a screen recording, or a zip containing `.env`, rotate that key in
Google AI Studio immediately and add a spending cap there.

## What you must do before going live

1. **Set the environment** (copy `.env.example` to `server/.env` on the server, never into the repo):
   `NODE_ENV=production`, `CLIENT_ORIGIN=https://your-domain`, `DATABASE_PATH` outside any public
   folder. Leave `DEMO_ACCOUNT` unset.
2. **Serve over HTTPS** (a reverse proxy such as Caddy or nginx, or a host that terminates TLS).
   Then set `TRUST_PROXY=1` (the number of proxies in front) so per-IP limits see real client IPs.
   Do not set it if clients connect directly.
3. **If you turn Bio Bot on:** put `GEMINI_API_KEY` in the server environment only; set a monthly
   spending cap and alert in Google Cloud; keep `CHAT_GLOBAL_DAILY_LIMIT` at a number you can afford
   (each question is a paid call). Check Google's terms for apps used by people under 18.
4. **Schedule backups:** run `npm run backup` daily (cron or launchd) and copy the `backups/` folder
   off the machine. Practice one restore: stop the server, copy a backup over the database file,
   delete the `-wal`/`-shm` files beside it, start the server.
5. **Watch the logs** for `login_blocked`, `rate_limited`, `chat_global_cap_hit` and `server_error`
   lines (JSON, one per line). Repeated `chat_global_cap_hit` means someone is hammering Bio Bot.
6. **Enable GitHub's secret scanning and Dependabot** if you push this to GitHub; the included
   workflow and `dependabot.yml` then run automatically.
7. **Run one independent test** before real student data: a second person trying to break it, or a
   scanner such as OWASP ZAP against a staging copy (never against someone else's server).

## Remaining risks and limitations (not fixed, and why)

- **No email verification or password recovery.** Both need an email service and domain, which the
  project doesn't have. Consequences: a forgotten password cannot be reset (the player keeps their
  guest progress only on that device), and someone can register an account with an email they don't
  own, which blocks the real owner from using it. Recommended next step: add a transactional email
  provider, then verification links and reset links with short expiry, one-time tokens and rate limits.
- **No multi-factor authentication and no admin accounts.** There is nothing administrative to
  protect today. If you add an admin area, require MFA and explicit server-side role checks first.
- **Rate limits live in server memory.** Correct for the single-instance SQLite setup. If you run
  several servers, move `RateLimiter` to a shared store (Redis) or each server counts separately.
  A restart also clears the counters (the Bio Bot daily ceiling is in the database and does persist).
- **Shared school networks:** many students on one IP share that IP's allowances (40 new players per
  10 minutes, 12 Bio Bot questions per minute). Raise the numbers in `server/src/limits.ts` if a
  whole class hits them.
- **Google/Apple ID tokens have no nonce.** A stolen, still-valid token could be replayed until it
  expires (about an hour). Low risk here; add a nonce if you handle sensitive data.
- **Bearer tokens live in `localStorage`.** Readable by any script on the page, so an XSS bug would
  expose them. The strict CSP and the absence of HTML-injection sinks reduce that risk a lot, but
  cookies with `HttpOnly` would be stronger (and would then require CSRF protection).
- **Client-trusted learning economy** (finding 17). Mitigated by one-time rewards, server-side
  grading, and the limits above, not eliminated. Don't give ATP real-world value without redesign.
- **Anonymous players are never deleted.** The database grows with every guest. Add a purge of
  players with no activity for 6+ months and no account.
- **`@capacitor/cli` has 3 moderate advisories** (build tooling for the iOS app only, never run on
  the server or shipped to users). Upgrading requires a major Capacitor version; do it when you next
  update the iOS app.
- **CSP keeps `'unsafe-inline'` for styles** because React and animation libraries set style
  attributes. Scripts are fully locked down, which is the part that matters for XSS.

## Reporting a problem

Open a private issue or email the maintainers. Please don't post exploits publicly. Never include
real tokens or passwords in a report.
