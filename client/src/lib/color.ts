/**
 * A text-safe shade of a topic color: pulled toward the current ink (dark in light mode, pale in
 * dark mode) so small text meets WCAG AA on either ground.
 */
export const inkFor = (color: string) => `color-mix(in srgb, ${color} 62%, var(--color-ink))`;
