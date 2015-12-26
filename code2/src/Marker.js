
function Marker(scene, markerForm, font) {

	this.scene = scene;
	
	this.valueToShow;

	this.font = font;

	this.ID = markerForm.tagId;

	this.descendants = markerForm.children;

	this.lastTransformation = markerForm.lastTransformation;
	this.materialID = markerForm.materialID;
	this.matx = mat4.create();
	this.matxAni = mat4.create();
	mat4.identity(this.matxAni);
	this.spanSum = markerForm.spanSum;

	this.textureID = markerForm.TextureID;

	this.transformations = markerForm.transformations;

	mat4.identity(this.matx);
	for(var j=0; j<this.transformations.length; j++){
		switch(this.transformations[j].typeOf){
			case 'translation':
				mat4.translate(this.matx, this.matx, this.transformations[j].xyz);
				break;
			case 'rotation':
				switch(this.transformations[j].axisRot){
					case "x":
						mat4.rotate(this.matx, this.matx, this.transformations[j].angle * Math.PI / 180, [1, 0, 0]);
						break;
					case "y":
						mat4.rotate(this.matx, this.matx, this.transformations[j].angle * Math.PI / 180, [0, 1, 0]);
						break;
					case "z":
						mat4.rotate(this.matx, this.matx, this.transformations[j].angle * Math.PI / 180, [0, 0, 1]);
						break;
				}
				break;
			case 'scale':
				mat4.scale(this.matx, this.matx, this.transformations[j].xyz);
				break;
		}
	}

	scene.objects[this.ID] = this;

	if(this.ID.charAt(12) == '1'){
		scene.objects['option-1'].descendants.push(this.ID);
	}else if(this.ID.charAt(12) == '2'){
		scene.objects['option-2'].descendants.push(this.ID);
	}else{
		console.log("Marker not added, something went wrong");
	}
};

Marker.prototype.setShaderValues = function(){
	this.scene.setActiveShaderSimple(this.scene.textShader);

	this.scene.textShader.setUniformsValues({'dims': [16, 16]});
	
	this.scene.textShader.setUniformsValues({'uSampler': 0});
	this.scene.textShader.setUniformsValues({'uSampler2': 1});

	//this.scene.textShader.setUniformsValues({'charCoords': [16,16]});
};