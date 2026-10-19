import { useState } from 'react';
import type { AccountProvider, SignInResponse } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { Icon } from './Icon';
import { SignInButtons } from './SignInButtons';
import { EmailAccountForm } from './EmailAccountForm';

const NAME: Record<AccountProvider, string> = {
  google: 'Google',
  apple: 'Apple',
  email: 'your Bio Bites account',
};

/** Save progress to a Google or Apple account, or show which account it's saved to. */
export function AccountCard({ compact = false }: { compact?: boolean }) {
  const player = usePlayer((s) => s.player);
  const signOut = usePlayer((s) => s.signOut);
  const [signingOut, setSigningOut] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!player) return null;
  const account = player.account;
  if (compact && account) return null;

  const out = async () => {
    setSigningOut(true);
    setMsg(null);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
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
          <p role="status" className="mt-1 text-sm font-bold text-emerald-700">
            {msg}
          </p>
        )}
      </div>
      <div className="sm:w-72">
        {account ? (
          <button className="btn-ghost w-full py-2" onClick={out} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <EmailAccountForm collapsible onSignedIn={(res) => setMsg(signedInMessage(res))} />
            <SignInButtons onSignedIn={(res) => setMsg(signedInMessage(res))} />
          </div>
        )}
      </div>
    </section>
  );
}

const signedInMessage = (res: SignInResponse) =>
  res.switched
    ? `Welcome back, ${res.state.displayName}! Your saved progress is loaded.`
    : 'Saved! Your progress now follows you to any device you sign in on.';
