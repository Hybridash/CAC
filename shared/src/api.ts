/** Types shared by the API server and the client. */

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
  achievements: string[];
  /** The Google or Apple account this progress is saved to, or null for a guest. */
  account: LinkedAccount | null;
}

export type AuthProvider = 'google' | 'apple';

export interface LinkedAccount {
  provider: AuthProvider;
  email: string | null;
}

export interface SignInRequest {
  /** The ID token (a signed JWT) returned by Google or Apple sign-in on the device. */
  idToken: string;
  /** Apple only shares the person's name on the very first sign-in, so the device passes it along. */
  name?: string;
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
