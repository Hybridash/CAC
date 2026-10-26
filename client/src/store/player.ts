import { create } from 'zustand';
import {
  gradeQuiz,
  LESSON_BY_ID,
  type MysterySolveRequest,
  type MysterySolveResponse,
  type PackOpenResponse,
  type PackTier,
  type PlayerState,
  type QuizAnswer,
  type QuizSubmitResponse,
  type RewardLine,
  type RewardResponse,
  type SessionResponse,
  type AuthProvider,
  type SignInResponse,
} from '@bioplay/shared';
import { api, clearToken, getToken, RequestError, setToken, storage } from '../lib/api';
import { getIdToken, providerSignOut } from '../lib/signIn';

const STATE_KEY = 'bioplay.state';
const QUEUE_KEY = 'bioplay.queue';
const WELCOMED_KEY = 'biobites.welcomed';

/**
 * Whether the player chose "Continue as guest". Kept for this launch only (sessionStorage), so
 * every new launch opens on the login screen until the player signs in.
 */
const guestChoice = {
  get: () => {
    try {
      return sessionStorage.getItem(WELCOMED_KEY) === '1';
    } catch {
      return false;
    }
  },
  set: (on: boolean) => {
    try {
      if (on) sessionStorage.setItem(WELCOMED_KEY, '1');
      else sessionStorage.removeItem(WELCOMED_KEY);
    } catch {
      /* storage unavailable: the login screen just shows again next time */
    }
  },
};

type QueuedAction =
  | { kind: 'interaction'; conceptId: string }
  | { kind: 'quiz'; conceptId: string; answers: QuizAnswer[] };

export type Connection = 'connecting' | 'online' | 'offline';

interface PlayerStore {
  player: PlayerState | null;
  connection: Connection;
  /** Whether this launch has got past the login screen (signed in or continued as a guest). */
  welcomed: boolean;
  /** Leave the login screen for the rest of this launch. */
  finishWelcome: () => void;
  /** Reward lines waiting to be celebrated by the toast. */
  toasts: { id: number; lines: RewardLine[] }[];
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  completeInteraction: (conceptId: string) => Promise<RewardResponse | null>;
  submitQuiz: (conceptId: string, answers: QuizAnswer[]) => Promise<QuizSubmitResponse>;
  openPack: (tier: PackTier) => Promise<PackOpenResponse>;
  buyAvatar: (avatarId: string) => Promise<void>;
  equip: (avatarId: string | null) => Promise<void>;
  rename: (name: string) => Promise<void>;
  solveMystery: (id: string, req: MysterySolveRequest) => Promise<MysterySolveResponse>;
  /** Save progress to a Google/Apple account (or switch to the one saved there). */
  signIn: (provider: AuthProvider) => Promise<SignInResponse>;
  /** Create a Bio Bites account for this player, or log in to one (switching to its player). */
  emailAuth: (
    mode: 'register' | 'login',
    email: string,
    password: string,
  ) => Promise<SignInResponse>;
  /** Sign this device out; it carries on as a fresh guest. The account stays saved. */
  signOut: () => Promise<void>;
  dismissToast: (id: number) => void;
}

