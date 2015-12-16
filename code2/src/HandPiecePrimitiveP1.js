
function HandPiecePrimitiveP1(scene, piecePrimitive, pieceFormat) {

	this.ID = piecePrimitive.ID + "-" + scene.numHandPiecesP1;

	this.aniIter = piecePrimitive.aniIter;
	this.animated = piecePrimitive.animated;
	this.animations = piecePrimitive.animations;
	this.descendants = piecePrimitive.descendants;
	this.lastTransformation = piecePrimitive.lastTransformation;

	this.materialID = piecePrimitive.materialID;

	this.matx = mat4.create();

	this.matxAni = piecePrimitive.matxAni;
	this.spanSum = piecePrimitive.spanSum;

	this.textureID = pieceFormat;

	this.transformations = [];

	var positionTransformation = {};
	positionTransformation.typeOf = "translation";
	positionTransformation.xyz = [((scene.numHandPiecesP1 - 1) % 7), 0, 0];
	this.transformations.push(positionTransformation);

	this.transformations = this.transformations.concat(piecePrimitive.transformations);

	var positionTransformation2 = {};
	positionTransformation2.typeOf = "translation";
	positionTransformation2.xyz = [ 0, 0, Math.floor((scene.numHandPiecesP1 - 1) / 7)];
	this.transformations.push(positionTransformation2);

	mat4.identity(this.matx);
	for(var j=0; j<this.transformations.length; j++){
		switch(this.transformations[j].typeOf){
			case 'translation':
				mat4.translate(this.matx, this.matx, this.transformations[j].xyz);
				break;
			case 'rotation':
				switch(this.transformations[j].axis){
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
};

HandPiecePrimitiveP1.prototype.getObject = function() {

	var obj = {};

	obj.ID = this.ID;

	obj.aniIter = this.aniIter;
	obj.animated = this.animated;
	obj.animations = this.animations;
	obj.descendants = this.descendants;
	obj.lastTransformation = this.lastTransformation;

	obj.materialID = this.materialID;

	obj.matx = this.matx;

	obj.matxAni = this.matxAni;
	obj.spanSum = this.spanSum;

	obj.textureID = this.textureID;

	obj.transformations = this.transformations;

	return obj;
};