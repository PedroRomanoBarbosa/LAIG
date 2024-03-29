/* Global var to pass degrees to radius */
var degToRad = Math.PI / 180.0;

/**
* @constructs XMLscene constructor
*/
function XMLscene(app, myInterface) {
    CGFscene.call(this);

    this.app=app;
    this.myInterface=myInterface;

    this.vertexShader = "shaders/terrain.vert";
    this.fragmentShader = "shaders/terrain.frag";
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

    /* Set time flag */
    this.timeFlag = true;
};

/**
* @function Initializes the scene's lights
*/
XMLscene.prototype.initLights = function () {
	this.lights[0].setPosition(2, 3, 3, 1);
  this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
  this.lights[0].update();
};

/**
* @function Initializes scene's cameras
*/
XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 10, 500, vec3.fromValues(25, 25, 25), vec3.fromValues(0, 0, 0));
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
  this.textures={};
  this.initTexturesOnGraphLoaded();

  this.materials={};
  this.parentMaterial;
  this.initMaterialsOnGraphLoaded();

  this.animations = {};
  this.initAnimationsOnGraphLoaded();

	this.primitives = {};
	this.parentTexture=null;
  this.loadPrimitivesOnGraphLoaded();

  this.objects = {};
  this.rootId = this.graph.root.tagId;
  this.loadNodesOnGraphLoaded();
  this.root = this.objects[this.rootId];

  console.log(this);
  /* Update scene */
  this.setUpdatePeriod(1000/60);

  this.app.setInterface(this.myInterface);
};

/**
*
*/
XMLscene.prototype.update = function (){
  /* Gets startTime */
  if(this.lastUpdate != 0){
    if(this.timeFlag){
      this.startTime = this.lastUpdate;
      this.timeFlag = false;
    }else{
      this.secondsPassed = (this.lastUpdate - this.startTime) / 1000;
      this.updateNodes(this.root);
    }
  }
};

/**
*
*/
XMLscene.prototype.updateNodes = function(obj){

  if(obj.aniIter < obj.animations.length && obj.animated == true){
      /* reset matrix */
      mat4.identity(obj.matxAni);
      /* while the seconds passed are greater than the sum of the spans */
      while(this.secondsPassed > this.animations[obj.animations[obj.aniIter]].span + obj.spanSum){
        obj.spanSum = obj.spanSum + this.animations[obj.animations[obj.aniIter]].span;
        obj.aniIter++;
        if(obj.aniIter == obj.animations.length){
          obj.animated = false;
          obj.aniIter--;
          break;
        }
      }
      if(obj.animated){
        obj.lastTransformation = this.animations[obj.animations[obj.aniIter]].updateMatrix(this.secondsPassed - obj.spanSum);
        /* Apply transformations */
        mat4.translate(obj.matxAni, obj.matxAni, obj.lastTransformation.translation);
        mat4.rotate(obj.matxAni, obj.matxAni, obj.lastTransformation.angle, [0, 1, 0]);
      }else {
        /* Apply transformations */
        obj.lastTransformation = this.animations[obj.animations[obj.aniIter]].lastTransformation();
        mat4.translate(obj.matxAni, obj.matxAni, obj.lastTransformation.translation);
        mat4.rotate(obj.matxAni, obj.matxAni, obj.lastTransformation.angle, [0, 1, 0]);
      }
  }

  /* tree search */
  for(var u = 0; u < obj.descendants.length; u++){
		if(!(obj.descendants[u] in this.primitives) ){
      this.updateNodes(this.objects[obj.descendants[u]]);
    }
	}
};

/**
* @function Displays the scene
*/
XMLscene.prototype.display = function () {

	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	for (i = 0; i < this.lights.length; i++)
		this.lights[i].update();

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
	}

};

