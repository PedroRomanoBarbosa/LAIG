/**
* @constructs MySceneGraph constructor
* @param {string} filename Name of the .lsx file
* @param {XMLscene} scene Scene object
*/
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	this.counter = 0;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph = this;

	// File reading
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	 this.lights = [];
	 this.materials = {};
	 this.textures = {};
	 this.animations = {};

	 this.reader.open('scenes/' + filename, this);
	 this.ani = new Animation(this);
	 this.linearAni = new LinearAnimation(this);
	 this.ani.move();
	 this.linearAni.move();
	 console.log(this);
}


/**
 * @function Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() {
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	//Checks if SCENE tag exists
	if(rootElement.tagName != 'SCENE')
		this.onXMLError("<SCENE> tag does not exist.");

	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseScene(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk=true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();

};


/**
* @function Parses the .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseScene = function(rootElement) {
	this.parseInitials(rootElement);
	this.parseIllumination(rootElement);
	this.parseLights(rootElement);
	this.parseTextures(rootElement);
	this.parseMaterials(rootElement);
	this.parseAnimations(rootElement);
	this.parseLeafs(rootElement);
	this.parseNodes(rootElement);
};

/**
* @function Parses the INITIALS tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseInitials = function(rootElement) {
	this.IsTagUnique('INITIALS', rootElement);
	var initialsArray = this.getChildrenWithName('INITIALS',rootElement);
	var initials = initialsArray[0];

	//Parse frustum tag
	this.IsTagUnique('frustum', initials);
	this.near = this.parseFloat('frustum', initials, 'near');
	this.frustumFar = this.parseFloat('frustum', initials, 'far');

	//Check order of geometric transformations
	var order = ['translation', 'rotation', 'rotation', 'rotation', 'scale'];
	var itr = 0;
	for (var i = 0; i < initials.childNodes.length; i++) {
		var x = initials.childNodes[i].tagName;
		if(x == "translation" || x == "rotation" || x == "scale"){
			if(x != order[itr]){
				this.onXMLError("The geometric trasformations on the <INITIALS> tag are not in order. Order: translation, rotation, rotation, rotation, scale");
			}
			itr++;
			if(itr > 4)
				break;
		}
	}

	//Parse translate tag
	this.IsTagUnique('translation', initials);
	var translation = this.parseTranslation(this.getChildrenWithName('translation',initials)[0], initials);
	this.translateX = translation[0];
	this.translateY = translation[1];
	this.translateZ = translation[2];

	//Parse rotation tags
	var rotation = this.getChildrenWithName('rotation',initials);
	if(rotation.length != 3)
		this.onXMLError(" a <rotation> tag is missing or there are more than 3");
	//1
	var rotation1 = this.parseRotation(rotation[0], initials);
	this.rot1Axis = rotation1[0];
	this.rot1Angle = rotation1[1];
	//2
	var rotation2 = this.parseRotation(rotation[1], initials);
	this.rot2Axis = rotation2[0];
	this.rot2Angle = rotation2[1];
	//3
	var rotation3 = this.parseRotation(rotation[2], initials);
	this.rot3Axis = rotation3[0];
	this.rot3Angle = rotation3[1];

	//Parse scale tag
	this.IsTagUnique('scale', initials);
	var scale = this.parseScale(this.getChildrenWithName('scale',initials)[0], initials);
	this.scaleX = scale[0];
	this.scaleY = scale[1];
	this.scaleZ = scale[2];

	//Parse reference tag
	this.IsTagUnique('reference', initials);
	this.referenceLength = this.parseFloat('reference', initials, 'length');
}

/**
* @function Parses the ILLUMINATION tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseIllumination = function(rootElement) {
	var illumination = this.getChildrenWithName('ILLUMINATION',rootElement);
	if(illumination.length == 0)
		this.onXMLError("<ILLUMINATION> tag is missing.");
	if(illumination.length > 1)
		this.onXMLError("<ILLUMINATION> tag appears more than once.");

	//Parse ambient tag
	this.IsTagUnique('ambient', illumination[0]);
	this.ambientRGBA = this.parseRGBA('ambient', illumination[0]);

	//Parse background tag
	this.IsTagUnique('background', illumination[0]);
	this.backgroundRGBA = this.parseRGBA('background', illumination[0]);

}

/**
* @function Parses the LIGHTS tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseLights = function(rootElement) {
	var lightsTag = this.getChildrenWithName('LIGHTS',rootElement);
	if(lightsTag.length == 0)
		this.onXMLError("<LIGHTS> tag is missing");
	if(lightsTag.length > 1)
		this.onXMLError("<LIGHTS> tag appears more than once");

	//Parse lights
	lightsTagArray = this.getChildrenWithName('LIGHT',lightsTag[0]);
	if(lightsTagArray.length > 8)
		this.onXMLError("More than 8 lights defined in the LIGHTS tag");
	for (var i = 0; i < lightsTagArray.length; i++) {
		var id = this.reader.getString(lightsTagArray[i], "id", true);
		if(this.checkID(id, this.lights, []))
			this.onXMLError("Id: '" + id + "' duplicated in inside lights tag");
		else{
			this.parseLight(lightsTagArray[i]);
		}
	};
}

/**
* @function Parses a LIGHT tag in .lsx file and stores it's information in this class
* @param parent The parent element of the LIGHT tag. It should be a tag element with name 'LIGHTS'
*/
MySceneGraph.prototype.parseLight = function(parent){
	//Set id
	var light = { tagId:parent.id };

	//Parse enable value
	this.IsTagUnique('enable',parent);

	light.enable = this.parseBool('enable', 'value', parent);

	//Parse position tag
	this.IsTagUnique('position', parent);
	light.position = this.parseXYZW('position', parent);

	//Parse ambient tag
	this.IsTagUnique('ambient', parent);
	light.ambient = this.parseRGBA('ambient', parent);

	//Parse diffuse tag
	this.IsTagUnique('diffuse', parent);
	light.diffuse = this.parseRGBA('diffuse', parent);

	//Parse ambient tag
	this.IsTagUnique('specular', parent);
	light.specular = this.parseRGBA('specular', parent);

	//Add to array
	this.lights.push(light);
}

