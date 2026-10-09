import request from 'supertest';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';
import type { IdentityVerifier } from '../src/identity.js';

/** Fresh in-memory app with a controllable clock. */
export function testApp(
  start = new Date('2026-10-07T12:00:00Z'),
  verifyIdentity?: IdentityVerifier,
) {
  let now = start;
  const db = openDatabase(':memory:');
  const app = createApp(db, () => now, undefined, verifyIdentity);
  return {
    db,
    app,
    setNow: (d: Date) => (now = d),
    advanceHours: (h: number) => (now = new Date(now.getTime() + h * 3600_000)),
    async newPlayer() {
      const res = await request(app).post('/api/session').expect(201);
      const token: string = res.body.token;
      const auth = { Authorization: `Bearer ${token}` };
      return { token, auth, state: res.body.state };
    },
  };
}
