
function Piece(scene, destination, piecePrimitive, pieceFormat, line, col) {
	line = typeof line !== 'undefined' ? line : 0;
	col = typeof col !== 'undefined' ? col : 0;
	this.line = line;
	this.col = col;

	this.scene = scene;
	this.dest = destination;
	this.primitive = piecePrimitive;
	this.primMatx = piecePrimitive.matx;
	this.descendants = piecePrimitive.descendants;
	this.lastTransformation = piecePrimitive.lastTransformation;
	this.materialID = piecePrimitive.materialID;
	this.textureID = pieceFormat;

	this.matx = mat4.clone(piecePrimitive.matx);
	this.pos = {x:0,y:0,z:0};
	this.angle = {x:0,y:0,z:0};

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
	this.handLine = 1;
	this.hide = true;

	/* Board Animation */
	this.boardTime = 0.7;
	this.boardPos = {x:0, y:0, z:0};

	this.movingTime = 0.5;

	mat4.identity(this.matx);

	switch(destination){
		case "board":
			this.ID = piecePrimitive.ID + "-b-" + line + "" + col;
			this.pos.x = this.col - 5;
			this.pos.y = 0;
			this.pos.z = this.line - 5;
			break;
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
			this.iddleAnimation();
			break;
		case "chosen":
			this.chosenAnimation(time);
			break;
		case "moving":
			this.movingAnimation(time);
			break;
		case "bag":
			this.bagAnimation(time);
			break;
		case "board":
			this.boardAnimation(time);
			break;
		case "boardChosen":
			this.boardChosenAnimation(time);
			break;
		case "movieBoard":
			this.movieBoardAnimation(time);
			break;
		case "movieMoving":
			this.movieMovingAnimation(time);
			break;
	}
}

Piece.prototype.boardChosenAnimation = function(time){
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
	mat4.identity(this.matx);
	mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);
	mat4.rotate(this.matx, this.matx, this.angleY * Math.PI / 180, [0, 1, 0]);

	/* Reset animation time */
	if(this.aniTime > this.chosenTime){
		this.aniTime = 0;
	}

	mat4.multiply(this.matx,this.matx,this.primMatx);
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
	mat4.identity(this.matx);
	mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);
	if(this.dest == "p2"){
		mat4.rotate(this.matx, this.matx, 180*Math.PI/180, [0, 1, 0]);
	}
	mat4.rotate(this.matx, this.matx, 45*Math.PI/180, [1, 0, 0]);
	mat4.rotate(this.matx, this.matx, this.angleY * Math.PI / 180, [0, 1, 0]);

	/* Reset animation time */
	if(this.aniTime > this.chosenTime){
		this.aniTime = 0;
	}
	mat4.multiply(this.matx,this.matx,this.primMatx);
}

Piece.prototype.iddleAnimation = function(){

	/* reset matrix */
	mat4.identity(this.matx);

	if(this.dest == "board"){
		mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);
	}else {
		if(this.ID.substring(this.primitive.ID.length) == "-p1-1" && this.scene.playerTurnToPlay == 2){
			mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y-1.5,this.pos.z]);
		}else if(this.ID.substring(this.primitive.ID.length) == "-p2-1" && this.scene.playerTurnToPlay == 1){
			mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y-1.5,this.pos.z]);
		}else{
			mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);
		}
		mat4.rotate(this.matx, this.matx, this.angle.x*Math.PI/180, [1, 0, 0]);
		if(this.dest == "p2"){
			mat4.rotate(this.matx, this.matx, 180*Math.PI/180, [0, 1, 0]);
		}
	}

	mat4.multiply(this.matx,this.matx,this.primMatx);
	this.hide = false;
}

