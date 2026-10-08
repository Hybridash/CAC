/** A darker shade of a category color for text, so small text meets WCAG AA contrast on pale tints. */
export const inkFor = (color: string) => `color-mix(in srgb, ${color} 62%, #000)`;
