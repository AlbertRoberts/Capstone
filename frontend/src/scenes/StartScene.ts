
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  private selectedAgentCount = 3;

  constructor() {
    super("StartScene");
  }

  create() {
    this.add.text(500, 100, "Town Simulation Setup", {
      fontSize: "32px",
      color: "#ffffff",
    });

    this.add.text(500, 180, "Agent Count:", {
      fontSize: "24px",
      color: "#ffffff",
    });

    const countText = this.add.text(700, 180, String(this.selectedAgentCount), {
      fontSize: "24px",
      color: "#ffff00",
    });

    const plusButton = this.add.text(760, 180, "[ + ]", {
      fontSize: "24px",
      color: "#00ff00",
    }).setInteractive();

    const minusButton = this.add.text(820, 180, "[ - ]", {
      fontSize: "24px",
      color: "#ff5555",
    }).setInteractive();

    plusButton.on("pointerdown", () => {
      this.selectedAgentCount = Math.min(12, this.selectedAgentCount + 1);
      countText.setText(String(this.selectedAgentCount));
    });

    minusButton.on("pointerdown", () => {
      this.selectedAgentCount = Math.max(1, this.selectedAgentCount - 1);
      countText.setText(String(this.selectedAgentCount));
    });

    const startButton = this.add.text(540, 320, "[ Start Simulation ]", {
      fontSize: "28px",
      color: "#00ffff",
      backgroundColor: "#333333",
      padding: { left: 10, right: 10, top: 6, bottom: 6 },
    }).setInteractive();

    startButton.on("pointerdown", () => {
      this.scene.start("townscene", {
        agentCount: this.selectedAgentCount,
      });
    });
  }
}

/* END OF COMPILED CODE */

// You can write more code here