/**
*
*/
XMLscene.prototype.initMatrixOnGraphLoaded = function () {

	this.m=mat4.create();
	mat4.identity(this.m);

	mat4.translate(this.m, this.m, [this.graph.translateX, this.graph.translateY, this.graph.translateZ]);

	switch(this.graph.rot1Axis){
		case "x":
			mat4.rotate(this.m, this.m, this.graph.rot1Angle * Math.PI / 180, [1, 0, 0]);
			break;
		case "y":
			mat4.rotate(this.m, this.m, this.graph.rot1Angle * Math.PI / 180, [0, 1, 0]);
			break;
		case "z":
			mat4.rotate(this.m, this.m, this.graph.rot1Angle * Math.PI / 180, [0, 0, 1]);
			break;
	}

	switch(this.graph.rot2Axis){
		case "x":
			mat4.rotate(this.m, this.m, this.graph.rot2Angle * Math.PI / 180, [1, 0, 0]);
			break;
		case "y":
			mat4.rotate(this.m, this.m, this.graph.rot2Angle * Math.PI / 180, [0, 1, 0]);
			break;
		case "z":
			mat4.rotate(this.m, this.m, this.graph.rot2Angle * Math.PI / 180, [0, 0, 1]);
			break;
	}

	switch(this.graph.rot3Axis){
		case "x":
			mat4.rotate(this.m, this.m, this.graph.rot3Angle * Math.PI / 180, [1, 0, 0]);
			break;
		case "y":
			mat4.rotate(this.m, this.m, this.graph.rot3Angle * Math.PI / 180, [0, 1, 0]);
			break;
		case "z":
			mat4.rotate(this.m, this.m, this.graph.rot3Angle * Math.PI / 180, [0, 0, 1]);
			break;
	}

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
    var light, i = 0;
    for(var i = 0; i < this.graph.lights.length; i++){
        light = this.graph.lights[i];

		if(light.enable){
			this.lights[i].lightBool = true;
      		this.lights[i].enable();
		}else{
			this.lights[i].lightBool = false;
      		this.lights[i].disable();
		}

    this.lights[i].ID = light.tagId;
		this.lights[i].setPosition(light.position[0], light.position[1], light.position[2], light.position[3]);
		this.lights[i].setAmbient(light.ambient[0], light.ambient[1], light.ambient[2], light.ambient[3]);
		this.lights[i].setDiffuse(light.diffuse[0], light.diffuse[1], light.diffuse[2], light.diffuse[3]);
		this.lights[i].setSpecular(light.specular[0], light.specular[1], light.specular[2], light.specular[3]);
		this.lights[i].setVisible(true);

		this.lights[i].update();
	 }
};

/**
* @function Initializes the scene's textures after the scene's graph is loaded
*/
XMLscene.prototype.initTexturesOnGraphLoaded = function () {

	var p="scenes/"+this.path.substring(0, this.path.lastIndexOf("/"))+"/";

  for(var key in this.graph.textures){
    if (this.graph.textures.hasOwnProperty(key)) {
      var texture = this.graph.textures[key];
      this.textures[key] = (new CGFtexture(this, p + texture.filepath));
      this.textures[key].ID = texture.tagId;
      this.textures[key].amplif_factor = {};
      this.textures[key].amplif_factor.s = texture.amplif_factor.s;
      this.textures[key].amplif_factor.t = texture.amplif_factor.t;
    }
	}
};

/**
* @function Initializes the scene's textures after the scene's graph is loaded
*/
XMLscene.prototype.initMaterialsOnGraphLoaded = function () {

	this.materials["_default_material_"] = (new CGFappearance(this));
	this.materials["_default_material_"].ID="_default_material_";
	this.materials["_default_material_"].shininess=10;
	this.materials["_default_material_"].setSpecular(0.5, 0.5, 0.5, 1);
	this.materials["_default_material_"].setDiffuse(0.5, 0.5, 0.5, 1);
	this.materials["_default_material_"].setAmbient(0.2, 0.2, 0.2, 1);
	this.materials["_default_material_"].setEmission(0.0, 0.0, 0.0, 1);

	this.parentMaterial=this.materials["_default_material_"];

  for(var key in this.graph.materials){
    if (this.graph.materials.hasOwnProperty(key)) {
      var material = this.graph.materials[key];
      this.materials[key] = (new CGFappearance(this));
  		this.materials[key].ID = material.tagId;
  		this.materials[key].shininess = material.shininess;
  		this.materials[key].setSpecular(material.specular[0],material.specular[1],material.specular[2],material.specular[3]);
  		this.materials[key].setDiffuse(material.diffuse[0],material.diffuse[1],material.diffuse[2],material.diffuse[3]);
  		this.materials[key].setAmbient(material.ambient[0],material.ambient[1],material.ambient[2],material.ambient[3]);
  		this.materials[key].setEmission(material.emission[0],material.emission[1],material.emission[2],material.emission[3]);
    }
	}
};

