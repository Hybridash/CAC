# Bio Bites — Interactive Biology Made Simple

Learn biology by _doing_: drag, drop, toggle, build, and watch living systems react. Every lesson is a short
hands-on interaction plus a three-question quiz. Completing lessons earns **ATP** (the in-game currency), which buys
card packs of collectible biology avatars. No real money, ads or purchases — ever.

- **154 concepts** across 12 categories, from food chains to nonsense-mediated decay
- **10 hand-built flagship lessons** (Insulin, Action Potentials, Photosynthesis, DNA → Protein, Mitosis, Vaccines,
  Electron Transport Chain, Natural Selection, Food Chains, Antibiotic Resistance)
- **10 reusable interaction templates** that power the rest of the library from plain data
- **18 Bio Mysteries** — detective cases that combine concepts
- **72 avatars** (54 from packs, 12 category-locked, 6 mystery-exclusive), each with a real biology fact
- Knowledge Map, streaks, Concept of the Day, fuzzy search, offline-friendly client

## Setup

```bash
git clone <repo-url> bioplay
cd bioplay
nvm use            # Node 24 LTS (see .nvmrc)
npm install
cp .env.example server/.env   # optional — the defaults work
npm run dev        # API on http://localhost:3001 + client on http://localhost:5173
```

Open <http://localhost:5173>. A player profile is created automatically on first visit (no sign-up); its token is
kept in `localStorage`.

> `npm install` runs native install scripts for `better-sqlite3` and `esbuild`; these are pre-approved in
> `package.json` (`allowScripts`).

### Scripts

| Command                           | What it does                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run app`                     | Build and run BioPlay as an installable app on http://localhost:3000                           |
| `npm run dev`                     | Start API (tsx watch) and client (Vite) together                                               |
| `npm test`                        | Unit tests in all workspaces (Vitest)                                                          |
| `npm run test:e2e`                | Playwright smoke tests against a production build (run `npx playwright install chromium` once) |
| `npm run typecheck`               | TypeScript in all workspaces                                                                   |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                              |
| `npm run build`                   | Typecheck everything and build the client                                                      |
| `npm start`                       | Production mode: the API also serves `client/dist` (set `PORT`, `DATABASE_PATH`)               |

## Installing BioPlay as an app

BioPlay is a Progressive Web App: it installs from the browser and then opens in its own window with its own icon,
like any other app.

1. In a terminal, run:

   ```bash
   cd bioplay
   npm run app
   ```

   This builds BioPlay, starts it on <http://localhost:3000> and opens that page. Keep the terminal window open while
   you use the app (press Ctrl+C to stop it). Next time, `npm run app -- --no-build` starts faster. If port 3000 is
   busy, use `PORT=3005 npm run app`.

2. Install it:
   - **Chrome or Edge:** click **Install app** on the BioPlay home page, or the install icon at the right end of the
     address bar.
   - **Safari on a Mac:** File → **Add to Dock**.

3. Open BioPlay from your Dock, Start menu or Launchpad. (Start `npm run app` first whenever you use it.)

**Phones and tablets** can install it too (Android: **Install app**; iPhone/iPad: Share → **Add to Home Screen**),
but they need BioPlay served over **HTTPS**, so deploy the production server (`npm run build && npm start`) to a
host first.

> Use <http://localhost:3000> (from `npm run app`) for the app. `npm run dev` is for development only — its address is
> <http://localhost:5173>, and its API port (3001) shows a “use the other address” page if opened directly.

A service worker caches the app shell, so lessons keep working offline and progress syncs when you reconnect. The
icon source is `client/public/icon.svg`; PWA settings live in `client/vite.config.ts`.

## The Bio Bites iPhone app (Xcode Device Hub / Simulator)

Bio Bites is also a native iPhone/iPad app, built with [Capacitor](https://capacitorjs.com) from the same code.
Its Xcode project is in `client/ios`.

```bash
npm run ios
```

This starts the Bio Bites server on <http://localhost:3000> (if it isn't already running), builds the app, and
installs and opens it in the simulator shown in Xcode's Device Hub. The first build takes a few minutes while Xcode
downloads packages. The app stays on the simulator's home screen; keep the terminal open while you use it, because
the app saves progress to that server.

To open the project in Xcode instead (to run on a real iPhone, for example): `cd client && npx cap open ios`, then
press Run. A real iPhone can't reach `localhost` on your Mac, so first set `VITE_API_URL` in `client/.env.native` to
your Mac's Wi-Fi address (e.g. `http://192.168.1.50:3000`) or to a hosted `https://` server, then run `npm run ios`
again to rebuild.

## Sign in with Google or Apple

