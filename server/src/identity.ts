import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { AuthProvider } from '@bioplay/shared';
import { HttpError } from './http.js';

export interface VerifiedIdentity {
  /** The provider's stable, unique id for this person. */
  subject: string;
  email: string | null;
}

export type IdentityVerifier = (
  provider: AuthProvider,
  idToken: string,
) => Promise<VerifiedIdentity>;

interface ProviderConfig {
  issuer: string | string[];
  /** Client IDs this server accepts tokens for (the token's `aud`). */
  audience: string[];
  keys: JWTVerifyGetKey;
  setupHint: string;
}

const list = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Checks Google and Apple ID tokens ourselves: the signature against the provider's published
 * keys, plus issuer, audience and expiry. No Firebase or other middleman is needed.
 */
export function providerVerifier(
  env: NodeJS.ProcessEnv = process.env,
  keys: Partial<Record<AuthProvider, JWTVerifyGetKey>> = {},
): IdentityVerifier {
  const providers: Record<AuthProvider, ProviderConfig> = {
    google: {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: list(env.GOOGLE_CLIENT_IDS),
      keys:
        keys.google ?? createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs')),
      setupHint: 'set GOOGLE_CLIENT_IDS in server/.env',
    },
    apple: {
      issuer: 'https://appleid.apple.com',
      audience: list(env.APPLE_CLIENT_IDS),
      keys: keys.apple ?? createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys')),
      setupHint: 'set APPLE_CLIENT_IDS in server/.env',
    },
  };

  return async (provider, idToken) => {
    const p = providers[provider];
    if (!p.audience.length) {
      throw new HttpError(503, `${label(provider)} sign-in isn’t set up yet (${p.setupHint})`);
    }
    try {
      const { payload } = await jwtVerify(idToken, p.keys, {
        issuer: p.issuer,
        audience: p.audience,
      });
      if (!payload.sub) throw new Error('missing subject');
      const email = typeof payload.email === 'string' ? payload.email : null;
      return { subject: payload.sub, email };
    } catch {
      throw new HttpError(401, `${label(provider)} sign-in could not be verified`);
    }
  };
}

const label = (p: AuthProvider) => (p === 'google' ? 'Google' : 'Apple');
