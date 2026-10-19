import { useId, useState, type FormEvent } from 'react';
import type { SignInResponse } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { RequestError } from '../lib/api';

type Mode = 'register' | 'login';

export const DEMO_LOGIN = { email: 'demo@gmail.com', password: 'demo123' };
const MIN_PASSWORD = 6;

/**
 * Create a Bio Bites account (email + password) or log in to one. With `collapsible`, it starts
 * as two buttons and opens the form in the chosen mode.
 */
export function EmailAccountForm({
  onSignedIn,
  collapsible = false,
  large = false,
}: {
  onSignedIn?: (res: SignInResponse) => void;
  collapsible?: boolean;
  large?: boolean;
}) {
  const emailAuth = usePlayer((s) => s.emailAuth);
  const connection = usePlayer((s) => s.connection);
  const hasPlayer = usePlayer((s) => !!s.player);
  const [mode, setMode] = useState<Mode | null>(collapsible ? null : 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uid = useId();
  const size = large ? 'py-3.5 text-lg' : 'py-2.5';

  const submit = async (m: Mode, e = email, p = password) => {
    setError(null);
    if (m === 'register' && p.length < MIN_PASSWORD) {
      setError(`Choose a password with at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    try {
      onSignedIn?.(await emailAuth(m, e, p));
    } catch (err) {
      setError(
        err instanceof RequestError && err.offline
          ? 'You’re offline. Connect to the internet to sign in.'
          : (err as Error).message || 'That didn’t work. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (!mode)
    return (
      <div className="flex flex-col gap-2">
        <button
          className={`btn-primary w-full ${size}`}
          onClick={() => setMode('register')}
          data-testid="create-account"
        >
          Create a Bio Bites account
        </button>
        <button
          className="text-sm font-bold text-brand-dark hover:underline"
          onClick={() => setMode('login')}
        >
          Already have one? Log in
        </button>
      </div>
    );

  const off = busy || connection === 'offline' || !hasPlayer;
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(mode);
  };

  return (
    <form className="flex flex-col gap-2.5" onSubmit={onSubmit} data-testid="email-account-form">
      <div
        role="tablist"
        aria-label="Bio Bites account"
        className="flex gap-1 rounded-xl bg-slate-100 p-1"
      >
        {(['register', 'login'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-sm font-bold ${mode === m ? 'bg-white shadow' : 'text-ink-soft'}`}
          >
            {m === 'register' ? 'Create account' : 'Log in'}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-email`} className="text-sm font-bold">
          Email
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/15 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${uid}-password`} className="text-sm font-bold">
          Password
        </label>
        <div className="flex items-center gap-2 rounded-xl bg-white pr-2 ring-1 ring-black/15 focus-within:ring-2 focus-within:ring-indigo-400">
          <input
            id={`${uid}-password`}
            aria-describedby={mode === 'register' ? `${uid}-hint` : undefined}
            type={show ? 'text' : 'password'}
            required
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2.5 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-xs font-bold text-ink-soft hover:text-ink"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {mode === 'register' && (
          <span id={`${uid}-hint`} className="text-xs text-ink-soft">
            At least {MIN_PASSWORD} characters.
          </span>
        )}
      </div>
      <button type="submit" className={`btn-primary w-full ${size}`} disabled={off}>
        {busy
          ? mode === 'register'
            ? 'Creating account…'
            : 'Logging in…'
          : mode === 'register'
            ? 'Create account'
            : 'Log in'}
      </button>
      {mode === 'register' && (
        <p className="text-xs text-ink-soft">
          Everything you’ve earned so far is kept and saved to your new account.
        </p>
      )}
      {mode === 'login' && (
        <button
          type="button"
          className="rounded-xl bg-amber-50 px-3 py-2 text-left text-sm ring-1 ring-amber-200 hover:bg-amber-100"
          onClick={() => {
            setEmail(DEMO_LOGIN.email);
            setPassword(DEMO_LOGIN.password);
            void submit('login', DEMO_LOGIN.email, DEMO_LOGIN.password);
          }}
          disabled={off}
          data-testid="demo-login"
        >
          <span className="font-bold">Try the demo account</span>
          <span className="block text-xs text-ink-soft">
            {DEMO_LOGIN.email} · password {DEMO_LOGIN.password}
          </span>
        </button>
      )}
      {connection === 'offline' && !error && (
        <p className="text-sm font-bold text-amber-800">
          Can’t reach the Bio Bites server. Accounts need a connection.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-bold text-rose-700">
          {error}
        </p>
      )}
    </form>
  );
}