Players start as guests. Signing in saves their progress to that Google or Apple account: everything earned as a
guest is kept, and signing in on another device loads the same progress. **Firebase isn't needed.** The server checks
each sign-in itself (the token's signature against Google's or Apple's public keys, plus who it was issued to and when
it expires), and progress lives in the server's SQLite database.

What you need to provide:

**Google** (free)

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create a project, set up the OAuth
   consent screen, then **Create credentials → OAuth client ID → iOS** with bundle ID `com.biobites.app`.
2. Put that client ID in `client/.env.native` as `VITE_GOOGLE_IOS_CLIENT_ID=…` (the app), and in `server/.env` as
   `GOOGLE_CLIENT_IDS=…` (the server). For the website too, also create a **Web application** client ID, set it as
   `VITE_GOOGLE_WEB_CLIENT_ID` in `client/.env`, and add it to `GOOGLE_CLIENT_IDS`, separated by a comma.
3. Run `npm run ios` again. It registers the URL scheme Google needs.

**Apple** (needs an [Apple Developer Program](https://developer.apple.com/programs/) membership, $99/year)

1. Open the project in Xcode (`cd client && npx cap open ios`) → **App** target → **Signing & Capabilities**: choose
   your team, set a bundle ID you own if `com.biobites.app` is taken, and add **Sign in with Apple**.
2. Put the bundle ID in `server/.env` as `APPLE_CLIENT_IDS=com.biobites.app`.
3. In the simulator, sign in to an Apple Account in **Settings** first.

To keep progress safe when your Mac is off, and to let real phones sign in from anywhere, host the server somewhere
with `https://` and point `VITE_API_URL` at it.

## Project layout

```
bioplay/
├─ shared/   Types, concept + mystery + avatar data, reward math, pack odds, simulators, validators
├─ server/   Express + SQLite (better-sqlite3) API — the only place rewards and pack rolls happen
├─ client/   React + Vite + Tailwind + Framer Motion + dnd-kit + Zustand + Fuse.js
└─ e2e/      Playwright smoke tests
```

- `shared/src/types.ts` — the concept, mystery and avatar schemas.
- `shared/src/rewards.ts` — **all** ATP math (difficulty multipliers, review cooldown, streaks, concept of the day).
- `shared/src/packs.ts` — pack tiers, odds, duplicate → nucleotide conversion, direct-buy prices.
- `shared/src/validate.ts` — structural checks run by the tests over the whole library (including that every slider
  and Punnett challenge is actually reachable).
- `client/src/templates/` — the ten interaction templates; `client/src/flagships/` — the hand-built lessons.
- `client/src/templates/framework/dnd.tsx` — the drag-or-tap system: every draggable also works by tapping (or
  pressing Enter) to pick up and tapping a target to place, which is the keyboard and touch alternative to dragging.

### Server-side trust

The client never tells the server how much ATP to award. It reports _what happened_ (interaction finished, quiz
answers, which pack to open, mystery answer) and the server grades quizzes and mysteries, applies the shared reward
module, rolls packs with a cryptographic RNG, and records every change in a ledger table. The client caches state in
`localStorage` so the UI is instant, and queues interaction/quiz submissions made offline to replay later.

### Rewards at a glance

| Difficulty | Multiplier | Interaction | Pass quiz (2/3+) | Perfect | Max |
| ---------- | ---------- | ----------- | ---------------- | ------- | --- |
| 1 Beginner | ×1         | 10          | 15               | 5       | 30  |
| 2 Easy     | ×1.5       | 15          | 23               | 8       | 46  |
| 3 Medium   | ×2         | 20          | 30               | 10      | 60  |
| 4 Hard     | ×3         | 30          | 45               | 15      | 90  |
| 5 Expert   | ×4         | 40          | 60               | 20      | 120 |

Plus: obscure concept first completion +10×multiplier, full category +150, Concept of the Day ×1.5, daily streak bonus
(+5 per day, capped at +50), quiz review after 24 h = 25% of the quiz reward, mysteries 60×multiplier.

## Adding a concept (data only)

Concepts live in `shared/src/data/concepts/*.ts`, one file (or two) per category. Add an object to the array — no
component code needed. The helpers in `helpers.ts` keep it short:

```ts
import { mc, predict, label, sorting, steps } from './helpers';

{
  id: 'tardigrades',                       // kebab-case, unique
  title: 'Tardigrade Cryptobiosis',
  category: 'weird',
  tags: ['water bears', 'extremophiles', 'survival'],
  aliases: ['water bears', 'moss piglets'], // extra search terms
  difficulty: 2,                           // 1 Beginner … 5 Expert
  rarity: 'obscure',                       // 'common' | 'obscure' (obscure earns a bonus)
  prerequisites: ['cell-membrane'],        // optional, recommended-not-required; drawn on the Knowledge Map
  summary: 'One-sentence hook.',
  steps: steps(['Title', 'One or two plain sentences.'], ['Next', '…']),
  interaction: sorting('Prompt', [/* bins */], [/* items */]),  // or any template below
  goDeeper: 'Technical detail. In reality, it’s a bit more complicated: …',  // flag simplifications here
  quiz: [mc(…), predict(…), label(…)],     // exactly three questions
  relatedConcepts: ['extremophiles'],
  funFact: '…',
}
```

Available templates (see `shared/src/types.ts` for every option):

| Template           | Use it for                                                                                | Builder      |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------ |
| `feed-and-observe` | Drop items into a system; meters and automatic responses react                            | raw config   |
| `assembly-line`    | Put steps or parts in order (line or cycle)                                               | `assembly()` |
| `slider-sim`       | Adjust variables; live graph + challenges (`expr` uses the safe math engine in `expr.ts`) | `slider()`   |
| `lock-and-key`     | Match molecules to receptors; decoys bounce, blockers jam                                 | `lockKey()`  |
| `zoom-explorer`    | Zoom through levels with hotspots                                                         | `zoom()`     |
| `cause-effect`     | Trigger a cascade; break links to see what goes wrong                                     | `cascade()`  |
| `sorting`          | Drag items into categories                                                                | `sorting()`  |
| `ecosystem`        | Add/remove species; Lotka–Volterra populations                                            | raw config   |
| `punnett`          | Pick parents, breed, hit probability challenges                                           | raw config   |
| `timeline`         | Scrub through frames whose elements animate between states                                | `timeline()` |

Then run `npm test`. The library test validates every concept: quiz shape, template config, that slider and genetics
challenges are reachable, and that every `relatedConcepts`/`prerequisites` id exists.

A hand-built lesson uses `interaction: { template: 'flagship', config: { component: 'my-lesson' } }` and registers a
React component in `client/src/flagships/registry.ts`.

## Adding a Bio Mystery (data only)

Add an object to `shared/src/data/mysteries/cases.ts`:

```ts
{
  id: 'my-case', title: '…', category: 'ecology', difficulty: 3, emoji: '🐟',
  requires: ['food-chains', 'nitrogen-cycle'],   // unlocks when these are completed
  scenario: 'The story…',
  clues: [
    { id: 'tests', kind: 'test', title: 'Water tests', intro: '…', tests: [{ label: '…', emoji: '🧪', result: '…' }] },
    { id: 'zoom', kind: 'zoom', title: '…', intro: '…', levels: [{ label: '…', emoji: '🔬', text: '…' }] },
    { id: 'graph', kind: 'slider', title: '…', intro: '…', input: { label: 'Hour', min: 0, max: 24, step: 1, start: 12 },
      expr: '2 + 9 * gauss(x, 15, 5)', outputLabel: 'Oxygen', outputUnit: 'mg/L', note: '…' },
    { id: 'note', kind: 'observe', title: '…', emoji: '📋', text: '…' },
  ],
  question: 'What happened?',
  explanations: ['The right answer', 'A plausible wrong one', '…'],
  answer: 0,
  evidence: [{ text: 'A clue that supports it', supports: true }, { text: 'A red herring', supports: false }],
  resolution: 'What really happened, explained simply.',
}
```

Players must examine every clue, choose an explanation, and select exactly the supporting evidence. The server grades it.

## Git workflow

- `main` always passes tests. Work happens on a branch per phase or feature (`feat/…`, `fix/…`, `data/…`), merged
  with `--no-ff` once `npm test` (and `npm run test:e2e` for UI changes) passes.
- Conventional Commit messages: `feat: add insulin lesson`, `fix: drag-and-drop on mobile`, `data: add immunology concepts`.
- Never commit secrets — use `server/.env` (git-ignored) and keep `.env.example` up to date. SQLite files, build output
  and test artifacts are git-ignored.

## Accessibility

- Every drag-and-drop has a tap/keyboard alternative (pick up with Enter or a tap, then place on a target).
- Visible focus rings, a skip link, live regions for feedback, labeled SVG scenes and meters.
- Respects `prefers-reduced-motion` (CSS and Framer Motion), with a sound mute toggle in the header.
- Category text colors are darkened for AA contrast on their pale backgrounds.

## Accuracy

Lessons simplify, but shouldn’t be wrong: each concept’s **Go Deeper** panel gives the fuller picture and flags what
the interaction simplifies (“In reality, it’s a bit more complicated: …”). Simulations (glucose–insulin, action
potentials, populations, etc.) are teaching models tuned to behave qualitatively correctly and are covered by
behavior tests. BioPlay is for learning, not medical advice.
