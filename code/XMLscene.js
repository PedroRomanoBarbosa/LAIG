/* Global var to pass degrees to radius */
var degToRad = Math.PI / 180.0;

/**
* @constructs XMLscene constructor
*/
function XMLscene() {
    CGFscene.call(this);
}


XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
* @function Initializes the scene's axis and the scene's default attributes
* @param application The application object
*/
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

/**
* @function Initializes the scene's lights
*/
XMLscene.prototype.initLights = function () {
  this.shader.bind();
	this.lights[0].setPosition(2, 3, 3, 1);
  this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
  this.lights[0].update();
  this.shader.unbind();
};

/**
* @function Initializes scene's cameras
*/
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 10, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

/**
* @function Sets the default appearance for the scene
*/
XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

/**
* @function Handler called when the graph is finally loaded. As loading is asynchronous, this may be called already after the application has started the run loop
* @param application The application object
*/
XMLscene.prototype.onGraphLoaded = function () {

	this.initMatrixOnGraphLoaded();

	this.initCamerasOnGraphLoaded();
	this.initIlluminationOnGraphLoaded();
  this.initLightsOnGraphLoaded();

  this.enableTextures(true);
  this.textures=[];
  this.initTexturesOnGraphLoaded();

  this.materials=[];
  this.parentMaterial;
  this.initMaterialsOnGraphLoaded();

	this.primitives=[];
	this.parentTexture=null;
  this.loadPrimitivesOnGraphLoaded();

  this.objects=[];
  this.loadNodesOnGraphLoaded();
};

/**
* @function Displays the scene
*/
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

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		this.multMatrix(this.m);

		// Draw axis
		if(this.graph.referenceLength != 0) this.axis.display();

		for(var i=0; i<8; i++){
			this.lights[i].update();
		}

		this.nodesDisplay();
	};

    this.shader.unbind();
};

XMLscene.prototype.initMatrixOnGraphLoaded = function () {
	
	this.m=mat4.create();
	mat4.identity(this.m);

	mat4.translate(this.m, this.m, [this.graph.translateX, this.graph.translateY, this.graph.translateZ]);

	mat4.rotate(this.m, this.m, this.graph.rot1Angle * Math.PI / 180, [1, 0, 0]);
	mat4.rotate(this.m, this.m, this.graph.rot2Angle * Math.PI / 180, [0, 1, 0]);
	mat4.rotate(this.m, this.m, this.graph.rot3Angle * Math.PI / 180, [0, 0, 1]);

	mat4.scale(this.m, this.m, [this.graph.scaleX, this.graph.scaleY, this.graph.scaleZ]);
};

/**
* @function Initializes the scene's cameras after the scene's graph is loaded
*/
XMLscene.prototype.initCamerasOnGraphLoaded = function () {
	this.camera.near=this.graph.near;
	this.camera.far=this.graph.frustumFar;

	this.axis = new CGFaxis(this, this.graph.referenceLength, 0.1);
};

/**
* @function Initializes the scene's illumination after the scene's graph is loaded
*/
XMLscene.prototype.initIlluminationOnGraphLoaded = function () {
	this.setGlobalAmbientLight(this.graph.ambientRGBA[0],this.graph.ambientRGBA[1],this.graph.ambientRGBA[2],this.graph.ambientRGBA[3]);
    this.gl.clearColor(this.graph.backgroundRGBA[0],this.graph.backgroundRGBA[1],this.graph.backgroundRGBA[2],this.graph.backgroundRGBA[3]);
};

/**
* @function Initializes the scene's lights after the scene's graph is loaded
*/
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

/**
* @function Initializes the scene's textures after the scene's graph is loaded
*/
XMLscene.prototype.initTexturesOnGraphLoaded = function () {

	for(var i=0; i<this.graph.textures.length; i++){
		this.textures.push(new CGFtexture(this, this.graph.textures[i].filepath));
		this.textures[i].ID=this.graph.textures[i].tagId;
		this.textures[i].amplif_factor = {};
		this.textures[i].amplif_factor.s=this.graph.textures[i].amplif_factor.s;
		this.textures[i].amplif_factor.t=this.graph.textures[i].amplif_factor.t;
	}
};