Piece.prototype.handPosition = function(){
	if(this.dest == "p1"){
		this.pos.x = -3 + (this.numPiece%7);
		this.pos.y = - this.handLine*0.7 + 0.3;
		this.pos.z = 6.5 + this.handLine*0.7 - 1.3;
		this.angle.x = 45;
	}else if(this.dest == "p2"){
		this.pos.x = 3 - (this.numPiece%7);
		this.pos.y = -this.handLine*0.7 + 0.3;
		this.pos.z = - 6.5 - this.handLine*0.7 + 1.3;
		this.angle.x = -45;
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

		var P4 = {x:0, y:0, z:0};
		/* Final point */
		P4.x = 2 + (this.numPiece%7);
		P4.y = - this.handLine*0.7 + 0.3;
		P4.z = this.handLine*0.7 - 1.3;
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
			if(this.dest == "p2"){
				this.pos.x = -(P4.x - 5);
				this.pos.y = P4.y;
				this.pos.z = -(P4.z + 6.5);
				this.angle.x = -45;
			}else {
				this.pos.x = P4.x - 5;
				this.pos.y = P4.y;
				this.pos.z = P4.z + 6.5;
				this.angle.x = 45;
			}
			if(this.scene.movieStarted && this.numPiece == 0 && this.dest == this.scene.moviePlayer){
				if(this.scene.typeOfMove == 1){
					this.scene.movieObj.changeAnimation("movieBoard");
				}else if (this.scene.typeOfMove == 2) {
					this.scene.movieObj.changeAnimation("movieMoving");
				}else if (this.scene.typeOfMove == 0) {
					this.scene.rotateScene = true;
				}
			}
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

Piece.prototype.boardAnimation = function(time){
	  this.aniTime += time;

		/* Final point */
		var P4 = {x: this.boardPos.x-this.pos.x, y: this.boardPos.y-this.pos.y, z: this.boardPos.z-this.pos.z};
		var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

		/* Get angle */
		var angle = Math.atan2(P4.z,P4.x);

		/* reset matrix */
		mat4.identity(this.matx);

		/* Applies transformations */
		mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);

		/* Reset animation time */
		if(this.aniTime > this.boardTime){
			this.aniTime = 0;
			var x = d*Math.cos(angle);
			var z = d*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [P4.x,P4.y,P4.z]);
			this.pos.x = this.boardPos.x;
			this.pos.y = this.boardPos.y;
			this.pos.z = this.boardPos.z;
			this.angle.x = 0;
			this.changeAnimation("iddle");
			this.scene.stop = false;

			if(this.scene.playerMode == "pvp" || this.scene.playerMode == "pcvpc"){
				this.scene.reloadEntities();
				if(this.scene.firstPlay || this.scene.state.playerTurn != this.scene.stateToCompare.playerTurn){
					this.scene.firstPlay = false;
					this.scene.rotateScene = true;
				}
			}
		}else {
			var percentage = (this.aniTime/this.boardTime);
			var P2 = {x: 0, y:5, z:0};
			var P3 = {x: 0, y:5, z:0};
			var P1 = {x: 0, y:0, z:0};
			var pos = this.getBezier(percentage, P1, P2, P3, P4);
			var x = pos.z*Math.cos(angle);
			var z = pos.z*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [x,pos.y,z]);
			if(this.dest == "p1"){
				mat4.rotate(this.matx, this.matx, (45 - 45*percentage)*Math.PI/180, [1, 0, 0]);
			}else if (this.dest == "p2") {
				mat4.rotate(this.matx, this.matx, -(45 - 45*percentage)*Math.PI/180, [1, 0, 0]);
			}
			if(percentage < 0.5){
				mat4.scale(this.matx, this.matx, [1 + percentage*2, 1 + percentage*2, 1 + percentage*2]);
			}else {
				mat4.scale(this.matx, this.matx, [1 + (1 - percentage)*2, 1 + (1 - percentage)*2, 1 + (1 - percentage)*2]);
			}
		}
		if(this.dest == "p2"){
			mat4.rotate(this.matx, this.matx, 180*Math.PI/180, [0, 1, 0]);
		}
		mat4.multiply(this.matx,this.matx,this.primMatx);
}

Piece.prototype.movieBoardAnimation = function(time){
	this.aniTime += time;

	/* Final point */
	var P4 = {x: this.boardPos.x-this.pos.x, y: this.boardPos.y-this.pos.y, z: this.boardPos.z-this.pos.z};
	var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

	/* Get angle */
	var angle = Math.atan2(P4.z,P4.x);

	/* reset matrix */
	mat4.identity(this.matx);

	/* Applies transformations */
	mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);

	/* Reset animation time */
	if(this.aniTime > this.boardTime){
		this.aniTime = 0;
		var x = d*Math.cos(angle);
		var z = d*Math.sin(angle);
		mat4.translate(this.matx, this.matx, [P4.x,P4.y,P4.z]);
		this.pos.x = this.boardPos.x;
		this.pos.y = this.boardPos.y;
		this.pos.z = this.boardPos.z;
		this.angle.x = 0;
		this.angle.y = 0;
		this.angle.z = 0;
		this.changeAnimation("iddle");
		if (this.scene.moviePlayer == "p1") {
			this.scene.moviePlayer = "p2";
		}else if (this.scene.moviePlayer == "p2") {
			this.scene.moviePlayer = "p1";
		}
		this.scene.rotateScene = true;
	}else {
		var percentage = (this.aniTime/this.boardTime);
		var P2 = {x: 0, y:5, z:0};
		var P3 = {x: 0, y:5, z:0};
		var P1 = {x: 0, y:0, z:0};
		var pos = this.getBezier(percentage, P1, P2, P3, P4);
		var x = pos.z*Math.cos(angle);
		var z = pos.z*Math.sin(angle);
		mat4.translate(this.matx, this.matx, [x,pos.y,z]);
		if(this.dest == "p1"){
			mat4.rotate(this.matx, this.matx, (45 - 45*percentage)*Math.PI/180, [1, 0, 0]);
		}else if (this.dest == "p2") {
			mat4.rotate(this.matx, this.matx, -(45 - 45*percentage)*Math.PI/180, [1, 0, 0]);
		}
		if(percentage < 0.5){
			mat4.scale(this.matx, this.matx, [1 + percentage*2, 1 + percentage*2, 1 + percentage*2]);
		}else {
			mat4.scale(this.matx, this.matx, [1 + (1 - percentage)*2, 1 + (1 - percentage)*2, 1 + (1 - percentage)*2]);
		}
	}
	if(this.dest == "p2"){
		mat4.rotate(this.matx, this.matx, 180*Math.PI/180, [0, 1, 0]);
	}
	mat4.multiply(this.matx,this.matx,this.primMatx);
}

