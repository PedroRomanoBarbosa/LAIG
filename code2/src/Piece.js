
function Piece(scene, destination, piecePrimitive, pieceFormat, line, col) {
	line = typeof line !== 'undefined' ? line : 0;
	col = typeof col !== 'undefined' ? col : 0;

	this.scene = scene;
	this.dest = destination;
	this.primMatx = piecePrimitive.matx;
	this.descendants = piecePrimitive.descendants;
	this.lastTransformation = piecePrimitive.lastTransformation;
	this.materialID = piecePrimitive.materialID;
	this.textureID = pieceFormat;

	this.matx = mat4.clone(piecePrimitive.matx);

	/* Animation related */
	this.currentAnim = "iddle";
	this.angleY = 0;
	this.chosenTime = 1;
	this.chosenVel = 180 / this.chosenTime;
	this.aniTime = 0;
	this.finaPos;

	/* Bag animation */
	this.bagTime = 0.5;
	this.numberPiece = 0;
	this.line = 1;
	this.hide = true;

	mat4.identity(this.matx);

	switch(destination){
		case "p1":
			this.ID = piecePrimitive.ID + "-p1-" + scene.numHandPiecesP1;
		break;
		case "p2":
			this.ID = piecePrimitive.ID + "-p2-" + scene.numHandPiecesP2;
		break;
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
			this.chosenAnimation(time);
		case "moving":
			break;
		case "bag":
			this.bagAnimation(time);
			break;
	}
}

Piece.prototype.chosenAnimation = function(time){
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
}

Piece.prototype.bagAnimation = function(time){
	this.aniTime += time;
	var iddleTime = (4 - this.numPiece)*0.2;

	/* Delay between pieces */
	if(this.aniTime > iddleTime){
		if(this.hide){
			this.hide = false;
		}
		/* Final point */
		var P4 = {x:2 + (this.numPiece%7), y:- this.line*0.7 + 0.3, z:this.line*0.7 - 1.3};
		var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

		/* Get angle */
		var angle = Math.atan2(P4.z,P4.x);

		/* reset matrix */
		mat4.identity(this.matx);

		/* Applies transformations */
		if(this.dest == "p2"){
			mat4.rotate(this.matx, this.matx, 180*Math.PI/180, [0, 1, 0]);
		}
		mat4.translate(this.matx, this.matx, [-5,0,6.5]);

		/* Reset animation time */
		if(this.aniTime > (this.bagTime + iddleTime)){
			this.aniTime = 0;
			var x = d*Math.cos(angle);
			var z = d*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [P4.x,P4.y,P4.z]);
			mat4.rotate(this.matx, this.matx, 45*Math.PI/180, [1, 0, 0]);
			this.changeAnimation("iddle");
		}else {
			var percentage = ((this.aniTime - iddleTime) /this.bagTime);
			var P2 = {x: 0, y:5, z:0};
			var P3 = {x: 0, y:5, z:0};
			var P1 = {x: 0, y:0, z:0};
			var pos = this.getBezier(percentage, P1, P2, P3, P4);
			var x = pos.z*Math.cos(angle);
			var z = pos.z*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [x,pos.y,z]);
		}
		mat4.multiply(this.matx,this.matx,this.primMatx);
	}
}


Piece.prototype.changeAnimation = function(name){
	if(name != "iddle" && name != "chosen" && name != "moving" && name != "bag"){
		console.log("The name of the animation given in change animation is not valid");
		return false;
	}
	this.currentAnim = name;
	this.aniTime = 0;
	return true;
}


Piece.prototype.getBezier = function(p,P1,P2,P3,P4) {
	var pos = {};
	var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

	/* Calculate bezier point */
  pos.z = (1-p)*(1-p)*(1-p) * P1.z +
					3*(1-p)*(1-p)*p * P2.z +
					3*(1-p)*p*p * P3.z +
					p*p*p * d;

	pos.y = (1-p)*(1-p)*(1-p) * P1.y +
					3*(1-p)*(1-p)*p * P2.y +
					3*(1-p)*p*p * P3.y +
					p*p*p * P4.y;

  return pos;
}