/**
*
*/
XMLscene.prototype.initAnimationsOnGraphLoaded = function (){
  for(var key in this.graph.animations){
    if (this.graph.animations.hasOwnProperty(key)) {
      var animation = this.graph.animations[key];
      switch(animation.typeOf){
        case "linear":
          this.animations[key] = new LinearAnimation(key, animation.span, animation.controlPoints);
          break;
        case "circular":
          this.animations[key] = new CircularAnimation(animation.span, animation.center, animation.radius, animation.startang, animation.rotang);
          break;
      }
    }
	}
};

/**
* @function Loads the scene's primitives after the scene's graph is loaded
*/
XMLscene.prototype.loadPrimitivesOnGraphLoaded = function () {

	for(var i=0; i<this.graph.leaves.length; i++){
		switch(this.graph.leaves[i].typeOf){
			case 'rectangle':
				this.primitives[this.graph.leaves[i].tagId] = new Rectangle(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.leftTopX, this.graph.leaves[i].primitive.leftTopY,
					this.graph.leaves[i].primitive.rightBottomX, this.graph.leaves[i].primitive.rightBottomY);
				break;
			case 'triangle':
				this.primitives[this.graph.leaves[i].tagId] = new Triangle(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.Point1[0], this.graph.leaves[i].primitive.Point1[1], this.graph.leaves[i].primitive.Point1[2],
					this.graph.leaves[i].primitive.Point2[0], this.graph.leaves[i].primitive.Point2[1], this.graph.leaves[i].primitive.Point2[2],
					this.graph.leaves[i].primitive.Point3[0], this.graph.leaves[i].primitive.Point3[1], this.graph.leaves[i].primitive.Point3[2]);
				break;
	      case 'cylinder':
	      		var l = this.graph.leaves[i];
	      		this.primitives[this.graph.leaves[i].tagId] = new Cylinder(this, l.tagId,
	      			l.primitive.heightC,
	      			l.primitive.bottomRadius,
	      			l.primitive.topRadius,
	      			l.primitive.stacks,
	      			l.primitive.slices);
	      		break;
			case 'sphere':
				this.primitives[this.graph.leaves[i].tagId] = new Sphere(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.radius,
					this.graph.leaves[i].primitive.partsAlongRadius,
					this.graph.leaves[i].primitive.partsPerSection);
				break;
			case 'plane':
				this.primitives[this.graph.leaves[i].tagId] = new Plane(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.parts,
					this.graph.leaves[i].primitive.parts);
				break;
			case 'patch':
				this.primitives[this.graph.leaves[i].tagId] = new Patch(this, this.graph.leaves[i].tagId,
					this.graph.leaves[i].primitive.order,
					this.graph.leaves[i].primitive.order,
					this.graph.leaves[i].primitive.partsU,
					this.graph.leaves[i].primitive.partsV,
					this.graph.leaves[i].primitive.controlPoints);
				break;
			case 'terrain':
				this.primitives[this.graph.leaves[i].tagId] = new Terrain(this, this.graph.leaves[i].tagId,
				this.textures[this.graph.leaves[i].primitive.texture],
				this.textures[this.graph.leaves[i].primitive.heightmap],
				this.vertexShader,
				this.fragmentShader);
				break;
			case 'vehicle':
				this.primitives[this.graph.leaves[i].tagId] = new Vehicle(this, this.graph.leaves[i].tagId,
				this.textures["stripes"],
				this.textures["flames"]);
				break;
		}
	}
};