Piece.prototype.movingAnimation = function(time){
	  this.aniTime += time;

		/* Final point */
		var P4 = {x: this.boardPos.x-this.pos.x, y: this.boardPos.y-this.pos.y, z: this.boardPos.z-this.pos.z};
		var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

		/* Get angle */
		var angle = Math.atan2(P4.z,P4.x);

		/* reset matrix */
		mat4.identity(this.matx);

		/* Applies transformations */
		mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);

		/* Reset animation time */
		if(this.aniTime > this.movingTime){
			this.aniTime = 0;
			var x = d*Math.cos(angle);
			var z = d*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [P4.x,P4.y,P4.z]);
			this.pos.x = this.boardPos.x;
			this.pos.y = this.boardPos.y;
			this.pos.z = this.boardPos.z;
			this.angle.x = 0;
			this.changeAnimation("iddle");
			this.scene.stop = false;
			this.scene.reloadEntities();
		}else {
			var percentage = (this.aniTime/this.movingTime);
			var P2 = {x: 0, y:2, z:0};
			var P3 = {x: 0, y:2, z:1};
			var P1 = {x: 0, y:0, z:0};
			var pos = this.getBezier(percentage, P1, P2, P3, P4);
			var x = pos.z*Math.cos(angle);
			var z = pos.z*Math.sin(angle);
			mat4.translate(this.matx, this.matx, [x,pos.y,z]);
		}
		mat4.multiply(this.matx,this.matx,this.primMatx);
}

Piece.prototype.movieMovingAnimation = function(time){
	this.aniTime += time;

	/* Final point */
	var P4 = {x: this.boardPos.x-this.pos.x, y: this.boardPos.y-this.pos.y, z: this.boardPos.z-this.pos.z};
	var d = Math.sqrt((P4.x)*(P4.x) + (P4.z)*(P4.z));

	/* Get angle */
	var angle = Math.atan2(P4.z,P4.x);

	/* reset matrix */
	mat4.identity(this.matx);

	/* Applies transformations */
	mat4.translate(this.matx, this.matx, [this.pos.x,this.pos.y,this.pos.z]);

	/* Reset animation time */
	if(this.aniTime > this.movingTime){
		this.aniTime = 0;
		var x = d*Math.cos(angle);
		var z = d*Math.sin(angle);
		mat4.translate(this.matx, this.matx, [P4.x,P4.y,P4.z]);
		this.pos.x = this.boardPos.x;
		this.pos.y = this.boardPos.y;
		this.pos.z = this.boardPos.z;
		this.angle.x = 0;
		if (this.scene.moviePlayer == "p1") {
			this.scene.moviePlayer = "p2";
		}else if (this.scene.moviePlayer == "p2") {
			this.scene.moviePlayer = "p1";
		}
		if(this.scene.movieStarted){
			this.scene.movie = true;
		}
		this.changeAnimation("iddle");
	}else {
		var percentage = (this.aniTime/this.movingTime);
		var P2 = {x: 0, y:2, z:0};
		var P3 = {x: 0, y:2, z:1};
		var P1 = {x: 0, y:0, z:0};
		var pos = this.getBezier(percentage, P1, P2, P3, P4);
		var x = pos.z*Math.cos(angle);
		var z = pos.z*Math.sin(angle);
		mat4.translate(this.matx, this.matx, [x,pos.y,z]);
	}
	mat4.multiply(this.matx,this.matx,this.primMatx);
}

Piece.prototype.changeAnimation = function(name){
	if(name != "iddle" && name != "chosen" && name != "moving" && name != "bag" && name != "board" && name != "boardChosen" && name != "movieBoard" && name != "movieMoving"){
		console.error("The name of the animation given in change animation is not valid");
		return false;
	}
	this.currentAnim = name;
	this.aniTime = 0;
	return true;
}

Piece.prototype.setBoardPosition = function(x,y,z){
	this.boardPos.x = x;
	this.boardPos.y = y;
	this.boardPos.z = z;
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
