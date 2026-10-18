import { isBlankHtml } from "./sanitize";

type P = { id: string; name: string };

/** "Period 1, Period 2" or "Full day". */
export function describePeriods(periods: P[]): string {
  return periods.length ? periods.map((p) => p.name).join(", ") : "Full day";
}

/**
 * Which covered periods still need a lesson plan?
 * - Period assignment: each covered period needs a block for that period with lesson content.
 * - Full-day assignment: needs a plan with at least one block or directions.
 * Returns the names of what's missing ("the whole day" when there's no plan).
 */
export function missingLessons(
  plan: { directionsHtml: string; blocks: Array<{ periodId: string | null; lessonHtml: string }> } | undefined,
  periods: P[],
): string[] {
  if (!plan) return ["the whole day"];
  if (periods.length === 0) {
    return plan.blocks.some((b) => !isBlankHtml(b.lessonHtml)) || !isBlankHtml(plan.directionsHtml) ? [] : ["the whole day"];
  }
  return periods.filter((p) => !plan.blocks.some((b) => b.periodId === p.id && !isBlankHtml(b.lessonHtml))).map((p) => p.name);
}
