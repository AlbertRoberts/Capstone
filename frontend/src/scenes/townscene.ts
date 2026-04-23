import type { AgentConfig } from "./StartScene";
import {
  type LocationId, type SpeedLevel,
  LOCATIONS, ENTRANCES, AGENT_COLORS,
  DWELL_MS, AGENT_SPEED, INTERACTION_DISTANCE, INTERACTION_COOLDOWN,
  AGENT_LOOP_RESTART_MS, AGENT_LOOP_STAGGER_MS, API_BASE,
} from "../town/types";
import { BackendClient } from "../town/BackendClient";
import { SidewalkGraph }  from "../town/SidewalkGraph";
import { Agent }          from "../town/Agent";
import { Sidebar }        from "../town/Sidebar";

/* START OF COMPILED CODE */
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class TownScene extends Phaser.Scene {

  // ── scene init ────────────────────────────────────────────────────────────

  private configuredAgents: AgentConfig[] = [];

  init(data: { agents?: AgentConfig[] }) {
    this.configuredAgents = data.agents ?? [];
  }

  constructor() { super("townscene"); }

  // ── core objects ──────────────────────────────────────────────────────────

  private agents:  Map<string, Agent> = new Map();
  private sidebar: Sidebar | null = null;
  private graph:   SidewalkGraph | null = null;
  private client:  BackendClient | null = null;
  private lightingOverlay!: Phaser.GameObjects.Rectangle;

  // ── sim-time tracking (speed-aware) ──────────────────────────────────────

  /** Accumulated sim-minutes up to the last speed change. */
  private simAccuMinutes = 8 * 60;   // start at 8:00am
  /** Real wall-clock ms at the last speed change. */
  private simLastRealMs  = Date.now();
  /** Current speed (sim-minutes per real second). */
  private simSpeed: SpeedLevel = 1;

  // ── scene lifecycle ───────────────────────────────────────────────────────

  async create() {
    this.editorCreate();

    this.graph  = new SidewalkGraph();
    this.client = new BackendClient(API_BASE);
    this.sidebar = new Sidebar();

    // Wire sidebar callbacks
    this.sidebar.onSpeedChange = speed => this.setSimSpeed(speed);
    this.sidebar.onAskAgent    = async (agentId, question) => {
      const res = await this.client!.askAgent(agentId, question);
      this.log(`[Q&A] ${res.agent_name} was asked: "${res.question}"`);
      return res.answer;
    };

    this.createLighting();
    this.updateLighting();

    // Update clock + lighting every Phaser-second (respects timeScale)
    this.time.addEvent({
      delay: 1_000, loop: true,
      callback: () => {
        this.sidebar?.updateClock(this.getSimTime());
        this.updateLighting();
      },
    });

    // Proximity check every Phaser-second
    this.time.addEvent({
      delay: 1_000, loop: true,
      callback: () => this.checkAgentProximity(),
    });

    this.events.once("shutdown", () => this.cleanup());
    this.events.once("destroy",  () => this.cleanup());

    // Register and spawn each configured agent
    for (const cfg of this.configuredAgents) {
      const loc   = LOCATIONS[cfg.startingPoint];
      const color = AGENT_COLORS[this.configuredAgents.indexOf(cfg) % AGENT_COLORS.length];
      try {
        const backendId = await this.client!.registerAgent(cfg);
        const agent     = new Agent(this, cfg.name, loc.x, loc.y, backendId, color, cfg.role);
        agent.currentLocation = cfg.startingPoint;
        this.agents.set(cfg.id, agent);

        const stagger = this.configuredAgents.indexOf(cfg) * AGENT_LOOP_STAGGER_MS;
        this.time.delayedCall(stagger, () => this.runAgentLoop(cfg.id));

        this.log(`${cfg.name} entered the town at ${cfg.startingPoint}.`);
      } catch (err) {
        console.error(`Failed to register ${cfg.name}:`, err);
        this.log(`Failed to register ${cfg.name}.`);
      }
    }

    const agentList = Array.from(this.agents.values());
    this.sidebar.renderAgents(agentList);
    this.sidebar.updateAgentOptions(
      agentList.map(a => ({ id: a.backendId, name: a.displayName }))
    );
  }

  // ── agent loop ────────────────────────────────────────────────────────────

  private async runAgentLoop(frontendId: string): Promise<void> {
    const agent = this.agents.get(frontendId);
    if (!agent || agent.status !== "idle") return;

    try {
      // 1. Plan
      const plan        = await this.client!.fetchPlan(agent.backendId);
      const action      = plan.actions[0];
      const description = action?.description ?? "";
      const locationId  = this.resolveLocation(action);

      agent.destination = locationId;
      agent.lastAction  = description || "Moving";
      agent.setStatus("walking",
        description.length > 24 ? description.slice(0, 22) + "…" : description);
      this.sidebar?.renderAgents(Array.from(this.agents.values()));
      this.log(`${agent.displayName}: "${description}" → ${locationId}`);

      // 2. Walk
      await this.walkAgentTo(frontendId, locationId);

      // 3. Dwell
      await this.delay(DWELL_MS);

      // 4. Report arrival + write memory
      await this.client!.reportArrival(agent.backendId, locationId, description);
      const simTime = this.getSimTime();
      const locName = locationId.replace(/_/g, " ");
      await this.client!.writeMemory(
        agent.backendId,
        `At ${simTime} I went to the ${locName}. ${description}`,
        0.3,
      );
      this.log(`${agent.displayName} visited the ${locName} at ${simTime}.`);

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
    this.time.delayedCall(AGENT_LOOP_RESTART_MS, () => this.runAgentLoop(frontendId));
  }

  /**
   * Resolves which LocationId an action targets.
   * Priority: explicit location_id → string match → random fallback.
   */
  private resolveLocation(action: { description?: string; location_id?: LocationId } | undefined): LocationId {
    if (action?.location_id && action.location_id in LOCATIONS) return action.location_id;

    const desc    = action?.description?.toLowerCase() ?? "";
    const allKeys = Object.keys(LOCATIONS) as LocationId[];
    const found   = allKeys.find(loc =>
      desc.includes(loc.replace(/_/g, " ")) || desc.includes(loc));

    return found ?? allKeys[Math.floor(Math.random() * allKeys.length)];
  }

  // ── movement ──────────────────────────────────────────────────────────────

  private walkAgentTo(frontendId: string, locationId: LocationId): Promise<void> {
    return new Promise(resolve => {
      const agent = this.agents.get(frontendId);
      if (!agent) { resolve(); return; }

      this.tweens.killTweensOf(agent.body);

      const destEntrance     = ENTRANCES[locationId];
      const finalDestination = LOCATIONS[locationId];

      const exitPt = agent.currentLocation
        ? ENTRANCES[agent.currentLocation]
        : this.graph!.closestPoint(agent.body.x, agent.body.y);

      const keyPath = this.graph!.aStar(
        this.graph!.keyOf(exitPt),
        this.graph!.keyOf(destEntrance),
      );

      const route: { x: number; y: number }[] = [{ x: agent.body.x, y: agent.body.y }];
      if (keyPath) {
        for (const k of keyPath) {
          const p = this.graph!.pointByKey(k);
          if (p) route.push(p);
        }
      } else {
        route.push(exitPt, destEntrance);
      }
      if (finalDestination.x !== destEntrance.x || finalDestination.y !== destEntrance.y) {
        route.push(finalDestination);
      }

      // Deduplicate consecutive identical points
      const cleaned = route.filter((p, i) => {
        const prev = route[i - 1];
        return !prev || prev.x !== p.x || prev.y !== p.y;
      });

      agent.destination     = locationId;
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
        const to     = cleaned[i];
        const segLen = Phaser.Math.Distance.Between(agent.body.x, agent.body.y, to.x, to.y);
        this.tweens.add({
          targets: agent.body, x: to.x, y: to.y,
          duration: (segLen / AGENT_SPEED) * 1_000,
          ease: "Linear",
          onUpdate:   () => agent.syncLabels(),
          onComplete: step,
        });
      };
      step();
    });
  }

  // ── interactions ──────────────────────────────────────────────────────────

  private checkAgentProximity() {
    const agents = Array.from(this.agents.entries());
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const [aId, a] = agents[i];
        const [bId, b] = agents[j];
        if (this.canInteract(aId, a, bId, b)) {
          void this.runInteraction(a, b);
          return;
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
    if (!a.currentLocation || a.currentLocation !== b.currentLocation) return;

    const location = a.currentLocation;
    a.interactingWith = b;
    b.interactingWith = a;
    a.setStatus("interacting", "...");
    b.setStatus("interacting", "...");
    a.lastAction = `Talking to ${b.displayName}`;
    b.lastAction = `Talking to ${a.displayName}`;
    a.lastInteractionAt = this.time.now;
    b.lastInteractionAt = this.time.now;
    this.sidebar?.renderAgents(Array.from(this.agents.values()));

    try {
      const result = await this.client!.requestInteraction(
        a.backendId, b.backendId, location, this.getSimTime());

      if (result.happened) {
        const turns     = result.turns ?? [];
        const msPerTurn = turns.length > 0
          ? Math.floor(result.duration_ms / turns.length)
          : result.duration_ms;

        for (let i = 0; i < turns.length; i++) {
          const turn     = turns[i];
          const speaker  = turn.speaker === a.displayName ? a : b;
          const listener = speaker === a ? b : a;
          const truncated = turn.line.length > 28
            ? turn.line.slice(0, 26) + "…" : turn.line;

          this.sidebar?.showConversationTurn(turn, i === 0);
          speaker.setStatus("interacting", `"${truncated}"`);
          listener.setStatus("interacting", "...");
          this.sidebar?.renderAgents(Array.from(this.agents.values()));
          await this.delay(msPerTurn);
        }

        this.log(`${a.displayName} & ${b.displayName}: ${result.summary}`);
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

  // ── lighting ──────────────────────────────────────────────────────────────

  private createLighting() {
    this.lightingOverlay = this.add.rectangle(640, 360, 1280, 720, 0x0b1020);
    this.lightingOverlay.setScrollFactor(0).setDepth(800).setAlpha(0.08);
  }

  private updateLighting() {
    if (!this.lightingOverlay) return;
    const h = this.getSimMinutes() / 60;
    let alpha: number;
    if      (h >= 6  && h < 8)  alpha = Phaser.Math.Linear(0.45, 0.08, (h - 6)  / 2);
    else if (h >= 8  && h < 17) alpha = 0.08;
    else if (h >= 17 && h < 20) alpha = Phaser.Math.Linear(0.12, 0.4,  (h - 17) / 3);
    else                         alpha = 0.45;
    this.lightingOverlay.setAlpha(alpha);
  }

  // ── sim clock ─────────────────────────────────────────────────────────────

  private getSimMinutes(): number {
    const elapsed = (Date.now() - this.simLastRealMs) / 1_000;
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
    this.simAccuMinutes   = this.getSimMinutes();
    this.simLastRealMs    = Date.now();
    this.simSpeed         = speed;
    this.time.timeScale   = speed === 0 ? 0 : speed;
    this.tweens.timeScale = speed === 0 ? 0 : speed;
    this.client?.setSpeed(speed).catch(console.error);
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  private log(message: string) {
    this.sidebar?.addEventLog(this.getSimTime(), message);
  }

  private cleanup() {
    this.sidebar?.remove();
    this.sidebar = null;
  }

  // ── editor-generated scene setup ─────────────────────────────────────────

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
