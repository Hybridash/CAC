/**
 * The AI tutor behind Bio Bot. It is a plain function so tests can swap in a fake one; the real
 * implementation calls Google's Gemini API from the server, so the API key never reaches players.
 */
import { HttpError } from './http.js';

export interface TutorMessage {
  role: 'user' | 'model';
  text: string;
}

/** Returns the tutor's reply to the conversation, guided by the system instructions. */
export type Tutor = (system: string, messages: TutorMessage[]) => Promise<string>;

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

/** Shown when Gemini declines to answer (for example, a safety block). */
export const DECLINED_REPLY =
  'I can’t help with that one. Try asking me something about this lesson or another biology topic!';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  error?: { message?: string };
}

export function geminiTutor(
  apiKey: string,
  model = DEFAULT_GEMINI_MODEL,
  fetchImpl: typeof fetch = fetch,
): Tutor {
  return async (system, messages) => {
    let res: Response;
    try {
      res = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
            // Generous, because thinking models spend part of this budget before answering.
            generationConfig: { maxOutputTokens: 2048 },
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
    } catch {
      throw new HttpError(502, 'Bio Bot couldn’t reach its brain. Please try again in a moment.');
    }
    const body = (await res.json().catch(() => ({}))) as GeminiResponse;
    if (!res.ok) {
      console.error(`Gemini error ${res.status}: ${body.error?.message ?? 'unknown'}`);
      throw new HttpError(
        res.status === 429 ? 503 : 502,
        res.status === 429
          ? 'Bio Bot is very busy right now. Please try again in a minute.'
          : 'Bio Bot had a problem answering. Please try again.',
      );
    }
    const text = (body.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought && p.text)
      .map((p) => p.text)
      .join('')
      .trim();
    return text || DECLINED_REPLY;
  };
}

/** The tutor configured by GEMINI_API_KEY (and optional GEMINI_MODEL), or none if no key is set. */
export function tutorFromEnv(env = process.env): Tutor | undefined {
  const key = env.GEMINI_API_KEY?.trim();
  return key ? geminiTutor(key, env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL) : undefined;
}
