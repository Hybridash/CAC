#!/usr/bin/env node
/**
 * `npm run app` — build BioPlay and run it as one app on http://localhost:3000, then open it.
 * Uses the same progress database as `npm run dev` (server/data/bioplay.db).
 */
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stopStaleServer } from './server-freshness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 3000);
const URL = `http://localhost:${PORT}`;
const skipBuild = process.argv.includes('--no-build');

const portFree = (port) =>
  new Promise((resolve) => {
    const s = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => s.close(() => resolve(true)));
    s.listen(port);
  });

async function isBioPlayRunning() {
  try {
    const health = await fetch(`${URL}/api/health`).then((r) => r.json());
    const page = await fetch(URL).then((r) => r.text());
    return health.ok && page.includes('<div id="root">');
  } catch {
    return false;
  }
}

function openBrowser() {
  if (process.env.BIOPLAY_NO_OPEN) return;
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(cmd, [URL], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: true,
  }).unref();
}

function banner() {
  console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │  BioPlay is running at  ${URL.padEnd(32)} │
  │                                                          │
  │  To install it as an app (Chrome or Edge):               │
  │    click "Install app" on the home page, or the install  │
  │    icon at the right end of the address bar.             │
  │  Safari on Mac: File → Add to Dock.                      │
  │                                                          │
  │  Keep this window open while you use the app.            │
  │  Press Ctrl+C here to stop it.                           │
  └──────────────────────────────────────────────────────────┘
`);
}

if (!(await portFree(PORT)) && !(await stopStaleServer(URL, root))) {
  if (await isBioPlayRunning()) {
    console.log(`BioPlay is already running at ${URL} — opening it.`);
    openBrowser();
    process.exit(0);
  }
  console.error(
    `\nPort ${PORT} is being used by another program.\nClose it, or choose another port:  PORT=3005 npm run app\n`,
  );
  process.exit(1);
}

if (!skipBuild) {
  console.log('Building BioPlay (about a minute the first time)…');
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn('npx', ['tsx', 'src/index.ts'], {
  cwd: path.join(root, 'server'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
});
server.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.kill(sig));

for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 500));
  if (await isBioPlayRunning()) {
    banner();
    openBrowser();
    break;
  }
}
