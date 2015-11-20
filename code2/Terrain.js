
function Terrain(scene, id, colTex, heiTex, vertexShader, fragmentShader) {	

	this.scene = scene;

	this.divU = 50;
	this.divV = 50;

	this.colTex = colTex;
	this.heiTex = heiTex;

	this.usedShader = new CGFshader(this.scene.gl, vertexShader, fragmentShader);

	this.usedShader.setUniformsValues({heightScale: 0.2});
	this.usedShader.setUniformsValues({uSampler: 0});
	this.usedShader.setUniformsValues({uSampler2: 1});

	this.plane = new Plane(scene, id, this.divU, this.divV);
};

Terrain.prototype = Object.create(Plane.prototype);
Terrain.prototype.constructor=Terrain;

Terrain.prototype.display = function() {

	this.scene.setActiveShader(this.usedShader);

	this.colTex.bind(0);
	this.heiTex.bind(1);
	this.plane.display();

	this.scene.setActiveShader(this.scene.defaultShader);
};