/**
* @function Parses the TEXTURES tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseTextures = function(rootElement) {
	var texturesTag = this.getChildrenWithName('TEXTURES',rootElement);
	if(texturesTag.length == 0)
		this.onXMLError("<TEXTURES> tag is missing.");
	if(texturesTag.length > 1)
		this.onXMLError("<TEXTURES> tag appears more than once.");

	//Parse textures
	texturesTagArray = this.getChildrenWithName('TEXTURE',texturesTag[0]);
	for (var i = 0; i < texturesTagArray.length; i++) {
		var id = this.reader.getString(texturesTagArray[i], "id", true);
		if(id in this.textures)
			this.onXMLError("Id: '" + id + "' duplicated in inside textures tag");
		else{
			this.parseTexture(texturesTagArray[i]);
		}
	};
}

/**
* @function Parses a TEXTURE tag in .lsx file and stores it's information in this class
* @param parent The parent element of the TEXTURE tag. It should be a tag element with name 'TEXTURES'
*/
MySceneGraph.prototype.parseTexture = function(parent){
	//Set id
	var texture = { tagId:parent.id };

	//Parse file tag
	this.IsTagUnique('file',parent);
	texture.filepath = this.parseString('file', parent, 'path');

	//Parse amplif_factor tag
	this.IsTagUnique('amplif_factor',parent);
	var amplif_factorTag = this.getChildrenWithName('amplif_factor',parent);
	texture.amplif_factor = {};
	texture.amplif_factor.s = this.parseFloat('amplif_factor',parent,'s');
	texture.amplif_factor.t = this.parseFloat('amplif_factor',parent,'t');

	//Add to array
	this.textures[texture.tagId] = texture;
}

/**
* @function Parses the MATERIALS tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseMaterials = function(rootElement) {
	var materialsTag = this.getChildrenWithName('MATERIALS',rootElement);
	if(materialsTag.length == 0)
		this.onXMLError("<MATERIALS> tag is missing.");
	if(materialsTag.length > 1)
		this.onXMLError("<MATERIALS> tag appears more than once.");

	//Parse materials
	materialsTagArray = this.getChildrenWithName('MATERIAL',materialsTag[0]);
	for (var i = 0; i < materialsTagArray.length; i++) {
		var id = this.reader.getString(materialsTagArray[i], "id", true);
		if(id in this.materials)
			this.onXMLError("Id: '" + id + "' duplicated in inside materials tag");
		else{
			this.parseMaterial(materialsTagArray[i]);
		}
	};
}

/**
* @function Parses a MATERIAL tag in .lsx file and stores it's information in this class
* @param parent The parent element of the MATERIAL tag. It should be a tag element with name 'MATERIALS'
*/
MySceneGraph.prototype.parseMaterial = function(parent){
	//Set id
	var material = { tagId:parent.id };

	//Parse shininess value
	this.IsTagUnique('shininess',parent);
	material.shininess = this.parseFloat('shininess', parent, 'value');

	//Parse specular
	this.IsTagUnique('specular', parent);
	material.specular = this.parseRGBA('specular', parent);

	//Parse diffuse
	this.IsTagUnique('diffuse', parent);
	material.diffuse = this.parseRGBA('diffuse', parent);

	//Parse ambient
	this.IsTagUnique('ambient', parent);
	material.ambient = this.parseRGBA('ambient', parent);

	//Parse emission
	this.IsTagUnique('emission', parent);
	material.emission = this.parseRGBA('emission', parent);

	//Add to array
	this.materials[material.tagId] = material;
}

