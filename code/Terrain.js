
function Terrain(scene, id, divU, divV, colTex, heiTex, vertexShader, fragmentShader) {	

	this.scene = scene;

	this.colTex = heiTex;
	this.heiTex = heiTex;

	this.usedShader = new CGFshader(this.scene.gl, vertexShader, fragmentShader);

	this.usedShader.setUniformsValues({heightScale: 0.1});
	this.usedShader.setUniformsValues({uSampler: 0});
	this.usedShader.setUniformsValues({uSampler2: 1});

	this.plane = new Plane(scene, id, divU, divV);
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