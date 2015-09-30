
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
	 
	this.reader.open('scenes/'+filename, this);
}


/*
 * Callback to be executed after successful reading
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
	console.log(this);
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};


/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseScene = function(rootElement) {
	this.parseInitials(rootElement);
	this.parseIllumination(rootElement);
	this.parseLights(rootElement);
	this.parseTextures(rootElement);
	this.parseMaterials(rootElement);
	this.parseLeafs(rootElement);
	this.parseNodes(rootElement);
};

MySceneGraph.prototype.parseInitials = function(rootElement) {
	var initialsArray = this.getOnlyChilds(rootElement.getElementsByTagName('INITIALS'), rootElement);
	if(initialsArray.length == 0)
		this.onXMLError("<INITIALS> tag is missing.");
	if(initialsArray.length > 1)
		this.onXMLError("<INITIALS> tag appears more than once.");
	var initials = initialsArray[0];

	//Parse frustum tag
	var frustum = initials.getElementsByTagName('frustum');
	if(frustum.length != 1)
		this.onXMLError("<frustum> tag is missing or appears more than once");
	this.near = this.reader.getFloat(frustum[0],'near',true);
	if(isNaN(this.near))
		this.onXMLError("near attribute is not a float.");
	this.frustumFar = this.reader.getFloat(frustum[0],'far',true);
	if(isNaN(this.frustumFar))
		this.onXMLError("far attribute is not a float.");

	//Parse translate tag
	var translate = initials.getElementsByTagName('translate');
	if(translate.length != 1)
		this.onXMLError("<translate> tag is missing or appears more than once");
	this.translateX = this.reader.getFloat(translate[0], 'x', true);
	this.translateY = this.reader.getFloat(translate[0], 'y', true);
	this.translateZ = this.reader.getFloat(translate[0], 'z', true);
	if(isNaN(this.translateX))
		this.onXMLError("x attribute is not a float.");
	if(isNaN(this.translateY))
		this.onXMLError("y attribute is not a float.");
	if(isNaN(this.translateZ))
		this.onXMLError("z attribute is not a float.");

	//Parse rotation tags
	var rotation = initials.getElementsByTagName('rotation');
	if(rotation.length != 3)
		this.onXMLError(" a <rotation> tag is missing or there are more than 3");
	//1
	this.rot1Axis = this.reader.getString(rotation[0], 'axis', true);
	this.rot1Angle = this.reader.getFloat(rotation[0], 'angle', true);
	if(this.rot1Axis != 'x' && this.rot1Axis != 'y' && this.rot1Axis != 'z')
		this.onXMLError("axis attribute in rotation nº1 is not 'x', 'y' or 'z'");
	if(isNaN(this.rot1Angle))
		this.onXMLError("angle attribute in rotation nº1 is not a float.");
	//2
	this.rot2Axis = this.reader.getString(rotation[1], 'axis', true);
	this.rot2Angle = this.reader.getFloat(rotation[1], 'angle', true);
	if(this.rot2Axis != 'x' && this.rot2Axis != 'y' && this.rot2Axis != 'z')
		this.onXMLError("axis attribute in rotation nº2 is not 'x', 'y' or 'z'");
	if(isNaN(this.rot2Angle))
		this.onXMLError("angle attribute in rotation nº2 is not a float.");
	//3
	this.rot3Axis = this.reader.getString(rotation[2], 'axis', true);
	this.rot3Angle = this.reader.getFloat(rotation[2], 'angle', true);
	if(this.rot3Axis != 'x' && this.rot3Axis != 'y' && this.rot3Axis != 'z')
		this.onXMLError("axis attribute in rotation nº3 is not 'x', 'y' or 'z'");
	if(isNaN(this.rot3Angle))
		this.onXMLError("angle attribute in rotation nº3 is not a float.");

	//Parse scale tag
	var scale = initials.getElementsByTagName('scale');
	if(scale.length != 1)
		this.onXMLError("<scale> tag is missing or appears more than once");
	this.scaleX = this.reader.getFloat(scale[0], 'sx', true);
	this.scaleY = this.reader.getFloat(scale[0], 'sy', true);
	this.scaleZ = this.reader.getFloat(scale[0], 'sz', true);
	if(isNaN(this.scaleX))
		this.onXMLError("x attribute in scale tag is not a float.");
	if(isNaN(this.scaleY))
		this.onXMLError("y attribute in scale tag is not a float.");
	if(isNaN(this.scaleZ))
		this.onXMLError("z attribute in scale tag is not a float.");

	//Parse reference tag
	var reference = initials.getElementsByTagName('reference');
	if(reference.length != 1)
		this.onXMLError("<reference> tag is missing or appears more than once");
	this.referenceLength = this.reader.getFloat(reference[0], 'length', true);
	if(isNaN(this.referenceLength))
		this.onXMLError("length attribute reference tag is not a float.");
}

MySceneGraph.prototype.parseIllumination = function(rootElement) {
	var illumination = rootElement.getElementsByTagName('ILLUMINATION');
	if(illumination.length == 0)
		this.onXMLError("<ILLUMINATION> tag is missing.");
	if(illumination.length > 1)
		this.onXMLError("<ILLUMINATION> tag appears more than once.");

	//Parse ambient tag
	this.ambientRGBA = [];
	var ambient = illumination[0].getElementsByTagName('ambient');
	if(ambient.length != 1)
		this.onXMLError("<ambient> tag is missing or appears more than once");
	this.ambientRGBA[0] = this.reader.getFloat(ambient[0],'r',true);
	if(isNaN(this.ambientRGBA[0]))
		this.onXMLError("'r' attribute value in ambient tag is not a float.");
	this.ambientRGBA[1] = this.reader.getFloat(ambient[0],'g',true);
	if(isNaN(this.ambientRGBA[1]))
		this.onXMLError("'g' attribute value in ambient tag is not a float.");
	this.ambientRGBA[2] = this.reader.getFloat(ambient[0],'g',true);
	if(isNaN(this.ambientRGBA[2]))
		this.onXMLError("'b' attribute value in ambient tag is not a float.");
	this.ambientRGBA[3] = this.reader.getFloat(ambient[0],'a',true);
	if(isNaN(this.ambientRGBA[3]))
		this.onXMLError("'a' attribute value in ambient tag is not a float.");

	//Parse doubleside tag
	var doubleside = illumination[0].getElementsByTagName('doubleside');
	if(doubleside.length != 1)
		this.onXMLError("<doubleside> tag is missing or appears more than once");
	this.doublesideValue = this.reader.getFloat(doubleside[0],'value',true);
	if(isNaN(this.doublesideValue))
		this.onXMLError("'value' attribute value in doubleside tag is not a float.");

	//Parse background tag
	this.backgroundRGBA = [];
	var background = illumination[0].getElementsByTagName('background');
	if(background.length != 1)
		this.onXMLError("<background> tag is missing or appears more than once");
	this.backgroundRGBA[0] = this.reader.getFloat(background[0],'r',true);
	if(isNaN(this.backgroundRGBA[0]))
		this.onXMLError("'r' attribute value in background tag is not a float.");
	this.backgroundRGBA[1] = this.reader.getFloat(background[0],'g',true);
	if(isNaN(this.backgroundRGBA[1]))
		this.onXMLError("'g' attribute value in background tag is not a float.");
	this.backgroundRGBA[2] = this.reader.getFloat(background[0],'g',true);
	if(isNaN(this.backgroundRGBA[2]))
		this.onXMLError("'b' attribute value in background tag is not a float.");
	this.backgroundRGBA[3] = this.reader.getFloat(background[0],'a',true);
	if(isNaN(this.backgroundRGBA[3]))
		this.onXMLError("'a' attribute value in background tag is not a float.");
}

MySceneGraph.prototype.parseLights = function(rootElement) {
	var lightsTag = rootElement.getElementsByTagName('LIGHTS');
	if(lightsTag.length == 0)
		this.onXMLError("<LIGHTS> tag is missing");
	if(lightsTag.length > 1)
		this.onXMLError("<LIGHTS> tag appears more than once");

	//Parse lights
	lightsTagArray = lightsTag[0].getElementsByTagName('LIGHT');
	this.lights = [];
	for (var i = 0; i < lightsTagArray.length; i++) {
		var id = this.reader.getString(lightsTagArray[i], "id", true);
		if(this.checkID(id,this.lights))
			this.onXMLError("Id: '" + id + "' duplicated in inside lights tag");  
		else{
			this.parseLight(lightsTagArray[i]);
		}
	};
}

MySceneGraph.prototype.parseLight = function(parent){
	//Set id
	var light = { tagId:parent.id };

	//Parse enable value
	var enableTags = parent.getElementsByTagName('enable');
	this.IsTagUnique('enable',parent);
	light.enable = this.reader.getFloat(enableTags[0],'value',true);
	if(!light.enable == null){
		if(light.enable != 1 && light.enable != 0){
			this.onXMLError("enable value on <enable> tag on light with the id '" + parent.id + "' it's not 0 nor 1.");
		}
	}

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

MySceneGraph.prototype.parseTextures = function(rootElement) {
	var texturesTag = this.getOnlyChilds(rootElement.getElementsByTagName('TEXTURES'), rootElement);
	if(texturesTag.length == 0)
		this.onXMLError("<TEXTURES> tag is missing.");
	if(texturesTag.length > 1)
		this.onXMLError("<TEXTURES> tag appears more than once.");

	//Parse textures
	texturesTagArray = texturesTag[0].getElementsByTagName('TEXTURE');
	this.textures = [];
	for (var i = 0; i < texturesTagArray.length; i++) {
		var id = this.reader.getString(texturesTagArray[i], "id", true);
		if(this.checkID(id,this.textures))
			this.onXMLError("Id: '" + id + "' duplicated in inside textures tag");  
		else{
			this.parseTexture(texturesTagArray[i]);
		}
	};
}

MySceneGraph.prototype.parseTexture = function(parent){
	//Set id
	var texture = { tagId:parent.id };

	//Parse file tag
	this.IsTagUnique('file',parent);
	texture.filepath = this.parseString('file', parent, 'path');

	//Parse amplif_factor tag
	this.IsTagUnique('amplif_factor',parent);
	var amplif_factorTag = parent.getElementsByTagName('amplif_factor');
	texture.amplif_factor = {};
	texture.amplif_factor.s = this.parseFloat('amplif_factor',parent,'s');
	texture.amplif_factor.t = this.parseFloat('amplif_factor',parent,'t');

	//Add to array
	this.textures.push(texture);
}

MySceneGraph.prototype.parseMaterials = function(rootElement) {
	var materialsTag = rootElement.getElementsByTagName('MATERIALS');
	if(materialsTag.length == 0)
		this.onXMLError("<MATERIALS> tag is missing.");
	if(materialsTag.length > 1)
		this.onXMLError("<MATERIALS> tag appears more than once.");

	//Parse materials
	materialsTagArray = materialsTag[0].getElementsByTagName('MATERIAL');
	this.materials = [];
	for (var i = 0; i < materialsTagArray.length; i++) {
		var id = this.reader.getString(materialsTagArray[i], "id", true);
		if(this.checkID(id,this.materials))
			this.onXMLError("Id: '" + id + "' duplicated in inside materials tag");  
		else{
			this.parseMaterial(materialsTagArray[i]);
		}
	};
}

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
	this.materials.push(material);
}

MySceneGraph.prototype.parseLeafs = function(rootElement) {
	var leavesTag = rootElement.getElementsByTagName('LEAVES');
	if(leavesTag.length == 0)
		this.onXMLError("<LEAVES> tag is missing.");
	if(leavesTag.length > 1)
		this.onXMLError("<LEAVES> tag appears more than once.");

	//Parse leafs
	leavesTagArray = leavesTag[0].getElementsByTagName('LEAF');
	this.leaves = [];
	for (var i = 0; i < leavesTagArray.length; i++) {
		var id = this.reader.getString(leavesTagArray[i], "id", true);
		if(this.checkID(id,this.leaves))
			this.onXMLError("Id: '" + id + "' duplicated inside leaves tag");  
		else{
			this.parseLeaf(leavesTagArray[i]);
		}
	};
}

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

MySceneGraph.prototype.parseNodes = function(rootElement) {
	var nodes = rootElement.getElementsByTagName('NODES');
	if(nodes.length == 0)
		this.onXMLError("<NODES> tag is missing.");
	if(nodes.length > 1)
		this.onXMLError("<NODES> tag appears more than once.");
}


/*
 *	Helping functions
 */

