// You can write more code here

// anchor points for the locations in the town, used for navigation and interaction

type LocationId =
  | "town_hall"
  | "school"
  | "clinic"
  | "cafe"
  | "tavern"
  | "market"
  | "park";

type Pt = { x: number; y: number };

const LOCATIONS: Record<LocationId, Pt> = {
  town_hall: { x: 647, y: 369 },
  school: { x: 317, y: 363 },
  clinic: { x: 977, y: 268 },
  cafe: { x: 977, y: 450 },
  tavern: { x: 389, y: 643 },
  market: { x: 799, y: 646 },
  park: { x: 1102, y: 652 },
};

const ENTRANCES: Record<LocationId, Pt> = {
  town_hall: { x: 647, y: 551 },
  school: { x: 201, y: 363 },
  clinic: { x: 1085, y: 268 },
  cafe: { x: 977, y: 551 },
  tavern: { x: 389, y: 551 },
  market: { x: 799, y: 551 },
  park: { x: 1085, y: 551 },
};

const SIDEWALK_SEGMENTS = [
	// top horizontal
	{ x1: 201, y1: 176, x2: 1085, y2: 176 },
  
	// bottom horizontal
	{ x1: 201, y1: 551, x2: 1085, y2: 551 },
  
	// left outer vertical
	{ x1: 201, y1: 176, x2: 201, y2: 551 },
  
	// middle verticals
	{ x1: 466, y1: 176, x2: 466, y2: 551 },
	{ x1: 831, y1: 176, x2: 831, y2: 551 },
  
	// right outer vertical
	{ x1: 1085, y1: 176, x2: 1085, y2: 551 },
  
	// center bottom lead
	{ x1: 647, y1: 551, x2: 647, y2: 628 },
  
	// entrance connectors
	{ x1: 389, y1: 551, x2: 389, y2: 643 },
	{ x1: 799, y1: 551, x2: 799, y2: 646 },
  ];

function uniquePoints(points: Pt[]): Pt[] {
  const seen = new Set<string>();
  const out: Pt[] = [];
  for (const p of points) {
    const key = `${p.x},${p.y}`;
    if (!seen.has(key)) { seen.add(key); out.push(p); }
  }
  return out;
}

function generateSidewalkPoints(step = 60): Pt[] {
  const pts: Pt[] = [];
  for (const seg of SIDEWALK_SEGMENTS) {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const length = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(length / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({ x: Math.round(seg.x1 + dx * t), y: Math.round(seg.y1 + dy * t) });
    }
  }
  return uniquePoints(pts);
}

const SIDEWALK_POINTS: Pt[] = generateSidewalkPoints(60);

// Backend config
const API_BASE = "http://localhost:8000";

/** How long an agent waits at a destination before requesting the next action */
const DWELL_MS = 5000;

// Types

interface BackendAgent {
	id: number;
	name: string;
	personality: string;
	location: string;
	current_action: string;
}

interface BackendAction {
	description: string;
	scheduled_time: string | null;
}

interface BackendPlan {
	agent_id: number;
	date: string;
	actions: BackendAction[];
}

interface BackendInteractionRequest {
	agent_a_id: number;
	agent_b_id: number;
	location: string;
	time: string;
}

interface BackendInteractionResponse {
	happened: boolean;
	summary: string;
	importance_a: number;
	importance_b: number;
	duration_ms: number;
}

