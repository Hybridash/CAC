import { create } from 'zustand';
import { storage } from '../lib/api';

export type Theme = 'light' | 'dark';

/** The saved choice, else the device's preference. index.html applies the same rule before first paint. */
function initialTheme(): Theme {
  const saved = storage.get('bioplay.theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0f1711' : '#2f6b3f');
}

interface Settings {
  muted: boolean;
  toggleMute: () => void;
  theme: Theme;
  toggleTheme: () => void;
  /** The desktop sidebar shrunk to an icon-only rail. */
  railCollapsed: boolean;
  toggleRail: () => void;
}

export const useSettings = create<Settings>((set, get) => ({
  muted: storage.get('bioplay.muted') === '1',
  toggleMute: () => {
    const muted = !get().muted;
    storage.set('bioplay.muted', muted ? '1' : '0');
    set({ muted });
  },
  railCollapsed: storage.get('bioplay.rail') === 'collapsed',
  toggleRail: () => {
    const railCollapsed = !get().railCollapsed;
    storage.set('bioplay.rail', railCollapsed ? 'collapsed' : 'open');
    set({ railCollapsed });
  },
  theme: initialTheme(),
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    storage.set('bioplay.theme', theme);
    const root = document.documentElement;
    root.classList.add('theme-anim');
    window.setTimeout(() => root.classList.remove('theme-anim'), 320);
    applyTheme(theme);
    set({ theme });
  },
}));

applyTheme(useSettings.getState().theme);
