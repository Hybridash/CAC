import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePlayer } from '../store/player';
import { useSettings } from '../store/settings';
import { AtpIcon, NucleotideIcon } from './Atp';
import { SearchBox } from './SearchBox';
import { RewardToasts } from './RewardToasts';
import { PlayerAvatar } from './PlayerAvatar';
import { ErrorBoundary } from './ErrorBoundary';
import { UiIcon, type UiIconName } from './UiIcon';

type NavItem = { to: string; label: string; icon: UiIconName };

const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/mysteries', label: 'Mysteries', icon: 'search' },
  { to: '/olympiad', label: 'Olympiad', icon: 'medal' },
  { to: '/shop', label: 'Shop', icon: 'bag' },
  { to: '/collection', label: 'Collection', icon: 'cards' },
];

/** The phone tab bar holds the four most-used places; everything else lives under More. */
const TABS = NAV.filter((n) => ['/', '/library', '/mysteries', '/olympiad'].includes(n.to));
const MORE: NavItem[] = [
  ...NAV.filter((n) => !TABS.includes(n)),
  { to: '/profile', label: 'Profile', icon: 'user' },
];

const railLink = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-brand-tint text-brand-dark shadow-[inset_3px_0_0_var(--color-brand)]'
      : 'text-ink-soft hover:bg-slate-100 hover:text-ink'
  }`;

export function Layout() {
  const player = usePlayer((s) => s.player);
  const connection = usePlayer((s) => s.connection);
  const { muted, toggleMute, theme, toggleTheme } = useSettings();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  const moreActive = MORE.some((m) => pathname.startsWith(m.to));

  return (
    <div className="min-h-dvh lg:pl-60">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-surface p-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface px-3 pt-5 pb-4 lg:flex">
        <NavLink
          to="/"
          className="mb-6 flex items-center gap-2.5 px-2"
          aria-label="Bio Bites home"
        >
          <img src="/icon.svg" alt="" width={32} height={32} className="rounded-lg" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Bio Bites
          </span>
        </NavLink>
        <nav className="flex flex-col gap-0.5" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={railLink}>
              <UiIcon name={n.icon} size={22} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
          <NavLink to="/profile" className={railLink} aria-label="Your profile and stats">
            <PlayerAvatar size={28} />
            Profile
          </NavLink>
          <button
            onClick={toggleMute}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={muted}
          >
            <UiIcon name={muted ? 'soundOff' : 'sound'} size={22} />
            {muted ? 'Sound off' : 'Sound on'}
          </button>
          <button
            onClick={toggleTheme}
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-100 hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <UiIcon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
            {theme === 'dark' ? 'Light theme' : 'Dark theme'}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 lg:px-8">
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-2 lg:hidden"
            aria-label="Bio Bites home"
          >
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            <span className="font-display text-xl font-extrabold tracking-tight">Bio Bites</span>
          </NavLink>
          <div className="hidden max-w-md flex-1 md:block">{pathname !== '/' && <SearchBox />}</div>
          <div className="ml-auto flex items-center gap-1.5">
            <NavLink
              to="/shop"
              className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-ink tabular-nums"
              title="ATP balance"
            >
              <AtpIcon size={20} />
              <span data-testid="atp-balance">{player?.atp ?? '—'}</span>
              <span className="sr-only">ATP</span>
            </NavLink>
            {!!player?.streak && (
              <NavLink
                to="/profile"
                className="hidden min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-ink tabular-nums sm:inline-flex"
                title={`${player.streak}-day learning streak`}
              >
                <UiIcon name="flame" size={18} className="text-eosin" /> {player.streak}
                <span className="sr-only"> day streak</span>
              </NavLink>
            )}
            <span
              className="hidden min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-ink tabular-nums sm:inline-flex"
              title="Nucleotides"
            >
              <NucleotideIcon size={18} />
              {player?.nucleotides ?? 0}
              <span className="sr-only">Nucleotides</span>
            </span>
            <button
              onClick={toggleMute}
              className="hidden h-11 w-11 place-items-center rounded-lg text-ink-soft hover:bg-slate-100 sm:grid lg:hidden"
              aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              aria-pressed={muted}
            >
              <UiIcon name={muted ? 'soundOff' : 'sound'} size={22} />
            </button>
            <button
              onClick={toggleTheme}
              className="hidden h-11 w-11 place-items-center rounded-lg text-ink-soft hover:bg-slate-100 sm:grid lg:hidden"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <UiIcon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
            </button>
            <NavLink
              to="/profile"
              aria-label="Your profile and stats"
              className="grid h-11 w-11 shrink-0 place-items-center lg:hidden"
            >
              <PlayerAvatar size={36} />
            </NavLink>
          </div>
        </div>
        {connection === 'offline' && (
          <div
            className="border-t border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-sm font-semibold text-amber-900"
            role="status"
          >
            You’re offline. Keep learning; progress syncs when the server is back.
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 lg:px-8 lg:pb-14">
        <div key={pathname} className="route-in">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Phone and tablet tab bar. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {TABS.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${isActive ? 'text-brand-dark' : 'text-ink-soft'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="bar-in absolute inset-x-4 top-0 h-0.5 bg-brand" />}
                <UiIcon name={n.icon} size={22} />
                {n.label}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          aria-controls="more-menu"
          className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${moreOpen || moreActive ? 'text-brand-dark' : 'text-ink-soft'}`}
        >
          {(moreOpen || moreActive) && <span className="bar-in absolute inset-x-4 top-0 h-0.5 bg-brand" />}
          <UiIcon name="more" size={22} />
          More
        </button>
      </nav>

      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-night/30 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id="more-menu"
            className="sheet-in fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-50 rounded-xl bg-surface p-2 shadow-lg ring-1 ring-ink/10 lg:hidden"
          >
            {MORE.map((n) => (
              <NavLink key={n.to} to={n.to} className={railLink}>
                <UiIcon name={n.icon} size={22} />
                {n.label}
              </NavLink>
            ))}
            <div className="mt-1 border-t border-line pt-1 sm:hidden">
              <button
                onClick={toggleMute}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-soft"
                aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
                aria-pressed={muted}
              >
                <UiIcon name={muted ? 'soundOff' : 'sound'} size={22} />
                {muted ? 'Sound off' : 'Sound on'}
              </button>
              <button
                onClick={toggleTheme}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-soft"
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                <UiIcon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
                {theme === 'dark' ? 'Light theme' : 'Dark theme'}
              </button>
            </div>
          </div>
        </>
      )}
      <RewardToasts />
    </div>
  );
}
