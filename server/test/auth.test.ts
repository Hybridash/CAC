import request from 'supertest';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { providerVerifier } from '../src/identity.js';
import { testApp } from './helpers.js';

const GOOGLE_CLIENT = 'test-ios.apps.googleusercontent.com';
const BUNDLE_ID = 'com.biobites.app';

let sign: (
  claims: Record<string, unknown>,
  opts?: { iss?: string; aud?: string },
) => Promise<string>;
let verifier: ReturnType<typeof providerVerifier>;

beforeAll(async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'RS256' };
  const keys = createLocalJWKSet({ keys: [jwk] });
  verifier = providerVerifier(
    { GOOGLE_CLIENT_IDS: GOOGLE_CLIENT, APPLE_CLIENT_IDS: BUNDLE_ID },
    { google: keys, apple: keys },
  );
  sign = (claims, opts = {}) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer(opts.iss ?? 'https://accounts.google.com')
      .setAudience(opts.aud ?? GOOGLE_CLIENT)
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(privateKey);
});

const google = (sub: string) => sign({ sub, email: `${sub}@gmail.com` });

describe('sign in with Google or Apple', () => {
  it('links a new account to the guest player and keeps their progress', async () => {
    const t = testApp(undefined, verifier);
    const p = await t.newPlayer();
    await request(t.app)
      .post('/api/concepts/food-chains/interaction')
      .set(p.auth)
      .send({})
      .expect(200);
    const res = await request(t.app)
      .post('/api/auth/google')
      .set(p.auth)
      .send({ idToken: await google('alice'), name: 'Alice Smith' })
      .expect(200);
    expect(res.body.switched).toBe(false);
    expect(res.body.token).toBeUndefined();
    expect(res.body.state.account).toEqual({ provider: 'google', email: 'alice@gmail.com' });
    expect(res.body.state.displayName).toBe('Alice');
    expect(res.body.state.atp).toBeGreaterThan(0);
  });

  it('signing in on a second device switches it to the saved player', async () => {
    const t = testApp(undefined, verifier);
    const phone = await t.newPlayer();
    await request(t.app).post('/api/concepts/food-chains/interaction').set(phone.auth).send({});
    await request(t.app)
      .post('/api/auth/google')
      .set(phone.auth)
      .send({ idToken: await google('bob') });

    const tablet = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/auth/google')
      .set(tablet.auth)
      .send({ idToken: await google('bob') })
      .expect(200);
    expect(res.body.switched).toBe(true);
    expect(res.body.state.userId).toBe(phone.state.userId);
    const again = await request(t.app)
      .get('/api/state')
      .set({ Authorization: `Bearer ${res.body.token}` })
      .expect(200);
    expect(again.body.progress['food-chains']).toBeTruthy();
    // The first device stays signed in too.
    await request(t.app).get('/api/state').set(phone.auth).expect(200);
  });

  it('accepts Apple tokens for the app bundle id', async () => {
    const t = testApp(undefined, verifier);
    const p = await t.newPlayer();
    const idToken = await sign(
      { sub: 'apple-1' },
      { iss: 'https://appleid.apple.com', aud: BUNDLE_ID },
    );
    const res = await request(t.app)
      .post('/api/auth/apple')
      .set(p.auth)
      .send({ idToken })
      .expect(200);
    expect(res.body.state.account).toEqual({ provider: 'apple', email: null });
  });

  it('rejects forged, mis-addressed or wrong-provider tokens', async () => {
    const t = testApp(undefined, verifier);
    const p = await t.newPlayer();
    const bad = [
      await sign({ sub: 'x' }, { aud: 'someone-elses-app' }),
      await sign({ sub: 'x' }, { iss: 'https://evil.example' }),
      (await google('x')).slice(0, -4) + 'AAAA',
    ];
    for (const idToken of bad) {
      await request(t.app).post('/api/auth/google').set(p.auth).send({ idToken }).expect(401);
    }
    // A Google token can't be used as an Apple sign-in.
    await request(t.app)
      .post('/api/auth/apple')
      .set(p.auth)
      .send({ idToken: await google('x') })
      .expect(401);
    await request(t.app)
      .post('/api/auth/facebook')
      .set(p.auth)
      .send({ idToken: await google('x') })
      .expect(404);
  });

  it('explains when a provider is not configured', async () => {
    const t = testApp(undefined, providerVerifier({}));
    const p = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/auth/google')
      .set(p.auth)
      .send({ idToken: 'x'.repeat(40) })
      .expect(503);
    expect(res.body.error).toMatch(/GOOGLE_CLIENT_IDS/);
  });

  it('sign-out ends only this device’s session', async () => {
    const t = testApp(undefined, verifier);
    const p = await t.newPlayer();
    await request(t.app).post('/api/auth/sign-out').set(p.auth).expect(204);
    await request(t.app).get('/api/state').set(p.auth).expect(401);
  });
});
