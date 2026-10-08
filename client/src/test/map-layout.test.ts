import { describe, expect, it } from 'vitest';
import { CATEGORIES, CONCEPTS, MYSTERIES } from '@bioplay/shared';
import { computeMapLayout } from '../map/layout';

describe('knowledge map layout', () => {
  const layout = computeMapLayout(CONCEPTS, CATEGORIES, MYSTERIES);

  it('places every concept exactly once', () => {
    expect(layout.nodes).toHaveLength(CONCEPTS.length);
    expect(new Set(layout.nodes.map((n) => n.concept.id)).size).toBe(CONCEPTS.length);
  });

  it('keeps nodes inside their category region', () => {
    for (const n of layout.nodes) {
      const r = layout.regions.find((x) => x.category.id === n.concept.category)!;
      expect(n.x).toBeGreaterThan(r.x);
      expect(n.x).toBeLessThan(r.x + r.w);
      expect(n.y).toBeGreaterThan(r.y);
      expect(n.y).toBeLessThan(r.y + r.h);
    }
  });

  it('keeps nodes from overlapping', () => {
    for (let i = 0; i < layout.nodes.length; i++)
      for (let j = i + 1; j < layout.nodes.length; j++) {
        const a = layout.nodes[i];
        const b = layout.nodes[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(24);
      }
  });

  it('draws an edge for every prerequisite', () => {
    const expected = CONCEPTS.reduce((s, c) => s + (c.prerequisites?.length ?? 0), 0);
    expect(layout.edges).toHaveLength(expected);
  });
});