const loadCached = (): PlayerState | null => {
  try {
    return JSON.parse(storage.get(STATE_KEY) ?? 'null');
  } catch {
    return null;
  }
};
const loadQueue = (): QueuedAction[] => {
  try {
    return JSON.parse(storage.get(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
};
const saveQueue = (q: QueuedAction[]) => storage.set(QUEUE_KEY, JSON.stringify(q));

let toastId = 0;

export const usePlayer = create<PlayerStore>((set, get) => {
  /** Store fresh server state and mirror it to localStorage so the next load is instant. */
  const accept = (state: PlayerState) => {
    storage.set(STATE_KEY, JSON.stringify(state));
    set({ player: state, connection: 'online' });
  };

  const celebrate = (lines: RewardLine[]) => {
    if (!lines.length) return;
    set((s) => ({ toasts: [...s.toasts, { id: ++toastId, lines }] }));
  };

  const enqueue = (a: QueuedAction) => {
    saveQueue([...loadQueue(), a]);
    set({ connection: 'offline' });
  };

  /** Replay actions made while offline; the server computes the rewards. */
  const flushQueue = async () => {
    const queue = loadQueue();
    while (queue.length) {
      const a = queue[0];
      try {
        const res =
          a.kind === 'interaction'
            ? await api<RewardResponse>(`/concepts/${a.conceptId}/interaction`, { body: {} })
            : await api<QuizSubmitResponse>(`/concepts/${a.conceptId}/quiz`, {
                body: { answers: a.answers },
              });
        celebrate(res.lines);
        accept(res.state);
      } catch (e) {
        if (e instanceof RequestError && e.offline) break;
        // Rejected by the server (e.g. unknown concept): drop it rather than retry forever.
      }
      queue.shift();
      saveQueue(queue);
    }
  };

  /** Optimistically mark local progress while offline so the UI reflects what was done. */
  const markLocal = (conceptId: string, patch: Partial<PlayerState['progress'][string]>) => {
    const p = get().player;
    if (!p) return;
    const prev = p.progress[conceptId] ?? {
      interactionDoneAt: null,
      quizPassedAt: null,
      quizPerfect: false,
      bestScore: 0,
      lastQuizAt: null,
      completedAt: null,
    };
    set({ player: { ...p, progress: { ...p.progress, [conceptId]: { ...prev, ...patch } } } });
  };

  return {
    player: loadCached(),
    connection: 'connecting',
    welcomed: guestChoice.get(),
    toasts: [],

    finishWelcome() {
      guestChoice.set(true);
      set({ welcomed: true });
    },

    async init() {
      try {
        if (!getToken()) {
          const s = await api<SessionResponse>('/session', { method: 'POST' });
          setToken(s.token);
          accept(s.state);
        } else {
          accept(await api<PlayerState>('/state'));
        }
        await flushQueue();
      } catch (e) {
        if (e instanceof RequestError && e.status === 401) {
          // Token no longer valid (e.g. database reset) — start a fresh profile.
          clearToken();
          storage.remove(STATE_KEY);
          return get().init();
        }
        set({ connection: 'offline' });
      }
    },

    async refresh() {
      accept(await api<PlayerState>('/state'));
    },

    async completeInteraction(conceptId) {
      try {
        const res = await api<RewardResponse>(`/concepts/${conceptId}/interaction`, { body: {} });
        accept(res.state);
        celebrate(res.lines);
        return res;
      } catch (e) {
        if (e instanceof RequestError && e.offline) {
          enqueue({ kind: 'interaction', conceptId });
          markLocal(conceptId, { interactionDoneAt: new Date().toISOString() });
          return null;
        }
        throw e;
      }
    },

    async submitQuiz(conceptId, answers) {
      try {
        const res = await api<QuizSubmitResponse>(`/concepts/${conceptId}/quiz`, {
          body: { answers },
        });
        accept(res.state);
        celebrate(res.lines);
        return res;
      } catch (e) {
        if (!(e instanceof RequestError && e.offline)) throw e;
        // Offline: grade locally for instant feedback; the server re-grades when we reconnect.
        const concept = LESSON_BY_ID[conceptId];
        const g = gradeQuiz(concept.quiz, answers);
        enqueue({ kind: 'quiz', conceptId, answers });
        const passed = g.score >= 2;
        if (passed) markLocal(conceptId, { quizPassedAt: new Date().toISOString() });
        return {
          ...g,
          passed,
          perfect: g.score === g.outOf,
          lines: [],
          total: 0,
          state: get().player!,
        };
      }
    },

    async openPack(tier) {
      const res = await api<PackOpenResponse>('/shop/packs', { body: { tier } });
      accept(res.state);
      return res;
    },

    async buyAvatar(avatarId) {
      accept(await api<PlayerState>(`/shop/avatars/${avatarId}`, { method: 'POST' }));
    },

    async equip(avatarId) {
      accept(await api<PlayerState>('/equip', { body: { avatarId } }));
    },

    async rename(displayName) {
      accept(await api<PlayerState>('/profile', { method: 'PATCH', body: { displayName } }));
    },

    async solveMystery(id, req) {
      const res = await api<MysterySolveResponse>(`/mysteries/${id}/solve`, { body: req });
      accept(res.state);
      celebrate(res.lines);
      return res;
    },

    async signIn(provider) {
      const { idToken, name } = await getIdToken(provider);
      // Send anything done offline first, so it lands on the guest profile before linking.
      await flushQueue();
      const res = await api<SignInResponse>(`/auth/${provider}`, { body: { idToken, name } });
      if (res.token) setToken(res.token);
      accept(res.state);
      get().finishWelcome();
      return res;
    },

    async emailAuth(mode, email, password) {
      // Send anything done offline first, so it lands on the guest profile before linking.
      await flushQueue();
      const res = await api<SignInResponse>(`/auth/email/${mode}`, { body: { email, password } });
      if (res.token) setToken(res.token);
      accept(res.state);
      get().finishWelcome();
      return res;
    },

    async signOut() {
      const provider = get().player?.account?.provider;
      await api('/auth/sign-out', { method: 'POST' }).catch(() => undefined);
      if (provider && provider !== 'email') await providerSignOut(provider);
      clearToken();
      storage.remove(STATE_KEY);
      saveQueue([]);
      guestChoice.set(false);
      set({ player: null, welcomed: false });
      await get().init();
    },

    dismissToast(id) {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },
  };
});

export const isCompleted = (p: PlayerState | null, conceptId: string) =>
  !!p?.progress[conceptId]?.completedAt;