/**
* @function Parses the animations tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseAnimations = function(rootElement) {
	var animationsTag = this.getChildrenWithName('animations',rootElement);
	if(animationsTag.length > 1)
		this.onXMLError("<animations> tag appears more than once.");
	if(animationsTag.length == 1){
		//Parse animations
		animationsTagArray = this.getChildrenWithName('animation',animationsTag[0]);
		for (var i = 0; i < animationsTagArray.length; i++) {
			var id = this.reader.getString(animationsTagArray[i], "id", true);
			if(id in this.animations)
				this.onXMLError("Id: '" + id + "' duplicated in inside animations tag");
			else{
				this.parseAnimation(animationsTagArray[i], animationsTag[0], id);
			}
		};
	}
}

/**
* @function Parses a animation tag in .lsx file and stores it's information in this class
* @param parent The parent element of the animation tag. It should be a tag element with name 'animations'
*/
MySceneGraph.prototype.parseAnimation = function(ani, parent, id){
	//Set id
	var animation = { tagId:id };

	//Set span
	animation.span= this.reader.getFloat(ani,'span',true);
	if( isNaN(animation.span) )
		this.onXMLError("span attribute in tag <animation> with id: " + ani.id +  " inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");

	//Set type
	animation.typeOf = this.reader.getString(ani,'type',true);
	if(animation.typeOf == 'linear'){
		//Parse control points
		animation.controlPoints = [];
		var controlPoints = this.getChildrenWithName('controlpoint', ani);
		for(var i = 0; i < controlPoints.length; i++){
			animation.controlPoints.push(this.parseXYZ(controlPoints[i],ani));
		}
	}else if(animation.typeOf == 'circular'){
		//parse center
		animation.center = [];
		var centerStr = this.reader.getString(ani,'center',true);
		var centerArray = centerStr.match(/\S+/g);
		if(centerArray.length != 3){
			this.onXMLError("center attribute on tag <'" + ani.tagName + "'> with id: " + ani.id + " inside <'" + parent.tagName + "'> with id " + parent.id + " doesn't have 3 values");
		}
		for (var i = 0; i < centerArray.length; i++) {
			var n = parseFloat(centerArray[i]);
			if(isNaN(n)){
				this.onXMLError("the value number:" + (i+1) +  " of center attribute on tag <'" + ani.tagName + "'> with id: " + ani.id + " inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
			}else{
				animation.center.push(n);
			}
		}
		//parse radius
		animation.radius = this.reader.getFloat(ani,'radius', true);
		if( isNaN(animation.radius) ){
			this.onXMLError("radius attribute in tag <animation> with id: " + ani.id +  " inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");
		}

		//parse startang
		animation.startang = this.reader.getFloat(ani,'startang', true);
		if( isNaN(animation.startang) ){
			this.onXMLError("startang attribute in tag <animation> with id: " + ani.id +  " inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");
		}

		//parse rotang
		animation.rotang = this.reader.getFloat(ani,'rotang', true);
		if( isNaN(animation.rotang) ){
			this.onXMLError("rotang attribute in tag <animation> with id: " + ani.id +  " inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");
		}

	}
	//Add to object
	this.animations[animation.tagId] = animation;
}

/**
* @function Parses the LEAFS tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseLeafs = function(rootElement) {
	var leavesTag = this.getChildrenWithName('LEAVES',rootElement);
	if(leavesTag.length == 0)
		this.onXMLError("<LEAVES> tag is missing.");
	if(leavesTag.length > 1)
		this.onXMLError("<LEAVES> tag appears more than once.");

	//Parse leafs
	leavesTagArray = this.getChildrenWithName('LEAF',leavesTag[0]);
	this.leaves = [];
	for (var i = 0; i < leavesTagArray.length; i++) {
		var id = this.reader.getString(leavesTagArray[i], "id", true);
		if(this.checkID(id,this.leaves,[]))
			this.onXMLError("Id: '" + id + "' duplicated inside leaves tag");
		else{
			this.parseLeaf(leavesTagArray[i]);
		}
	};
}

/**
* @function Parses a LEAF tag in .lsx file and stores it's information in this class
* @param parent The parent element of the LEAF tag. It should be a tag element with name 'LEAFS'
*/
MySceneGraph.prototype.parseLeaf = function(parent){
	var leaf = { tagId:parent.id };

	//Parse type
	leaf.typeOf = this.reader.getItem(parent, 'type', ['rectangle', 'cylinder', 'sphere', 'triangle'], true);
	var coordString = this.reader.getString(parent, 'args', true);
	switch(leaf.typeOf){
		case 'rectangle':
			leaf.primitive = this.parseRectangleCoord(coordString, parent);
			break;
		case 'cylinder':
			leaf.primitive = this.parseCylinderCoord(coordString, parent);
			break;
		case 'sphere':
			leaf.primitive = this.parseSphereCoord(coordString, parent);
			break;
		case 'triangle':
			leaf.primitive = this.parseTriangleCoord(coordString, parent);
			break;
		default:
			this.onXMLError("type of leaf not recognized.");

	}

	//Add to array
	this.leaves.push(leaf);
}

/**
* @function Parses the NODES tag in .lsx file and stores it's information in this class
* @param rootElement The root element of the .lsx file. It should be a tag element with name 'SCENE'
*/
MySceneGraph.prototype.parseNodes = function(rootElement) {
	var nodesTag = this.getChildrenWithName('NODES',rootElement);
	if(nodesTag.length == 0)
		this.onXMLError("<NODES> tag is missing.");
	if(nodesTag.length > 1)
		this.onXMLError("<NODES> tag appears more than once.");

	//Create nodes array
	this.nodes = [];

	//Parse nodes
	nodesTagArray = this.getChildrenWithName('NODE',nodesTag[0]);
	for (var i = 0; i < nodesTagArray.length; i++) {
		var id = this.reader.getString(nodesTagArray[i], "id", true);
		if(this.checkID(id,this.nodes,[])){
			this.onXMLError("Id: '" + id + "' duplicated in inside NODES tag");
		}else{
			this.parseNode(nodesTagArray[i], nodesTagArray);
		}
	};

	//Parse root
	this.IsTagUnique('ROOT', nodesTag[0]);
	this.parseRoot(rootElement);
}

/**
* @function Parses the ROOT tag in .lsx file and stores it's information in this class
* @param parent The parent element of the ROOT tag. It should be a tag element with name 'NODES'
*/
MySceneGraph.prototype.parseRoot = function(rootElement){
	var rootArray = rootElement.getElementsByTagName('ROOT');
	this.root = {};

	//Parse and check ID
	if(this.checkID(rootArray[0].id, this.nodes,[])){
		this.root.tagId = rootArray[0].id;
	}else{
		this.onXMLError("Id: '" + rootArray[0].id + "' referenced in root tag doesn't exist in NODES tag");
	}
}

/**
* @function Parses a NODE tag in .lsx file and stores it's information in this class
* @param parent The parent element of the NODE tag. It should be a tag element with name 'NODES'
*/
MySceneGraph.prototype.parseNode = function(rootElement, nodesArray){
	var node = {};
	node.children = [];

	//Parse and check ID
	if(this.checkID(rootElement.id, this.nodes,[])){
		this.onXMLError("Id: '" + rootElement.id + "' duplicated inside NODES tag");
	}else{
		node.tagId = rootElement.id;
		this.nodes.push(node);
	}

	//Parse Material
	this.IsTagUnique('MATERIAL', rootElement);
	this.existsIDInObject('MATERIAL', rootElement, this.materials, ["null"]);
	node.materialID = this.parseString('MATERIAL', rootElement, 'id');

	//Parse Texture
	this.IsTagUnique('TEXTURE', rootElement);
	this.existsIDInObject('TEXTURE', rootElement, this.textures, ["null", "clear"]);
	node.TextureID = this.parseString('TEXTURE', rootElement, 'id');


	//Parse Geometric Transformations
	var geoTransformsTag = [];
	node.transformations = [];
	geoTransformsTag = rootElement.childNodes;
	for (var i = 0; i < geoTransformsTag.length; i++) {
		switch(geoTransformsTag[i].tagName){
			case 'TRANSLATION':
				var translation = {};
				translation.typeOf = 'translation';
				translation.xyz = this.parseTranslation(geoTransformsTag[i], rootElement);
				node.transformations.push(translation);
				break;
			case 'ROTATION':
				var rotation = {};
				rotation.typeOf = 'rotation';
				var arrayRot = this.parseRotation(geoTransformsTag[i], rootElement);
				rotation.axisRot = arrayRot[0];
				rotation.angle = arrayRot[1];
				node.transformations.push(rotation);
				break;
			case 'SCALE':
				var scale = {};
				scale.typeOf = 'scale';
				scale.xyz = this.parseScale(geoTransformsTag[i], rootElement);
				node.transformations.push(scale);
				break;
		}
	};

	//Parse descendants
	this.IsTagUnique('DESCENDANTS', rootElement);
	var descendantsTag = this.getChildrenWithName('DESCENDANTS',rootElement);
	var descendants = this.getChildrenWithName('DESCENDANT',descendantsTag[0]);
	if(descendants.length == 0){
		this.onXMLError("The node with tag '" + rootElement.tagName + "' with id '" + rootElement.id + "' doesn't have any children node or leaf");
	}else{
		for (var i = 0; i < descendants.length; i++) {
			if( !this.checkIDother(descendants[i].id, nodesArray) && !this.checkID(descendants[i].id, this.leaves,[])){
				this.onXMLError("The node with tag '" + rootElement.tagName + "' with id '" + rootElement.id + "' has a children node or leaf that doesn't exist");
			}else{
				node.children.push(descendants[i].id);
			}
		};
	}
}

/*
*	Helping functions
*/

/**
* @function Get only the direct children of a tag element in the .lsx file with a certain name
* @param parent The parent element.
* @param {string} tagName The name of the children tags to search
* @returns {Array} The array of the direct children
*/
MySceneGraph.prototype.getOnlyChildsWithName = function(parent, tagName){
	var children = [];
	for (var i = 0; i < parent.childNodes.length; i++) {
		if(parent.childNodes[i].tagName == tagName){
			children.push(parent.childNodes[i]);
		}
	};
	return children;
}

/**
* @function Checks if an Id is already in an array or if the new ID is accepted from a set of values
* @param {string} newId The new ID to test
* @param {Array} array The array to search the ID on
* @param {Array} accepted The array with the accepted values for the newId
* @returns {Boolean} True if the Id matches and false if it doesn't
*/
MySceneGraph.prototype.checkID = function(newId, array, accepted){
	for (var i = 0; i < accepted.length; i++) {
			if(accepted[i] == newId){
				return true;
		}
	};
	for (var i = 0; i < array.length; i++) {
		if(array[i].tagId == newId){
			return true;
		}
	};
	return false;
}

/**
* @function Checks if an Id is already in an object or if the new ID is accepted from a set of values
* @param {string} newId The new ID to test
* @param {Array} array The array to search the ID on
* @param {Array} accepted The array with the accepted values for the newId
* @returns {Boolean} True if the Id matches and false if it doesn't
*/
MySceneGraph.prototype.checkIDInObject = function(newId, object, accepted){
	for (var i = 0; i < accepted.length; i++) {
			if(accepted[i] == newId){
				return true;
		}
	};
	if(newId in object)
		return true;
	return false;
}

/**
* @function Checks if an Id is already in an array
* @param {string} newId The new ID to test
* @param {Array} array The array to search the ID on
* @returns {Boolean} True if the Id matches and false if it doesn't
*/
MySceneGraph.prototype.checkIDother = function(newId, array){
	for (var i = 0; i < array.length; i++) {
		if(array[i].id == newId){
			return true;
		}
	};
	return false;
}

/**
* @function Parses a a tag with this configuration: <NAME x="ff" y="ff" z="ff">. Example: TRANSLATION or translation tags
* @param tag The tag element to parse
* @param parent The parent tag of the tag to parse
* @returns {Array}o Array of the translation values with this configuration: [x,y,z]
*/
MySceneGraph.prototype.parseTranslation = function(tag, parent){
	var x = this.reader.getFloat(tag,'x',true);
	if(isNaN(x)){
		this.onXMLError("'x' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var y = this.reader.getFloat(tag,'y',true);
	if(isNaN(y)){
		this.onXMLError("'y' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var z = this.reader.getFloat(tag,'z',true);
	if(isNaN(z)){
		this.onXMLError("'z' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [x,y,z];
}

/**
* @function Parses a a tag with this configuration: <NAME axis="cc" angle="ff">. Example: ROTATION or rotation tags
* @param tag The tag element to parse
* @param parent The parent tag of the tag to parse
* @returns {Array} Array of the rotation values with this configuration: [axis,angle]
*/
MySceneGraph.prototype.parseRotation = function(tag, parent){
	var axis = this.reader.getString(tag, 'axis', true);
	if(axis != 'x' && axis != 'y' && axis != 'z')
		this.onXMLError("'axis' attribute in tag '" + tag.tagName + "' inside tag '" + parent.tagName + "' with id '" + parent.id + "' is not 'x', 'y' or 'z'");
	var angle = this.reader.getFloat(tag, 'angle', true);
	if(isNaN(angle))
		this.onXMLError("'angle' attribute in tag '" + tag.tagName + "' inside tag '" + parent.tagName + "' with id '" + parent.id + "' is not a float");
	return [axis,angle];
}

/**
* @function Parses a a tag with this configuration: <NAME sx="ff" sy="ff" sz="ff">. Example: SCALE or scale tags
* @param tag The tag element to parse
* @param parent The parent tag of the tag to parse
* @returns {Array} Array of the scale values with this configuration: [sx,sy,sz]
*/
MySceneGraph.prototype.parseScale = function(tag, element){
	var sx = this.reader.getFloat(tag,'sx',true);
	if(isNaN(sx)){
		this.onXMLError("'sx' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var sy = this.reader.getFloat(tag,'sy',true);
	if(isNaN(sy)){
		this.onXMLError("'sy' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var sz = this.reader.getFloat(tag,'sz',true);
	if(isNaN(sz)){
		this.onXMLError("'sz' attribute on tag <'" + tag.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [sx,sy,sz];
}

/**
* @function Parses a a boolean tag attribute with this configuration: <NAME ... name="tt">.
* @param {string} element The element tag name of the tag to parse
* @param {string} attribute The attribute name on the tag to parse
* @param parent The tag element's parent
* @returns  {Boolean} the boolean value
*/
MySceneGraph.prototype.parseBool = function(element, attribute, parent){
	var tags = this.getChildrenWithName(element,parent);
	var bool = this.reader.getFloat(tags[0],attribute,true);
		if( (bool != 1 && bool != 0) || !Number.isInteger(bool) ){
			this.onXMLError("The attribute '" + attribute + "'  on tag '" + element + "' inside '" + parent.tagName + "' tag with the id '" + parent.id + "' it's not 0 nor 1.");
		}
	return bool;
}

/**
* @function Parses a a tag with this configuration: <NAME r="ff" g="ff" b="ff" a="ff">.
* @param {string} rgbaElement The tag element's name to parse
* @param parent The parent tag of the tag to parse
* @returns {Array} Array of the rgba values with this configuration: [r,g,b,a]
*/
MySceneGraph.prototype.parseRGBA = function(rgbaElement, parent){
	var tags = this.getChildrenWithName(rgbaElement,parent);
	var r = this.reader.getFloat(tags[0],'r',true);
	if(isNaN(r)){
		this.onXMLError("'r' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}else if (r < 0 || r > 1 ) {
		console.warn("The value of 'r' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not inside the accepted range(0-1). If its lesser than 0 it will be converted to zero. If its higher than 1 it will be converted to 1");
	}
	var g = this.reader.getFloat(tags[0],'g',true);
	if(isNaN(g)){
		this.onXMLError("'g' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}else if (g < 0 || g > 1 ) {
		console.warn("The value of 'g' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not inside the accepted range(0-1). If its lesser than 0 it will be converted to zero. If its higher than 1 it will be converted to 1");
	}
	var b = this.reader.getFloat(tags[0],'b',true);
	if(isNaN(b)){
		this.onXMLError("'b' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}else if (b < 0 || b > 1 ) {
		console.warn("The value of 'b' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not inside the accepted range(0-1). If its lesser than 0 it will be converted to zero. If its higher than 1 it will be converted to 1");
	}
	var a = this.reader.getFloat(tags[0],'a',true);
	if(isNaN(a)){
		this.onXMLError("'a' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}else if (a < 0 || a > 1 ) {
		console.warn("The value of 'a' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not inside the accepted range(0-1). If its lesser than 0 it will be converted to zero. If its higher than 1 it will be converted to 1");
	}
	return [r,g,b,a];
}

/**
* @function Parses a a tag with this configuration: <NAME x="ff" y="ff" z="ff" w="ff">.
* @param {string} rgbaElement The tag element's name to parse
* @param parent The parent tag of the tag to parse
* @returns {Array} Array of the rgba values with this configuration: [x,y,z,w]
*/
MySceneGraph.prototype.parseXYZW = function(xyzwElement, parent){
	var tags = this.getChildrenWithName(xyzwElement,parent);
	var x = this.reader.getFloat(tags[0],'x',true);
	if(isNaN(x)){
		this.onXMLError("'x' attribute on tag <'" + xyzwElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var y = this.reader.getFloat(tags[0],'y',true);
	if(isNaN(y)){
		this.onXMLError("'y' attribute on tag <'" + xyzwElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var z = this.reader.getFloat(tags[0],'z',true);
	if(isNaN(z)){
		this.onXMLError("'z' attribute on tag <'" + xyzwElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var w = this.reader.getFloat(tags[0],'w',true);
	if(isNaN(w)){
		this.onXMLError("'w' attribute on tag <'" + xyzwElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [x,y,z,w];
}

/**
* @function Parses a a tag with this configuration: <NAME xx="ff" yy="ff" zz="ff" ww="ff">.
* @param {string} rgbaElement The tag element's name to parse
* @param parent The parent tag of the tag to parse
* @returns {Array} Array of the rgba values with this configuration: [x,y,z,w]
*/
MySceneGraph.prototype.parseXYZ = function(xyzElement, parent){
	var x = this.reader.getFloat(xyzElement,'xx',true);
	if(isNaN(x)){
		this.onXMLError("'xx' attribute on tag <'" + xyzElement.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var y = this.reader.getFloat(xyzElement,'yy',true);
	if(isNaN(y)){
		this.onXMLError("'yy' attribute on tag <'" + xyzElement.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var z = this.reader.getFloat(xyzElement,'zz',true);
	if(isNaN(z)){
		this.onXMLError("'zz' attribute on tag <'" + xyzElement.tagName + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [x,y,z];
}

/**
* @function Parses a a string tag attribute with this configuration: <NAME ... name="ss">.
* @param {string} stringElement The element tag name of the tag to parse
* @param {string} attribute The attribute name on the tag to parse
* @param parent The tag element's parent
* @returns  {string} the string
*/
MySceneGraph.prototype.parseString = function(stringElement, parent, attribute){
	var tags = this.getChildrenWithName(stringElement,parent);
	return this.reader.getString(tags[0], attribute, true);
}

/**
* @function Parses a a string tag attribute with this configuration: <NAME ... name="ss">.
* @param {string} element The element tag name of the tag to parse
* @param {string} attribute The attribute name on the tag to parse
* @param parent The tag element's parent
* @returns  {Float} the float value
*/
MySceneGraph.prototype.parseFloat = function(element, parent, attribute){
	var tags = this.getChildrenWithName(element,parent);
	var x = this.reader.getFloat(tags[0],attribute,true);
	if( isNaN(x) )
		this.onXMLError(attribute + " attribute in tag <" + element + "> with id: " + tags[0].id +  " inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");
	return x;
}

/**
* @function Checks if a determined tag is unique from the direct children of the parent tag
* @param {string} tag The tag name
* @param parent The aparent of the tag to check
* @returns  {Boolean} True if is unique, false if it isn't
*/
MySceneGraph.prototype.IsTagUnique = function(tag, parent){
	var tags = this.getChildrenWithName(tag,parent);
	if(tags.length != 1)
		this.onXMLError("<'" + tag + "'> tag inside <'" + parent.tagName + "'> with id '" + parent.id + "' is missing or appears more than once");
}

/**
* @function Checks if an Id is already in an array or if the new ID is accepted from a set of values
* @param {string} newId The new ID to test
* @param {Array} array The array to search the ID on
* @param {Array} accepted The array with the accepted values for the newId
* @param parent The parent of the tag to test
* @returns {Boolean} True if the Id exists and false if it doesn't
*/
MySceneGraph.prototype.existsID = function(tag, parent, array, accepted){
	var tags = this.getChildrenWithName(tag,parent);
	if(!this.checkID(tags[0].id, array, accepted)){
		this.onXMLError("The id '" + tags[0].id + "' in tag '" + tag + "' inside tag '" + parent.tagName + "' with  id '" + parent.id + "' references a non-existant id or doesn't match the options");
	}
}

/**
* @function Checks if an Id is already in an object or if the new ID is accepted from a set of values
* @param {string} newId The new ID to test
* @param {Array} array The array to search the ID on
* @param {Array} accepted The array with the accepted values for the newId
* @param parent The parent of the tag to test
* @returns {Boolean} True if the Id exists and false if it doesn't
*/
MySceneGraph.prototype.existsIDInObject = function(tag, parent, object, accepted){
	var tags = this.getChildrenWithName(tag,parent);
	if(!this.checkIDInObject(tags[0].id, object, accepted)){
		this.onXMLError("The id '" + tags[0].id + "' in tag '" + tag + "' inside tag '" + parent.tagName + "' with  id '" + parent.id + "' references a non-existant id or doesn't match the options");
	}
}

/**
* @function Get only the direct children of a tag element in the .lsx file
* @param parent The parent element.
* @param {Array} array The array with all the children of the parent node
* @returns {Array} The array of the direct children
*/
MySceneGraph.prototype.getOnlyChilds = function(array,parent){
	var newArray = [];
	for (var i = 0; i < array.length; i++) {
			if (array[i].parentNode === parent){
				newArray.push(array[i]);
			}
	};
	return newArray;
}

/**
* @function Get only the direct children of a tag element in the .lsx file by its tag name
* @param parent The parent element.
* @param {string} tagName The name of the tag to search
* @returns {Array} The array of the resulting children
*/
MySceneGraph.prototype.getChildrenWithName = function(tagName,parent){
	var array = [];
	for(var i = 0; i < parent.childNodes.length; i++){
		if(parent.childNodes[i].tagName === tagName)
			array.push(parent.childNodes[i]);
	}
	return array;
}

/**
* @function Parses a string with this configuration "ff ff ff ff". Variable number os spaces between values
* @param {string} s The string to parse
* @param parent The parent of the tag
* @returns The rectangle object formed by the coordinates parsed from the string
*/
MySceneGraph.prototype.parseRectangleCoord = function(s, parent){
	var rectangle = {};
	var coordArray = s.match(/\S+/g);
	if(coordArray.length != 4){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 4. format:'ff ff ff ff'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(isNaN(n)){
			this.onXMLError("The value number:" + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
		}else{
			switch(i){
				case 0:
					rectangle.leftTopX = n;
					break;
				case 1:
					rectangle.leftTopY = n;
					break;
				case 2:
					rectangle.rightBottomX = n;
					break;
				case 3:
					rectangle.rightBottomY = n;
					break;
			}
		}
	}
	return rectangle;
}

/**
* @function Parses a string with this configuration "ff ff ff ii ii". Variable number os spaces between values
* @param {string} s The string to parse
* @param parent The parent of the tag
* @returns The cylinder object formed by the coordinates parsed from the string
*/
MySceneGraph.prototype.parseCylinderCoord = function(s, parent){
	var cylinder = {};
	var error = false;
	var coordArray = s.match(/\S+/g);
	if(coordArray.length != 5){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 5. format:'ff ff ff ii ii'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(i < 3){
			if(isNaN(n)){
				error = true;
				this.onXMLError("The value number: " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
			}
		}else if(i >= 3){
			if(!this.isInteger(n)){
				error = true;
				this.onXMLError("The value number: " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not an integer.");
			}
		}
		if(!error){
			switch(i){
				case 0:
					cylinder.heightC = n;
					break;
				case 1:
					cylinder.bottomRadius = n;
					break;
				case 2:
					cylinder.topRadius = n;
					break;
				case 3:
					cylinder.stacks = parseInt(n,10);
					break;
				case 4:
					cylinder.slices = parseInt(n,10);
					break;
			}
		}
	}
	return cylinder;
}

/**
* @function Parses a string with this configuration "ff ii ii". Variable number os spaces between values
* @param {string} s The string to parse
* @param parent The parent of the tag
* @returns The sphere object formed by the coordinates parsed from the string
*/
MySceneGraph.prototype.parseSphereCoord = function(s, parent){
	var sphere = {};
	var error = false;
	var coordArray = s.match(/\S+/g);
	if(coordArray.length != 3){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 3. format:'ff ii ii'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(i < 1){
			if(isNaN(n)){
				error = true;
				this.onXMLError("The value number: " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
			}
		}else if(i >= 1){
			if(!this.isInteger(n)){
				error = true;
				this.onXMLError("The value number: " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not an integer.");
			}
		}
		if(!error){
			switch(i){
				case 0:
					sphere.radius = n;
					break;
				case 1:
					sphere.partsAlongRadius = n;
					break;
				case 2:
					sphere.partsPerSection = n;
					break;
			}
		}
	}
	return sphere;
}

/**
* @function Parses a string with this configuration "ff ff ff  ff ff ff  ff ff ff". Variable number os spaces between values
* @param {string} s The string to parse
* @param parent The parent of the tag
* @returns The triangle object formed by the coordinates parsed from the string
*/
MySceneGraph.prototype.parseTriangleCoord = function(s){
	var triangle = {};
	triangle.Point1 = [];
	triangle.Point2 = [];
	triangle.Point3 = [];
	coordArray = s.match(/\S+/g);
	if(coordArray.length != 9){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 9. format:'ff ff ff  ff ff ff  ff ff ff'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(isNaN(n)){
			this.onXMLError("The value number: " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
		}else{
			if(i < 3){
				triangle.Point1.push(n);
			}else if(i > 2 && i < 6){
				triangle.Point2.push(n);
			}else if(i > 5){
				triangle.Point3.push(n);
			}
		}
	}
	return triangle;
}

/**
* @function Checks if a variable is an integer
* @param x The variable to check
* @returns {Boolean} True if the variable is an integer, false if otherwise
*/
MySceneGraph.prototype.isInteger = function(x){
	var flag = (typeof x === 'number') && (x % 1 === 0);
    return flag;
}

/**
 * @function Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: " + message);
	this.loadedOk=false;
	throw "error";
};
