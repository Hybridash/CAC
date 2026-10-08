import { create } from 'zustand';
import { storage } from '../lib/api';

interface Settings {
  muted: boolean;
  toggleMute: () => void;
}

export const useSettings = create<Settings>((set, get) => ({
  muted: storage.get('bioplay.muted') === '1',
  toggleMute: () => {
    const muted = !get().muted;
    storage.set('bioplay.muted', muted ? '1' : '0');
    set({ muted });
  },
}));