/* Checks if an Id is already in an array */
MySceneGraph.prototype.checkID = function(newId, array){
	for (var i = 0; i < array.length; i++) {
		if(array[i].tagId == newId){
			return true;
		}
	};
	return false;
}

MySceneGraph.prototype.parseRGBA = function(rgbaElement, parent){
	var tags = parent.getElementsByTagName(rgbaElement);
	var r = this.reader.getFloat(tags[0],'r',true);
	if(isNaN(r)){
		this.onXMLError("'r' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var g = this.reader.getFloat(tags[0],'g',true);
	if(isNaN(g)){
		this.onXMLError("'g' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var b = this.reader.getFloat(tags[0],'b',true);
	if(isNaN(b)){
		this.onXMLError("'b' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var a = this.reader.getFloat(tags[0],'a',true);
	if(isNaN(a)){
		this.onXMLError("'a' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [r,g,b,a];
}

MySceneGraph.prototype.parseXYZW = function(xyzwelement, parent){
	var tags = parent.getElementsByTagName(rgbaElement);
	var x = this.reader.getFloat(tags[0],'r',true);
	if(isNaN(r)){
		this.onXMLError("'x' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var y = this.reader.getFloat(tags[0],'g',true);
	if(isNaN(g)){
		this.onXMLError("'y' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var z = this.reader.getFloat(tags[0],'b',true);
	if(isNaN(b)){
		this.onXMLError("'z' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	var w = this.reader.getFloat(tags[0],'a',true);
	if(isNaN(a)){
		this.onXMLError("'w' attribute on tag <'" + rgbaElement + "'> inside <'" + parent.tagName + "'> with id " + parent.id + " is not a float.");
	}
	return [x,y,z,w];
}

MySceneGraph.prototype.parseString = function(stringElement, parent, attribute){
	var tags = parent.getElementsByTagName(stringElement);
	return this.reader.getString(tags[0], attribute, true);
}

MySceneGraph.prototype.parseFloat = function(element, parent, attribute){
	var tags = parent.getElementsByTagName(element);
	var x = this.reader.getFloat(tags[0],attribute,true);
	if( isNaN(x) )
		this.onXMLError(attribute + " attribute in tag <" + element + "> inside tag <" + parent.tagName + "> with id: " + parent.id + " is not a float.");
	return x;
}

MySceneGraph.prototype.IsTagUnique = function(tag, parent){
	var tags = parent.getElementsByTagName(tag);
	if(tags.length != 1)
		this.onXMLError("<'" + tag + "'> tag inside <'" + parent.tagName + "'> with id " + parent.id + " is missing or appears more than once");
}

MySceneGraph.prototype.getOnlyChilds = function(array,parent){
	var newArray = [];
	for (var i = 0; i < array.length; i++) {
			if (array[i].parentNode == parent){
				newArray.push(array[i]);
			}
	};
	return newArray;
}
	
MySceneGraph.prototype.parseRectangleCoord = function(s, parent){
	var rectangle = {};
	var coordArray = s.split(" ");
	if(coordArray.length != 4){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 4. format:'ff ff ff ff'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(isNaN(n)){
			this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
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

MySceneGraph.prototype.parseCylinderCoord = function(s, parent){
	var cylinder = {};
	var error = false;
	var coordArray = s.split(" ");
	if(coordArray.length != 5){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 5. format:'ff ff ff ii ii'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(i < 3){
			if(isNaN(n)){
				error = true;
				this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
			}
		}else if(i >= 3){
			if(!this.isInteger(n)){
				error = true;
				this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not an integer.");
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
					cylinder.sections = parseInt(n,10);
					break;
				case 4:
					cylinder.parts = parseInt(n,10);
					break;
			}
		}
	}
	return cylinder;
}

MySceneGraph.prototype.parseSphereCoord = function(s, parent){
	var sphere = {};
	var error = false;
	var coordArray = s.split(" ");
	if(coordArray.length != 3){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 3. format:'ff ii ii'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(i < 1){
			if(isNaN(n)){
				error = true;
				this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
			}
		}else if(i >= 1){
			if(!this.isInteger(n)){
				error = true;
				this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not an integer.");
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

MySceneGraph.prototype.parseTriangleCoord = function(s){
	var triangle = {};
	triangle.Point1 = [];
	triangle.Point2 = [];
	triangle.Point3 = [];
	var temp = s.split("  ");
	var coordArray = [];
	coordArray = coordArray.concat(temp[0].split(" "), temp[1].split(" "), temp[2].split(" "));
	if(coordArray.length != 9){
		this.onXMLError("The number of arguments in the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not 9. format:'ff ff ff  ff ff ff  ff ff ff'");
	}
	for (var i = 0; i < coordArray.length; i++) {
		var n = parseFloat(coordArray[i]);
		if(isNaN(n)){
			this.onXMLError("The value nº " + (i+1) + " of the attribute 'args' in tag: '" + parent.tagName + "' with the id of '" + parent.id + "' is not a float.");
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

MySceneGraph.prototype.isInteger = function(x){
	var flag = (typeof x === 'number') && (x % 1 === 0);
    return flag;
}

/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: " + message);	
	this.loadedOk=false;
};


