/**
 * The launch scripts reuse a Bio Bites server that is already running. That is only safe if the
 * server was started after the latest changes to its code or settings; otherwise it serves old
 * behavior (for example, missing routes). This stops such a stale server so a fresh one can start.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** Newest modification time (ms) of the server's code, the shared code and server/.env. */
function newestChange(root) {
  let newest = 0;
  const visit = (p) => {
    let stat;
    try {
      stat = fs.statSync(p);
    } catch {
      return;
    }
    if (stat.isDirectory()) for (const f of fs.readdirSync(p)) visit(path.join(p, f));
    else newest = Math.max(newest, stat.mtimeMs);
  };
  for (const p of ['server/src', 'shared/src', 'server/.env']) visit(path.join(root, p));
  return newest;
}

/** The pid listening on a port, if it looks like a Bio Bites server process. */
function serverPidOnPort(port) {
  const pid = Number(
    spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' })
      .stdout.trim()
      .split('\n')[0],
  );
  if (!pid) return null;
  const cmd = spawnSync('ps', ['-o', 'command=', '-p', String(pid)], { encoding: 'utf8' }).stdout;
  return /src\/index\.ts|dist\/index\.js/.test(cmd) ? pid : null;
}

const portOpen = (url) =>
  fetch(`${url}/api/health`)
    .then(() => true)
    .catch(() => false);

/**
 * If a Bio Bites server at `url` is older than the code, stop it and wait for the port to free up.
 * Returns true if a stale server was stopped.
 */
export async function stopStaleServer(url, root) {
  let health;
  try {
    health = await fetch(`${url}/api/health`).then((r) => r.json());
  } catch {
    return false;
  }
  if (!health?.ok) return false;
  // Servers from before this check existed report no start time, so they count as stale.
  const startedAt = health.startedAt ? Date.parse(health.startedAt) : 0;
  if (startedAt >= newestChange(root)) return false;

  const pid = health.pid ?? serverPidOnPort(new URL(url).port);
  if (!pid) {
    console.warn(
      `\n⚠ The Bio Bites server at ${url} was started before your latest changes, and couldn’t be restarted automatically.\n  Stop it (close the terminal running it), then run this command again.\n`,
    );
    return false;
  }
  console.log(`\n▶ Restarting the Bio Bites server: it was started before your latest changes…`);
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return false;
  }
  for (let i = 0; i < 50 && (await portOpen(url)); i++)
    await new Promise((r) => setTimeout(r, 100));
  return true;
}
