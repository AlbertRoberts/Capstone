
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

import Phaser from "phaser";

type StartingLocation =
  | "town_hall"
  | "school"
  | "clinic"
  | "cafe"
  | "tavern"
  | "market"
  | "park";

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
