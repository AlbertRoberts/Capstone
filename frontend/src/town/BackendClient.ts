import type { AgentConfig } from "../scenes/StartScene";
import type { LocationId } from "./types";

// ── Backend response shapes ───────────────────────────────────────────────────

export interface BackendAgent {
  id:             number;
  name:           string;
  personality:    string;
  location:       string;
  current_action: string;
}

export interface BackendAction {
  description:    string;
  location_id?:   LocationId;
  scheduled_time: string | null;
}

export interface BackendPlan {
  agent_id: number;
  date:     string;
  actions:  BackendAction[];
}

export interface ConversationTurn {
  speaker: string;
  line:    string;
}

export interface BackendInteractionResponse {
  happened:     boolean;
  summary:      string;
  importance_a: number;
  importance_b: number;
  duration_ms:  number;
  turns:        ConversationTurn[];
}

export interface BackendAskResponse {
  agent_name: string;
  question:   string;
  answer:     string;
}

// ── Client ────────────────────────────────────────────────────────────────────

export class BackendClient {
  constructor(private readonly base: string) {}

  async registerAgent(cfg: AgentConfig): Promise<number> {
    const res = await this.post("/agents/", {
      name:           cfg.name,
      personality:    cfg.personalityPrompt,
      role:           cfg.role || null,
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
    location: LocationId,
    simTime:  string,
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

  // ── private helpers ───────────────────────────────────────────────────────

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