import type { AgentConfig } from "./StartScene";

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class townscene extends Phaser.Scene {
	private configuredAgents: AgentConfig[] = [];

	init(data: { agents?: AgentConfig[] }) {
		this.configuredAgents = data.agents ?? [];
	}

	constructor() {
		super("townscene");
	}

	editorCreate(): void {

		const rectangle_1 = this.add.rectangle(632, 371, 128, 128);
		rectangle_1.scaleX = 10.180187948025909;
		rectangle_1.scaleY = 5.833727976370516;
		rectangle_1.isFilled = true;
		rectangle_1.fillColor = 3108670;

		const sidewalk_lead = this.add.rectangle(644, 628, 128, 128);
		sidewalk_lead.scaleX = 0.37167610523713657;
		sidewalk_lead.scaleY = 1.4867068094771634;
		sidewalk_lead.isFilled = true;
		sidewalk_lead.fillColor = 9408399;

		const sidewalk_bottom = this.add.rectangle(644, 551, 128, 128);
		sidewalk_bottom.scaleX = 0.32718513673271565;
		sidewalk_bottom.scaleY = 7.251572595017952;
		sidewalk_bottom.angle = -90;
		sidewalk_bottom.isFilled = true;
		sidewalk_bottom.fillColor = 9408399;

		const sidewalk_left = this.add.rectangle(201, 361, 128, 128);
		sidewalk_left.scaleX = 0.37328872859877876;
		sidewalk_left.scaleY = 3.245378044183737;
		sidewalk_left.isFilled = true;
		sidewalk_left.fillColor = 9408399;

		const sidewalk_right = this.add.rectangle(1085, 361, 128, 128);
		sidewalk_right.scaleX = 0.37328872859877876;
		sidewalk_right.scaleY = 3.245378044183737;
		sidewalk_right.isFilled = true;
		sidewalk_right.fillColor = 9408399;

		const sidewalk_top = this.add.rectangle(647, 176, 128, 128);
		sidewalk_top.scaleX = 0.32718513673271565;
		sidewalk_top.scaleY = 7.251572595017952;
		sidewalk_top.angle = -90;
		sidewalk_top.isFilled = true;
		sidewalk_top.fillColor = 9408399;

		const school = this.add.rectangle(317, 363, 128, 128);
		school.scaleY = 2.466942142176058;
		school.isFilled = true;
		school.fillColor = 4662308;

		const house_4 = this.add.rectangle(305, 66, 128, 128);
		house_4.isFilled = true;
		house_4.fillColor = 4662308;

		const house_5 = this.add.rectangle(481, 66, 128, 128);
		house_5.isFilled = true;
		house_5.fillColor = 4662308;

		const house_6 = this.add.rectangle(668, 66, 128, 128);
		house_6.isFilled = true;
		house_6.fillColor = 4662308;

		const house_7 = this.add.rectangle(852, 66, 128, 128);
		house_7.isFilled = true;
		house_7.fillColor = 4662308;

		const house_8 = this.add.rectangle(1019, 66, 128, 128);
		house_8.isFilled = true;
		house_8.fillColor = 4662308;

		const house_9 = this.add.rectangle(1209, 224, 128, 128);
		house_9.isFilled = true;
		house_9.fillColor = 4662308;

		const house_10 = this.add.rectangle(1212, 372, 128, 128);
		house_10.isFilled = true;
		house_10.fillColor = 4662308;

		const rectangle_15 = this.add.rectangle(1209, 527, 128, 128);
		rectangle_15.isFilled = true;
		rectangle_15.fillColor = 4662308;

		const house_1 = this.add.rectangle(85, 545, 128, 128);
		house_1.isFilled = true;
		house_1.fillColor = 4662308;

		const house_2 = this.add.rectangle(82, 378, 128, 128);
		house_2.isFilled = true;
		house_2.fillColor = 4662308;

		const house_3 = this.add.rectangle(79, 218, 128, 128);
		house_3.isFilled = true;
		house_3.fillColor = 4662308;

		const cafe = this.add.rectangle(977, 450, 128, 128);
		cafe.isFilled = true;
		cafe.fillColor = 4662308;

		const clinic = this.add.rectangle(977, 268, 128, 128);
		clinic.isFilled = true;
		clinic.fillColor = 4662308;

		const town_Hall = this.add.rectangle(647, 369, 128, 128);
		town_Hall.scaleX = 2.001800422483393;
		town_Hall.scaleY = 1.1617588487187138;
		town_Hall.isFilled = true;
		town_Hall.fillColor = 4662308;

		const market = this.add.rectangle(799, 646, 128, 128);
		market.scaleX = 1.4865908809477275;
		market.scaleY = 0.8796780398859774;
		market.isFilled = true;
		market.fillColor = 4662308;

		const tavern = this.add.rectangle(389, 643, 128, 128);
		tavern.scaleX = 2.777556167090955;
		tavern.scaleY = 0.696841503238748;
		tavern.isFilled = true;
		tavern.fillColor = 4662308;

		const side_middle_left = this.add.rectangle(466, 364, 48, 380);
		side_middle_left.isFilled = true;
		side_middle_left.fillColor = 9408399;

		const side_middle_right = this.add.rectangle(831, 364, 48, 380);
		side_middle_right.isFilled = true;
		side_middle_right.fillColor = 9408399;

		const park = this.add.rectangle(1102, 652, 128, 128);
		park.scaleX = 2.288062440058767;
		park.scaleY = 0.416422309655215;
		park.isFilled = true;
		park.fillColor = 9489506;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// lighting
	private lightingOverlay!: Phaser.GameObjects.Rectangle;

	private getSimMinutes(): number {
		const simMinutes = Math.floor(this.time.now / 1000);
		return (8 * 60 + simMinutes) % (24 * 60);
	}
	
	private getLightingAlpha(totalMinutes: number): number {
		const hour = totalMinutes / 60;
	
		// 6am–8am: sunrise
		if (hour >= 6 && hour < 8) {
			return Phaser.Math.Linear(0.45, 0.08, (hour - 6) / 2);
		}
	
		// 8am–5pm: daytime
		if (hour >= 8 && hour < 17) {
			return 0.08;
		}
	
		// 5pm–8pm: sunset
		if (hour >= 17 && hour < 20) {
			return Phaser.Math.Linear(0.12, 0.4, (hour - 17) / 3);
		}
	
		// 8pm–6am: night
		return 0.45;
	}
	
	private createLighting() {
		this.lightingOverlay = this.add.rectangle(640, 360, 1280, 720, 0x0b1020);
		this.lightingOverlay.setScrollFactor(0);
		this.lightingOverlay.setDepth(800); // below agents/labels, above town
		this.lightingOverlay.setAlpha(0.08);
	}
	
	private updateLighting() {
		if (!this.lightingOverlay) return;
		const totalMinutes = this.getSimMinutes();
		const alpha = this.getLightingAlpha(totalMinutes);
		this.lightingOverlay.setAlpha(alpha);
	}

	// Sidebar

	private createSidebar() {
		const panel = document.createElement("div");
		panel.id = "town-sidebar";
		panel.style.position = "absolute";
		panel.style.top = "0";
		panel.style.right = "0";
		panel.style.width = "320px";
		panel.style.height = "100vh";
		panel.style.background = "rgba(17, 24, 39, 0.96)";
		panel.style.color = "white";
		panel.style.padding = "16px";
		panel.style.boxSizing = "border-box";
		panel.style.borderLeft = "2px solid #374151";
		panel.style.fontFamily = "Arial, sans-serif";
		panel.style.zIndex = "1000";
		panel.style.overflowY = "auto";

		panel.innerHTML = `
			<h2 style="margin-top:0;">Town Status</h2>

			<div style="margin-bottom:12px; color:#9ca3af; font-size:13px;">
				<span>Sim time: </span><span id="sim-clock">8:00am</span>
			</div>

			<div id="agent-status-section">
				<h3>Agents</h3>
				<div id="agent-status-list"></div>
			</div>

			<hr style="margin:16px 0; border-color:#374151;" />

			<div id="event-log-section">
				<h3>Event Log</h3>
				<div id="event-log-list" style="display:flex; flex-direction:column; gap:8px;"></div>
			</div>
		`;

		document.body.appendChild(panel);
		this.sidebarEl = panel;
	}

	private updateSidebarAgentStatus() {
		if (!this.sidebarEl) return;
		const list = this.sidebarEl.querySelector("#agent-status-list") as HTMLDivElement;
		if (!list) return;

		list.innerHTML = "";

		for (const [, agent] of this.agents) {
			const row = document.createElement("div");
			row.style.padding = "8px";
			row.style.marginBottom = "8px";
			row.style.background = "#1f2937";
			row.style.borderRadius = "6px";
			row.style.border = "1px solid #374151";

			row.innerHTML = `
				<strong>${agent.label.text}</strong><br/>
				Destination: ${agent.destination || "None"}<br/>
				Status: ${agent.busy ? "moving / acting" : "idle"}<br/>
				Action: ${agent.lastAction || "None"}
			`;

			list.appendChild(row);
		}
	}

	private addEventLog(message: string) {
		if (!this.sidebarEl) return;
		const log = this.sidebarEl.querySelector("#event-log-list") as HTMLDivElement;
		if (!log) return;

		const item = document.createElement("div");
		item.style.padding = "8px";
		item.style.background = "#111827";
		item.style.border = "1px solid #374151";
		item.style.borderRadius = "6px";
		item.style.fontSize = "14px";
		item.textContent = `[${this.getSimTime()}] ${message}`;

		log.prepend(item);

		while (log.children.length > 30) {
			log.removeChild(log.lastChild!);
		}
	}

	private updateSimClock() {
		if (!this.sidebarEl) return;
		const clockEl = this.sidebarEl.querySelector("#sim-clock");
		if (clockEl) clockEl.textContent = this.getSimTime();
	}

	private cleanupSidebar() {
		if (this.sidebarEl) {
			this.sidebarEl.remove();
			this.sidebarEl = null;
		}
	}

	// Agent visual state

	private agents = new Map<string, {
		body: Phaser.GameObjects.Arc;
		label: Phaser.GameObjects.Text;
		statusText: Phaser.GameObjects.Text;
		backendId: number;
		busy: boolean;
		destination: string;
		lastAction: string;
		currentLocation: LocationId | null;
		interactingWith: string | null;
		lastInteractionAt: number;
	}>();

	private readonly INTERACTION_DISTANCE = 40;
	private readonly INTERACTION_COOLDOWN_MS = 15000;

	private sidebarEl: HTMLDivElement | null = null;

	// Sidewalk graph

	private sidewalkGraph = new Map<string, string[]>();
	private sidewalkByKey = new Map<string, Pt>();

	private keyOf(p: Pt) { return `${p.x},${p.y}`; }

	private dist(a: Pt, b: Pt) {
		return Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
	}

	private closestSidewalkPoint(x: number, y: number): Pt {
		let best = SIDEWALK_POINTS[0];
		let bestD = Infinity;
		for (const p of SIDEWALK_POINTS) {
			const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
			if (d < bestD) { bestD = d; best = p; }
		}
		return best;
	}

	private buildSidewalkGraph() {
		const EPS = 6;
		this.sidewalkGraph.clear();
		this.sidewalkByKey.clear();

		for (const p of SIDEWALK_POINTS) {
			const k = this.keyOf(p);
			this.sidewalkByKey.set(k, p);
			this.sidewalkGraph.set(k, []);
		}

		const link = (a: Pt, b: Pt) => {
			const ka = this.keyOf(a), kb = this.keyOf(b);
			const aList = this.sidewalkGraph.get(ka)!;
			const bList = this.sidewalkGraph.get(kb)!;
			if (!aList.includes(kb)) aList.push(kb);
			if (!bList.includes(ka)) bList.push(ka);
		};

		for (const a of SIDEWALK_POINTS) {
			let left: Pt | null = null, right: Pt | null = null;
			let up: Pt | null = null, down: Pt | null = null;

			for (const b of SIDEWALK_POINTS) {
				if (a === b) continue;
				const sameY = Math.abs(a.y - b.y) <= EPS;
				const sameX = Math.abs(a.x - b.x) <= EPS;

				if (sameY) {
					if (b.x < a.x && (!left  || b.x > left.x))  left  = b;
					if (b.x > a.x && (!right || b.x < right.x)) right = b;
				}
				if (sameX) {
					if (b.y < a.y && (!up   || b.y > up.y))   up   = b;
					if (b.y > a.y && (!down || b.y < down.y)) down = b;
				}
			}

			if (left)  link(a, left);
			if (right) link(a, right);
			if (up)    link(a, up);
			if (down)  link(a, down);
		}
	}

	private aStar(startKey: string, goalKey: string): string[] | null {
		const start = this.sidewalkByKey.get(startKey);
		const goal  = this.sidewalkByKey.get(goalKey);
		if (!start || !goal) return null;

		const open = new Set<string>([startKey]);
		const cameFrom = new Map<string, string>();
		const gScore   = new Map<string, number>();
		const fScore   = new Map<string, number>();

		gScore.set(startKey, 0);
		fScore.set(startKey, this.dist(start, goal));

		const lowestF = () => {
			let bestK: string | null = null, bestF = Infinity;
			for (const k of open) {
				const f = fScore.get(k) ?? Infinity;
				if (f < bestF) { bestF = f; bestK = k; }
			}
			return bestK;
		};

		while (open.size > 0) {
			const current = lowestF();
			if (!current) break;

			if (current === goalKey) {
				const path: string[] = [current];
				let cur = current;
				while (cameFrom.has(cur)) { cur = cameFrom.get(cur)!; path.push(cur); }
				path.reverse();
				return path;
			}

			open.delete(current);
			const curPt = this.sidewalkByKey.get(current)!;

			for (const nb of (this.sidewalkGraph.get(current) ?? [])) {
				const nbPt = this.sidewalkByKey.get(nb);
				if (!nbPt) continue;
				const tentativeG = (gScore.get(current) ?? Infinity) + this.dist(curPt, nbPt);
				if (tentativeG < (gScore.get(nb) ?? Infinity)) {
					cameFrom.set(nb, current);
					gScore.set(nb, tentativeG);
					fScore.set(nb, tentativeG + this.dist(nbPt, goal));
					open.add(nb);
				}
			}
		}
		return null;
	}

	private moveAgentAlongPath(frontendId: string, locationId: LocationId, onComplete?: () => void) {
		const agent = this.agents.get(frontendId);
		if (!agent) return;
	
		this.tweens.killTweensOf(agent.body);
		this.tweens.killTweensOf(agent.label);
		this.tweens.killTweensOf(agent.statusText);
	
		const entrance = ENTRANCES[locationId];
		const finalDestination = LOCATIONS[locationId];
	
		const startSide = this.closestSidewalkPoint(agent.body.x, agent.body.y);
		const endSide = this.closestSidewalkPoint(entrance.x, entrance.y);
		const keyPath = this.aStar(this.keyOf(startSide), this.keyOf(endSide));
	
		const route: Pt[] = [];
	
		// Start from exact current position only if already near sidewalk.
		route.push({ x: agent.body.x, y: agent.body.y });
	
		if (keyPath && keyPath.length > 0) {
			for (const k of keyPath) {
				const p = this.sidewalkByKey.get(k);
				if (p) route.push(p);
			}
		} else {
			route.push(endSide);
		}
	
		// Go to building entrance first
		route.push(entrance);
	
		// Then go into the building / destination anchor
		// For park, entrance and location may be close enough already, but this is fine.
		route.push(finalDestination);
	
		const cleaned: Pt[] = [];
		for (const p of route) {
			const prev = cleaned[cleaned.length - 1];
			if (!prev || prev.x !== p.x || prev.y !== p.y) cleaned.push(p);
		}
	
		agent.destination = locationId;
		agent.currentLocation = null;
		agent.lastAction = `Moving to ${locationId}`;
		agent.busy = true;
		agent.statusText.setText("walking");
		this.updateSidebarAgentStatus();
	
		const SPEED = 140;
		let i = 0;
	
		const step = () => {
			i += 1;
	
			if (i >= cleaned.length) {
				agent.busy = false;
				agent.currentLocation = locationId;
				agent.statusText.setText("idle");
				agent.lastAction = `Arrived at ${locationId}`;
				this.updateSidebarAgentStatus();
				onComplete?.();
				return;
			}
	
			const to = cleaned[i];
			const from = { x: agent.body.x, y: agent.body.y };
			const segLen = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
	
			this.tweens.add({
				targets: agent.body,
				x: to.x,
				y: to.y,
				duration: (segLen / SPEED) * 1000,
				ease: "Linear",
				onUpdate: () => {
					agent.label.setPosition(agent.body.x + 12, agent.body.y - 10);
					agent.statusText.setPosition(agent.body.x + 12, agent.body.y + 6);
				},
				onComplete: step,
			});
		};
	
		this.addEventLog(`${agent.label.text} started moving to ${locationId}.`);
		step();
	}

	// Backend API helpers

	private async requestInteraction(
		agentAId: number,
		agentBId: number,
		location: LocationId
	): Promise<BackendInteractionResponse> {
		const res = await fetch(`${API_BASE}/interactions/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				agent_a_id: agentAId,
				agent_b_id: agentBId,
				location,
				time: this.getSimTime()
			})
		});
	
		if (!res.ok) {
			throw new Error(`Interaction request failed: ${res.status}`);
		}
	
		return await res.json();
	}

	private async registerAgent(cfg: AgentConfig): Promise<number> {
		const res = await fetch(`${API_BASE}/agents/`, {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({
				name:           cfg.name,
				personality:    cfg.personalityPrompt,
				location:       cfg.startingPoint,
				current_action: "idle",
			}),
		});
		if (!res.ok) throw new Error(`Failed to register agent ${cfg.name}: ${res.status}`);
		const data: BackendAgent = await res.json();
		return data.id;
	}

	private async fetchNextAction(backendId: number): Promise<{ locationId: LocationId; description: string }> {
		const res = await fetch(`${API_BASE}/agents/${backendId}/plan`);
		if (!res.ok) throw new Error(`Plan fetch failed for agent ${backendId}: ${res.status}`);

		const plan: BackendPlan = await res.json();
		const action = plan.actions[0];
		const desc   = action?.description ?? "";

		const locationKeys = Object.keys(LOCATIONS) as LocationId[];
		const found = locationKeys.find(loc =>
			desc.toLowerCase().includes(loc.replace("_", " ")) ||
			desc.toLowerCase().includes(loc)
		);

		const locationId: LocationId = found ?? locationKeys[Math.floor(Math.random() * locationKeys.length)];
		return { locationId, description: desc };
	}

	private async reportArrival(backendId: number, locationId: LocationId, action: string): Promise<void> {
		await fetch(`${API_BASE}/agents/${backendId}`, {
			method:  "PUT",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ location: locationId, current_action: action }),
		});
	}

	/**
	 * Write a memory entry for this agent via the backend API.
	 * importance: 0.0 (trivial) → 1.0 (life-changing)
	 */
	private async writeMemory(backendId: number, content: string, importance: number): Promise<void> {
		await fetch(`${API_BASE}/agents/${backendId}/memory`, {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ agent_id: backendId, content, importance }),
		});
	}

	// proximity helpers

	private canAgentsInteract(aId: string, bId: string): boolean {
		const a = this.agents.get(aId);
		const b = this.agents.get(bId);
		if (!a || !b) return false;
		if (aId === bId) return false;
	
		if (a.busy || b.busy) return false;
		if (a.interactingWith || b.interactingWith) return false;
		if (!a.currentLocation || !b.currentLocation) return false;
		if (a.currentLocation !== b.currentLocation) return false;
	
		const now = this.time.now;
		if (now - a.lastInteractionAt < this.INTERACTION_COOLDOWN_MS) return false;
		if (now - b.lastInteractionAt < this.INTERACTION_COOLDOWN_MS) return false;
	
		const d = Phaser.Math.Distance.Between(a.body.x, a.body.y, b.body.x, b.body.y);
		return d <= this.INTERACTION_DISTANCE;
	}
	
	private async startInteraction(aId: string, bId: string) {
		const a = this.agents.get(aId);
		const b = this.agents.get(bId);
		if (!a || !b || !a.currentLocation || !b.currentLocation) return;
		if (a.currentLocation !== b.currentLocation) return;
	
		const location = a.currentLocation;
	
		a.interactingWith = bId;
		b.interactingWith = aId;
		a.busy = true;
		b.busy = true;
		a.statusText.setText("talking");
		b.statusText.setText("talking");
		a.lastAction = `Talking to ${b.label.text}`;
		b.lastAction = `Talking to ${a.label.text}`;
		a.lastInteractionAt = this.time.now;
		b.lastInteractionAt = this.time.now;
		this.updateSidebarAgentStatus();
	
		try {
			const result = await this.requestInteraction(a.backendId, b.backendId, location);
	
			if (result.happened) {
				this.addEventLog(`${a.label.text} and ${b.label.text}: ${result.summary}`);
				await new Promise<void>(resolve => this.time.delayedCall(result.duration_ms, resolve));
			} else {
				await new Promise<void>(resolve => this.time.delayedCall(1000, resolve));
			}
		} catch (err) {
			console.error("Interaction failed:", err);
			this.addEventLog(`${a.label.text} and ${b.label.text} tried to interact, but the backend errored.`);
			await new Promise<void>(resolve => this.time.delayedCall(2000, resolve));
		}
	
		a.interactingWith = null;
		b.interactingWith = null;
		a.busy = false;
		b.busy = false;
		a.statusText.setText("idle");
		b.statusText.setText("idle");
		a.lastAction = "idle";
		b.lastAction = "idle";
		this.updateSidebarAgentStatus();
	}
	
	private checkAgentProximity() {
		const ids = Array.from(this.agents.keys());
	
		for (let i = 0; i < ids.length; i++) {
			for (let j = i + 1; j < ids.length; j++) {
				const aId = ids[i];
				const bId = ids[j];
	
				if (this.canAgentsInteract(aId, bId)) {
					this.startInteraction(aId, bId);
					return; // only trigger one pair per cycle
				}
			}
		}
	}

	/**
	 * Lightweight sim clock — starts at 8:00am, 1 real second = 1 sim minute.
	 */
	private getSimTime(): string {
		const simMinutes  = Math.floor(this.time.now / 1000);
		const totalMinutes = (8 * 60 + simMinutes) % (24 * 60);
		const hours        = Math.floor(totalMinutes / 60);
		const minutes      = totalMinutes % 60;
		const period       = hours < 12 ? "am" : "pm";
		const displayHour  = hours % 12 === 0 ? 12 : hours % 12;
		const displayMin   = minutes.toString().padStart(2, "0");
		return `${displayHour}:${displayMin}${period}`;
	}

	// Agent lifecycle

	private spawnAgent(frontendId: string, name: string, x: number, y: number, backendId: number) {
		const body = this.add.circle(x, y, 10, 0x4ade80).setDepth(900);
		const label = this.add.text(x + 12, y - 10, name, { color: "#ffffff", fontSize: "14px" }).setDepth(900);
		const statusText = this.add.text(x + 12, y + 6, "idle", { color: "#9ca3af", fontSize: "11px" }).setDepth(900);
	
		this.agents.set(frontendId, {
			body,
			label,
			statusText,
			backendId,
			busy: false,
			destination: "None",
			lastAction: "None",
			currentLocation: null,
			interactingWith: null,
			lastInteractionAt: 0
		});
	
		this.updateSidebarAgentStatus();
	}

	/**
	 * Main agent loop:
	 * 1. Fetch next action from backend
	 * 2. Move to target location
	 * 3. Dwell
	 * 4. Report arrival
	 * 5. Write memory
	 * 6. Repeat
	 */
	private async runAgentLoop(frontendId: string) {
		const a = this.agents.get(frontendId);
		if (!a || a.busy) return;

		a.busy = true;
		this.updateSidebarAgentStatus();

		try {
			// 1. Plan
			const { locationId, description } = await this.fetchNextAction(a.backendId);
			a.destination = locationId;
			a.lastAction  = description || "Moving";
			a.statusText.setText(description.length > 24 ? description.slice(0, 22) + "…" : description);
			this.updateSidebarAgentStatus();
			this.addEventLog(`${a.label.text} plans: "${description}" → ${locationId}`);

			// 2. Walk
			await new Promise<void>(resolve => this.moveAgentAlongPath(frontendId, locationId, resolve));

			// 3. Dwell
			await new Promise<void>(resolve => this.time.delayedCall(DWELL_MS, resolve));

			// 4. Report arrival
			await this.reportArrival(a.backendId, locationId, description);

			// 5. Write memory
			const simTime      = this.getSimTime();
			const locationName = locationId.replace("_", " ");
			const memoryText   = `At ${simTime} I went to the ${locationName}. ${description}`;
			await this.writeMemory(a.backendId, memoryText, 0.3);
			this.addEventLog(`${a.label.text} remembered: visiting the ${locationName} at ${simTime}.`);

			a.statusText.setText("idle");
			a.lastAction = "idle";

		} catch (err) {
			console.error(`[${frontendId}] agent loop error:`, err);
			a.statusText.setText("⚠ error");
			a.lastAction = "error";
			this.addEventLog(`${a.label.text} hit an error.`);
			await new Promise<void>(resolve => this.time.delayedCall(10_000, resolve));
		}

		a.busy = false;
		this.updateSidebarAgentStatus();
		this.time.delayedCall(500, () => this.runAgentLoop(frontendId));
	}

	// Debug helpers

	private drawAnchors() {
		for (const [id, pos] of Object.entries(LOCATIONS)) {
			const dot = this.add.circle(pos.x, pos.y, 6, 0xffcc00).setDepth(1000);
			this.add.text(pos.x + 8, pos.y - 10, id, { color: "#ffffff", fontSize: "12px" }).setDepth(1000);
			dot.setAlpha(0.6);
		}
		for (const [, pos] of Object.entries(SIDEWALK_POINTS)) {
			this.add.circle(pos.x, pos.y, 4, 0xffcc00).setDepth(1000).setAlpha(0.4);
		}
	}

	private drawEntrances() {
		for (const [id, pos] of Object.entries(ENTRANCES)) {
			const dot = this.add.circle(pos.x, pos.y, 5, 0x00ffff).setDepth(1100);
			this.add.text(pos.x + 8, pos.y + 8, `entry_${id}`, { color: "#00ffff", fontSize: "11px" }).setDepth(1100);
			dot.setAlpha(0.85);
		}
	}

	// Scene entry point

	async create() {
		this.editorCreate();
		this.buildSidewalkGraph();
		this.drawAnchors();
		this.drawEntrances();
		this.createSidebar();
		this.createLighting();
		this.updateLighting();

		// Tick the sim clock display every real second
		this.time.addEvent({
			delay: 1000,
			loop: true,
			callback: () => {
				this.updateSimClock();
				this.updateLighting();
			}
		});

		// proximity checks
		this.time.addEvent({
			delay: 1000,
			loop: true,
			callback: () => this.checkAgentProximity()
		});

		this.events.once("shutdown", () => this.cleanupSidebar());
		this.events.once("destroy",  () => this.cleanupSidebar());

		for (const cfg of this.configuredAgents) {
			const loc = LOCATIONS[cfg.startingPoint];
			try {
				const backendId = await this.registerAgent(cfg);
				this.spawnAgent(cfg.id, cfg.name, loc.x, loc.y, backendId);

				const idx = this.configuredAgents.indexOf(cfg);
				this.time.delayedCall(idx * 1500, () => this.runAgentLoop(cfg.id));

				this.addEventLog(`${cfg.name} entered the town at ${cfg.startingPoint}.`);
				console.log(`[${cfg.name}] registered as backend id ${backendId}`);
			} catch (err) {
				console.error(`Failed to register ${cfg.name}:`, err);
				this.addEventLog(`Failed to register ${cfg.name}.`);
			}
		}

		this.updateSidebarAgentStatus();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here