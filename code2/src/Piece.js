
function Piece(scene, destination, piecePrimitive, pieceFormat, line, col) {

	line = typeof line !== 'undefined' ? line : 0;
	col = typeof col !== 'undefined' ? col : 0;

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

	switch(destination){
		case "board":
			this.ID = piecePrimitive.ID + "-" + line + "" + col;

			this.transformations = [];

			var positionTransformation = {};
			positionTransformation.typeOf = "translation";
			positionTransformation.xyz = [ col - 5, 0, line - 5];
			this.transformations.push(positionTransformation);

			this.transformations = this.transformations.concat(piecePrimitive.transformations);
		break;

		case "p1":
			this.ID = piecePrimitive.ID + "-p1-" + scene.numHandPiecesP1;

			this.transformations = [];

			var positionTransformation = {};
			positionTransformation.typeOf = "translation";
			positionTransformation.xyz = [((scene.numHandPiecesP1 - 1) % 7), 0, 0];
			this.transformations.push(positionTransformation);

			var positionTransformation1 = {};
			positionTransformation1.typeOf = "translation";
			positionTransformation1.xyz = [-3, 0, 5.7];
			this.transformations.push(positionTransformation1);

			var positionTransformation2 = {};
			positionTransformation2.typeOf = "rotation";
			positionTransformation2.axisRot = "x";
			positionTransformation2.angle = 45;
			this.transformations.push(positionTransformation2);

			var positionTransformation3 = {};
			positionTransformation3.typeOf = "translation";
			positionTransformation3.xyz = [0, 0, 0.4];
			this.transformations.push(positionTransformation3);

			var positionTransformation4 = {};
			positionTransformation4.typeOf = "translation";
			positionTransformation4.xyz = [ 0, 0, Math.floor((scene.numHandPiecesP1 - 1) / 7)];
			this.transformations.push(positionTransformation4);

			this.transformations = this.transformations.concat(piecePrimitive.transformations);

			scene.numHandPiecesP1++;
		break;

		case "p2":
			this.ID = piecePrimitive.ID + "-p2-" + scene.numHandPiecesP2;

			this.transformations = [];

			var positionTransformation = {};
			positionTransformation.typeOf = "translation";
			positionTransformation.xyz = [((scene.numHandPiecesP2 - 1) % 7), 0, 0];
			this.transformations.push(positionTransformation);

			var positionTransformation1 = {};
			positionTransformation1.typeOf = "translation";
			positionTransformation1.xyz = [-1, 0, -5.7];
			this.transformations.push(positionTransformation1);

			var positionTransformation2 = {};
			positionTransformation2.typeOf = "rotation";
			positionTransformation2.axisRot = "x";
			positionTransformation2.angle = -45;
			this.transformations.push(positionTransformation2);

			var positionTransformation3 = {};
			positionTransformation3.typeOf = "translation";
			positionTransformation3.xyz = [0, 0, -0.4];
			this.transformations.push(positionTransformation3);

			var positionTransformation4 = {};
			positionTransformation4.typeOf = "rotation";
			positionTransformation4.axisRot = "y";
			positionTransformation4.angle = 180;
			this.transformations.push(positionTransformation4);

			var positionTransformation5 = {};
			positionTransformation5.typeOf = "translation";
			positionTransformation5.xyz = [ 0, 0, Math.floor((scene.numHandPiecesP2 - 1) / 7)];
			this.transformations.push(positionTransformation5);

			this.transformations = this.transformations.concat(piecePrimitive.transformations);

			scene.numHandPiecesP2++;
		break;
	}

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
	scene.root.descendants.push(this.ID);
};