# SubConnect

Connects classroom teachers with substitute teachers for specific days. Teachers write sub day plans, admins assign substitutes, and substitutes see the plans and chat with the teacher only while their assignment is active.

Stack: Next.js 15 (App Router), Tailwind CSS 4, PostgreSQL with Prisma 6, Server-Sent Events for real-time updates, TipTap for rich text, `obscenity` for chat filtering, and Vitest.

## Run it locally

Requirements: Node 20+ (tested on Node 24).

```bash
npm install
cp .env.example .env

# Terminal 1: start a local Postgres (embedded, no install needed; data lives in ./.pgdata)
npm run db:local

# Terminal 2
npm run db:push     # create tables
npm run db:seed     # sample school, people, assignments, plans
npm run dev         # http://localhost:3000
```

If you already run Postgres (locally, in Docker, or hosted), skip `db:local` and set `DATABASE_URL` in `.env`.

With npm 11+, install scripts must be allowed. The approved ones are listed under `allowScripts` in `package.json`. On a platform other than macOS arm64, approve the matching `@embedded-postgres/*` package with `npm install-scripts approve <pkg>`.

### Sample accounts (password `Password123!` for all)

| Role | Email | Notes |
|---|---|---|
| Admin | admin@maplegrove.test | Maple Grove Community School, join code `MAPLE-2026` |
| Teacher | rivera@maplegrove.test | Today is split: Jordan covers Homeroom and Periods 1 to 3, Sam covers Periods 4 and 5 (Period 5's lesson is left blank to show the reminder) |
| Teacher | chen@maplegrove.test | Upcoming 2-day assignment |
| Teacher | okafor@maplegrove.test | Past assignment with chat history |
| Teacher (elementary) | shah@maplegrove.test | 2nd grade. Taylor covers her whole day today; plan has arrival, dismissal, and a class seating chart |
| Teacher (new) | hill@maplegrove.test | Hasn't chosen a teaching level, so sees the welcome choice after signing in |
| Substitute | jordan@subs.test | Rivera's morning periods today (sees the Period 2 seating chart), past (Okafor) |
| Substitute | taylor@subs.test | Ms. Shah's whole day today (elementary view) |
| Substitute | sam@subs.test | Rivera's Periods 4 and 5 today, upcoming full days for Chen |
| Substitute | alex@subs.test | Pending approval, so they cannot sign in yet |

Seeded dates are relative to the day you run the seed. Run `npm run db:reset` to start fresh.

## Create the first admin (real deployment)

```bash
npm run db:push
npm run create-admin -- --email you@school.org --name "Your Name" --school "Lincoln High" --timezone America/Chicago
```

You will be prompted for a password. The script prints the school's join code. Teachers and substitutes use it on the sign-up page, and the admin approves each request under **People**. Admins can also create accounts directly with a temporary password. To add another admin to an existing school, pass `--school-id <id>` instead of `--school`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | Public base URL, used in email links |
| `SESSION_TTL_HOURS` | Session lifetime (default 12) |
| `STORAGE_DRIVER` | `local` (private folder, development) or `s3` |
| `LOCAL_STORAGE_DIR` | Folder for the local driver (default `./storage`, keep it outside any public folder) |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | S3-compatible storage (AWS, MinIO, R2). The bucket must be private. |
| `MAX_UPLOAD_MB` | Per-file upload limit (default 15) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional email notifications. When empty, emails are logged to the console. |

## Tests

```bash
npm test
```

- `tests/permissions.test.ts`: the access window (6 AM day-of or 6 PM evening before, ending at midnight after the last day, in the school's timezone). It also checks that substitutes cannot see plans before, after, or outside their assignment, or another teacher's plans, and that a cancelled assignment grants no access. Chat rules: read/write only while active, read-only history for the teacher and admin afterwards, nothing for outsiders.
- The same file covers per-period access: each substitute sees only their own periods' blocks and files, day-level files are shared, and period clashes are detected.
- `tests/profanity.test.ts`: clean text passes untouched (including "assessment", "Scunthorpe", "shiitake"). Masking, letter substitutions (`f@ck`, `sh1t`, `a$$hole`), repeated letters, spaced or punctuated letters (`f u c k`, `s-h-i-t`), invisible characters, and blocking of messages that are mostly profanity.

## Elementary vs. middle/high school

After their first sign-in, a teacher chooses how their day is organized. They can change it later from their home page.

- **Middle or high school.** Lesson plans are organized by period, and a different substitute can cover each period. Each period card in the editor has its own **Add seating chart** and **Add file** buttons. Only the substitute covering that period can open those files, and the server enforces this. The substitute sees them inside that period on their schedule.
- **Elementary.** One substitute covers the whole day, and the admin's assignment form only offers Full day. The server also refuses period-based assignments for elementary teachers. The plan editor has its own layout:
  - A full-day schedule (arrival, morning meeting, reading, specials, math, lunch and recess, and so on).
  - Arrival and morning routine, Dismissal, and Classroom management sections.
  - Other directions.
  - A class seating chart.

  The substitute sees the class seating chart at the top of the schedule, and the routines on the Directions tab.

## Per-period coverage

- **Bell schedule.** Admins define the school's periods under **School settings**. Removed periods are archived, not deleted, so existing assignments and plans keep their links.
- **Assignments.** An assignment covers either the **full day** or **specific periods**, so a teacher's day can be split across several substitutes. Clash checks are per period: a substitute can't be in two places in the same period, and a teacher's period can't have two substitutes.
- **Lesson plans.** Teachers write one lesson block per period. New blank plans start with every period in the bell schedule. The editor shows who covers each period. The editor and dashboards flag any covered period that has no lesson yet.
- **What each substitute sees:**
  - The lesson blocks for their own periods.
  - The general directions for the day (attendance, emergencies).
  - Day-level files.
  - Files that the teacher limited to one of their periods. Use this for seating charts with student names.
- **Other blocks.** Blocks not tied to a class period are shown only to full-day substitutes.
- **Chat.** Each substitute has a separate chat with the teacher.

## How it works

### Data model (`prisma/schema.prisma`)
- **School** has a timezone, join code, and default access-opening time.
- **User** has a role (`ADMIN`, `TEACHER`, `SUBSTITUTE`) and a status (`PENDING`, `ACTIVE`, `DISABLED`).
- **Session** stores a SHA-256 of a random token. The raw token only lives in an httpOnly cookie, and disabling a user deletes their sessions.
- **Assignment** has teacher, substitute, date range, and a precomputed `accessStartsAt` / `accessEndsAt`. Status (upcoming, active, ended, cancelled) is always computed from the current time, so access ends automatically with no background job.
- **SubDayPlan** (one per teacher per date) has **PlanBlock**s (periods) and **FileAttachment**s. **Template** stores reusable directions and periods.
- **ChatMessage** and **ChatReadState** handle chat and unread counts. **Notification** holds in-app notifications. **AuditLog** records substitute views and downloads of plans and files.

### Permissions (`src/lib/access.ts`)
All rules live in one module and run on the server for every page, route, and action:
- Teachers can view and edit only their own plans.
- Substitutes can view a plan or file only if they have a non-cancelled assignment for that teacher that is active now and covers the plan's date. Within that plan they only get the periods (and period-limited files) their assignment covers.
- Admins manage assignments and accounts for their own school and can read chat records. They cannot see plan contents, which may include student information.
- Denied requests return 404, so the server does not reveal whether something exists.
- Live streams re-check access every 20 seconds. A substitute is disconnected when an assignment ends or is cancelled.

### Privacy and security
- Passwords use bcrypt (cost 12). Sign-in is rate limited, with uniform errors and timing for unknown emails.
- Sessions use httpOnly, SameSite=Lax cookies, marked Secure in production. Server actions and API routes check the request origin.
- Rich text is sanitized on the server with an allowlist.
- Uploads are checked against an extension allowlist and the file's magic bytes, and are size limited. SVG and HTML are rejected.
- Files are stored under random keys and served only through `/api/files/[id]` after a permission check, with `Cache-Control: private, no-store`. There are no public URLs, and S3 objects are encrypted at rest.
- Emails contain only names, dates, and a link, never plan contents.
- Assignment notes carry a reminder not to include student information.

### Real-time
Server-Sent Events (`/api/stream` per user, `/api/assignments/[id]/stream` per assignment) deliver chat messages, plan updates, notifications, and unread counts through an in-process event bus (`src/lib/events.ts`). For more than one server instance, back the bus with Postgres `LISTEN/NOTIFY` or Redis pub/sub. The same applies to the in-memory rate limiter.

### Chat filter (`src/lib/profanity.ts`)
Every message is filtered on the server before it is saved or delivered. The filter uses the `obscenity` English dataset with its leet-speak, confusable-character, and repeated-letter handling. It adds NFKC normalization, removal of zero-width characters, detection of spaced-out words, and whole-word masking. A message that is mostly profanity is not sent, and the sender sees a short neutral notice. The UI has no filter settings or labels.

### Design
- Calm palette defined as tokens in `src/app/globals.css`: off-white background, muted blue primary, gray text, and one muted terracotta accent for buttons and alerts.
- No emojis.
- Illustrations are a single custom flat SVG set (`src/components/illustrations.tsx`) drawn only from the palette, with accessible titles where they carry meaning.
- Tap targets are at least 44 to 48 px. There is a mobile bottom tab bar, a skip link, visible focus rings, and labeled form controls.
