// You can write more code here

// anchor points for the locations in the town, used for navigation and interaction

type LocationId = "town_hall" | "school" | "clinic" | "cafe" | "tavern" | "market" | "park";

type Pt = { x: number; y: number };

const LOCATIONS: Record<LocationId, { x: number; y: number }> = {
	town_hall: { x: 647, y: 369 },
	school: { x: 317, y: 363 },
	clinic: { x: 977, y: 268 },
	cafe: { x: 977, y: 450 },
	tavern: { x: 389, y: 643 },
	market: { x: 799, y: 646 },
	park: { x: 1102, y: 652 },
};

// anchor points for movement along the sidewalks
const SIDEWALK_POINTS = [
	{ x: 201, y: 361 },
	{ x: 201, y: 176 },
	{ x: 466, y: 364 },
	{ x: 831, y: 365 },
	{ x: 1085, y: 361 },
	{ x: 1085, y: 551 },
	{ x: 1085, y: 176 },
	{ x: 647, y: 176 },
	{ x: 644, y: 551 },
	{ x: 201, y: 551 },
	{ x: 977, y: 450 },
	{ x: 389, y: 551 },
	{ x: 799, y: 551 },
	{ x: 644, y: 628 },
];

// ─── Backend config ───────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

/** How long an agent waits at a destination before requesting the next action */
const DWELL_MS = 5000;

