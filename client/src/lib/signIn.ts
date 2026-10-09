import { SocialLogin } from '@capgo/capacitor-social-login';
import type { AuthProvider } from '@bioplay/shared';
import { isNativeApp } from './platform';

const env = import.meta.env;
const GOOGLE_IOS = env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined;
const GOOGLE_WEB = env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined;
const APPLE_SERVICE_ID = env.VITE_APPLE_SERVICE_ID as string | undefined;

export class SignInCancelled extends Error {}

/** Whether this build has the IDs needed for each provider (see README → Sign in). */
export const providerReady: Record<AuthProvider, boolean> = {
  google: isNativeApp ? !!GOOGLE_IOS : !!GOOGLE_WEB,
  // On iPhone/iPad, Apple sign-in is built into the system; the website needs a Services ID.
  apple: isNativeApp || !!APPLE_SERVICE_ID,
};

let ready: Promise<void> | null = null;
const init = () =>
  (ready ??= SocialLogin.initialize({
    google:
      GOOGLE_IOS || GOOGLE_WEB ? { iOSClientId: GOOGLE_IOS, webClientId: GOOGLE_WEB } : undefined,
    apple: isNativeApp
      ? {}
      : APPLE_SERVICE_ID
        ? { clientId: APPLE_SERVICE_ID, redirectUrl: window.location.origin }
        : undefined,
  }));

/**
 * Show Google's or Apple's own sign-in sheet and return the ID token it issues.
 * The token is only trusted after the server checks its signature.
 */
export async function getIdToken(
  provider: AuthProvider,
): Promise<{ idToken: string; name?: string }> {
  if (!providerReady[provider]) {
    throw new Error(
      `${provider === 'google' ? 'Google' : 'Apple'} sign-in isn’t set up in this build yet.`,
    );
  }
  await init();
  try {
    if (provider === 'google') {
      const { result } = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['email', 'profile'] },
      });
      if (!('idToken' in result) || !result.idToken) throw new Error('Google returned no token');
      return { idToken: result.idToken, name: result.profile.givenName ?? undefined };
    }
    const { result } = await SocialLogin.login({
      provider: 'apple',
      options: { scopes: ['name', 'email'] },
    });
    if (!result.idToken) throw new Error('Apple returned no token');
    return { idToken: result.idToken, name: result.profile.givenName ?? undefined };
  } catch (e) {
    const code = (e as { code?: string }).code;
    const msg = String((e as Error)?.message ?? e);
    if (code === 'USER_CANCELLED' || /cancel/i.test(msg)) throw new SignInCancelled();
    throw e;
  }
}

/** Forget the provider's own signed-in state on this device (best effort). */
export async function providerSignOut(provider: AuthProvider) {
  try {
    await init();
    await SocialLogin.logout({ provider });
  } catch {
    /* not signed in with the provider, or it doesn't keep state — nothing to do */
  }
}
