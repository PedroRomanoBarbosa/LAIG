var degToRad = Math.PI / 180.0;

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
XMLscene.prototype.onGraphLoaded = function () {
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

    this.objects=[];
    this.loadNodesOnGraphLoaded();
    console.log(this.objects);
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

		/*for(var i=0; i<this.primitives.length; i++){
			this.primitives[i].display();
		}*/

		this.nodesDisplay();
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
      case 'cylinder':
        var l = this.graph.leaves[i];
        this.primitives.push(new Cylinder(this, l.tagId,
          l.primitive.heightC,
          l.primitive.bottomRadius,
          l.primitive.topRadius,
          l.primitive.stacks,
          l.primitive.slices));
        break;
			case 'sphere':
				this.primitives.push(new Sphere(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.radius,
					this.graph.leaves[i].primitive.partsAlongRadius,
					this.graph.leaves[i].primitive.partsPerSection));
				break;
		}
	}
};

XMLscene.prototype.loadNodesOnGraphLoaded = function () {

	this.rootID=this.graph.root.tagId;

	for(var i=0; i<this.graph.nodes.length; i++){
		var nodeN = {};
		nodeN.ID=this.graph.nodes[i].tagId;
		nodeN.materialID=this.graph.nodes[i].materialID;
		nodeN.textureID=this.graph.nodes[i].TextureID;

		nodeN.transformations = [];
		for(var j=0; j<this.graph.nodes[i].transformations.length; j++){
			var transformationN = {};
			switch(this.graph.nodes[i].transformations[j].typeOf){
				case 'translation':
					transformationN.typeOf=this.graph.nodes[i].transformations[j].typeOf;

					transformationN.xyz = [];
					for(var e=0; e<this.graph.nodes[i].transformations[j].xyz.length; e++){
						transformationN.xyz.push(this.graph.nodes[i].transformations[j].xyz[e]);
					}
					break;
				case 'rotation':
					transformationN.typeOf=this.graph.nodes[i].transformations[j].typeOf;
					transformationN.angle=this.graph.nodes[i].transformations[j].angle;
					transformationN.axis=this.graph.nodes[i].transformations[j].axisRot;
					break;
				case 'scale':
					transformationN.typeOf=this.graph.nodes[i].transformations[j].typeOf;

					transformationN.xyz = [];
					for(var e=0; e<this.graph.nodes[i].transformations[j].xyz.length; e++){
						transformationN.xyz.push(this.graph.nodes[i].transformations[j].xyz[e]);
					}
					break;
			}

			nodeN.transformations.push(transformationN);
		}

		nodeN.descendants = [];
		for(var u=0; u<this.graph.nodes[i].children.length; u++){
			nodeN.descendants.push(this.graph.nodes[i].children[u]);
		}

		this.objects.push(nodeN);
	}
};

XMLscene.prototype.nodesDisplay = function () {

	for(var i=0; i<this.objects.length; i++){
		if(this.rootID==this.objects[i].ID){
			this.processNodeDisplay(this.objects[i].ID);
			break;
		}
	}
};

XMLscene.prototype.processNodeDisplay = function (id) {
	for(var i=0; i<this.objects.length; i++){
		if(id==this.objects[i].ID){

			this.pushMatrix();

			for(var j=0; j<this.objects[i].transformations.length; j++){
				switch(this.objects[i].transformations[j].typeOf){
				case 'translation':
					this.translate(this.objects[i].transformations[j].xyz[0], this.objects[i].transformations[j].xyz[1], this.objects[i].transformations[j].xyz[2]);
					break;
				case 'rotation':
					switch(this.objects[i].transformations[j].axis){
						case 'x':
							this.rotate(this.objects[i].transformations[j].angle*degToRad,1,0,0);
							break;
						case 'y':
							this.rotate(this.objects[i].transformations[j].angle*degToRad,0,1,0);
							break;
						case 'z':
							this.rotate(this.objects[i].transformations[j].angle*degToRad,0,0,1);
							break;
					}
					break;
				case 'scale':
					this.scale(this.objects[i].transformations[j].xyz[0], this.objects[i].transformations[j].xyz[1], this.objects[i].transformations[j].xyz[2]);
					break;
				}
			}

			for(var u=0; u<this.objects[i].descendants.length; u++){

				if(this.isAPrimitive(this.objects[i].descendants[u])) this.processPrimitiveDisplay(this.objects[i].descendants[u]);
				else this.processNodeDisplay(this.objects[i].descendants[u]);
			}

			this.popMatrix();
		}
	}
};

XMLscene.prototype.processPrimitiveDisplay = function (id) {
	for(var i=0; i<this.primitives.length; i++){
		if(id==this.primitives[i].ID){
			this.primitives[i].display();
		}
	}
};

XMLscene.prototype.isAPrimitive = function (str) {
	for(var i=0; i<this.primitives.length; i++){
		if(str==this.primitives[i].ID){
			return true;
		}
	}

	return false;
};
