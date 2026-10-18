import { describe, expect, it } from "vitest";
import { filterMessage, containsProfanity, BLOCKED_NOTICE } from "@/lib/profanity";

function sent(text: string) {
  const r = filterMessage(text);
  if (r.status !== "ok") throw new Error(`expected ok, got blocked for: ${text}`);
  return r;
}

describe("profanity filter", () => {
  it("passes clean classroom messages through unchanged", () => {
    for (const t of [
      "Period 3 has an assessment today.",
      "The class can work in the grass area if it's sunny.",
      "Assignment sheets are in the blue bin by the cockpit model.",
      "Bring the shiitake mushrooms for the science lab.",
      "Analysis of the passage is due Friday.",
      "Visitors from Scunthorpe arrive at noon.",
    ]) {
      const r = sent(t);
      expect(r.text).toBe(t);
      expect(r.masked).toBe(false);
    }
  });

  it("masks plain profanity with asterisks and keeps the rest", () => {
    const r = sent("This copier is shit, use the one in the library");
    expect(r.masked).toBe(true);
    expect(r.text).toBe("This copier is ****, use the one in the library");
  });

  it("catches letter substitutions", () => {
    for (const t of ["f@ck", "sh1t", "b!tch", "a$$hole"]) {
      expect(containsProfanity(`well ${t} okay then`)).toBe(true);
    }
    const r = sent("the printer is a$$hole level broken today");
    expect(r.text).not.toMatch(/hole/);
  });

  it("catches repeated characters", () => {
    expect(containsProfanity("fuuuuuck this printer")).toBe(true);
    expect(containsProfanity("shiiiiit the bell rang")).toBe(true);
  });

  it("catches spacing and punctuation tricks", () => {
    for (const t of ["f u c k", "f.u.c.k", "s-h-i-t", "s h 1 t", "f_u_c_k"]) {
      expect(containsProfanity(`oh ${t} the fire drill`)).toBe(true);
    }
    const r = sent("oh f u c k, the fire drill is at 10");
    expect(r.text).toBe("oh *******, the fire drill is at 10");
  });

  it("ignores invisible characters used to split words", () => {
    expect(containsProfanity("sh​it happens in period 2")).toBe(true);
  });

  it("does not flag ordinary spaced letters", () => {
    expect(containsProfanity("Options are a b c or d")).toBe(false);
    expect(containsProfanity("Room B-1-2 is open")).toBe(false);
  });

  it("blocks messages that are mostly profanity with a gentle notice", () => {
    const r = filterMessage("fuck shit");
    expect(r.status).toBe("blocked");
    if (r.status === "blocked") expect(r.notice).toBe(BLOCKED_NOTICE);
  });

  it("normalizes whitespace at the ends", () => {
    expect(sent("  hello  ").text).toBe("hello");
  });
});
