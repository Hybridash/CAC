import { useState } from 'react';
import type { AuthProvider, SignInResponse } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { SignInCancelled } from '../lib/signIn';
import { RequestError } from '../lib/api';

/**
 * "Sign in with Apple" and "Sign in with Google" buttons, with their own busy and error states.
 * Used on the welcome screen and the Profile page.
 */
export function SignInButtons({
  onSignedIn,
  large = false,
}: {
  onSignedIn?: (res: SignInResponse) => void;
  large?: boolean;
}) {
  const connection = usePlayer((s) => s.connection);
  const hasPlayer = usePlayer((s) => !!s.player);
  const signIn = usePlayer((s) => s.signIn);
  const [busy, setBusy] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (provider: AuthProvider) => {
    setBusy(provider);
    setError(null);
    try {
      onSignedIn?.(await signIn(provider));
    } catch (e) {
      if (e instanceof SignInCancelled) return;
      setError(
        e instanceof RequestError && e.offline
          ? 'You’re offline — connect to the internet to sign in.'
          : (e as Error).message || 'Sign-in didn’t work. Please try again.',
      );
    } finally {
      setBusy(null);
    }
  };

  const off = !!busy || connection === 'offline' || !hasPlayer;
  const size = large ? 'py-3.5 text-lg' : 'py-2.5';
  return (
    <div className="flex flex-col gap-2">
      <button
        className={`flex items-center justify-center gap-2 rounded-xl bg-black px-4 font-bold text-white disabled:opacity-60 ${size}`}
        onClick={() => go('apple')}
        disabled={off}
      >
        <AppleLogo />
        {busy === 'apple' ? 'Signing in…' : 'Sign in with Apple'}
      </button>
      <button
        className={`flex items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-[#1f1f1f] ring-1 ring-[#747775] disabled:opacity-60 ${size}`}
        onClick={() => go('google')}
        disabled={off}
      >
        <GoogleLogo />
        {busy === 'google' ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {connection === 'offline' && !error && (
        <p className="text-sm font-bold text-amber-800">
          Can’t reach the Bio Bites server — sign-in needs a connection.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-bold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="19" viewBox="0 0 17 20" aria-hidden fill="currentColor">
      <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4zM11.6 3c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.7 6c4.5-4.1 7.1-10.2 7.1-17.4z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
