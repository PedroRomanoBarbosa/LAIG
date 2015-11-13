
function Terrain(scene, id, divU, divV, colTex, heiTex, vertexShader, fragmentShader) {	

	this.scene = scene;

	this.colTex = colTex;
	this.heiTex = heiTex;

	this.usedShader = new CGFshader(this.scene.gl, vertexShader, fragmentShader);

	this.usedShader.setUniformsValues({heightScale: 0.5});
	this.usedShader.setUniformsValues({uSampler: this.colTex});
	this.usedShader.setUniformsValues({uSampler2: this.heiTex});

	this.plane = new Plane(scene, id, 1, 1, divU, divV);
};

Terrain.prototype = Object.create(Plane.prototype);
Terrain.prototype.constructor=Terrain;

Terrain.prototype.display = function() {
	this.scene.setActiveShader(this.usedShader);

	this.colTex.bind();
	this.plane.display();

	this.scene.setActiveShader(this.scene.defaultShader);
};