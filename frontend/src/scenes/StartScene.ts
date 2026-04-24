
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
  role: string; // e.g. "Doctor", "Bartender", "" for no fixed role
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
        <div style="display:flex; gap:8px; align-items:center;">
          <button id="import-btn"    style="padding:8px 14px; cursor:pointer; background:#1f2937; color:#d1d5db; border:1px solid #4b5563; border-radius:6px;">Import</button>
          <button id="export-btn"    style="padding:8px 14px; cursor:pointer; background:#1f2937; color:#d1d5db; border:1px solid #4b5563; border-radius:6px;">Export</button>
          <button id="add-agent-btn" style="padding:8px 14px; cursor:pointer;">+ Add Agent</button>
        </div>
      </div>

      <!-- hidden file picker — accepts JSON and CSV -->
      <input id="file-input" type="file" accept=".json,.csv" style="display:none;" />

      <p style="margin-top:0; color:#9ca3af; font-size:13px;">
        Import a <strong>.json</strong> or <strong>.csv</strong> file, or fill in the rows below.
        JSON: array of <code>{name, role, startingPoint, personality}</code>.
        CSV: columns <code>name, role, startingPoint, personality</code>.
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
    const importBtn   = container.querySelector("#import-btn")    as HTMLButtonElement;
    const exportBtn   = container.querySelector("#export-btn")    as HTMLButtonElement;
    const fileInput   = container.querySelector("#file-input")    as HTMLInputElement;
    const agentList   = container.querySelector("#agent-list")    as HTMLDivElement;

    addAgentBtn.onclick = () => this.addAgentRow(agentList);

    // ── Import ──────────────────────────────────────────────────────────────
    importBtn.onclick = () => fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const configs = file.name.endsWith(".csv")
            ? this.parseCSV(text)
            : this.parseJSON(text);

          agentList.innerHTML = "";           // clear existing rows
          for (const cfg of configs) this.addAgentRow(agentList, cfg);
        } catch (err) {
          alert(`Failed to import file: ${err instanceof Error ? err.message : err}`);
        }
        fileInput.value = "";               // reset so the same file can be re-imported
      };
      reader.readAsText(file);
    };

    // ── Export ──────────────────────────────────────────────────────────────
    exportBtn.onclick = () => {
      const agents = this.collectAgents(agentList);
      const exportData = agents.map(a => ({
        name:         a.name,
        role:         a.role,
        startingPoint: a.startingPoint,
        personality:  a.personalityPrompt,
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "agents.json";
      a.click();
      URL.revokeObjectURL(url);
    };

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

  // ── Import parsers ──────────────────────────────────────────────────────────

  private parseJSON(text: string): Partial<AgentConfig>[] {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("JSON must be an array of agent objects.");
    return data.map((d: Record<string, string>) => ({
      name:             d.name         ?? "",
      role:             d.role         ?? "",
      startingPoint:    (d.startingPoint ?? "house_1") as StartingLocation,
      personalityPrompt: d.personality  ?? "",
    }));
  }

  private parseCSV(text: string): Partial<AgentConfig>[] {
    const lines  = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

    // Normalise header names (lowercase, strip spaces)
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const col = (row: string[], name: string) => {
      const i = headers.indexOf(name);
      return i >= 0 ? (row[i] ?? "").trim() : "";
    };

    return lines.slice(1).filter(l => l.trim()).map(line => {
      // Handle quoted fields with commas inside them
      const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g)
        ?.map(c => c.replace(/^"|"$/g, "").trim()) ?? line.split(",").map(c => c.trim());

      return {
        name:              col(cols, "name"),
        role:              col(cols, "role"),
        startingPoint:     (col(cols, "startingpoint") || "house_1") as StartingLocation,
        personalityPrompt: col(cols, "personality"),
      };
    });
  }

  private addAgentRow(agentList: HTMLDivElement, prefill?: Partial<AgentConfig>) {
    const row = document.createElement("div");
    row.className = "agent-row";
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1fr 1fr 0.9fr 2fr auto";
    row.style.gap = "10px";
    row.style.marginBottom = "12px";
    row.style.padding = "12px";
    row.style.background = "#111827";
    row.style.borderRadius = "8px";
    row.style.border = "1px solid #374151";

    const inputStyle = "padding:10px; border-radius:6px; border:1px solid #4b5563; background:#1f2937; color:white;";

    row.innerHTML = `
      <input
        type="text"
        class="agent-name"
        placeholder="Name"
        style="${inputStyle}"
      />

      <select class="agent-role" style="${inputStyle}">
        <option value="">Resident (no role)</option>
        <option value="Doctor">Doctor — clinic</option>
        <option value="Teacher">Teacher — school</option>
        <option value="Student">Student — school</option>
        <option value="Mayor">Mayor — town hall</option>
        <option value="Sheriff">Sheriff — town hall</option>
        <option value="Café Owner">Café Owner — café</option>
        <option value="Bartender">Bartender — tavern</option>
        <option value="Merchant">Merchant — market</option>
        <option value="Farmer">Farmer — park</option>
      </select>

      <select class="agent-start" style="${inputStyle}">
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
        style="${inputStyle} resize:vertical;"
      ></textarea>

      <button
        class="remove-agent-btn"
        style="padding:10px 12px; border-radius:6px; cursor:pointer; background:#7f1d1d; color:white; border:none;"
      >
        ✕
      </button>
    `;

    const removeBtn = row.querySelector(".remove-agent-btn") as HTMLButtonElement;
    removeBtn.onclick = () => row.remove();

    // Pre-fill values if provided (from import)
    if (prefill) {
      (row.querySelector(".agent-name")        as HTMLInputElement   ).value = prefill.name             ?? "";
      (row.querySelector(".agent-role")        as HTMLSelectElement  ).value = prefill.role             ?? "";
      (row.querySelector(".agent-start")       as HTMLSelectElement  ).value = prefill.startingPoint    ?? "house_1";
      (row.querySelector(".agent-personality") as HTMLTextAreaElement).value = prefill.personalityPrompt ?? "";
    }

    agentList.appendChild(row);
  }

  private collectAgents(agentList: HTMLDivElement): AgentConfig[] {
    const rows = Array.from(agentList.querySelectorAll(".agent-row"));

    return rows.map((row, index) => {
      const nameInput        = row.querySelector(".agent-name")        as HTMLInputElement;
      const roleInput        = row.querySelector(".agent-role")        as HTMLSelectElement;
      const startInput       = row.querySelector(".agent-start")       as HTMLSelectElement;
      const personalityInput = row.querySelector(".agent-personality") as HTMLTextAreaElement;

      return {
        id:               `a${index + 1}`,
        name:             nameInput.value.trim() || `Agent ${index + 1}`,
        role:             roleInput.value,
        startingPoint:    startInput.value as StartingLocation,
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
