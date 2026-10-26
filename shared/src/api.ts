/** Types shared by the API server and the client. */
import type { AvatarRarity } from './types';

export interface ConceptProgress {
  interactionDoneAt: string | null;
  quizPassedAt: string | null;
  quizPerfect: boolean;
  bestScore: number;
  lastQuizAt: string | null;
  completedAt: string | null;
}

export interface PlayerState {
  userId: string;
  displayName: string;
  atp: number;
  nucleotides: number;
  equippedAvatar: string | null;
  streak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  progress: Record<string, ConceptProgress>;
  /** avatarId -> number of copies ever pulled (≥1 means owned). */
  inventory: Record<string, number>;
  mysteriesSolved: string[];
  /** Mysteries opened for this account directly, without their required concepts. */
  unlockedMysteries: string[];
  achievements: string[];
  /** The account this progress is saved to (Google, Apple or a Bio Bites email account), or null for a guest. */
  account: LinkedAccount | null;
}

export type AuthProvider = 'google' | 'apple';

/** Where a player's progress is saved: a Google/Apple account or a Bio Bites email account. */
export type AccountProvider = AuthProvider | 'email';

export interface LinkedAccount {
  provider: AccountProvider;
  email: string | null;
}

export interface SignInRequest {
  /** The ID token (a signed JWT) returned by Google or Apple sign-in on the device. */
  idToken: string;
  /** Apple only shares the person's name on the very first sign-in, so the device passes it along. */
  name?: string;
}

/** Create or log in to a Bio Bites account (email + password). */
export interface EmailAuthRequest {
  email: string;
  password: string;
}

/** `token` is set when signing in switched to an existing account; the client must use it from then on. */
export interface SignInResponse {
  token?: string;
  state: PlayerState;
  switched: boolean;
}

export interface SessionResponse {
  token: string;
  state: PlayerState;
}

/** One line item of a reward so the UI can explain where ATP came from. */
export interface RewardLine {
  reason: string;
  amount: number;
  currency: 'atp' | 'nucleotides';
}

export interface RewardResponse {
  lines: RewardLine[];
  total: number;
  state: PlayerState;
}

export interface QuizSubmitResponse extends RewardResponse {
  score: number;
  outOf: number;
  passed: boolean;
  perfect: boolean;
  /** Per-question correctness, in question order. */
  results: boolean[];
}

export interface ApiError {
  error: string;
}

export interface PackCard {
  avatarId: string;
  duplicate: boolean;
  /** Nucleotides granted if this was a duplicate. */
  nucleotides: number;
}

export interface PackOpenResponse {
  tier: string;
  cards: PackCard[];
  /** Whether each tap on the pack raised its rarity, in tap order (rolled on the server). */
  upgrades: boolean[];
  /** The pack's final rarity: at least one card is this rarity or better. */
  rarity: AvatarRarity;
  state: PlayerState;
}

export interface MysterySolveRequest {
  explanation: number;
  /** Indices of evidence statements the player selected. */
  evidence: number[];
}

export interface MysterySolveResponse extends RewardResponse {
  correct: boolean;
  explanationCorrect: boolean;
  evidenceCorrect: boolean;
  /** Mystery-exclusive avatar won on this solve, if any. */
  exclusiveAvatar: string | null;
  alreadySolved: boolean;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export interface ChatRequest {
  /** The lesson the player is asking about (library or High School id). */
  lessonId: string;
  /** The conversation so far, oldest first; the last message is the player's new question. */
  messages: ChatMessage[];
}

export interface ChatStatus {
  /** False when the server has no AI key configured. */
  enabled: boolean;
  limit: number;
  remaining: number;
}

export interface ChatResponse {
  reply: string;
  remaining: number;
}
