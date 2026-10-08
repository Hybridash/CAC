import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { AVATAR_BY_ID, DIRECT_BUY_COST, mulberry32, PACKS, STARTER_AVATAR } from '@bioplay/shared';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';

function setup(seed = 1) {
  const db = openDatabase(':memory:');
  const app = createApp(db, () => new Date('2026-10-07T12:00:00Z'), mulberry32(seed));
  return {
    db,
    app,
    async player(atp = 0, nucleotides = 0) {
      const res = await request(app).post('/api/session').expect(201);
      db.prepare('UPDATE users SET atp = ?, nucleotides = ? WHERE id = ?').run(
        atp,
        nucleotides,
        res.body.state.userId,
      );
      return {
        auth: { Authorization: `Bearer ${res.body.token}` },
        id: res.body.state.userId as string,
      };
    },
  };
}

describe('shop', () => {
  it('new players start with the starter avatar equipped', async () => {
    const t = setup();
    const res = await request(t.app).post('/api/session');
    expect(res.body.state.equippedAvatar).toBe(STARTER_AVATAR);
    expect(res.body.state.inventory[STARTER_AVATAR]).toBe(1);
  });

  it('refuses to open a pack without enough ATP', async () => {
    const t = setup();
    const p = await t.player(10);
    const res = await request(t.app)
      .post('/api/shop/packs')
      .set(p.auth)
      .send({ tier: 'basic' })
      .expect(402);
    expect(res.body.error).toMatch(/65 more ATP/);
  });

  it('charges ATP and grants 3 pack avatars, computed on the server', async () => {
    const t = setup();
    const p = await t.player(500);
    const res = await request(t.app)
      .post('/api/shop/packs')
      .set(p.auth)
      .send({ tier: 'rare', cards: ['tardi-astronaut'] })
      .expect(200);
    expect(res.body.cards).toHaveLength(3);
    expect(res.body.state.atp).toBe(500 - PACKS.rare.cost);
    for (const c of res.body.cards) expect(AVATAR_BY_ID[c.avatarId].source.kind).toBe('pack');
    const owned = Object.values(res.body.state.inventory as Record<string, number>).reduce(
      (a, b) => a + b,
      0,
    );
    expect(owned).toBe(1 + 3);
  });

  it('converts duplicates to nucleotides', async () => {
    const t = setup(3);
    const p = await t.player(75 * 40);
    let dupes = 0;
    let nucs = 0;
    for (let i = 0; i < 40; i++) {
      const res = await request(t.app).post('/api/shop/packs').set(p.auth).send({ tier: 'basic' });
      for (const c of res.body.cards) {
        if (!c.duplicate) continue;
        dupes++;
        nucs += c.nucleotides;
      }
    }
    const s = await request(t.app).get('/api/state').set(p.auth);
    expect(dupes).toBeGreaterThan(0);
    expect(s.body.nucleotides).toBe(nucs);
    expect(s.body.atp).toBe(0);
  });

  it('rejects unknown pack tiers', async () => {
    const t = setup();
    const p = await t.player(1000);
    await request(t.app).post('/api/shop/packs').set(p.auth).send({ tier: 'free' }).expect(400);
  });

  it('buys a specific pack avatar with nucleotides', async () => {
    const t = setup();
    const p = await t.player(0, 1000);
    const res = await request(t.app).post('/api/shop/avatars/axolotl').set(p.auth).expect(200);
    expect(res.body.inventory.axolotl).toBe(1);
    expect(res.body.nucleotides).toBe(1000 - DIRECT_BUY_COST.rare);
    await request(t.app).post('/api/shop/avatars/axolotl').set(p.auth).expect(409);
  });

  it('cannot buy exclusives or afford beyond balance', async () => {
    const t = setup();
    const p = await t.player(0, 10);
    await request(t.app).post('/api/shop/avatars/heart-hero').set(p.auth).expect(403);
    await request(t.app).post('/api/shop/avatars/detective-phage').set(p.auth).expect(403);
    await request(t.app).post('/api/shop/avatars/axolotl').set(p.auth).expect(402);
  });

  it('lets you equip avatars you own', async () => {
    const t = setup();
    const p = await t.player(0, 1000);
    await request(t.app).post('/api/shop/avatars/axolotl').set(p.auth);
    const res = await request(t.app)
      .post('/api/equip')
      .set(p.auth)
      .send({ avatarId: 'axolotl' })
      .expect(200);
    expect(res.body.equippedAvatar).toBe('axolotl');
  });
});
