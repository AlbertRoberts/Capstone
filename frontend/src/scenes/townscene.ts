
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
	{ x: 201, y: 551},
	{ x: 977, y: 450 },
	{ x: 389, y: 551 },
	{ x: 799, y: 551},
	{ x: 644, y: 628 },
];

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */


	

/* END-USER-IMPORTS */

export default class townscene extends Phaser.Scene {

	constructor() {
		super("townscene");

		/* START-USER-CTR-CODE */



		/* END-USER-CTR-CODE */
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

	// simple agent object
	private agents = new Map<string, { body: Phaser.GameObjects.Arc; label: Phaser.GameObjects.Text }>();

	
	private spawnAgent(id: string, name: string, x: number, y: number) {
	const body = this.add.circle(x, y, 10, 0x4ade80).setDepth(900);
	const label = this.add.text(x + 12, y - 10, name, { color: "#ffffff", fontSize: "14px" }).setDepth(900);
	this.agents.set(id, { body, label });
	}

	// (optional) direct move
	private moveAgentTo(id: string, x: number, y: number) {
	const a = this.agents.get(id);
	if (!a) return;

	this.tweens.killTweensOf(a.body);
	this.tweens.killTweensOf(a.label);

	this.tweens.add({ targets: a.body, x, y, duration: 700, ease: "Sine.easeInOut" });
	this.tweens.add({ targets: a.label, x: x + 12, y: y - 10, duration: 700, ease: "Sine.easeInOut" });
	}

	// helper function to draw point at anchor locations
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

	

	create() {
	this.editorCreate();

	this.buildSidewalkGraph();

	this.drawAnchors();

	// fake agents for testing
	this.spawnAgent("a1", "Elara", LOCATIONS.town_hall.x - 40, LOCATIONS.town_hall.y);
	this.spawnAgent("a2", "Marcus", LOCATIONS.school.x, LOCATIONS.school.y + 40);
	this.spawnAgent("a3", "Ivy", LOCATIONS.cafe.x, LOCATIONS.cafe.y - 40);

	// sends an agent on a path to a location every ten seconds for testing
	this.time.addEvent({
		delay: 7000,
		loop: true,
		callback: () => {
		const agents = Array.from(this.agents.keys());
		const locations = Object.values(LOCATIONS);
		const randomAgent = agents[Math.floor(Math.random() * agents.length)];
		const randomLocation = locations[Math.floor(Math.random() * locations.length)];
		this.moveAgentAlongPath(randomAgent, randomLocation.x, randomLocation.y);
		},
	});
	}


	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
