// Types & Constants

type PublicLocationId =
  | "town_hall"
  | "school"
  | "clinic"
  | "cafe"
  | "tavern"
  | "market"
  | "park";

type HouseId =
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

type LocationId = PublicLocationId | HouseId;

type Pt = { x: number; y: number };

const PUBLIC_LOCATIONS: Record<PublicLocationId, Pt> = {
  town_hall: { x: 647, y: 369 },
  school:    { x: 317, y: 363 },
  clinic:    { x: 977, y: 268 },
  cafe:      { x: 977, y: 450 },
  tavern:    { x: 389, y: 643 },
  market:    { x: 799, y: 646 },
  park:      { x: 1102, y: 652 },
};

const HOUSE_LOCATIONS: Record<HouseId, Pt> = {
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

const LOCATIONS: Record<LocationId, Pt> = {
  ...PUBLIC_LOCATIONS,
  ...HOUSE_LOCATIONS,
};

const PUBLIC_ENTRANCES: Record<PublicLocationId, Pt> = {
  town_hall: { x: 647,  y: 551 },
  school:    { x: 201,  y: 363 },
  clinic:    { x: 1085, y: 268 },
  cafe:      { x: 977,  y: 551 },
  tavern:    { x: 389,  y: 551 },
  market:    { x: 799,  y: 551 },
  park:      { x: 1085, y: 551 },
};

const HOUSE_ENTRANCES: Record<HouseId, Pt> = {
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

const ENTRANCES: Record<LocationId, Pt> = {
  ...PUBLIC_ENTRANCES,
  ...HOUSE_ENTRANCES,
};

const SIDEWALK_SEGMENTS = [
  // Bottom sidewalk
  { x1: 201,  y1: 551, x2: 1085, y2: 551 },

  // Verticals connecting bottom road to the top house-road.
  { x1: 201,  y1: 176, x2: 201,  y2: 551 },
  { x1: 466,  y1: 176, x2: 466,  y2: 551 },
  { x1: 831,  y1: 176, x2: 831,  y2: 551 },
  { x1: 1085, y1: 176, x2: 1085, y2: 551 },

  // three short spans so A* cannot use the top road as a shortcut over grass / buildings.
  { x1: 201,  y1: 176, x2: 466,  y2: 176 },  
  { x1: 466,  y1: 176, x2: 831,  y2: 176 },  
  { x1: 831,  y1: 176, x2: 1085, y2: 176 },  

  // Entry points
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

/** New Colors for each Agent to visually separate */
const AGENT_COLORS = [
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

/** How long an agent dwells at a destination before requesting the next action */
const DWELL_MS               = 5_000;
const AGENT_SPEED            = 140; // px/s
const INTERACTION_DISTANCE   = 40;  // px
const INTERACTION_COOLDOWN   = 15_000; // ms
const AGENT_LOOP_RESTART_MS  = 500;
const AGENT_LOOP_STAGGER_MS  = 1_500;
const MAX_EVENT_LOG_ENTRIES  = 30;
const API_BASE               = "http://localhost:8000";

// Sidewalk graph helpers (module-level, built once)


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
    const dx     = seg.x2 - seg.x1;
    const dy     = seg.y2 - seg.y1;
    const steps  = Math.max(1, Math.floor(Math.hypot(dx, dy) / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({ x: Math.round(seg.x1 + dx * t), y: Math.round(seg.y1 + dy * t) });
    }
  }
  return uniquePoints(pts);
}

const SIDEWALK_POINTS = generateSidewalkPoints(60);

// Backend types

interface BackendAgent {
  id:             number;
  name:           string;
  personality:    string;
  location:       string;
  current_action: string;
}

interface BackendAction {
  description:    string;
  location_id?:   LocationId;   // preferred: explicit field from backend
  scheduled_time: string | null;
}

interface BackendPlan {
  agent_id: number;
  date:     string;
  actions:  BackendAction[];
}

interface ConversationTurn {
  speaker: string;
  line:    string;
}

interface BackendInteractionResponse {
  happened:     boolean;
  summary:      string;
  importance_a: number;
  importance_b: number;
  duration_ms:  number;
  turns:        ConversationTurn[];
}

interface BackendAskResponse {
  agent_name: string;
  question:   string;
  answer:     string;
}

// BackendClient  — all API calls

class BackendClient {
  constructor(private readonly base: string) {}

  async registerAgent(cfg: AgentConfig): Promise<number> {
    const res = await this.post("/agents/", {
      name:           cfg.name,
      personality:    cfg.personalityPrompt,
      location:       cfg.startingPoint,
      home_location:  cfg.startingPoint,
      current_action: "idle",
    });
    const data: BackendAgent = await res.json();
    return data.id;
  }

  async fetchPlan(agentId: number): Promise<BackendPlan> {
    const res = await fetch(`${this.base}/agents/${agentId}/plan`);
    if (!res.ok) throw new Error(`Plan fetch failed for agent ${agentId}: ${res.status}`);
    return res.json();
  }

  async reportArrival(agentId: number, locationId: LocationId, action: string): Promise<void> {
    await this.put(`/agents/${agentId}`, { location: locationId, current_action: action });
  }

  async writeMemory(agentId: number, content: string, importance: number): Promise<void> {
    await this.post(`/agents/${agentId}/memory`, { agent_id: agentId, content, importance });
  }

  async requestInteraction(
    agentAId: number,
    agentBId: number,
    location:  LocationId,
    simTime:   string,
  ): Promise<BackendInteractionResponse> {
    const res = await this.post("/interactions/", {
      agent_a_id: agentAId,
      agent_b_id: agentBId,
      location,
      time:       simTime,
    });
    return res.json();
  }

  async setSpeed(speed: number): Promise<void> {
    await this.post("/simulation/speed", { speed });
  }

  async askAgent(agentId: number, question: string): Promise<BackendAskResponse> {
    const res = await this.post(`/agents/${agentId}/ask`, { question });
    return res.json();
  }

  // ── private helpers ──────────────────────────────────────

  private async post(path: string, body: unknown): Promise<Response> {
    const res = await fetch(`${this.base}${path}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return res;
  }

  private async put(path: string, body: unknown): Promise<void> {
    const res = await fetch(`${this.base}${path}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  }
}

// SidewalkGraph — encapsulates the A* pathfinder

class SidewalkGraph {
  private readonly graph    = new Map<string, string[]>();
  private readonly byKey    = new Map<string, Pt>();

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

      if (current === goalKey) {
        return this.reconstructPath(cameFrom, current);
      }

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

  // ── private ──────────────────────────────────────────────

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
    // Register every generated sidewalk point in the lookup maps.
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

    // KEY CHANGE: build edges by walking each segment in order, then linking
    // only consecutive points along that segment.  This means a node can only
    // reach neighbours that share its segment — it can never jump across grass
    // to another road that happens to be collinear.
    const EPS = 6;
    for (const seg of SIDEWALK_SEGMENTS) {
      const isHorizontal = Math.abs(seg.y1 - seg.y2) <= EPS;

      // Collect every generated point that lies on this segment.
      const onSeg = SIDEWALK_POINTS.filter(p => {
        if (isHorizontal) {
          // Same row: y matches, x is between the segment endpoints.
          const withinX = p.x >= Math.min(seg.x1, seg.x2) - EPS &&
                          p.x <= Math.max(seg.x1, seg.x2) + EPS;
          return Math.abs(p.y - seg.y1) <= EPS && withinX;
        } else {
          // Same column: x matches, y is between the segment endpoints.
          const withinY = p.y >= Math.min(seg.y1, seg.y2) - EPS &&
                          p.y <= Math.max(seg.y1, seg.y2) + EPS;
          return Math.abs(p.x - seg.x1) <= EPS && withinY;
        }
      });

      // Sort along the segment axis so consecutive entries are truly adjacent.
      onSeg.sort((a, b) => isHorizontal ? a.x - b.x : a.y - b.y);

      // Link only neighbouring pairs — never skip a node.
      for (let i = 0; i < onSeg.length - 1; i++) {
        link(onSeg[i], onSeg[i + 1]);
      }
    }
  }
}

// Agent — owns its own visual objects and async loop

/**
 * Status values that drive busy/available logic.
 *
 * "idle"        — at a location, waiting for next loop tick
 * "walking"     — tween sequence in progress
 * "interacting" — backend interaction call in-flight
 * "error"       — last loop iteration threw; cooling down
 */
type AgentStatus = "idle" | "walking" | "interacting" | "error";

class Agent {
  // Phaser display objects
  readonly body:       Phaser.GameObjects.Arc;
  readonly label:      Phaser.GameObjects.Text;
  readonly statusText: Phaser.GameObjects.Text;

  // Logical state
  readonly backendId:  number;
  readonly color:      number;
  status:              AgentStatus = "idle";
  currentLocation:     LocationId | null = null;
  destination:         LocationId | null = null;
  lastAction:          string = "None";
  interactingWith:     Agent | null = null;
  lastInteractionAt:   number = 0;

  get busy(): boolean {
    return this.status !== "idle";
  }

  get displayName(): string {
    return this.label.text;
  }

  constructor(
    scene:     Phaser.Scene,
    name:      string,
    x:         number,
    y:         number,
    backendId: number,
    color:     number,
  ) {
    this.backendId  = backendId;
    this.color      = color;
    this.body       = scene.add.circle(x, y, 10, color).setDepth(900);
    this.label      = scene.add.text(x + 12, y - 10, name, { color: "#ffffff", fontSize: "14px" }).setDepth(900);
    this.statusText = scene.add.text(x + 12, y + 6,  "idle", { color: "#9ca3af", fontSize: "11px" }).setDepth(900);
  }

  setStatus(status: AgentStatus, label?: string) {
    this.status = status;
    this.statusText.setText(label ?? status);
  }

  /** Sync label positions to the body's current coordinates. */
  syncLabels() {
    this.label.setPosition(this.body.x + 12, this.body.y - 10);
    this.statusText.setPosition(this.body.x + 12, this.body.y + 6);
  }

  destroy() {
    this.body.destroy();
    this.label.destroy();
    this.statusText.destroy();
  }
}

// Sidebar — owns all DOM interaction

type SpeedLevel = 0 | 1 | 2 | 4;

class Sidebar {
  private readonly el: HTMLDivElement;
  private currentSpeed: SpeedLevel = 1;
  onSpeedChange: ((speed: SpeedLevel) => void) | null = null;
  onAskAgent:    ((agentId: number, question: string) => Promise<string>) | null = null;

  // agent list for the ask dropdown (backendId → displayName)
  private agentOptions: { id: number; name: string }[] = [];

  constructor() {
    this.el = document.createElement("div");
    Object.assign(this.el.style, {
      position:   "absolute",
      top:        "0",
      right:      "0",
      width:      "320px",
      height:     "100vh",
      background: "rgba(17, 24, 39, 0.96)",
      color:      "white",
      padding:    "16px",
      boxSizing:  "border-box",
      borderLeft: "2px solid #374151",
      fontFamily: "Arial, sans-serif",
      zIndex:     "1000",
      overflowY:  "auto",
    });

    this.el.innerHTML = `
      <h2 style="margin-top:0;">Town Status</h2>

      <!-- Clock + speed controls -->
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="color:#9ca3af; font-size:13px;">
           <span id="sim-clock">8:00am</span>
        </span>
        <div id="speed-controls" style="display:flex; gap:4px; margin-left:auto;">
          <button data-speed="0"  id="spd-0" title="Pause">⏸</button>
          <button data-speed="1"  id="spd-1" title="1× speed">▶</button>
          <button data-speed="2"  id="spd-2" title="2× speed">▶▶</button>
          <button data-speed="4"  id="spd-4" title="4× speed">▶▶▶</button>
        </div>
      </div>

      <!-- Agent status -->
      <div id="agent-status-section">
        <h3 style="margin:0 0 8px;">Agents</h3>
        <div id="agent-status-list"></div>
      </div>

      <hr style="margin:16px 0; border-color:#374151;" />

      <!-- Active conversation (hidden until a convo starts) -->
      <div id="conversation-section" style="display:none;">
        <h3 style="margin:0 0 8px;"> Conversation</h3>
        <div id="conversation-box" style="
          display:flex; flex-direction:column; gap:6px;
          padding:8px; background:#0f172a;
          border:1px solid #1e3a5f; border-radius:6px;
          min-height:60px;
        "></div>
      </div>

      <hr id="conversation-hr" style="margin:16px 0; border-color:#374151; display:none;" />

      <!-- Ask an agent -->
      <div id="ask-section">
        <h3 style="margin:0 0 8px;">Ask an Agent</h3>
        <select id="ask-agent-select" style="
          width:100%; padding:6px; margin-bottom:6px;
          background:#1f2937; color:white; border:1px solid #374151; border-radius:4px;
        ">
          <option value="">— select agent —</option>
        </select>
        <div style="display:flex; gap:6px; margin-bottom:6px;">
          <input id="ask-input" type="text" placeholder="Type your question…" style="
            flex:1; padding:6px; background:#1f2937; color:white;
            border:1px solid #374151; border-radius:4px; font-size:13px;
          "/>
          <button id="ask-submit" style="
            padding:6px 10px; background:#3b82f6; color:white;
            border:none; border-radius:4px; cursor:pointer; font-size:13px;
          ">Ask</button>
        </div>
        <div id="ask-response" style="
          min-height:40px; padding:8px; background:#111827;
          border:1px solid #374151; border-radius:4px; font-size:13px;
          color:#d1d5db; white-space:pre-wrap; display:none;
        "></div>
      </div>

      <hr style="margin:16px 0; border-color:#374151;" />

      <!-- Event log -->
      <div id="event-log-section">
        <h3 style="margin:0 0 8px;">Event Log</h3>
        <div id="event-log-list" style="display:flex; flex-direction:column; gap:8px;"></div>
      </div>
    `;

    document.body.appendChild(this.el);
    this._styleSpeedButtons();
    this._attachSpeedListeners();
    this._attachAskListeners();
  }

  // ── speed controls ────────────────────────────────────────

  private _styleSpeedButtons() {
    this.el.querySelectorAll<HTMLButtonElement>("#speed-controls button").forEach(btn => {
      Object.assign(btn.style, {
        padding:      "4px 8px",
        background:   "#374151",
        color:        "white",
        border:       "1px solid #4b5563",
        borderRadius: "4px",
        cursor:       "pointer",
        fontSize:     "12px",
        fontFamily:   "monospace",
      });
    });
    this._highlightSpeed(this.currentSpeed);
  }

  private _highlightSpeed(speed: SpeedLevel) {
    this.el.querySelectorAll<HTMLButtonElement>("#speed-controls button").forEach(btn => {
      const active = Number(btn.dataset.speed) === speed;
      btn.style.background  = active ? "#2563eb" : "#374151";
      btn.style.borderColor = active ? "#3b82f6" : "#4b5563";
    });
  }

  private _attachSpeedListeners() {
    this.el.querySelectorAll<HTMLButtonElement>("#speed-controls button").forEach(btn => {
      btn.addEventListener("click", () => {
        const speed = Number(btn.dataset.speed) as SpeedLevel;
        this.currentSpeed = speed;
        this._highlightSpeed(speed);
        this.onSpeedChange?.(speed);
      });
    });
  }

  setSpeed(speed: SpeedLevel) {
    this.currentSpeed = speed;
    this._highlightSpeed(speed);
  }

  // ── ask-agent panel ───────────────────────────────────────

  private _attachAskListeners() {
    const btn   = this.el.querySelector<HTMLButtonElement>("#ask-submit")!;
    const input = this.el.querySelector<HTMLInputElement>("#ask-input")!;

    const submit = async () => {
      const select   = this.el.querySelector<HTMLSelectElement>("#ask-agent-select")!;
      const agentId  = Number(select.value);
      const question = input.value.trim();
      if (!agentId || !question) return;

      const respEl = this.el.querySelector<HTMLDivElement>("#ask-response")!;
      respEl.style.display = "block";
      respEl.textContent   = "Thinking…";
      btn.disabled         = true;

      try {
        const answer = await this.onAskAgent?.(agentId, question) ?? "No response.";
        const name   = this.agentOptions.find(a => a.id === agentId)?.name ?? "Agent";
        respEl.textContent = `${name}: "${answer}"`;
      } catch {
        respEl.textContent = "Failed to get a response.";
      } finally {
        btn.disabled = false;
      }
    };

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  }

  updateAgentOptions(agents: { id: number; name: string }[]) {
    this.agentOptions = agents;
    const select = this.el.querySelector<HTMLSelectElement>("#ask-agent-select");
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">— select agent —</option>`;
    for (const a of agents) {
      const opt      = document.createElement("option");
      opt.value      = String(a.id);
      opt.textContent = a.name;
      select.appendChild(opt);
    }
    select.value = current; // restore selection if still valid
  }

  // ── clock ─────────────────────────────────────────────────

  updateClock(simTime: string) {
    const el = this.el.querySelector<HTMLSpanElement>("#sim-clock");
    if (el) el.textContent = simTime;
  }

  // ── agent status ──────────────────────────────────────────

  renderAgents(agents: Agent[]) {
    const list = this.el.querySelector<HTMLDivElement>("#agent-status-list");
    if (!list) return;
    list.innerHTML = "";

    for (const agent of agents) {
      const row = document.createElement("div");
      Object.assign(row.style, {
        padding:      "8px",
        marginBottom: "8px",
        background:   "#1f2937",
        borderRadius: "6px",
        border:       "1px solid #374151",
      });
      row.innerHTML = `
        <strong>${agent.displayName}</strong><br/>
        Destination: ${agent.destination ?? "None"}<br/>
        Status: ${agent.status}<br/>
        Action: ${agent.lastAction}
      `;
      list.appendChild(row);
    }
  }

  // ── conversation panel ────────────────────────────────────

  showConversationTurn(turn: ConversationTurn, isFirst: boolean) {
    const section = this.el.querySelector<HTMLDivElement>("#conversation-section")!;
    const hr      = this.el.querySelector<HTMLHRElement>("#conversation-hr")!;
    const box     = this.el.querySelector<HTMLDivElement>("#conversation-box")!;

    if (isFirst) {
      box.innerHTML      = "";
      section.style.display = "block";
      hr.style.display   = "block";
    }

    const bubble = document.createElement("div");
    Object.assign(bubble.style, {
      padding:      "6px 10px",
      borderRadius: "8px",
      fontSize:     "13px",
      lineHeight:   "1.4",
      maxWidth:     "90%",
      wordBreak:    "break-word",
      animation:    "fadeInUp 0.3s ease",
    });

    // Alternate alignment: first speaker left, second speaker right
    const isLeft = box.children.length % 2 === 0;
    Object.assign(bubble.style, {
      background:  isLeft ? "#1e3a5f" : "#1e3a2a",
      border:      isLeft ? "1px solid #2563eb" : "1px solid #16a34a",
      alignSelf:   isLeft ? "flex-start" : "flex-end",
    });

    bubble.innerHTML = `<strong style="font-size:11px; opacity:0.75;">${turn.speaker}</strong><br/>${turn.line}`;
    box.appendChild(bubble);
    // Scroll to bottom
    box.scrollTop = box.scrollHeight;
  }

  clearConversation() {
    const section = this.el.querySelector<HTMLDivElement>("#conversation-section")!;
    const hr      = this.el.querySelector<HTMLHRElement>("#conversation-hr")!;
    if (section) section.style.display = "none";
    if (hr)      hr.style.display      = "none";
  }

  // ── event log ─────────────────────────────────────────────

  addEventLog(simTime: string, message: string) {
    const log = this.el.querySelector<HTMLDivElement>("#event-log-list");
    if (!log) return;

    const item = document.createElement("div");
    Object.assign(item.style, {
      padding:      "8px",
      background:   "#111827",
      border:       "1px solid #374151",
      borderRadius: "6px",
      fontSize:     "14px",
    });
    item.textContent = `[${simTime}] ${message}`;
    log.prepend(item);

    while (log.children.length > MAX_EVENT_LOG_ENTRIES) {
      log.removeChild(log.lastChild!);
    }
  }

  remove() {
    this.el.remove();
  }
}

// AgentConfig (imported type — matches StartScene)

import type { AgentConfig } from "./StartScene";

// TownScene

/* START OF COMPILED CODE */
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class TownScene extends Phaser.Scene {

  // ── scene init ────────────────────────────────────────────

  private configuredAgents: AgentConfig[] = [];

  init(data: { agents?: AgentConfig[] }) {
    this.configuredAgents = data.agents ?? [];
  }

  constructor() {
    super("townscene");
  }

  // ── core objects ──────────────────────────────────────────

  private agents:  Map<string, Agent> = new Map();
  private sidebar: Sidebar | null = null;
  private graph:   SidewalkGraph | null = null;
  private client:  BackendClient | null = null;
  private lightingOverlay!: Phaser.GameObjects.Rectangle;

  // ── sim-time tracking (speed-aware) ───────────────────────
  /** Accumulated sim-minutes up to the last speed change. */
  private simAccuMinutes = 8 * 60;       // start at 8:00am
  /** Real wall-clock timestamp (ms) of the last speed change. */
  private simLastRealMs  = Date.now();
  /** Current speed multiplier (sim-minutes per real second). */
  private simSpeed: SpeedLevel = 1;

  // ── scene lifecycle ───────────────────────────────────────

  async create() {
    this.editorCreate();

    this.graph  = new SidewalkGraph();
    this.client = new BackendClient(API_BASE);
    this.sidebar = new Sidebar();

    // Wire up sidebar callbacks
    this.sidebar.onSpeedChange = (speed) => this.setSimSpeed(speed);
    this.sidebar.onAskAgent    = async (agentId, question) => {
      const res = await this.client!.askAgent(agentId, question);
      this.log(`[Q&A] ${res.agent_name} was asked: "${res.question}"`);
      return res.answer;
    };

    this.createLighting();
    this.updateLighting();

    this.drawAnchors();
    this.drawEntrances();

    // Tick the sim clock every real second
    this.time.addEvent({
      delay:    1_000,
      loop:     true,
      callback: () => {
        this.sidebar?.updateClock(this.getSimTime());
        this.updateLighting();
      },
    });

    // Proximity check every second
    this.time.addEvent({
      delay:    1_000,
      loop:     true,
      callback: () => this.checkAgentProximity(),
    });

    this.events.once("shutdown", () => this.cleanup());
    this.events.once("destroy",  () => this.cleanup());

    // Register and spawn each configured agent
    for (const cfg of this.configuredAgents) {
      const loc = LOCATIONS[cfg.startingPoint];
      const color = AGENT_COLORS[this.configuredAgents.indexOf(cfg) % AGENT_COLORS.length];
      try {
        const backendId = await this.client!.registerAgent(cfg);
        const agent     = new Agent(this, cfg.name, loc.x, loc.y, backendId, color);
        agent.currentLocation = cfg.startingPoint; // so first move exits via the correct entrance
        this.agents.set(cfg.id, agent);

        const stagger = this.configuredAgents.indexOf(cfg) * AGENT_LOOP_STAGGER_MS;
        this.time.delayedCall(stagger, () => this.runAgentLoop(cfg.id));

        this.log(`${cfg.name} entered the town at ${cfg.startingPoint}.`);
        console.log(`[${cfg.name}] registered as backend id ${backendId}`);
      } catch (err) {
        console.error(`Failed to register ${cfg.name}:`, err);
        this.log(`Failed to register ${cfg.name}.`);
      }
    }

    this.sidebar.renderAgents(Array.from(this.agents.values()));
    this.sidebar.updateAgentOptions(
      Array.from(this.agents.values()).map(a => ({ id: a.backendId, name: a.displayName }))
    );
  }

  // ── agent loop ────────────────────────────────────────────

  private async runAgentLoop(frontendId: string): Promise<void> {
    const agent = this.agents.get(frontendId);
    // Guard: don't start a new loop iteration if already running
    if (!agent || agent.status !== "idle") return;

    try {
      // 1. Fetch plan
      const plan        = await this.client!.fetchPlan(agent.backendId);
      const action      = plan.actions[0];
      const description = action?.description ?? "";
      const locationId  = this.resolveLocation(action);

      agent.destination = locationId;
      agent.lastAction  = description || "Moving";
      agent.setStatus("walking", description.length > 24 ? description.slice(0, 22) + "…" : description);
      this.sidebar?.renderAgents(Array.from(this.agents.values()));
      this.log(`${agent.displayName} plans: "${description}" → ${locationId}`);

      // 2. Walk
      await this.walkAgentTo(frontendId, locationId);

      // 3. Dwell
      await this.delay(DWELL_MS);

      // 4. Report arrival
      await this.client!.reportArrival(agent.backendId, locationId, description);

      // 5. Write memory
      const simTime    = this.getSimTime();
      const locName    = locationId.replace(/_/g, " ");
      await this.client!.writeMemory(
        agent.backendId,
        `At ${simTime} I went to the ${locName}. ${description}`,
        0.3,
      );
      this.log(`${agent.displayName} remembered: visiting the ${locName} at ${simTime}.`);

      agent.setStatus("idle");
      agent.lastAction = "idle";

    } catch (err) {
      console.error(`[${frontendId}] agent loop error:`, err);
      agent.setStatus("error", "⚠ error");
      agent.lastAction = "error";
      this.log(`${agent.displayName} hit an error.`);
      await this.delay(10_000);
      agent.setStatus("idle");
    }

    this.sidebar?.renderAgents(Array.from(this.agents.values()));

    // Restart loop after a short pause
    this.time.delayedCall(AGENT_LOOP_RESTART_MS, () => this.runAgentLoop(frontendId));
  }

  /**
   * Resolves which LocationId an action targets.
   *
   * Priority:
   *   1. Explicit `location_id` field from the backend (preferred)
   *   2. String-match against the description
   *   3. Random fallback
   */
  private resolveLocation(action: BackendAction | undefined): LocationId {
    if (action?.location_id && action.location_id in LOCATIONS) {
      return action.location_id;
    }

    const desc    = action?.description?.toLowerCase() ?? "";
    const allKeys = Object.keys(LOCATIONS) as LocationId[];
    const found   = allKeys.find(loc =>
      desc.includes(loc.replace(/_/g, " ")) || desc.includes(loc),
    );

    return found ?? allKeys[Math.floor(Math.random() * allKeys.length)];
  }

  // ── movement ──────────────────────────────────────────────

  /**
   * Moves the agent to a destination along the sidewalk graph.
   * Returns a promise that resolves when the agent arrives.
   * The agent's status is managed by the caller (runAgentLoop).
   */
  private walkAgentTo(frontendId: string, locationId: LocationId): Promise<void> {
    return new Promise(resolve => {
      const agent = this.agents.get(frontendId);
      if (!agent) { resolve(); return; }

      this.tweens.killTweensOf(agent.body);

      const destEntrance     = ENTRANCES[locationId];
      const finalDestination = LOCATIONS[locationId];

      // Exit point: the entrance of the building we're currently in.
      // All building entrances are sidewalk nodes, so we run A* directly
      // between them — no extra closestPoint() call needed.
      const exitPt = agent.currentLocation
        ? ENTRANCES[agent.currentLocation]
        : this.graph!.closestPoint(agent.body.x, agent.body.y);

      const keyPath = this.graph!.aStar(
        this.graph!.keyOf(exitPt),
        this.graph!.keyOf(destEntrance),
      );

      // Route: interior start → exit onto sidewalk → A* sidewalk path → dest interior
      // The A* path already starts at exitPt and ends at destEntrance, so we
      // never manually re-push either of those points — that was the source of
      // the duplicate-node bug (cafe→cafe entry→clinic→clinic entry→clinic).
      const route: Pt[] = [{ x: agent.body.x, y: agent.body.y }];
      if (keyPath) {
        for (const k of keyPath) {
          const p = this.graph!.pointByKey(k);
          if (p) route.push(p);
        }
      } else {
        // Fallback: straight line to entrance if graph lookup fails
        route.push(exitPt, destEntrance);
      }
      // Only append the interior destination if it differs from the entrance
      // (they are the same point for some locations, which would add a zero-
      // duration tween and confuse the step counter).
      if (finalDestination.x !== destEntrance.x || finalDestination.y !== destEntrance.y) {
        route.push(finalDestination);
      }

      // Deduplicate consecutive identical points
      const cleaned = route.filter((p, i) => {
        const prev = route[i - 1];
        return !prev || prev.x !== p.x || prev.y !== p.y;
      });

      agent.destination    = locationId;
      agent.currentLocation = null;
      this.log(`${agent.displayName} started moving to ${locationId}.`);
      this.sidebar?.renderAgents(Array.from(this.agents.values()));

      let i = 0;

      const step = () => {
        i++;
        if (i >= cleaned.length) {
          agent.currentLocation = locationId;
          agent.setStatus("idle");
          this.sidebar?.renderAgents(Array.from(this.agents.values()));
          resolve();
          return;
        }

        const to   = cleaned[i];
        const segLen = Phaser.Math.Distance.Between(agent.body.x, agent.body.y, to.x, to.y);

        this.tweens.add({
          targets:  agent.body,
          x:        to.x,
          y:        to.y,
          duration: (segLen / AGENT_SPEED) * 1_000,
          ease:     "Linear",
          onUpdate: () => agent.syncLabels(),
          onComplete: step,
        });
      };

      step();
    });
  }

  // ── interactions ──────────────────────────────────────────

  private checkAgentProximity() {
    const agents = Array.from(this.agents.entries());

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const [aId, a] = agents[i];
        const [bId, b] = agents[j];

        if (this.canInteract(aId, a, bId, b)) {
          // Fire-and-forget — the scene continues ticking
          void this.runInteraction(a, b);
          return; // one pair per cycle
        }
      }
    }
  }

  private canInteract(aId: string, a: Agent, bId: string, b: Agent): boolean {
    if (aId === bId) return false;
    if (a.busy || b.busy) return false;
    if (a.interactingWith || b.interactingWith) return false;
    if (!a.currentLocation || b.currentLocation !== a.currentLocation) return false;

    const now = this.time.now;
    if (now - a.lastInteractionAt < INTERACTION_COOLDOWN) return false;
    if (now - b.lastInteractionAt < INTERACTION_COOLDOWN) return false;

    return Phaser.Math.Distance.Between(a.body.x, a.body.y, b.body.x, b.body.y) <= INTERACTION_DISTANCE;
  }

  private async runInteraction(a: Agent, b: Agent): Promise<void> {
    // Re-validate location now that we're in an async context
    if (!a.currentLocation || a.currentLocation !== b.currentLocation) return;

    const location = a.currentLocation;

    a.interactingWith = b;
    b.interactingWith = a;
    a.setStatus("interacting", "…");
    b.setStatus("interacting", "…");
    a.lastAction = `Talking to ${b.displayName}`;
    b.lastAction = `Talking to ${a.displayName}`;
    a.lastInteractionAt = this.time.now;
    b.lastInteractionAt = this.time.now;
    this.sidebar?.renderAgents(Array.from(this.agents.values()));

    try {
      const result = await this.client!.requestInteraction(
        a.backendId,
        b.backendId,
        location,
        this.getSimTime(),
      );

      if (result.happened) {
        const turns = result.turns ?? [];
        const msPerTurn = turns.length > 0
          ? Math.floor(result.duration_ms / turns.length)
          : result.duration_ms;

        // Play turns one by one
        for (let i = 0; i < turns.length; i++) {
          const turn = turns[i];

          // Show in sidebar conversation panel
          this.sidebar?.showConversationTurn(turn, i === 0);

          // Show the line as the speaking agent's status
          const speaker = turn.speaker === a.displayName ? a : b;
          const listener = speaker === a ? b : a;
          const truncated = turn.line.length > 28
            ? turn.line.slice(0, 26) + "…"
            : turn.line;
          speaker.setStatus("interacting", `"${truncated}"`);
          listener.setStatus("interacting", "👂 …");
          this.sidebar?.renderAgents(Array.from(this.agents.values()));

          await this.delay(msPerTurn);
        }

        // Log summary after conversation ends
        this.log(`${a.displayName} & ${b.displayName}: ${result.summary}`);

        // Clear conversation panel after a brief pause
        await this.delay(1_500);
        this.sidebar?.clearConversation();

      } else {
        await this.delay(1_000);
      }
    } catch (err) {
      console.error("Interaction failed:", err);
      this.log(`${a.displayName} and ${b.displayName} tried to talk, but something went wrong.`);
      this.sidebar?.clearConversation();
      await this.delay(2_000);
    }

    a.interactingWith = null;
    b.interactingWith = null;
    a.setStatus("idle");
    b.setStatus("idle");
    a.lastAction = "idle";
    b.lastAction = "idle";
    this.sidebar?.renderAgents(Array.from(this.agents.values()));
  }

  // ── lighting ──────────────────────────────────────────────

  private createLighting() {
    this.lightingOverlay = this.add.rectangle(640, 360, 1280, 720, 0x0b1020);
    this.lightingOverlay.setScrollFactor(0).setDepth(800).setAlpha(0.08);
  }

  private updateLighting() {
    if (!this.lightingOverlay) return;
    this.lightingOverlay.setAlpha(this.getLightingAlpha(this.getSimMinutes()));
  }

  private getLightingAlpha(totalMinutes: number): number {
    const h = totalMinutes / 60;
    if (h >= 6  && h < 8)  return Phaser.Math.Linear(0.45, 0.08, (h - 6)  / 2);
    if (h >= 8  && h < 17) return 0.08;
    if (h >= 17 && h < 20) return Phaser.Math.Linear(0.12, 0.4,  (h - 17) / 3);
    return 0.45;
  }

  // ── sim clock ─────────────────────────────────────────────

  private getSimMinutes(): number {
    const elapsed = (Date.now() - this.simLastRealMs) / 1_000; // real seconds
    return Math.floor(this.simAccuMinutes + elapsed * this.simSpeed) % (24 * 60);
  }

  private getSimTime(): string {
    const total       = this.getSimMinutes();
    const hours       = Math.floor(total / 60);
    const minutes     = total % 60;
    const period      = hours < 12 ? "am" : "pm";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes.toString().padStart(2, "0")}${period}`;
  }

  private setSimSpeed(speed: SpeedLevel) {
    // Snapshot current sim minutes before changing speed
    this.simAccuMinutes = this.getSimMinutes();
    this.simLastRealMs  = Date.now();
    this.simSpeed       = speed;

    // Scale Phaser's timer and tween systems (0 = full pause)
    this.time.timeScale   = speed === 0 ? 0 : speed;
    this.tweens.timeScale = speed === 0 ? 0 : speed;

    // Sync backend (fire-and-forget)
    this.client?.setSpeed(speed).catch(console.error);
  }

  // ── helpers ───────────────────────────────────────────────

  /** Thin wrapper around Phaser's delayedCall that returns a Promise. */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  /** Log a message to the sidebar event log. */
  private log(message: string) {
    this.sidebar?.addEventLog(this.getSimTime(), message);
  }

  private cleanup() {
    this.sidebar?.remove();
    this.sidebar = null;
  }

  // ── debug helpers ─────────────────────────────────────────

  private drawAnchors() {
    for (const [id, pos] of Object.entries(LOCATIONS)) {
      this.add.circle(pos.x, pos.y, 6, 0xffcc00).setDepth(1000).setAlpha(0.6);
      this.add.text(pos.x + 8, pos.y - 10, id, { color: "#ffffff", fontSize: "12px" }).setDepth(1000);
    }
    for (const pos of SIDEWALK_POINTS) {
      this.add.circle(pos.x, pos.y, 4, 0xffcc00).setDepth(1000).setAlpha(0.4);
    }
  }

  private drawEntrances() {
    for (const [id, pos] of Object.entries(ENTRANCES)) {
      this.add.circle(pos.x, pos.y, 5, 0x00ffff).setDepth(1100).setAlpha(0.85);
      this.add.text(pos.x + 8, pos.y + 8, `entry_${id}`, { color: "#00ffff", fontSize: "11px" }).setDepth(1100);
    }
  }

  // ── editor-generated scene setup (unchanged) ──────────────

  editorCreate(): void {
    this.add.rectangle(632, 371, 128, 128).setScale(10.180187948025909, 5.833727976370516).setFillStyle(3108670);
    this.add.rectangle(644, 628, 128, 128).setScale(0.37167610523713657, 1.4867068094771634).setFillStyle(9408399);
    this.add.rectangle(644, 551, 128, 128).setScale(0.32718513673271565, 7.251572595017952).setAngle(-90).setFillStyle(9408399);
    this.add.rectangle(201, 361, 128, 128).setScale(0.37328872859877876, 3.245378044183737).setFillStyle(9408399);
    this.add.rectangle(1085, 361, 128, 128).setScale(0.37328872859877876, 3.245378044183737).setFillStyle(9408399);
    this.add.rectangle(647, 176, 128, 128).setScale(0.32718513673271565, 7.251572595017952).setAngle(-90).setFillStyle(9408399);
    this.add.rectangle(317, 363, 128, 128).setScale(1, 2.466942142176058).setFillStyle(4662308);
    this.add.rectangle(305,   66, 128, 128).setFillStyle(4662308);
    this.add.rectangle(481,   66, 128, 128).setFillStyle(4662308);
    this.add.rectangle(668,   66, 128, 128).setFillStyle(4662308);
    this.add.rectangle(852,   66, 128, 128).setFillStyle(4662308);
    this.add.rectangle(1019,  66, 128, 128).setFillStyle(4662308);
    this.add.rectangle(1209, 224, 128, 128).setFillStyle(4662308);
    this.add.rectangle(1212, 372, 128, 128).setFillStyle(4662308);
    this.add.rectangle(1209, 527, 128, 128).setFillStyle(4662308);
    this.add.rectangle(85,  545, 128, 128).setFillStyle(4662308);
    this.add.rectangle(82,  378, 128, 128).setFillStyle(4662308);
    this.add.rectangle(79,  218, 128, 128).setFillStyle(4662308);
    this.add.rectangle(977, 450, 128, 128).setFillStyle(4662308);
    this.add.rectangle(977, 268, 128, 128).setFillStyle(4662308);
    this.add.rectangle(647, 369, 128, 128).setScale(2.001800422483393, 1.1617588487187138).setFillStyle(4662308);
    this.add.rectangle(799, 646, 128, 128).setScale(1.4865908809477275, 0.8796780398859774).setFillStyle(4662308);
    this.add.rectangle(389, 643, 128, 128).setScale(2.777556167090955,  0.696841503238748).setFillStyle(4662308);
    this.add.rectangle(466, 364,  48, 380).setFillStyle(9408399);
    this.add.rectangle(831, 364,  48, 380).setFillStyle(9408399);
    this.add.rectangle(1102, 652, 128, 128).setScale(2.288062440058767, 0.416422309655215).setFillStyle(9489506);
    this.events.emit("scene-awake");
  }

  /* END-USER-CODE */
}

/* END OF COMPILED CODE */