// ─── Types ────────────────────────────────────────────────────────────────────

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

		// rectangle_1
		const rectangle_1 = this.add.rectangle(632, 371, 128, 128);
		rectangle_1.scaleX = 10.180187948025909;
		rectangle_1.scaleY = 5.833727976370516;
		rectangle_1.isFilled = true;
		rectangle_1.fillColor = 3108670;

		// sidewalk_lead
		const sidewalk_lead = this.add.rectangle(644, 628, 128, 128);
		sidewalk_lead.scaleX = 0.37167610523713657;
		sidewalk_lead.scaleY = 1.4867068094771634;
		sidewalk_lead.isFilled = true;
		sidewalk_lead.fillColor = 9408399;

		// sidewalk_bottom
		const sidewalk_bottom = this.add.rectangle(644, 551, 128, 128);
		sidewalk_bottom.scaleX = 0.32718513673271565;
		sidewalk_bottom.scaleY = 7.251572595017952;
		sidewalk_bottom.angle = -90;
		sidewalk_bottom.isFilled = true;
		sidewalk_bottom.fillColor = 9408399;

		// sidewalk_left
		const sidewalk_left = this.add.rectangle(201, 361, 128, 128);
		sidewalk_left.scaleX = 0.37328872859877876;
		sidewalk_left.scaleY = 3.245378044183737;
		sidewalk_left.isFilled = true;
		sidewalk_left.fillColor = 9408399;

		// sidewalk_right
		const sidewalk_right = this.add.rectangle(1085, 361, 128, 128);
		sidewalk_right.scaleX = 0.37328872859877876;
		sidewalk_right.scaleY = 3.245378044183737;
		sidewalk_right.isFilled = true;
		sidewalk_right.fillColor = 9408399;

		// sidewalk_top
		const sidewalk_top = this.add.rectangle(647, 176, 128, 128);
		sidewalk_top.scaleX = 0.32718513673271565;
		sidewalk_top.scaleY = 7.251572595017952;
		sidewalk_top.angle = -90;
		sidewalk_top.isFilled = true;
		sidewalk_top.fillColor = 9408399;

		// School
		const school = this.add.rectangle(317, 363, 128, 128);
		school.scaleY = 2.466942142176058;
		school.isFilled = true;
		school.fillColor = 4662308;

		// House 4
		const house_4 = this.add.rectangle(305, 66, 128, 128);
		house_4.isFilled = true;
		house_4.fillColor = 4662308;

		// House 5
		const house_5 = this.add.rectangle(481, 66, 128, 128);
		house_5.isFilled = true;
		house_5.fillColor = 4662308;

		// House 6
		const house_6 = this.add.rectangle(668, 66, 128, 128);
		house_6.isFilled = true;
		house_6.fillColor = 4662308;

		// House 7
		const house_7 = this.add.rectangle(852, 66, 128, 128);
		house_7.isFilled = true;
		house_7.fillColor = 4662308;

		// House 8
		const house_8 = this.add.rectangle(1019, 66, 128, 128);
		house_8.isFilled = true;
		house_8.fillColor = 4662308;

		// House 9
		const house_9 = this.add.rectangle(1209, 224, 128, 128);
		house_9.isFilled = true;
		house_9.fillColor = 4662308;

		// House 10
		const house_10 = this.add.rectangle(1212, 372, 128, 128);
		house_10.isFilled = true;
		house_10.fillColor = 4662308;

		// rectangle_15
		const rectangle_15 = this.add.rectangle(1209, 527, 128, 128);
		rectangle_15.isFilled = true;
		rectangle_15.fillColor = 4662308;

		// House 1
		const house_1 = this.add.rectangle(85, 545, 128, 128);
		house_1.isFilled = true;
		house_1.fillColor = 4662308;

		// House 2
		const house_2 = this.add.rectangle(82, 378, 128, 128);
		house_2.isFilled = true;
		house_2.fillColor = 4662308;

		// House 3
		const house_3 = this.add.rectangle(79, 218, 128, 128);
		house_3.isFilled = true;
		house_3.fillColor = 4662308;

		// Cafe
		const cafe = this.add.rectangle(977, 450, 128, 128);
		cafe.isFilled = true;
		cafe.fillColor = 4662308;

		// Clinic
		const clinic = this.add.rectangle(977, 268, 128, 128);
		clinic.isFilled = true;
		clinic.fillColor = 4662308;

		// Town Hall
		const town_Hall = this.add.rectangle(647, 369, 128, 128);
		town_Hall.scaleX = 2.001800422483393;
		town_Hall.scaleY = 1.1617588487187138;
		town_Hall.isFilled = true;
		town_Hall.fillColor = 4662308;

		// Market
		const market = this.add.rectangle(799, 646, 128, 128);
		market.scaleX = 1.4865908809477275;
		market.scaleY = 0.8796780398859774;
		market.isFilled = true;
		market.fillColor = 4662308;

		// Tavern
		const tavern = this.add.rectangle(389, 643, 128, 128);
		tavern.scaleX = 2.777556167090955;
		tavern.scaleY = 0.696841503238748;
		tavern.isFilled = true;
		tavern.fillColor = 4662308;

		// side_middle_left
		const side_middle_left = this.add.rectangle(466, 364, 128, 128);
		side_middle_left.scaleX = 0.37328872859877876;
		side_middle_left.scaleY = 3.245378044183737;
		side_middle_left.angle = 11;
		side_middle_left.isFilled = true;
		side_middle_left.fillColor = 9408399;

		// side_middle_right
		const side_middle_right = this.add.rectangle(831, 365, 128, 128);
		side_middle_right.scaleX = 0.37328872859877876;
		side_middle_right.scaleY = 3.245378044183737;
		side_middle_right.angle = -11;
		side_middle_right.isFilled = true;
		side_middle_right.fillColor = 9408399;

		// Park
		const park = this.add.rectangle(1102, 652, 128, 128);
		park.scaleX = 2.288062440058767;
		park.scaleY = 0.416422309655215;
		park.isFilled = true;
		park.fillColor = 9489506;

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// sidebar creation code

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
		item.textContent = message;
	
		log.prepend(item);
	
		while (log.children.length > 30) {
			log.removeChild(log.lastChild!);
		}
	}

	private cleanupSidebar() {
		if (this.sidebarEl) {
			this.sidebarEl.remove();
			this.sidebarEl = null;
		}
	}

	// ─── Agent visual state ───────────────────────────────────────────────────

	/** Maps frontend agent id (e.g. "a1") → visual objects + backend id */
	private agents = new Map<string, {
		body: Phaser.GameObjects.Arc;
		label: Phaser.GameObjects.Text;
		statusText: Phaser.GameObjects.Text;
		backendId: number;
		busy: boolean;
		destination: string;
		lastAction: string;
	}>();

	private sidebarEl: HTMLDivElement | null = null;

	// ─── Sidewalk graph ───────────────────────────────────────────────────────

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
				const sameY = Math.abs(b.y - a.y) <= EPS;
				const sameX = Math.abs(b.x - a.x) <= EPS;

				if (sameY) {
					if (b.x < a.x && (!left || b.x > left.x)) left = b;
					if (b.x > a.x && (!right || b.x < right.x)) right = b;
				}
				if (sameX) {
					if (b.y < a.y && (!up || b.y > up.y)) up = b;
					if (b.y > a.y && (!down || b.y < down.y)) down = b;
				}
			}

			if (left) link(a, left);
			if (right) link(a, right);
			if (up) link(a, up);
			if (down) link(a, down);
		}
	}

	private aStar(startKey: string, goalKey: string): string[] | null {
		const start = this.sidewalkByKey.get(startKey);
		const goal = this.sidewalkByKey.get(goalKey);
		if (!start || !goal) return null;

		const open = new Set<string>([startKey]);
		const cameFrom = new Map<string, string>();
		const gScore = new Map<string, number>();
		const fScore = new Map<string, number>();

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

	/** Move agent along sidewalk path, call onComplete when arrived */
	private moveAgentAlongPath(id: string, destX: number, destY: number, onComplete?: () => void) {
		const a = this.agents.get(id);
		if (!a) return;

		this.tweens.killTweensOf(a.body);
		this.tweens.killTweensOf(a.label);

		const startSide = this.closestSidewalkPoint(a.body.x, a.body.y);
		const endSide = this.closestSidewalkPoint(destX, destY);
		const keyPath = this.aStar(this.keyOf(startSide), this.keyOf(endSide));

		const route: Pt[] = [{ x: startSide.x, y: startSide.y }];

		if (keyPath?.length) {
			for (const k of keyPath) {
				const p = this.sidewalkByKey.get(k);
				if (p) route.push({ x: p.x, y: p.y });
			}
		} else {
			route.push({ x: endSide.x, y: endSide.y });
		}
		route.push({ x: destX, y: destY });

		// deduplicate
		const cleaned: Pt[] = [];
		for (const p of route) {
			const prev = cleaned[cleaned.length - 1];
			if (!prev || prev.x !== p.x || prev.y !== p.y) cleaned.push(p);
		}

		let i = 0;
		const step = () => {
			i++;
			if (i >= cleaned.length) { onComplete?.(); return; }

			const to = cleaned[i];
			const from = { x: a.body.x, y: a.body.y };
			const segLen = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);

			this.tweens.add({
				targets: a.body,
				x: to.x, y: to.y,
				duration: Math.max(180, segLen * 1.2),
				ease: "Sine.easeInOut",
				onUpdate: () => {
					a.label.setPosition(a.body.x + 12, a.body.y - 10);
					a.statusText.setPosition(a.body.x + 12, a.body.y + 6);
				},
				onComplete: step,
			});
		};
		step();
	}

	// ─── Backend API helpers ──────────────────────────────────────────────────

	/** Register an agent in the backend, returns its numeric id */
	private async registerAgent(cfg: AgentConfig): Promise<number> {
		const res = await fetch(`${API_BASE}/agents/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: cfg.name,
				personality: cfg.personalityPrompt,
				location: cfg.startingPoint,
				current_action: "idle",
			}),
		});

		if (!res.ok) throw new Error(`Failed to register agent ${cfg.name}: ${res.status}`);
		const data: BackendAgent = await res.json();
		return data.id;
	}

	/**
	 * Ask the backend for this agent's next action.
	 * Parses the action description for a known LocationId keyword.
	 * Falls back to a random location if none found.
	 */
	private async fetchNextAction(backendId: number): Promise<{ locationId: LocationId; description: string }> {
		const res = await fetch(`${API_BASE}/agents/${backendId}/plan`);

		if (!res.ok) throw new Error(`Plan fetch failed for agent ${backendId}: ${res.status}`);

		const plan: BackendPlan = await res.json();

		// Pick the first action (or extend later to queue them all)
		const action = plan.actions[0];
		const desc = action?.description ?? "";

		// Try to find a location keyword in the description
		const locationKeys = Object.keys(LOCATIONS) as LocationId[];
		const found = locationKeys.find(loc =>
			desc.toLowerCase().includes(loc.replace("_", " ")) ||
			desc.toLowerCase().includes(loc)
		);

		const locationId: LocationId = found ?? locationKeys[Math.floor(Math.random() * locationKeys.length)];

		return { locationId, description: desc };
	}

	/** Tell the backend the agent has arrived and update its location */
	private async reportArrival(backendId: number, locationId: LocationId, action: string): Promise<void> {
		await fetch(`${API_BASE}/agents/${backendId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				location: locationId,
				current_action: action,
			}),
		});
	}

	// ─── Agent lifecycle ──────────────────────────────────────────────────────

	/** Spawn visuals for an agent */
	private spawnAgent(frontendId: string, name: string, x: number, y: number, backendId: number) {
		const body = this.add.circle(x, y, 10, 0x4ade80).setDepth(900);
		const label = this.add.text(x + 12, y - 10, name, {
			color: "#ffffff",
			fontSize: "14px",
		}).setDepth(900);
	
		const statusText = this.add.text(x + 12, y + 6, "idle", {
			color: "#9ca3af",
			fontSize: "11px",
		}).setDepth(900);
	
		this.agents.set(frontendId, {
			body,
			label,
			statusText,
			backendId,
			busy: false,
			destination: "None",
			lastAction: "None",
		});
	
		this.updateSidebarAgentStatus();
	}

	/**
	 * Main agent loop:
	 * 1. Fetch next action from backend
	 * 2. Move to target location
	 * 3. Dwell briefly
	 * 4. Report arrival to backend
	 * 5. Repeat
	 */
	private async runAgentLoop(frontendId: string) {
		const a = this.agents.get(frontendId);
		if (!a) return;
	
		if (a.busy) return;
		a.busy = true;
		this.updateSidebarAgentStatus();
	
		try {
			const { locationId, description } = await this.fetchNextAction(a.backendId);
			const dest = LOCATIONS[locationId];
	
			a.destination = locationId;
			a.lastAction = description || "Moving";
			a.statusText.setText(description.length > 24 ? description.slice(0, 22) + "…" : description);
			this.updateSidebarAgentStatus();
			this.addEventLog(`${a.label.text} plans to go to ${locationId}: ${description}`);
	
			await new Promise<void>(resolve => {
				this.moveAgentAlongPath(frontendId, dest.x, dest.y, resolve);
			});
	
			this.addEventLog(`${a.label.text} arrived at ${locationId}.`);
	
			await new Promise<void>(resolve => this.time.delayedCall(DWELL_MS, resolve));
	
			await this.reportArrival(a.backendId, locationId, description);
	
			a.statusText.setText("idle");
			a.lastAction = "idle";
		} catch (err) {
			console.error(`[${frontendId}] agent loop error:`, err);
			a.statusText.setText("⚠ error");
			a.lastAction = "error";
			this.addEventLog(`${a.label.text} hit an error while acting.`);
	
			await new Promise<void>(resolve => this.time.delayedCall(10_000, resolve));
		}
	
		a.busy = false;
		this.updateSidebarAgentStatus();
	
		this.time.delayedCall(500, () => this.runAgentLoop(frontendId));
	}


	// ─── Debug helpers ────────────────────────────────────────────────────────

	private drawAnchors() {
		for (const [id, pos] of Object.entries(LOCATIONS)) {
			const dot = this.add.circle(pos.x, pos.y, 6, 0xffcc00).setDepth(1000);
			this.add.text(pos.x + 8, pos.y - 10, id, { color: "#ffffff", fontSize: "12px" }).setDepth(1000);
			dot.setAlpha(0.6);
		}

		for (const [idx, pos] of Object.entries(SIDEWALK_POINTS)) {
			const dot = this.add.circle(pos.x, pos.y, 6, 0xffcc00).setDepth(1000);
			this.add.text(pos.x + 8, pos.y - 10, `sw_${idx}`, { color: "#ffffff", fontSize: "12px" }).setDepth(1000);
			dot.setAlpha(0.4);
		}
	}

	// ─── Scene entry point ────────────────────────────────────────────────────

	async create() {
	this.editorCreate();
	this.buildSidewalkGraph();
	this.drawAnchors();
	this.createSidebar();

	this.events.once("shutdown", () => this.cleanupSidebar());
	this.events.once("destroy", () => this.cleanupSidebar());

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