
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

import Phaser from "phaser";

type StartingLocation =
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

export type AgentConfig = {
  id: string;
  name: string;
  startingPoint: StartingLocation;
  personalityPrompt: string;
};

export default class StartScene extends Phaser.Scene {
  private containerEl: HTMLDivElement | null = null;

  constructor() {
    super("StartScene");
  }

  create() {
    this.add.rectangle(640, 360, 1280, 720, 0x1f2937);
    this.add.text(640, 70, "Little ReaLLM setup", {
      fontSize: "36px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.buildForm();

    this.events.once("shutdown", () => {
      this.cleanupForm();
    });

    this.events.once("destroy", () => {
      this.cleanupForm();
    });
  }

  private buildForm() {
    const container = document.createElement("div");
    container.id = "setup-ui";
    container.style.position = "absolute";
    container.style.top = "120px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.width = "900px";
    container.style.maxHeight = "520px";
    container.style.overflowY = "auto";
    container.style.background = "rgba(17, 24, 39, 0.95)";
    container.style.color = "white";
    container.style.padding = "20px";
    container.style.border = "2px solid #374151";
    container.style.borderRadius = "12px";
    container.style.zIndex = "1000";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h2 style="margin:0;">Create Agents</h2>
        <button id="add-agent-btn" style="padding:8px 14px; cursor:pointer;">+ Add Agent</button>
      </div>

      <p style="margin-top:0; color:#d1d5db;">
        Enter each agent's name, starting location, and a short personality prompt.
      </p>

      <div id="agent-list"></div>

      <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:12px;">
        <button id="start-sim-btn" style="padding:10px 18px; font-size:16px; cursor:pointer;">
          Start Simulation
        </button>
      </div>
    `;

    document.body.appendChild(container);
    this.containerEl = container;

    const addAgentBtn = container.querySelector("#add-agent-btn") as HTMLButtonElement;
    const startSimBtn = container.querySelector("#start-sim-btn") as HTMLButtonElement;
    const agentList = container.querySelector("#agent-list") as HTMLDivElement;

    addAgentBtn.onclick = () => this.addAgentRow(agentList);

    startSimBtn.onclick = () => {
      const agents = this.collectAgents(agentList);
      if (agents.length === 0) {
        alert("Please add at least one agent.");
        return;
      }

      this.cleanupForm();
      this.scene.start("townscene", { agents });
    };

    this.addAgentRow(agentList);
    this.addAgentRow(agentList);
    this.addAgentRow(agentList);
  }

  private addAgentRow(agentList: HTMLDivElement) {
    const row = document.createElement("div");
    row.className = "agent-row";
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1.2fr 1fr 2fr auto";
    row.style.gap = "10px";
    row.style.marginBottom = "12px";
    row.style.padding = "12px";
    row.style.background = "#111827";
    row.style.borderRadius = "8px";
    row.style.border = "1px solid #374151";

    row.innerHTML = `
      <input
        type="text"
        class="agent-name"
        placeholder="Name"
        style="padding:10px; border-radius:6px; border:1px solid #4b5563; background:#1f2937; color:white;"
      />

      <select
        class="agent-start"
        style="padding:10px; border-radius:6px; border:1px solid #4b5563; background:#1f2937; color:white;"
      >
        <option value="house_1">House 1</option>
        <option value="house_2">House 2</option>
        <option value="house_3">House 3</option>
        <option value="house_4">House 4</option>
        <option value="house_5">House 5</option>
        <option value="house_6">House 6</option>
        <option value="house_7">House 7</option>
        <option value="house_8">House 8</option>
        <option value="house_9">House 9</option>
        <option value="house_10">House 10</option>
      </select>

      <textarea
        class="agent-personality"
        rows="2"
        placeholder="Describe this agent's personality..."
        style="padding:10px; border-radius:6px; border:1px solid #4b5563; background:#1f2937; color:white; resize:vertical;"
      ></textarea>

      <button
        class="remove-agent-btn"
        style="padding:10px 12px; border-radius:6px; cursor:pointer; background:#7f1d1d; color:white; border:none;"
      >
        Remove
      </button>
    `;

    const removeBtn = row.querySelector(".remove-agent-btn") as HTMLButtonElement;
    removeBtn.onclick = () => row.remove();

    agentList.appendChild(row);
  }

  private collectAgents(agentList: HTMLDivElement): AgentConfig[] {
    const rows = Array.from(agentList.querySelectorAll(".agent-row"));

    return rows.map((row, index) => {
      const nameInput = row.querySelector(".agent-name") as HTMLInputElement;
      const startInput = row.querySelector(".agent-start") as HTMLSelectElement;
      const personalityInput = row.querySelector(".agent-personality") as HTMLTextAreaElement;

      return {
        id: `a${index + 1}`,
        name: nameInput.value.trim() || `Agent ${index + 1}`,
        startingPoint: startInput.value as StartingLocation,
        personalityPrompt:
          personalityInput.value.trim() || "Average town resident with no strong distinguishing traits.",
      };
    });
  }

  private cleanupForm() {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
    }
  }
}
/* END OF COMPILED CODE */

// You can write more code here
