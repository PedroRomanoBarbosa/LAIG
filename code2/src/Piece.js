
function Piece(scene, destination, piecePrimitive, pieceFormat, line, col) {

	line = typeof line !== 'undefined' ? line : 0;
	col = typeof col !== 'undefined' ? col : 0;

	this.descendants = piecePrimitive.descendants;
	this.lastTransformation = piecePrimitive.lastTransformation;
	this.materialID = piecePrimitive.materialID;
	this.matx = mat4.create();
	this.matxAni = mat4.create();
	mat4.identity(this.matxAni);
	this.spanSum = piecePrimitive.spanSum;
	this.textureID = pieceFormat;

	/* Animation related */
	this.currentAnim = "iddle";
	this.angleY = 0;
	this.chosenTime = 1;
	this.chosenVel = 180 / this.chosenTime;
	this.aniTime = 0;

	switch(destination){
		case "board":
			this.ID = piecePrimitive.ID + "-b-" + line + "" + col;

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
			positionTransformation.xyz = [(-(scene.numHandPiecesP2 - 1) % 7), 0, 0];
			this.transformations.push(positionTransformation);

			var positionTransformation1 = {};
			positionTransformation1.typeOf = "translation";
			positionTransformation1.xyz = [3, 0, -5.7];
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


/**
* Animates the piece given a time
*/
Piece.prototype.animate = function(time) {
	switch (this.currentAnim) {
		case "iddle":
			break;
		case "chosen":
			this.aniTime += time;
			var angle = (this.chosenVel*this.aniTime);
			/* First part */
			if(angle < 45){
				this.angleY = -1 * angle;
			/* Second part */
			}else if (angle < 135) {
				this.angleY = -90 + angle;
			/* Third part */
			}else if (angle < 180) {
				this.angleY = 180 - angle;
			}else{
					this.angleY = 0;
			}
			/* reset matrix */
			mat4.identity(this.matxAni);
			mat4.rotate(this.matxAni, this.matxAni, this.angleY * Math.PI / 180, [0, 1, 0]);
			/* Reset animation time */
			if(this.aniTime > this.chosenTime){
				this.aniTime = 0;
			}
		case "moving":
			break;
	}
}

Piece.prototype.changeAnimation = function(name){
	if(name != "iddle" && name != "chosen" && name != "moving"){
		console.log("The name of the animation given in change animation is not valid");
		return false;
	}
	this.currentAnim = name;
}
