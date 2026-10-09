import { useState } from 'react';
import type { AuthProvider } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { SignInCancelled } from '../lib/signIn';
import { RequestError } from '../lib/api';
import { Icon } from './Icon';

const NAME: Record<AuthProvider, string> = { google: 'Google', apple: 'Apple' };

/** Save progress to a Google or Apple account, or show which account it's saved to. */
export function AccountCard({ compact = false }: { compact?: boolean }) {
  const player = usePlayer((s) => s.player);
  const connection = usePlayer((s) => s.connection);
  const signIn = usePlayer((s) => s.signIn);
  const signOut = usePlayer((s) => s.signOut);
  const [busy, setBusy] = useState<AuthProvider | 'out' | null>(null);
  const [msg, setMsg] = useState<{ text: string; tone: 'good' | 'bad' } | null>(null);

  if (!player) return null;
  const account = player.account;
  if (compact && account) return null;

  const go = async (provider: AuthProvider) => {
    setBusy(provider);
    setMsg(null);
    try {
      const res = await signIn(provider);
      setMsg({
        text: res.switched
          ? `Welcome back, ${res.state.displayName}! Your saved progress is loaded.`
          : 'Saved! Your progress now follows you to any device you sign in on.',
        tone: 'good',
      });
    } catch (e) {
      if (e instanceof SignInCancelled) return;
      setMsg({
        text:
          e instanceof RequestError && e.offline
            ? 'You’re offline — connect to the internet to sign in.'
            : (e as Error).message || 'Sign-in didn’t work. Please try again.',
        tone: 'bad',
      });
    } finally {
      setBusy(null);
    }
  };

  const out = async () => {
    setBusy('out');
    setMsg(null);
    try {
      await signOut();
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
      aria-labelledby="account-h"
      data-testid="account-card"
    >
      <Icon name={account ? 'check' : 'shield'} size={48} />
      <div className="flex-1">
        <h2 id="account-h" className="text-xl font-extrabold">
          {account ? 'Your progress is saved' : 'Save your progress'}
        </h2>
        <p className="text-sm text-ink-soft">
          {account
            ? `Signed in with ${NAME[account.provider]}${account.email ? ` as ${account.email}` : ''}. Sign in on another device to pick up where you left off.`
            : 'Sign in so your ATP, avatars and lessons are kept safe and follow you to your other devices.'}
        </p>
        {msg && (
          <p
            role="status"
            className={`mt-1 text-sm font-bold ${msg.tone === 'good' ? 'text-emerald-700' : 'text-rose-700'}`}
          >
            {msg.text}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:w-56">
        {account ? (
          <button className="btn-ghost py-2" onClick={out} disabled={!!busy}>
            {busy === 'out' ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <>
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 font-bold text-white disabled:opacity-60"
              onClick={() => go('apple')}
              disabled={!!busy || connection === 'offline'}
            >
              <AppleLogo />
              {busy === 'apple' ? 'Signing in…' : 'Sign in with Apple'}
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-bold text-[#1f1f1f] ring-1 ring-[#747775] disabled:opacity-60"
              onClick={() => go('google')}
              disabled={!!busy || connection === 'offline'}
            >
              <GoogleLogo />
              {busy === 'google' ? 'Signing in…' : 'Sign in with Google'}
            </button>
          </>
        )}
      </div>
    </section>
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
