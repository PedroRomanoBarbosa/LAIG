
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);
};

XMLscene.prototype.initLights = function () {

    this.shader.bind();

	this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();
 
    this.shader.unbind();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.initCamerasOnGraphLoaded(); // Camera vec <-------------
	this.initIlluminationOnGraphLoaded();
    this.initLightsOnGraphLoaded();

    this.enableTextures(true);
    this.textures=[];
    this.initTexturesOnGraphLoaded();

    this.materials=[];
    this.initMaterialsOnGraphLoaded();

	this.primitives=[];
    this.loadPrimitivesOnGraphLoaded();
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
    this.shader.bind();
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();

	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		for(var i=0; i<8; i++){
			this.lights[i].update();
		}

		for(var i=0; i<this.primitives.length; i++){
			this.primitives[i].display();
		}
	};	

    this.shader.unbind();
};

XMLscene.prototype.initCamerasOnGraphLoaded = function () {
    //this.camera = new CGFcamera(0.4, this.graph.near, this.graph.frustumFar, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0)); //MOVE CAMERA
};

XMLscene.prototype.initIlluminationOnGraphLoaded = function () {
	this.setGlobalAmbientLight(this.graph.ambientRGBA[0],this.graph.ambientRGBA[1],this.graph.ambientRGBA[2],this.graph.ambientRGBA[3]);
    this.gl.clearColor(this.graph.backgroundRGBA[0],this.graph.backgroundRGBA[1],this.graph.backgroundRGBA[2],this.graph.backgroundRGBA[3]);
};

XMLscene.prototype.initLightsOnGraphLoaded = function () {

    this.shader.bind();

	for(var i=0; i<8 && i<this.graph.lights.length; i++){
		this.lights[i].ID=this.graph.lights[i].tagId;

		if(this.graph.lights[i].enable) this.lights[i].enable();
		else this.lights[i].disable();

		this.lights[i].setPosition(this.graph.lights[i].position[0], this.graph.lights[i].position[1], this.graph.lights[i].position[2], this.graph.lights[i].position[3]);
		this.lights[i].setAmbient(this.graph.lights[i].ambient[0], this.graph.lights[i].ambient[1], this.graph.lights[i].ambient[2], this.graph.lights[i].ambient[3]);
		this.lights[i].setDiffuse(this.graph.lights[i].diffuse[0], this.graph.lights[i].diffuse[1], this.graph.lights[i].diffuse[2], this.graph.lights[i].diffuse[3]);
		this.lights[i].setSpecular(this.graph.lights[i].specular[0], this.graph.lights[i].specular[1], this.graph.lights[i].specular[2], this.graph.lights[i].specular[3]);
		this.lights[i].setVisible(true);

		this.lights[i].update();
	}
 
    this.shader.unbind();
};

XMLscene.prototype.initTexturesOnGraphLoaded = function () {

	for(var i=0; i<this.graph.textures.length; i++){
		this.textures.push(new CGFappearance(this));
		this.textures[i].ID=this.graph.textures[i].tagId;
		this.textures[i].loadTexture(this.graph.textures[i].filepath);
		this.textures[i].amplif_factor = {};
		this.textures[i].amplif_factor.s=this.graph.textures[i].amplif_factor.s;
		this.textures[i].amplif_factor.t=this.graph.textures[i].amplif_factor.t;
	}
};

XMLscene.prototype.initMaterialsOnGraphLoaded = function () {

	for(var i=0; i<this.graph.materials.length; i++){
		this.materials.push(new CGFappearance(this));
		this.materials[i].ID=this.graph.materials[i].tagId;
		this.materials[i].shininess=this.graph.materials[i].shininess;
		this.materials[i].setSpecular(this.graph.materials[i].specular[0],this.graph.materials[i].specular[1],this.graph.materials[i].specular[2],this.graph.materials[i].specular[3]);
		this.materials[i].setDiffuse(this.graph.materials[i].diffuse[0],this.graph.materials[i].diffuse[1],this.graph.materials[i].diffuse[2],this.graph.materials[i].diffuse[3]);
		this.materials[i].setAmbient(this.graph.materials[i].ambient[0],this.graph.materials[i].ambient[1],this.graph.materials[i].ambient[2],this.graph.materials[i].ambient[3]);
		this.materials[i].setEmission(this.graph.materials[i].emission[0],this.graph.materials[i].emission[1],this.graph.materials[i].emission[2],this.graph.materials[i].emission[3]);
	}
};

XMLscene.prototype.loadPrimitivesOnGraphLoaded = function () {

	for(var i=0; i<this.graph.leaves.length; i++){
		switch(this.graph.leaves[i].typeOf){
			case 'rectangle':
				this.primitives.push(new Rectangle(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.leftTopX, this.graph.leaves[i].primitive.leftTopY,
					this.graph.leaves[i].primitive.rightBottomX, this.graph.leaves[i].primitive.rightBottomY));
				break;
			case 'triangle':
				this.primitives.push(new Triangle(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.Point1[0], this.graph.leaves[i].primitive.Point1[1], this.graph.leaves[i].primitive.Point1[2],
					this.graph.leaves[i].primitive.Point2[0], this.graph.leaves[i].primitive.Point2[1], this.graph.leaves[i].primitive.Point2[2],
					this.graph.leaves[i].primitive.Point3[0], this.graph.leaves[i].primitive.Point3[1], this.graph.leaves[i].primitive.Point3[2]));
				break;
			case 'sphere':
				/*this.primitives.push(new Sphere(this, this.graph.leaves[i].tagId,
				this.graph.leaves[i].primitive.radius,
				this.graph.leaves[i].primitive.partsAlongRadius,
				this.graph.leaves[i].primitive.partsPerSection));*/

				this.primitives.push(new Sphere(this, "o", 3, 1, 1));
				break;
		}
	}
};