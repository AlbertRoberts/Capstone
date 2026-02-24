
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

	// anchor points for the locations in the town, used for navigation and interaction

	type LocationId = "town_hall" | "school" | "clinic" | "cafe" | "tavern" | "market" | "park";

	const LOCATIONS: Record<LocationId, { x: number; y: number }> = {
	town_hall: { x: 647, y: 369 },
	school: { x: 317, y: 363 },
	clinic: { x: 977, y: 268 },
	cafe: { x: 977, y: 450 },
	tavern: { x: 389, y: 643 },
	market: { x: 799, y: 646 },
	park: { x: 1102, y: 652 },
	};
	
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

		// rectangle
		const rectangle = this.add.rectangle(644, 628, 128, 128);
		rectangle.scaleX = 0.37167610523713657;
		rectangle.scaleY = 1.4867068094771634;
		rectangle.isFilled = true;
		rectangle.fillColor = 9408399;

		// rectangle_2
		const rectangle_2 = this.add.rectangle(644, 551, 128, 128);
		rectangle_2.scaleX = 0.32718513673271565;
		rectangle_2.scaleY = 7.251572595017952;
		rectangle_2.angle = -90;
		rectangle_2.isFilled = true;
		rectangle_2.fillColor = 9408399;

		// rectangle_3
		const rectangle_3 = this.add.rectangle(201, 361, 128, 128);
		rectangle_3.scaleX = 0.37328872859877876;
		rectangle_3.scaleY = 3.245378044183737;
		rectangle_3.isFilled = true;
		rectangle_3.fillColor = 9408399;

		// rectangle_4
		const rectangle_4 = this.add.rectangle(1085, 361, 128, 128);
		rectangle_4.scaleX = 0.37328872859877876;
		rectangle_4.scaleY = 3.245378044183737;
		rectangle_4.isFilled = true;
		rectangle_4.fillColor = 9408399;

		// rectangle_5
		const rectangle_5 = this.add.rectangle(647, 176, 128, 128);
		rectangle_5.scaleX = 0.32718513673271565;
		rectangle_5.scaleY = 7.251572595017952;
		rectangle_5.angle = -90;
		rectangle_5.isFilled = true;
		rectangle_5.fillColor = 9408399;

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

		// rectangle_24
		const rectangle_24 = this.add.rectangle(466, 364, 128, 128);
		rectangle_24.scaleX = 0.37328872859877876;
		rectangle_24.scaleY = 3.245378044183737;
		rectangle_24.angle = 11;
		rectangle_24.isFilled = true;
		rectangle_24.fillColor = 9408399;

		// rectangle_25
		const rectangle_25 = this.add.rectangle(831, 365, 128, 128);
		rectangle_25.scaleX = 0.37328872859877876;
		rectangle_25.scaleY = 3.245378044183737;
		rectangle_25.angle = -11;
		rectangle_25.isFilled = true;
		rectangle_25.fillColor = 9408399;

		// Park
		const park = this.add.rectangle(1102, 652, 128, 128);
		park.scaleX = 2.288062440058767;
		park.scaleY = 0.416422309655215;
		park.isFilled = true;
		park.fillColor = 9489506;

		// text_1
		const text_1 = this.add.text(611, 345, "", {});
		text_1.text = "Town Hall";
		text_1.setStyle({  });

		// text
		const text = this.add.text(277, 344, "", {});
		text.text = "School";
		text.setStyle({  });

		// text_2
		const text_2 = this.add.text(950, 259, "", {});
		text_2.text = "Clinic";
		text_2.setStyle({  });

		// text_3
		const text_3 = this.add.text(942, 441, "", {});
		text_3.text = "Cafe";
		text_3.setStyle({  });

		// text_4
		const text_4 = this.add.text(360, 643, "", {});
		text_4.text = "Tavern";
		text_4.setStyle({  });

		// text_5
		const text_5 = this.add.text(762, 631, "", {});
		text_5.text = "Market";
		text_5.setStyle({  });

		// text_6
		const text_6 = this.add.text(1013, 641, "", {});
		text_6.text = "Park\n";
		text_6.setStyle({  });

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */



	// helper function to draw point at anchor locations
	private drawAnchors() {
		for (const [id, pos] of Object.entries(LOCATIONS)) {
		  const dot = this.add.circle(pos.x, pos.y, 6, 0xffcc00).setDepth(1000);
		  this.add.text(pos.x + 8, pos.y - 10, id, { color: "#ffffff", fontSize: "12px" }).setDepth(1000);
		  dot.setAlpha(0.6);
		}
	  }

	create() {

		this.editorCreate();
		this.drawAnchors();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
