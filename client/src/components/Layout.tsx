import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayer } from '../store/player';
import { useSettings } from '../store/settings';
import { AtpIcon, NucleotideIcon } from './Atp';
import { SearchBox } from './SearchBox';
import { RewardToasts } from './RewardToasts';
import { PlayerAvatar } from './PlayerAvatar';

const NAV = [
  { to: '/', label: 'Home', emoji: '🏠' },
  { to: '/library', label: 'Library', emoji: '📚' },
  { to: '/map', label: 'Map', emoji: '🗺️' },
  { to: '/mysteries', label: 'Mysteries', emoji: '🕵️' },
  { to: '/shop', label: 'Shop', emoji: '🛍️' },
  { to: '/collection', label: 'Collection', emoji: '🃏' },
];

export function Layout() {
  const player = usePlayer((s) => s.player);
  const connection = usePlayer((s) => s.connection);
  const { muted, toggleMute } = useSettings();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-white p-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <NavLink to="/" className="flex shrink-0 items-center gap-1.5" aria-label="BioPlay home">
            <span className="text-2xl" aria-hidden>
              🧬
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight">
              Bio<span className="text-brand">Play</span>
            </span>
          </NavLink>
          <nav className="ml-2 hidden gap-1 lg:flex" aria-label="Main">
            {NAV.slice(1).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-1.5 text-sm font-bold ${isActive ? 'bg-white shadow-sm ring-1 ring-black/5' : 'text-ink-soft hover:bg-white/70'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden max-w-xs flex-1 md:block">
            {pathname !== '/' && <SearchBox />}
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <NavLink
              to="/shop"
              className="chip bg-amber-100 py-1 text-base text-amber-900"
              title="ATP balance"
            >
              <AtpIcon size={20} />
              <span data-testid="atp-balance">{player?.atp ?? '—'}</span>
              <span className="sr-only">ATP</span>
            </NavLink>
            {!!player?.streak && (
              <NavLink
                to="/profile"
                className="chip hidden bg-orange-100 py-1 text-base text-orange-800 sm:inline-flex"
                title={`${player.streak}-day learning streak`}
              >
                🔥 {player.streak}
                <span className="sr-only"> day streak</span>
              </NavLink>
            )}
            <span
              className="chip hidden bg-violet-100 py-1 text-base text-violet-900 sm:inline-flex"
              title="Nucleotides"
            >
              <NucleotideIcon size={18} />
              {player?.nucleotides ?? 0}
              <span className="sr-only">Nucleotides</span>
            </span>
            <button
              onClick={toggleMute}
              className="grid h-9 w-9 place-items-center rounded-full bg-white ring-1 ring-black/10"
              aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              aria-pressed={muted}
            >
              <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
            </button>
            <NavLink to="/profile" aria-label="Your profile and stats" className="shrink-0">
              <PlayerAvatar size={40} />
            </NavLink>
          </div>
        </div>
        {connection === 'offline' && (
          <div
            className="bg-amber-100 px-4 py-1 text-center text-sm font-semibold text-amber-900"
            role="status"
          >
            You’re offline — keep learning! Progress will sync when the server is back.
          </div>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-28 lg:pb-12">
        <Outlet />
      </main>

      {/* Bottom tab bar for phones and tablets. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-[11px] font-bold ${isActive ? 'text-brand-dark' : 'text-ink-soft'}`
            }
          >
            <span className="text-xl" aria-hidden>
              {n.emoji}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <RewardToasts />
    </div>
  );
}
