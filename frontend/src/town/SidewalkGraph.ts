import { type Pt, SIDEWALK_POINTS, SIDEWALK_SEGMENTS } from "./types";

/**
 * Builds a graph of sidewalk waypoints and exposes an A* pathfinder.
 * Constructed once at module level and shared across the scene.
 */
export class SidewalkGraph {
  private readonly graph = new Map<string, string[]>();
  private readonly byKey = new Map<string, Pt>();

  constructor() {
    this.build();
  }

  keyOf(p: Pt): string { return `${p.x},${p.y}`; }

  pointByKey(key: string): Pt | undefined { return this.byKey.get(key); }

  closestPoint(x: number, y: number): Pt {
    let best  = SIDEWALK_POINTS[0];
    let bestD = Infinity;
    for (const p of SIDEWALK_POINTS) {
      const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  aStar(startKey: string, goalKey: string): string[] | null {
    const start = this.byKey.get(startKey);
    const goal  = this.byKey.get(goalKey);
    if (!start || !goal) return null;

    const open     = new Set<string>([startKey]);
    const cameFrom = new Map<string, string>();
    const gScore   = new Map<string, number>([[startKey, 0]]);
    const fScore   = new Map<string, number>([[startKey, this.dist(start, goal)]]);

    while (open.size > 0) {
      const current = this.lowestF(open, fScore);
      if (!current) break;

      if (current === goalKey) return this.reconstructPath(cameFrom, current);

      open.delete(current);
      const curPt = this.byKey.get(current)!;

      for (const nb of (this.graph.get(current) ?? [])) {
        const nbPt = this.byKey.get(nb);
        if (!nbPt) continue;
        const tentG = (gScore.get(current) ?? Infinity) + this.dist(curPt, nbPt);
        if (tentG < (gScore.get(nb) ?? Infinity)) {
          cameFrom.set(nb, current);
          gScore.set(nb, tentG);
          fScore.set(nb, tentG + this.dist(nbPt, goal));
          open.add(nb);
        }
      }
    }
    return null;
  }

  // ── private ───────────────────────────────────────────────────────────────

  private dist(a: Pt, b: Pt): number {
    return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
  }

  private lowestF(open: Set<string>, fScore: Map<string, number>): string | null {
    let bestK: string | null = null;
    let bestF = Infinity;
    for (const k of open) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) { bestF = f; bestK = k; }
    }
    return bestK;
  }

  private reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
    const path = [current];
    let cur    = current;
    while (cameFrom.has(cur)) { cur = cameFrom.get(cur)!; path.push(cur); }
    return path.reverse();
  }

  private build() {
    for (const p of SIDEWALK_POINTS) {
      const k = this.keyOf(p);
      this.byKey.set(k, p);
      this.graph.set(k, []);
    }

    const link = (a: Pt, b: Pt) => {
      const ka = this.keyOf(a), kb = this.keyOf(b);
      const al = this.graph.get(ka);
      const bl = this.graph.get(kb);
      if (al && !al.includes(kb)) al.push(kb);
      if (bl && !bl.includes(ka)) bl.push(ka);
    };

    const EPS = 6;
    for (const seg of SIDEWALK_SEGMENTS) {
      const isHorizontal = Math.abs(seg.y1 - seg.y2) <= EPS;

      const onSeg = SIDEWALK_POINTS.filter(p => {
        if (isHorizontal) {
          const withinX = p.x >= Math.min(seg.x1, seg.x2) - EPS &&
                          p.x <= Math.max(seg.x1, seg.x2) + EPS;
          return Math.abs(p.y - seg.y1) <= EPS && withinX;
        } else {
          const withinY = p.y >= Math.min(seg.y1, seg.y2) - EPS &&
                          p.y <= Math.max(seg.y1, seg.y2) + EPS;
          return Math.abs(p.x - seg.x1) <= EPS && withinY;
        }
      });

      onSeg.sort((a, b) => isHorizontal ? a.x - b.x : a.y - b.y);

      for (let i = 0; i < onSeg.length - 1; i++) link(onSeg[i], onSeg[i + 1]);
    }
  }
}
