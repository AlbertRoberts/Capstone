import { type SpeedLevel, MAX_EVENT_LOG_ENTRIES } from "./types";
import type { Agent } from "./Agent";
import type { ConversationTurn } from "./BackendClient";

/**
 * Owns all DOM elements that make up the right-hand sidebar:
 *   - Clock display + speed controls
 *   - Agent status list
 *   - Active conversation panel
 *   - Ask-an-agent panel
 *   - Event log
 */
export class Sidebar {
  private readonly el: HTMLDivElement;
  private currentSpeed: SpeedLevel = 1;

  // Callbacks wired up by TownScene after construction
  onSpeedChange: ((speed: SpeedLevel) => void) | null = null;
  onAskAgent:    ((agentId: number, question: string) => Promise<string>) | null = null;

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

    this.el.innerHTML = this.buildHTML();
    document.body.appendChild(this.el);
    this.styleSpeedButtons();
    this.attachSpeedListeners();
    this.attachAskListeners();
  }

  // ── HTML template ─────────────────────────────────────────────────────────

  private buildHTML(): string {
    return `
      <h2 style="margin-top:0;">Town Status</h2>

      <!-- Clock + speed controls -->
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span style="color:#9ca3af; font-size:13px;">
           <span id="sim-clock">8:00am</span>
        </span>
        <div id="speed-controls" style="display:flex; gap:4px; margin-left:auto;">
          <button data-speed="0" title="Pause">⏸</button>
          <button data-speed="1" title="1× speed">▶</button>
          <button data-speed="2" title="2× speed">▶▶</button>
          <button data-speed="4" title="4× speed">▶▶▶</button>
        </div>
      </div>

      <!-- Agent status -->
      <div id="agent-status-section">
        <h3 style="margin:0 0 8px;">Agents</h3>
        <div id="agent-status-list"></div>
      </div>

      <hr style="margin:16px 0; border-color:#374151;" />

      <!-- Active conversation (hidden until a conversation starts) -->
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
  }

  // ── Speed controls ────────────────────────────────────────────────────────

  private styleSpeedButtons() {
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
    this.highlightSpeed(this.currentSpeed);
  }

  private highlightSpeed(speed: SpeedLevel) {
    this.el.querySelectorAll<HTMLButtonElement>("#speed-controls button").forEach(btn => {
      const active = Number(btn.dataset.speed) === speed;
      btn.style.background  = active ? "#2563eb" : "#374151";
      btn.style.borderColor = active ? "#3b82f6" : "#4b5563";
    });
  }

  private attachSpeedListeners() {
    this.el.querySelectorAll<HTMLButtonElement>("#speed-controls button").forEach(btn => {
      btn.addEventListener("click", () => {
        const speed = Number(btn.dataset.speed) as SpeedLevel;
        this.currentSpeed = speed;
        this.highlightSpeed(speed);
        this.onSpeedChange?.(speed);
      });
    });
  }

  setSpeed(speed: SpeedLevel) {
    this.currentSpeed = speed;
    this.highlightSpeed(speed);
  }

  // ── Ask-agent panel ───────────────────────────────────────────────────────

  private attachAskListeners() {
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
      const opt       = document.createElement("option");
      opt.value       = String(a.id);
      opt.textContent = a.name;
      select.appendChild(opt);
    }
    select.value = current;
  }

  // ── Clock ─────────────────────────────────────────────────────────────────

  updateClock(simTime: string) {
    const el = this.el.querySelector<HTMLSpanElement>("#sim-clock");
    if (el) el.textContent = simTime;
  }

  // ── Agent status list ─────────────────────────────────────────────────────

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
      const hex     = "#" + agent.color.toString(16).padStart(6, "0");
      const roleTag = agent.role
        ? `<span style="font-size:11px; color:#60a5fa; margin-left:6px;">${agent.role}</span>`
        : "";
      row.innerHTML = `
        <strong>
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%;
            background:${hex}; margin-right:6px; vertical-align:middle;"></span>
          ${agent.displayName}${roleTag}
        </strong><br/>
        <span style="color:#9ca3af; font-size:12px;">
          @ ${agent.destination ?? agent.currentLocation ?? "?"}
        </span><br/>
        Status: ${agent.status}<br/>
        Action: ${agent.lastAction}
      `;
      list.appendChild(row);
    }
  }

  // ── Conversation panel ────────────────────────────────────────────────────

  showConversationTurn(turn: ConversationTurn, isFirst: boolean) {
    const section = this.el.querySelector<HTMLDivElement>("#conversation-section")!;
    const hr      = this.el.querySelector<HTMLHRElement>("#conversation-hr")!;
    const box     = this.el.querySelector<HTMLDivElement>("#conversation-box")!;

    if (isFirst) {
      box.innerHTML         = "";
      section.style.display = "block";
      hr.style.display      = "block";
    }

    const isLeft = box.children.length % 2 === 0;
    const bubble = document.createElement("div");
    Object.assign(bubble.style, {
      padding:     "6px 10px",
      borderRadius: "8px",
      fontSize:    "13px",
      lineHeight:  "1.4",
      maxWidth:    "90%",
      wordBreak:   "break-word",
      background:  isLeft ? "#1e3a5f" : "#1e3a2a",
      border:      isLeft ? "1px solid #2563eb" : "1px solid #16a34a",
      alignSelf:   isLeft ? "flex-start" : "flex-end",
    });
    bubble.innerHTML =
      `<strong style="font-size:11px; opacity:0.75;">${turn.speaker}</strong><br/>${turn.line}`;
    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
  }

  clearConversation() {
    const section = this.el.querySelector<HTMLDivElement>("#conversation-section");
    const hr      = this.el.querySelector<HTMLHRElement>("#conversation-hr");
    if (section) section.style.display = "none";
    if (hr)      hr.style.display      = "none";
  }

  // ── Event log ─────────────────────────────────────────────────────────────

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

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  remove() { this.el.remove(); }
}
