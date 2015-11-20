
function Vehicle(scene, id, headTex, bodyTex) {
	CGFobject.call(this, scene);

	this.scene = scene;

	this.ID = id;
	this.updatableTexCoords=false;

	this.head = headTex;
	this.body = bodyTex;

	this.dorso1 = new Triangle(this.scene, "", 2, 0, 0, 0, 1, 0, 0, 0, 4);
	this.dorso2 = new Triangle(this.scene, "", 0, 1, 0, -2, 0, 0, 0, 0, 4);

	this.rear1 = new Patch(this.scene, "", 2, 2, 10, 10, 
	[
		[
			[0, 1, 0, 1],
			[0, 3, -0.5, 1],
			[0, 0, -1, 1]
		],
		[
			[1, 0.5, 0, 1],
			[1, 0.25, -0.5, 1],
			[1, 0, -1, 1]
		],
		[
			[2, 0, 0, 1],
			[2, 0, -0.25, 1],
			[2, 0, -0.5, 1]
		]
	]);

	this.rear2 = new Patch(this.scene, "", 2, 2, 10, 10, 
	[
		[
			[-2, 0, 0, 1],
			[-2, 0, -0.25, 1],
			[-2, 0, -0.5, 1]
		],
		[
			[-1, 0.5, 0, 1],
			[-1, 0.25, -0.5, 1],
			[-1, 0, -1, 1]
		],
		[
			[0, 1, 0, 1],
			[0, 3, -0.5, 1],
			[0, 0, -1, 1]
		]
	]);

	this.dorso1.initBuffers();
	this.dorso2.initBuffers();
};

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor=Vehicle;

Vehicle.prototype.display = function() {

	var deg2rad=Math.PI/180.0;

	this.scene.pushMatrix();
		this.scene.scale(0.2, 0.5, 0.4);

	this.scene.pushMatrix();
		this.body.bind();
        this.dorso1.display();
        this.dorso2.display();

        this.head.bind();
        this.rear1.display();
        this.rear2.display();
    this.scene.popMatrix();

	this.scene.pushMatrix();
		this.scene.rotate(180 * deg2rad, 0, 0, 1);

		this.body.bind();
        this.dorso1.display();
        this.dorso2.display();

        this.head.bind();
        this.rear1.display();
        this.rear2.display();
    this.scene.popMatrix();

    this.scene.popMatrix();
};