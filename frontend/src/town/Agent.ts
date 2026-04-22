import type { LocationId, AgentStatus } from "./types";

/**
 * Owns the Phaser display objects (circle + labels) for one agent
 * and tracks its logical state (location, status, who it's talking to).
 */
export class Agent {
  // Phaser display objects
  readonly body:       Phaser.GameObjects.Arc;
  readonly label:      Phaser.GameObjects.Text;
  readonly statusText: Phaser.GameObjects.Text;

  // Identity
  readonly backendId: number;
  readonly color:     number;
  readonly role:      string;

  // Logical state
  status:            AgentStatus = "idle";
  currentLocation:   LocationId | null = null;
  destination:       LocationId | null = null;
  lastAction:        string = "None";
  interactingWith:   Agent | null = null;
  lastInteractionAt: number = 0;

  get busy(): boolean { return this.status !== "idle"; }

  get displayName(): string { return this.label.text; }

  constructor(
    scene:     Phaser.Scene,
    name:      string,
    x:         number,
    y:         number,
    backendId: number,
    color:     number,
    role       = "",
  ) {
    this.backendId  = backendId;
    this.color      = color;
    this.role       = role;
    this.body       = scene.add.circle(x, y, 10, color).setDepth(900);
    this.label      = scene.add.text(x + 12, y - 10, name,
      { color: "#ffffff", fontSize: "14px" }).setDepth(900);
    this.statusText = scene.add.text(x + 12, y + 6,  "idle",
      { color: "#9ca3af", fontSize: "11px" }).setDepth(900);
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