/**
* @function Initializes the scene's textures after the scene's graph is loaded
*/
XMLscene.prototype.initMaterialsOnGraphLoaded = function () {

	this.materials.push(new CGFappearance(this));
	this.materials[0].ID="_default_material_";
	this.materials[0].shininess=10;
	this.materials[0].setSpecular(0.5, 0.5, 0.5, 1);
	this.materials[0].setDiffuse(0.5, 0.5, 0.5, 1);
	this.materials[0].setAmbient(0.2, 0.2, 0.2, 1);
	this.materials[0].setEmission(0.0, 0.0, 0.0, 1);

	this.parentMaterial=this.materials[0];

	for(var i=0; i<this.graph.materials.length; i++){
		this.materials.push(new CGFappearance(this));
		this.materials[i+1].ID=this.graph.materials[i].tagId;
		this.materials[i+1].shininess=this.graph.materials[i].shininess;
		this.materials[i+1].setSpecular(this.graph.materials[i].specular[0],this.graph.materials[i].specular[1],this.graph.materials[i].specular[2],this.graph.materials[i].specular[3]);
		this.materials[i+1].setDiffuse(this.graph.materials[i].diffuse[0],this.graph.materials[i].diffuse[1],this.graph.materials[i].diffuse[2],this.graph.materials[i].diffuse[3]);
		this.materials[i+1].setAmbient(this.graph.materials[i].ambient[0],this.graph.materials[i].ambient[1],this.graph.materials[i].ambient[2],this.graph.materials[i].ambient[3]);
		this.materials[i+1].setEmission(this.graph.materials[i].emission[0],this.graph.materials[i].emission[1],this.graph.materials[i].emission[2],this.graph.materials[i].emission[3]);
	}
};

/**
* @function Loads the scene's primitives after the scene's graph is loaded
*/
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

/**
* @function Loads the scene's nodes after the scene's graph is loaded
*/
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

/**
* @function Displays the scene's nodes
*/
XMLscene.prototype.nodesDisplay = function () {

	for(var i=0; i<this.objects.length; i++){
		if(this.rootID==this.objects[i].ID){
			this.processNodeDisplay(this.objects[i].ID);
			break;
		}
	}
};

/**
* @function Processes the display of the nodes
* @param id The identification of the node to process
*/
XMLscene.prototype.processNodeDisplay = function (id) {
	for(var i=0; i<this.objects.length; i++){
		if(id==this.objects[i].ID){

			this.pushMatrix();

			var mat, matAnt;
			matAnt=this.parentMaterial;
			if(this.objects[i].materialID!='null'){
				for(var t=0; t<this.materials.length; t++){
					if(this.objects[i].materialID==this.materials[t].ID){
						this.parentMaterial=this.materials[t];
						mat=this.materials[t];
						mat.apply();
						break;
					}
				}
			}else{
				mat=this.parentMaterial;
			}

			var tex, texAnt;
			texAnt=this.parentTexture;
			if(this.objects[i].textureID!='null' && this.objects[i].textureID!='clear'){
				for(var w=0; w<this.textures.length; w++){
					if(this.objects[i].textureID==this.textures[w].ID){
						this.parentTexture=this.textures[w];
						tex=this.textures[w];
						tex.bind();
						break;
					}
				}
			}else{
				if(this.objects[i].textureID=='null'){
					if(this.parentTexture!=null) tex=this.parentTexture;
				}
				if(this.objects[i].textureID=='clear'){
					this.parentTexture=null;
				}
			}

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

				if(this.isAPrimitive(this.objects[i].descendants[u])) this.processPrimitiveDisplay(this.objects[i].descendants[u], mat, tex);
				else this.processNodeDisplay(this.objects[i].descendants[u]);
			}

			this.parentMaterial=matAnt;
			this.parentTexture=texAnt;

			this.popMatrix();
		}
	}
};

/**
* @function Processes the display of the primitives
* @param id The identification of the primitive to process
* @param m The material of the primitive to process
* @param t The texture of the primitive to process
*/
XMLscene.prototype.processPrimitiveDisplay = function (id, m, t) {
	for(var i=0; i<this.primitives.length; i++){
		if(id==this.primitives[i].ID){
			m.apply();
			if(t!=null){
				if(this.primitives[i].updatableTexCoords) this.primitives[i].updateTexCoords(t.amplif_factor.s, t.amplif_factor.t);
				t.bind();
			}
			this.primitives[i].display();
		}
	}
};

/**
* @function Checks if a certain id is an id of a primitive
* @param {string} str The id of the primitive to process
* @returns {Boolean} True if the str matches a primitive ID, false if otherwise
*/
XMLscene.prototype.isAPrimitive = function (str) {
	for(var i=0; i<this.primitives.length; i++){
		if(str==this.primitives[i].ID){
			return true;
		}
	}

	return false;
};
