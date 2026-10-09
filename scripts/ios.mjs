#!/usr/bin/env node
/**
 * `npm run ios` — build the Bio Bites iPhone app and run it in the iOS Simulator (Xcode's Device Hub).
 * Also starts the Bio Bites server on http://localhost:3000 if it isn't running, since the app
 * saves progress there. Keep this window open while you use the app; Ctrl+C stops the server.
 *
 * `npm run ios:live` — live editing: the app loads its pages from the Vite dev server instead of
 * from inside the app, so saving any file under client/src updates the simulator in about a second.
 * Run plain `npm run ios` again afterwards to go back to a normal, self-contained app.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = path.join(root, 'client');
const APP_ID = 'com.biobites.app';
const live = process.argv.includes('--live');
const LIVE_URL = 'http://localhost:5173';
const PORT = live ? 3001 : 3000;
const HEALTH = `http://localhost:${PORT}/api/health`;

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) {
    console.error(`\n✖ ${cmd} ${args.join(' ')} failed.`);
    process.exit(r.status ?? 1);
  }
};
const out = (cmd, args) => spawnSync(cmd, args, { encoding: 'utf8' }).stdout ?? '';
const step = (msg) => console.log(`\n▶ ${msg}`);

const serverUp = () =>
  fetch(HEALTH)
    .then((r) => r.ok)
    .catch(() => false);

const liveUp = () =>
  fetch(LIVE_URL)
    .then((r) => r.ok)
    .catch(() => false);

// 1. The server the app saves progress to (in live mode, also the Vite dev server for its pages).
let server = null;
if (!(await serverUp()) || (live && !(await liveUp()))) {
  step(
    live
      ? 'Starting the live-editing servers (pages on :5173, data on :3001)…'
      : 'Starting the Bio Bites server on http://localhost:3000…',
  );
  server = live
    ? spawn('npm', ['run', 'dev'], { cwd: root, stdio: 'inherit' })
    : spawn('node', [path.join(root, 'scripts/app.mjs')], {
        cwd: root,
        stdio: 'inherit',
        env: { ...process.env, BIOPLAY_NO_OPEN: '1', PORT: String(PORT) },
      });
  server.on('exit', (code) => process.exit(code ?? 0));
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.kill(sig));
  const ready = async () => (await serverUp()) && (!live || (await liveUp()));
  for (let i = 0; i < 240 && !(await ready()); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await ready())) {
    console.error('The server did not start; see the messages above.');
    process.exit(1);
  }
}

// 2. Google sign-in needs the app to own the "reversed client ID" URL scheme.
const env = Object.fromEntries(
  ['.env.native', '.env.native.local']
    .map((f) => path.join(client, f))
    .filter((f) => fs.existsSync(f))
    .flatMap((f) => fs.readFileSync(f, 'utf8').split('\n'))
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const plist = path.join(client, 'ios/App/App/Info.plist');
const buddy = (cmd) =>
  spawnSync('/usr/libexec/PlistBuddy', ['-c', cmd, plist], { stdio: 'ignore' });
buddy('Delete :CFBundleURLTypes');
const googleId = env.VITE_GOOGLE_IOS_CLIENT_ID;
if (googleId) {
  const scheme = googleId.split('.').reverse().join('.');
  buddy('Add :CFBundleURLTypes array');
  buddy('Add :CFBundleURLTypes:0 dict');
  buddy('Add :CFBundleURLTypes:0:CFBundleURLSchemes array');
  buddy(`Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string ${scheme}`);
}

// 3. Build the app's pages and copy them into the Xcode project.
if (live) {
  // Point the app at the dev server; capacitor.config.ts reads this while syncing.
  step('Pointing the app at the live dev server…');
  if (!fs.existsSync(path.join(client, 'dist-native')))
    run('npm', ['run', 'build:native'], { cwd: client });
  run('npx', ['cap', 'sync', 'ios'], {
    cwd: client,
    env: { ...process.env, CAP_LIVE_URL: LIVE_URL },
  });
} else {
  step('Building the app’s pages…');
  run('npm', ['run', 'build:native'], { cwd: client });
  run('npx', ['cap', 'sync', 'ios'], { cwd: client });
}

// 4. Pick a simulator: the one already open in Device Hub, else the newest iPhone.
const devices = JSON.parse(out('xcrun', ['simctl', 'list', 'devices', 'available', '-j'])).devices;
const all = Object.entries(devices)
  .filter(([runtime]) => runtime.includes('iOS'))
  .flatMap(([, list]) => list);
const sim =
  all.find((d) => d.state === 'Booted') ?? all.filter((d) => d.name.startsWith('iPhone')).at(-1);
if (!sim) {
  console.error(
    'No iPhone simulator found. Open Xcode → Settings → Components and add an iOS simulator.',
  );
  process.exit(1);
}
if (sim.state !== 'Booted') {
  step(`Starting the ${sim.name} simulator…`);
  run('xcrun', ['simctl', 'boot', sim.udid]);
}
spawnSync('open', ['-a', 'Simulator']);

// 5. Compile the native app (a few minutes the first time while Xcode fetches packages).
step(`Compiling Bio Bites for ${sim.name}…`);
const derived = path.join(client, 'ios/build');
run('xcodebuild', [
  '-project',
  path.join(client, 'ios/App/App.xcodeproj'),
  '-scheme',
  'App',
  '-configuration',
  'Debug',
  '-destination',
  `id=${sim.udid}`,
  '-derivedDataPath',
  derived,
  '-quiet',
  'build',
]);

// 6. Install and open it.
step('Installing and opening Bio Bites…');
const appPath = path.join(derived, 'Build/Products/Debug-iphonesimulator/App.app');
run('xcrun', ['simctl', 'install', sim.udid, appPath]);
run('xcrun', ['simctl', 'launch', sim.udid, APP_ID], { stdio: 'ignore' });

if (live) {
  console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │  Live editing is on in the ${sim.name.padEnd(30)}│
  │  simulator. Save any file in client/src and the app      │
  │  updates by itself.                                      │
  │                                                          │
  │  Keep this window open. Press Ctrl+C to stop, then run   │
  │  npm run ios to go back to the normal app.               │
  └──────────────────────────────────────────────────────────┘
`);
} else
  console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │  Bio Bites is installed on the ${sim.name.padEnd(26)}│
  │  simulator. Its icon stays on the home screen.           │
  │                                                          │
  │  The app saves progress to the server on this Mac, so    │
  │  keep this window open while you use it.                 │
  │  Press Ctrl+C to stop.                                   │
  └──────────────────────────────────────────────────────────┘
`);
if (!server) process.exit(0);
