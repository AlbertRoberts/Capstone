// ── Location types ────────────────────────────────────────────────────────────

export type PublicLocationId =
  | "town_hall"
  | "school"
  | "clinic"
  | "cafe"
  | "tavern"
  | "market"
  | "park";

export type HouseId =
  | "house_1"
  | "house_2"
  | "house_3"
  | "house_4"
  | "house_5"
  | "house_6"
  | "house_7"
  | "house_8"
  | "house_9"
  | "house_10";

export type LocationId = PublicLocationId | HouseId;

export type Pt = { x: number; y: number };

export type SpeedLevel = 0 | 1 | 2 | 4;

export type AgentStatus = "idle" | "walking" | "interacting" | "error";

// ── Map data ──────────────────────────────────────────────────────────────────

export const PUBLIC_LOCATIONS: Record<PublicLocationId, Pt> = {
  town_hall: { x: 647, y: 369 },
  school:    { x: 317, y: 363 },
  clinic:    { x: 977, y: 268 },
  cafe:      { x: 977, y: 450 },
  tavern:    { x: 389, y: 643 },
  market:    { x: 799, y: 646 },
  park:      { x: 1102, y: 652 },
};

export const HOUSE_LOCATIONS: Record<HouseId, Pt> = {
  house_1:  { x: 85,   y: 545 },
  house_2:  { x: 82,   y: 378 },
  house_3:  { x: 79,   y: 218 },
  house_4:  { x: 305,  y: 66  },
  house_5:  { x: 481,  y: 66  },
  house_6:  { x: 668,  y: 66  },
  house_7:  { x: 852,  y: 66  },
  house_8:  { x: 1019, y: 66  },
  house_9:  { x: 1209, y: 224 },
  house_10: { x: 1212, y: 372 },
};

export const LOCATIONS: Record<LocationId, Pt> = {
  ...PUBLIC_LOCATIONS,
  ...HOUSE_LOCATIONS,
};

export const PUBLIC_ENTRANCES: Record<PublicLocationId, Pt> = {
  town_hall: { x: 647,  y: 551 },
  school:    { x: 201,  y: 363 },
  clinic:    { x: 1085, y: 268 },
  cafe:      { x: 977,  y: 551 },
  tavern:    { x: 389,  y: 551 },
  market:    { x: 799,  y: 551 },
  park:      { x: 1085, y: 551 },
};

export const HOUSE_ENTRANCES: Record<HouseId, Pt> = {
  house_1:  { x: 201,  y: 545 },
  house_2:  { x: 201,  y: 378 },
  house_3:  { x: 201,  y: 218 },
  house_4:  { x: 305,  y: 176 },
  house_5:  { x: 481,  y: 176 },
  house_6:  { x: 668,  y: 176 },
  house_7:  { x: 852,  y: 176 },
  house_8:  { x: 1019, y: 176 },
  house_9:  { x: 1085, y: 224 },
  house_10: { x: 1085, y: 372 },
};

export const ENTRANCES: Record<LocationId, Pt> = {
  ...PUBLIC_ENTRANCES,
  ...HOUSE_ENTRANCES,
};

export const SIDEWALK_SEGMENTS = [
  // Bottom sidewalk
  { x1: 201,  y1: 551, x2: 1085, y2: 551 },

  // Verticals connecting bottom road to the top house-road
  { x1: 201,  y1: 176, x2: 201,  y2: 551 },
  { x1: 466,  y1: 176, x2: 466,  y2: 551 },
  { x1: 831,  y1: 176, x2: 831,  y2: 551 },
  { x1: 1085, y1: 176, x2: 1085, y2: 551 },

  // Short spans so A* cannot shortcut over grass / buildings
  { x1: 201,  y1: 176, x2: 466,  y2: 176 },
  { x1: 466,  y1: 176, x2: 831,  y2: 176 },
  { x1: 831,  y1: 176, x2: 1085, y2: 176 },

  // Entry spurs to each location
  { x1: 647,  y1: 551, x2: 647,  y2: 369 },  // town_hall
  { x1: 201,  y1: 363, x2: 317,  y2: 363 },  // school
  { x1: 1085, y1: 268, x2: 977,  y2: 268 },  // clinic
  { x1: 977,  y1: 551, x2: 977,  y2: 450 },  // cafe
  { x1: 389,  y1: 551, x2: 389,  y2: 643 },  // tavern
  { x1: 799,  y1: 551, x2: 799,  y2: 646 },  // market
  { x1: 1085, y1: 551, x2: 1102, y2: 652 },  // park
  { x1: 201,  y1: 545, x2: 85,   y2: 545 },  // house_1
  { x1: 201,  y1: 378, x2: 82,   y2: 378 },  // house_2
  { x1: 201,  y1: 218, x2: 79,   y2: 218 },  // house_3
  { x1: 305,  y1: 176, x2: 305,  y2: 66  },  // house_4
  { x1: 481,  y1: 176, x2: 481,  y2: 66  },  // house_5
  { x1: 668,  y1: 176, x2: 668,  y2: 66  },  // house_6
  { x1: 852,  y1: 176, x2: 852,  y2: 66  },  // house_7
  { x1: 1019, y1: 176, x2: 1019, y2: 66  },  // house_8
  { x1: 1085, y1: 224, x2: 1209, y2: 224 },  // house_9
  { x1: 1085, y1: 372, x2: 1212, y2: 372 },  // house_10
];

// ── Sidewalk graph helpers ────────────────────────────────────────────────────

function uniquePoints(points: Pt[]): Pt[] {
  const seen = new Set<string>();
  return points.filter(p => {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateSidewalkPoints(step = 60): Pt[] {
  const pts: Pt[] = [];
  for (const seg of SIDEWALK_SEGMENTS) {
    const dx    = seg.x2 - seg.x1;
    const dy    = seg.y2 - seg.y1;
    const steps = Math.max(1, Math.floor(Math.hypot(dx, dy) / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({ x: Math.round(seg.x1 + dx * t), y: Math.round(seg.y1 + dy * t) });
    }
  }
  return uniquePoints(pts);
}

export const SIDEWALK_POINTS = generateSidewalkPoints(60);

// ── Visual / gameplay constants ───────────────────────────────────────────────

/** One distinct colour per agent slot (up to 10 agents). */
export const AGENT_COLORS = [
  0x4ade80, // green
  0x60a5fa, // blue
  0xf87171, // red
  0xfbbf24, // amber
  0xe879f9, // fuchsia
  0x34d399, // emerald
  0xfb923c, // orange
  0xa78bfa, // violet
  0x22d3ee, // cyan
  0xf472b6, // pink
];

export const DWELL_MS              = 5_000;
export const AGENT_SPEED           = 140;    // px/s
export const INTERACTION_DISTANCE  = 40;     // px
export const INTERACTION_COOLDOWN  = 15_000; // ms
export const AGENT_LOOP_RESTART_MS = 500;
export const AGENT_LOOP_STAGGER_MS = 1_500;
export const MAX_EVENT_LOG_ENTRIES = 30;
export const API_BASE              = "http://localhost:8000";
