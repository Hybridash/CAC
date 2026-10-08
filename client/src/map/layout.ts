import type { Category, Concept, Mystery } from '@bioplay/shared';

export interface MapRegion {
  category: Category;
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface MapNode {
  concept: Concept;
  x: number;
  y: number;
}
export interface MapEdge {
  from: string;
  to: string;
}
export interface MysteryNode {
  mystery: Mystery;
  x: number;
  y: number;
}

export const REGION_W = 270;
export const REGION_H = 250;
const GAP = 30;
const COLS = 4;
const LABEL_H = 46;

/** Lay out categories as regions in a grid, concepts as nodes inside them (easiest first). */
export function computeMapLayout(
  concepts: Concept[],
  categories: Category[],
  mysteries: Mystery[],
) {
  const regions: MapRegion[] = categories.map((category, i) => ({
    category,
    x: GAP + (i % COLS) * (REGION_W + GAP),
    y: GAP + Math.floor(i / COLS) * (REGION_H + GAP),
    w: REGION_W,
    h: REGION_H,
  }));
  const nodes: MapNode[] = [];
  for (const r of regions) {
    const inCat = concepts
      .filter((c) => c.category === r.category.id)
      .sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
    const n = inCat.length;
    const areaW = r.w - 40;
    const areaH = r.h - LABEL_H - 26;
    const cols = Math.max(1, Math.ceil(Math.sqrt((n * areaW) / areaH)));
    const rows = Math.max(1, Math.ceil(n / cols));
    inCat.forEach((concept, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Offset alternate rows a little for an organic, honeycomb feel.
      const stagger = row % 2 ? 0.5 : 0;
      nodes.push({
        concept,
        x: r.x + 20 + ((col + 0.5 + stagger * (cols > 1 ? 0.5 : 0)) / cols) * areaW,
        y: r.y + LABEL_H + ((row + 0.5) / rows) * areaH,
      });
    });
  }
  const ids = new Set(concepts.map((c) => c.id));
  const edges: MapEdge[] = concepts.flatMap((c) =>
    (c.prerequisites ?? []).filter((p) => ids.has(p)).map((p) => ({ from: p, to: c.id })),
  );
  const byId = new Map(nodes.map((n) => [n.concept.id, n]));
  const mysteryNodes: MysteryNode[] = mysteries.map((m, i) => {
    const pts = m.requires.map((id) => byId.get(id)).filter((n): n is MapNode => !!n);
    const cx = pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length);
    const cy = pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length);
    return { mystery: m, x: cx + ((i % 3) - 1) * 14, y: cy - 18 + (i % 2) * 10 };
  });
  return {
    regions,
    nodes,
    edges,
    mysteryNodes,
    width: GAP + COLS * (REGION_W + GAP),
    height: GAP + Math.ceil(categories.length / COLS) * (REGION_H + GAP),
  };
}