/**
* @function Loads the scene's nodes after the scene's graph is loaded
*/
XMLscene.prototype.loadNodesOnGraphLoaded = function () {

	this.rootId = this.graph.root.tagId;

	for(var i=0; i<this.graph.nodes.length; i++){
		var nodeN = {};
    nodeN.aniIter = 0;
    nodeN.spanSum = 0;
		nodeN.ID=this.graph.nodes[i].tagId;
		nodeN.materialID=this.graph.nodes[i].materialID;
		nodeN.textureID=this.graph.nodes[i].TextureID;

    nodeN.animations = [];
    nodeN.lastTransformation = {};
    nodeN.animated = true;
    for (var j = 0; j < this.graph.nodes[i].animations.length; j++) {
      nodeN.animations.push(this.graph.nodes[i].animations[j]);
    }

		nodeN.matx = mat4.create();
		mat4.identity(nodeN.matx);

    nodeN.matxAni = mat4.create();
    mat4.identity(nodeN.matxAni);

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
					mat4.translate(nodeN.matx, nodeN.matx, this.graph.nodes[i].transformations[j].xyz);
					break;
				case 'rotation':
					transformationN.typeOf=this.graph.nodes[i].transformations[j].typeOf;
					transformationN.angle=this.graph.nodes[i].transformations[j].angle;
					transformationN.axis=this.graph.nodes[i].transformations[j].axisRot;

					switch(transformationN.axis){
						case "x":
							mat4.rotate(nodeN.matx, nodeN.matx, transformationN.angle * Math.PI / 180, [1, 0, 0]);
							break;
						case "y":
							mat4.rotate(nodeN.matx, nodeN.matx, transformationN.angle * Math.PI / 180, [0, 1, 0]);
							break;
						case "z":
							mat4.rotate(nodeN.matx, nodeN.matx, transformationN.angle * Math.PI / 180, [0, 0, 1]);
							break;
					}

					break;
				case 'scale':
					transformationN.typeOf=this.graph.nodes[i].transformations[j].typeOf;

					transformationN.xyz = [];
					for(var e=0; e<this.graph.nodes[i].transformations[j].xyz.length; e++){
						transformationN.xyz.push(this.graph.nodes[i].transformations[j].xyz[e]);
					}
					mat4.scale(nodeN.matx, nodeN.matx, this.graph.nodes[i].transformations[j].xyz);
					break;
			}

			nodeN.transformations.push(transformationN);
		}

		nodeN.descendants = [];
		for(var u=0; u<this.graph.nodes[i].children.length; u++){
			nodeN.descendants.push(this.graph.nodes[i].children[u]);
		}

		this.objects[nodeN.ID] = nodeN;
	}
};

/**
* @function Displays the scene's nodes
*/
XMLscene.prototype.nodesDisplay = function () {
			this.processNodeDisplay(this.root);
};

/**
* @function Processes the display of the nodes
* @param id The identification of the node to process
*/
XMLscene.prototype.processNodeDisplay = function (obj) {

	this.pushMatrix();

	var mat, matAnt;
	matAnt = this.parentMaterial;
	if(obj.materialID != 'null'){
    this.parentMaterial = this.materials[obj.materialID];
    mat = this.materials[obj.materialID];
	}else{
		mat = this.parentMaterial;
	}

	var tex, texAnt;
	texAnt = this.parentTexture;
	if(obj.textureID!='null' && obj.textureID!='clear'){
				this.parentTexture=this.textures[obj.textureID];
				tex = this.textures[obj.textureID];
	}else{
		if(obj.textureID=='null'){
			if(this.parentTexture!=null) tex=this.parentTexture;
		}
		if(obj.textureID=='clear'){
			this.parentTexture=null;
		}
	}

  //Multiply transformations matrix
  //this.multMatrix(obj.matxAni);
	this.multMatrix(obj.matx);

	for(var u=0; u < obj.descendants.length; u++){
		if(obj.descendants[u] in this.primitives ){
      this.processPrimitiveDisplay(this.primitives[ obj.descendants[u] ], mat, tex);
    }
		else{
      this.processNodeDisplay(this.objects[ obj.descendants[u] ] );
    }
	}

	this.parentMaterial = matAnt;
	this.parentTexture = texAnt;

	this.popMatrix();
};

/**
* @function Processes the display of the primitives
* @param id The identification of the primitive to process
* @param m The material of the primitive to process
* @param t The texture of the primitive to process
*/
XMLscene.prototype.processPrimitiveDisplay = function (obj, m, t) {

	m.apply();
	if(t!=null){
		if(obj.updatableTexCoords) obj.updateTexCoords(t.amplif_factor.s, t.amplif_factor.t);
		t.bind();
	}

	obj.display();
};
