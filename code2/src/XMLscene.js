/* Global var to pass degrees to radius */
var degToRad = Math.PI / 180.0;

/**
* @constructs XMLscene constructor
*/
function XMLscene(app, myInterface) {
    CGFscene.call(this);

    this.app=app;
    this.myInterface=myInterface;
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

    this.server = new Server(8081);
    this.isFirstPlay = true;
    this.newIndexOfPieceToPlay = -1;
    this.newLinePositionToPlay = -1;
    this.newColPositionToPlay = -1;
    this.changeLinePositionToPlay = -1;
    this.changeColPositionToPlay = -1;

    this.stop = false;
	this.startGame = false;
    this.hasInited = false;
    this.p2FirstTurn = true;

    this.loopState = 0;
    this.gameStatesStack = [];

    this.aniTime = 0;
    this.rotationTime = 1;
    this.rotationAngle = 180 / this.rotationTime;
    this.rotateScene = false;
    this.movingDirection = "up";

    /* Movie variables */
    this.movie = false;
    this.movieStarted = false;
    this.movieIter = 0;
    this.movieStates = [];
    this.moviePlayer = "p1";

    /* Wait animation */
    this.waitAni = false;
    this.waitTime = 0;
    this.lightsVisible = false;
	this.showAxis = false;
	this.maxTurnTime = 30;

	this.app.setInterface(this.myInterface);
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
    this.camera = new CGFcamera(0.4, 10, 500, vec3.fromValues(0,25,25), vec3.fromValues(0, -3, 0));
    //this.camera = new CGFcamera(0.4, 10, 500, vec3.fromValues(0, 25, -25), vec3.fromValues(0, 0, -3));
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

	this.primitives = {};
	this.parentTexture=null;
  this.loadPrimitivesOnGraphLoaded();

  this.objects = {};
  this.rootId = this.graph.root.tagId;
  this.loadNodesOnGraphLoaded();
  this.root = this.objects[this.rootId];

  this.rootCleanup=[];
  for(var i=0; i<this.graph.nodes.length; i++){
  	if(this.graph.nodes[i].tagId == this.graph.root.tagId){
  		this.rootCleanup = this.graph.nodes[i].children;
  	}
  }

  this.textShader=new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");
  this.textTexture = this.textures['font'];

  for(var i=0; i<this.graph.nodes.length; i++){
  	if(this.graph.nodes[i].tagId.substring(0, 7) == "screen-"){
  		new Marker(this, this.graph.nodes[i], this.textTexture);
  	}
  }

  this.objectsCleanup = {};
  for (var key in this.objects) {
  	if (this.objects.hasOwnProperty(key)) {
  		this.objectsCleanup[key] = this.objects[key];
  	}
  }

  this.numHandPiecesP1 = 1;
  this.numHandPiecesP2 = 1;

  this.turnTimerStamp = 0;
  this.turnTimeAcc = 0;

  this.timeOutBool = false;

  console.log(this);
  /* Update scene */
  this.setUpdatePeriod(1000/60);
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
      this.lastDate = Date.now();
    }else{
      this.currentDate = Date.now();
      this.timeInterval = this.currentDate - this.lastDate;
      this.lastDate = this.currentDate;
      this.secondsPassed = (this.lastUpdate - this.startTime) / 1000;
      this.updateObjects();
      if(this.rotateScene){
        this.rotateSceneAnimation(this.timeInterval/1000, this.rotateScene);
      }
      if(this.waitAni){
        this.waitAnimation(this.timeInterval/1000);
      }
    }
  }
};

/**
*
*/
XMLscene.prototype.updateObjects = function(){
  for (var key in this.objects) {
    if (this.objects.hasOwnProperty(key)) {
      var obj = this.objects[key];
      if(obj instanceof Piece){
        obj.animate(this.timeInterval/1000);
      }
      if(this.turnTimeAcc > 0 && this.loopState != 9)
      	this.turnTimeAcc = this.maxTurnTime - (this.secondsPassed - this.turnTimerStamp);

      if(obj.ID.substring(0, 7) == "screen-"){
      	if(obj.ID.substring(0, 12) == "screen-timer"){
			obj.valueToShow = Math.floor(this.turnTimeAcc);
      	}
      	if(obj.ID.substring(0, 12) == "screen-winds"){
			if(this.gameStatesStack.length > 1){
				var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
				obj.valueToShow = nowState.numberOfWindPiecesDiscarded;
			}else{
				obj.valueToShow = 0;
			}
      	}
      	if(obj.ID.substring(0, 12) == "screen-infor" && obj.ID.substring(13, 14) == "1"){
      		if(this.gameStatesStack.length > 0){
      			var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
      			obj.valueToShow = nowState.playerTurn;
      		}else{
      			obj.valueToShow = 0;
      		}
      	}
      	if(obj.ID.substring(0, 12) == "screen-infor" && obj.ID.substring(13, 14) == "2"){
      		if(this.gameStatesStack.length > 0){
      			var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
      			obj.valueToShow = nowState.playerTurn;
      		}else{
      			obj.valueToShow = 0;
      		}
      	}
      	if(obj.ID.substring(0, 12) == "screen-board" && obj.ID.substring(13, 14) == "1"){
			if(this.gameStatesStack.length > 0){
				var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
				obj.valueToShow = nowState.player1Pieces.length + nowState.player1HandPieces.length;
			}else{
				obj.valueToShow = 0;
			}
      	}
      	if(obj.ID.substring(0, 12) == "screen-board" && obj.ID.substring(13, 14) == "2"){
			if(this.gameStatesStack.length > 0){
				var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
				obj.valueToShow = nowState.player2Pieces.length + nowState.player2HandPieces.length;
			}else{
				obj.valueToShow = 0;
			}
      	}
      	if(obj.ID.substring(0, 12) == "screen-halfs"){
			if(this.gameStatesStack.length > 0){
				var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
				if(obj.ID.substring(12, 13) == "1")
					obj.valueToShow = nowState.player1HalfStones;
				else
					obj.valueToShow = nowState.player2HalfStones;
			}else{
				obj.valueToShow = 0;
			}
      	}
      	if(obj.ID.substring(0, 12) == "screen-sunss"){
			if(this.gameStatesStack.length > 0){
				var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
				if(obj.ID.substring(12, 13) == "1")
					obj.valueToShow = nowState.player1SunStones;
				else
					obj.valueToShow = nowState.player2SunStones;
			}else{
				obj.valueToShow = 0;
			}
      	}
      }
    }
  }
};

XMLscene.prototype.rotateSceneAnimation = function(time){
  this.aniTime += time;
  var m = 1;
  if(this.movieStarted){
    m = -1;
  }
  var angle = time/this.rotationTime*180;

	if(this.aniTime > this.rotationTime){
    if(this.state.playerTurn == 1){
      this.camera.setPosition(vec3.fromValues(0,25,m*25));
    }else if(this.state.playerTurn == 2){
        this.camera.setPosition(vec3.fromValues(0,25,m*-25));
    }
    this.rotateScene = false;
		this.aniTime = 0;
    if(this.movieStarted){
      this.movie = true;
    }
	}else {
    this.camera.orbit(CGFcameraAxis.Y, angle*Math.PI/180);
	}

};

XMLscene.prototype.waitAnimation = function(time){
  this.aniTime += time;

  /* Reset animation time */
	if(this.aniTime > this.waitTime){
    this.movie = true;
    this.waitAni = false;
  	this.aniTime = 0;
	}
};

XMLscene.prototype.wait = function(time){
  this.movie = false;
  this.waitAni = true;
  this.waitTime = time;
}

//------------------------------------------------------------------------------------------------------------

/*
 STATES OF THE GAME

 0 - initial game, receiving first data from server and storing it in js

*/

XMLscene.prototype.logPicking = function (){

	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			for (var i=0; i< this.pickResults.length; i++) {
				var obj = this.pickResults[i][0];
				if (obj)
				{
					var customId = this.pickResults[i][1];

          if(obj instanceof Piece){
            if(this.loopState == 1){
                if(obj.textureID != "wind-piece"){
                  /* push into movie state array */
                  var stateVars = {type: 1, pid: obj.ID, x: 0, y: 0, z: 0};
                  this.movieStates.push(stateVars);
                  obj.setBoardPosition(0,0,0);
                  obj.changeAnimation("board");
                  this.stop = true;
                }
            }else if (this.loopState == 2 ) {
                this.objSelected = obj;
                obj.changeAnimation("chosen");
            }else if (this.loopState == 4 ) {
                this.objSelectedToMove = obj;
                this.objSelectedToMove.changeAnimation("boardChosen");
            }
          }

					switch(this.loopState){
						case 0:
							if(customId == "300"){
								this.startGame = true;
								new MySceneGraph("jogo/jogo.lsx", this);
								this.playerMode = "pvp";
							}else if(customId == "301"){
								this.startGame = true;
								new MySceneGraph("jogo/jogo.lsx", this);
								this.playerMode = "pceasy";
							}else if(customId == "302"){
								this.startGame = true;
								new MySceneGraph("jogo/jogo.lsx", this);
								this.playerMode = "pchard";
							}else if(customId == "303"){
								this.startGame = true;
								new MySceneGraph("jogo/jogo.lsx", this);
								this.playerMode = "pcvpc";
							}
						break;
						case 1:
							this.newIndexOfPieceToPlay = customId;
							var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
							this.server.makeRequest(nowState.getRequestString(0, this.newIndexOfPieceToPlay, 0, 0, 0));
						break;
						case 2:
							this.newIndexOfPieceToPlay = customId;

							if(obj.textureID == "wind-piece"){
								this.loopState = 4;
							}

							var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
							if(customId == "70"){
                this.rotateScene = true;

                /* push into movie state array */
                var stateVars = {type: 0};
                this.movieStates.push(stateVars);

								this.newIndexOfPieceToPlay = -1;

								this.server.makeRequest(nowState.getRequestString(3, 0, 0, 0, 0));
							}else if(customId == "71"){
								this.newIndexOfPieceToPlay = -1;

								this.server.makeRequest(nowState.getRequestString(4, 0, 0, 0, 0));
							}else if(customId == "72"){
								this.newIndexOfPieceToPlay = -1;

								this.server.makeRequest(nowState.getRequestString(5, 0, 0, 0, 0));
							}else if(customId == "73"){
								this.newIndexOfPieceToPlay = -1;

								this.server.makeRequest(nowState.getRequestString(6, 0, 0, 0, 0));
							}else if(customId == "74"){
                this.stop = true;
                this.movieStarted = true;
                this.movie = true;
                /*
                this.rotateScene = true;
                this.newIndexOfPieceToPlay = -1;

                if(this.gameStatesStack.length >= 2){
                  this.gameStatesStack.pop();

                  this.reloadEntities();
                }

                if(this.gameStatesStack.length == 1){
                  this.loopState = 1;
                }*/

								this.turnTimeAcc = this.maxTurnTime;
								this.turnTimerStamp = this.secondsPassed;
							}else if(customId == "75"){
								new MySceneGraph("menu/menu.lsx", this);
								this.clearAllData();
							}
						break;
						case 3:
							this.newLinePositionToPlay = Math.floor(customId / 10);
    						this.newColPositionToPlay = customId % 10;

    						var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];

							this.server.makeRequest(
								nowState.getRequestString(
									1, this.newIndexOfPieceToPlay,
									this.newLinePositionToPlay, this.newColPositionToPlay,
									0
								)
							);
						break;
						case 4:
							this.changeLinePositionToPlay = Math.floor(customId / 10);
    						this.changeColPositionToPlay = customId % 10;
						break;
						case 5:
							var lineDir = Math.floor(customId / 10);
							var colDir = customId % 10;

							var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];

							if(lineDir != this.changeLinePositionToPlay && colDir != this.changeColPositionToPlay){
								this.newIndexOfPieceToPlay = -1;
								this.changeLinePositionToPlay = -1;
								this.changeColPositionToPlay = -1;
								this.loopState = 2;
                this.objSelected.changeAnimation("iddle");
                this.objSelectedToMove.changeAnimation("iddle");
							}else if(lineDir<this.changeLinePositionToPlay){
								this.server.makeRequest(
									nowState.getRequestString(
										2, this.newIndexOfPieceToPlay,
										this.changeLinePositionToPlay, this.changeColPositionToPlay,
										1
									)
								);
                this.movingDirection = "up";
							}else if(lineDir>this.changeLinePositionToPlay){
								this.server.makeRequest(
									nowState.getRequestString(
										2, this.newIndexOfPieceToPlay,
										this.changeLinePositionToPlay, this.changeColPositionToPlay,
										3
									)
								);
                this.movingDirection = "down";
							}else if(colDir<this.changeColPositionToPlay){
								this.server.makeRequest(
									nowState.getRequestString(
										2, this.newIndexOfPieceToPlay,
										this.changeLinePositionToPlay, this.changeColPositionToPlay,
										4
									)
								);
                this.movingDirection = "left";
							}else if(colDir>this.changeColPositionToPlay){
								this.server.makeRequest(
									nowState.getRequestString(
										2, this.newIndexOfPieceToPlay,
										this.changeLinePositionToPlay, this.changeColPositionToPlay,
										2
									)
								);
                this.movingDirection = "right";
							}
						break;
						case 6:
							if(customId == "75"){
								new MySceneGraph("menu/menu.lsx", this);
								this.clearAllData();
							}
						break;
						case 7:
							if(customId == "75"){
								new MySceneGraph("menu/menu.lsx", this);
								this.clearAllData();
							}
						break;
						case 8:
							if(customId == "75"){
								new MySceneGraph("menu/menu.lsx", this);
								this.clearAllData();
							}
						break;
						case 9:
							if(customId == "75"){
								new MySceneGraph("menu/menu.lsx", this);
								this.clearAllData();
							}
						break;
					}
				}
			}
			this.pickResults.splice(0,this.pickResults.length);
		}
	}
}

XMLscene.prototype.gameLoop = function () {

  if(this.stop){
    return true;
  }


	this.logPicking();

	if(this.loopState != 0 && this.loopState != 1 && Math.floor(this.turnTimeAcc) == 0 && this.timeOutBool == false){
		this.timeOutBool = true;
		this.loopState = 2;

		this.newIndexOfPieceToPlay = -1;
		this.newLinePositionToPlay = -1;
		this.newColPositionToPlay = -1;
		this.changeLinePositionToPlay = -1;
    this.changeColPositionToPlay = -1;

		var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
		this.server.makeRequest(nowState.getRequestString(3, 0, 0, 0, 0));
	}

	switch(this.loopState){

    /* Initial */
		case 0:
			if(this.server.replyReady){
				this.state = new GameState(this.server.answer);

				if(this.state.validState){
					this.gameStatesStack.push(this.state);

					this.loopState++;
					this.reloadEntities();
					this.clearPickRegistration();

					if(this.playerMode == "pcvpc"){
						var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
						this.server.makeRequest(nowState.getRequestString(8, 0, 0, 0, 0));
					}
				}

				this.server.replyReady = false;
			}
		break;

    /* First move */
		case 1:
			if(this.server.replyReady){
				this.state = new GameState(this.server.answer);

				if(this.state.validState){
					this.gameStatesStack.push(this.state);

					this.newIndexOfPieceToPlay = -1;

					if(this.playerMode == "pvp")
						this.loopState++;
					else
						this.loopState = 2;

					this.reloadEntities();
					this.turnTimeAcc = this.maxTurnTime;
					this.turnTimerStamp = this.secondsPassed;
					this.clearPickRegistration();
				}else{
					this.state = this.gameStatesStack[this.gameStatesStack.length - 1];
				}

				this.server.replyReady = false;
			}
		break;

    /* player moves */
		case 2:
			var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];

			if(nowState.player1HandPieces.length == 0 || nowState.player2HandPieces.length == 0){
				this.loopState = 9;
				break;
			}

			if(this.playerMode != "pvp"){

				if(nowState.playerTurn == 2){
					if(this.playerMode == "pceasy")
						this.loopState = 6;
					else if(this.playerMode == "pchard" || this.playerMode == "pcvpc")
						this.loopState = 8;
				}else if(this.playerMode == "pcvpc"){
					this.loopState = 8;
				}
			}

			if(this.newIndexOfPieceToPlay != -1){
				this.loopState++;
				this.clearPickRegistration();
			}else{
				this.state = this.gameStatesStack[this.gameStatesStack.length - 1];

				if(this.server.replyReady){
					this.state = new GameState(this.server.answer);

					if(this.state.validState){
            if(this.p2FirstTurn){
              this.p2FirstTurn = false;
            }
						this.gameStatesStack.push(this.state);

						this.newIndexOfPieceToPlay = -1;
						this.reloadEntities();
						this.turnTimeAcc = this.maxTurnTime;
						this.turnTimerStamp = this.secondsPassed;
					}else{
						this.newIndexOfPieceToPlay = -1;
						this.state = this.gameStatesStack[this.gameStatesStack.length - 1];
					}

					this.server.replyReady = false;
				}
			}
		break;

    /* Choose board position */
		case 3:
			if(this.server.replyReady){
				this.state = new GameState(this.server.answer);

				if(this.state.validState){
					this.gameStatesStack.push(this.state);

					this.newIndexOfPieceToPlay = -1;
					this.loopState = 2;

          /* push into movie state array */
          var stateVars = {type: 1, pid: this.objSelected.ID, x: this.newColPositionToPlay - 5, y: 0, z: this.newLinePositionToPlay - 5};
          this.movieStates.push(stateVars);

          this.objSelected.setBoardPosition(this.newColPositionToPlay - 5, 0, this.newLinePositionToPlay - 5);
          this.objSelected.changeAnimation("board");

					this.turnTimeAcc = this.maxTurnTime;
					this.turnTimerStamp = this.secondsPassed;

				}else{
          this.objSelected.changeAnimation("iddle");
					this.newIndexOfPieceToPlay = -1;
					this.loopState = 2;
					this.state = this.gameStatesStack[this.gameStatesStack.length - 1];
				}

				this.server.replyReady = false;
			}
		break;
		case 4:
			if(this.changeLinePositionToPlay != -1 && this.changeColPositionToPlay != -1){
				this.loopState++;
			}
		break;
		case 5:
			if(this.server.replyReady){
				this.state = new GameState(this.server.answer);

				if(this.state.validState){
					this.gameStatesStack.push(this.state);

					this.newIndexOfPieceToPlay = -1;
					this.loopState = 2;

          /* push into movie state array */
          var stateVars = {type: 2, pid: this.objSelectedToMove.ID };

          switch (this.movingDirection) {
            case "up":
              this.objSelectedToMove.setBoardPosition(this.changeColPositionToPlay - 5, 0, this.changeLinePositionToPlay - 5 - 1);
              stateVars.x = this.changeColPositionToPlay - 5;
              stateVars.y = 0;
              stateVars.z = this.changeLinePositionToPlay - 5 - 1;
              break;
            case "down":
              this.objSelectedToMove.setBoardPosition(this.changeColPositionToPlay - 5, 0, this.changeLinePositionToPlay - 5 + 1);
              stateVars.x = this.changeColPositionToPlay - 5;
              stateVars.y = 0;
              stateVars.z = this.changeLinePositionToPlay - 5 + 1;
              break;
            case "left":
              this.objSelectedToMove.setBoardPosition(this.changeColPositionToPlay - 5 - 1, 0, this.changeLinePositionToPlay - 5);
              stateVars.x = this.changeColPositionToPlay - 5 - 1;
              stateVars.y = 0;
              stateVars.z = this.changeLinePositionToPlay - 5;
              break;
            case "right":
              this.objSelectedToMove.setBoardPosition(this.changeColPositionToPlay - 5 + 1, 0, this.changeLinePositionToPlay - 5);
              stateVars.x = this.changeColPositionToPlay - 5 + 1;
              stateVars.y = 0;
              stateVars.z = this.changeLinePositionToPlay - 5;
              break;
          }

          this.movieStates.push(stateVars);
          this.objSelectedToMove.changeAnimation("moving");

					this.turnTimeAcc = this.maxTurnTime;
					this.turnTimerStamp = this.secondsPassed;
				}else{
					this.newIndexOfPieceToPlay = -1;
					this.changeLinePositionToPlay = -1;
					this.changeColPositionToPlay = -1;
					this.loopState = 2;
					this.state = this.gameStatesStack[this.gameStatesStack.length - 1];
				}

				this.server.replyReady = false;
			}
		break;
		case 6:
			var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
			this.server.makeRequest(nowState.getRequestString(7, 0, 0, 0, 0));

			this.loopState++;
		break;
		case 7:
			if(this.server.replyReady){
				this.state = new GameState(this.server.answer);

				if(this.state.validState){
					this.gameStatesStack.push(this.state);

					this.newIndexOfPieceToPlay = -1;
					this.loopState = 2;
					this.turnTimeAcc = this.maxTurnTime;
					this.turnTimerStamp = this.secondsPassed;
					this.reloadEntities();
				}else{
					this.newIndexOfPieceToPlay = -1;
					this.changeLinePositionToPlay = -1;
					this.changeColPositionToPlay = -1;
					this.loopState = 2;
					this.state = this.gameStatesStack[this.gameStatesStack.length - 1];
				}

				this.server.replyReady = false;
			}
		break;
		case 8:
			var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];
			this.server.makeRequest(nowState.getRequestString(8, 0, 0, 0, 0));

			this.loopState--;
		break;
		case 9:
		break;
	}
};

XMLscene.prototype.objectsToRegister = function (obj) {

	switch(this.loopState){
		case 0:
			if(obj.ID == 'option-pvpPlane'){
				this.registerForPick(300, obj);
			}else if(obj.ID == 'option-pvpceasyPlane'){
				this.registerForPick(301, obj);
			}else if(obj.ID == 'option-pvpchardPlane'){
				this.registerForPick(302, obj);
			}else if(obj.ID == 'option-pcvpcPlane'){
				this.registerForPick(303, obj);
			}else if(obj.ID.substring(0, 7) != 'option-'){
				this.clearPickRegistration();
			}
		break;
		case 1:
			this.state = this.gameStatesStack[this.gameStatesStack.length - 1];

			if(this.state.playerTurn == 1){
				if(obj.ID.substring(0, 9) == 'piece-p1-'){
					this.registerForPick(parseInt(obj.ID.substring(9)), obj);
				}else if(obj.ID.substring(0, 11) == 'option-main'){
					this.registerForPick(75, obj);
				}else if(obj.ID.substring(0, 7) == 'option-' || obj.ID.substring(0, 9) == 'piece-p2-' || obj.ID.substring(0, 7) == 'screen-'){
					this.clearPickRegistration();
				}
			}else if(this.state.playerTurn == 2){
				if(obj.ID.substring(0, 9) == 'piece-p2-'){
					this.registerForPick(parseInt(obj.ID.substring(9)), obj);
				}else if(obj.ID.substring(0, 11) == 'option-main'){
					this.registerForPick(75, obj);
				}else if(obj.ID.substring(0, 7) == 'option-' || obj.ID.substring(0, 9) == 'piece-p1-' || obj.ID.substring(0, 7) == 'screen-'){
					this.clearPickRegistration();
				}
			}else{
				this.clearPickRegistration();
			}
		break;
		case 2:
			if(this.state.playerTurn == 1){
				if(obj.ID.substring(0, 9) == 'piece-p1-'){
					this.registerForPick(parseInt(obj.ID.substring(9)), obj);
				}else if(obj.ID.substring(0, 10) == 'option-hts'){
					this.registerForPick(73, obj);
				}else if(obj.ID.substring(0, 10) == 'option-ste'){
					this.registerForPick(72, obj);
				}else if(obj.ID.substring(0, 10) == 'option-stw'){
					this.registerForPick(71, obj);
				}else if(obj.ID.substring(0, 11) == 'option-pass'){
					this.registerForPick(70, obj);
				}else if(obj.ID.substring(0, 11) == 'option-undo'){
					this.registerForPick(74, obj);
				}else if(obj.ID.substring(0, 11) == 'option-main'){
					this.registerForPick(75, obj);
				}else if(obj.ID.substring(0, 9) == 'piece-p2-' || obj.ID.substring(0, 8) == 'piece-b-' || obj.ID == "board" || obj.ID == "options-1" || obj.ID == "options-2" || obj.ID.substring(0, 7) == 'screen-'){
					this.clearPickRegistration();
				}
			}else if(this.state.playerTurn == 2){
				if(obj.ID.substring(0, 9) == 'piece-p2-'){
					this.registerForPick(parseInt(obj.ID.substring(9)), obj);
				}else if(obj.ID.substring(0, 10) == 'option-hts'){
					this.registerForPick(73, obj);
				}else if(obj.ID.substring(0, 10) == 'option-ste'){
					this.registerForPick(72, obj);
				}else if(obj.ID.substring(0, 10) == 'option-stw'){
					this.registerForPick(71, obj);
				}else if(obj.ID.substring(0, 11) == 'option-pass'){
					this.registerForPick(70, obj);
				}else if(obj.ID.substring(0, 11) == 'option-undo'){
					this.registerForPick(74, obj);
				}else if(obj.ID.substring(0, 11) == 'option-main'){
					this.registerForPick(75, obj);
				}else if(obj.ID.substring(0, 9) == 'piece-p1-' || obj.ID.substring(0, 8) == 'piece-b-' || obj.ID == "board" || obj.ID == "options-1" || obj.ID == "options-2" || obj.ID.substring(0, 7) == 'screen-'){
					this.clearPickRegistration();
				}
			}else{
				this.clearPickRegistration();
			}
		break;
		case 3:
			if(obj.ID.substring(0, 4) == 'tile'){
				this.registerForPick(parseInt(obj.ID.substring(4)), obj);
			}else{
				this.clearPickRegistration();
			}
		break;
		case 4:
			if(obj.ID.substring(0, 8) == 'piece-b-'){
				this.registerForPick(parseInt(obj.ID.substring(8)), obj);
			}else if(obj.ID.substring(0, 7) == 'piece-p' || obj.ID.substring(0, 7) == 'option-' || obj.ID == "board" || obj.ID.substring(0, 7) == 'screen-'){
				this.clearPickRegistration();
			}
		break;
		case 5:
			if(obj.ID.substring(0, 4) == 'tile'){
				this.registerForPick(parseInt(obj.ID.substring(4)), obj);
			}else{
				this.clearPickRegistration();
			}
		break;
		case 6:
			if(obj.ID.substring(0, 11) == 'option-main'){
				this.registerForPick(75, obj);
			}else{
				this.clearPickRegistration();
			}
		break;
		case 7:
			if(obj.ID.substring(0, 11) == 'option-main'){
				this.registerForPick(75, obj);
			}else{
				this.clearPickRegistration();
			}
		break;
		case 8:
			if(obj.ID.substring(0, 11) == 'option-main'){
				this.registerForPick(75, obj);
			}else{
				this.clearPickRegistration();
			}
		break;
		case 9:
			if(obj.ID.substring(0, 11) == 'option-main'){
				this.registerForPick(75, obj);
			}else{
				this.clearPickRegistration();
			}
		break;
	}
};

XMLscene.prototype.reloadEntities = function () {

	this.timeOutBool = false;

	this.root.descendants = [];
	for(var i=0; i<this.rootCleanup.length; i++){
		this.root.descendants.push(this.rootCleanup[i]);
	}

	this.objects = {};
	  for (var key in this.objectsCleanup) {
		if (this.objectsCleanup.hasOwnProperty(key)) {
			this.objects[key] = this.objectsCleanup[key];
		}
	  }

	  this.numHandPiecesP1 = 1;
  	this.numHandPiecesP2 = 1;
  	this.changeLinePositionToPlay = -1;
    this.changeColPositionToPlay = -1;

  	var nowState = this.gameStatesStack[this.gameStatesStack.length - 1];

  	for(var i=0; i<nowState.player1HandPieces.length; i++){
  		var p = new Piece(this, "p1", this.objects['piece'], nowState.player1HandPieces[i]);
      p.numPiece = i;
      p.handLine = 1;
      if(i > 6){
        p.handLine = 2;
      }
      if(i > 13){
        p.handLine = 3;
      }

      /*
      Decide animations, position and visibility
      depending on game state and player turn
      */
      switch (this.loopState) {
        case 1:
          p.changeAnimation("bag");
          break;
        case 2:
          if(p.numPiece == 0 && nowState.playerTurn == 1){
            p.changeAnimation("bag");
          }else if(p.numPiece == 0){
            p.hide = true;
          }else{
            p.handPosition();
            p.changeAnimation("iddle");
          }
          break;
      }

      this.numHandPiecesP1++;
  	}

  	for(var i=0; i<nowState.player2HandPieces.length; i++){
  		var p = new Piece(this, "p2", this.objects['piece'], nowState.player2HandPieces[i]);
      p.numPiece = i;
      p.handLine = 1;
      if(i > 6){
        p.handLine = 2;
      }
      if(i > 13){
        p.handLine = 3;
      }

      /*
      Decide animations, position and visibility
      depending on game state and player turn
      */
      switch (this.loopState) {
        case 1:
          p.changeAnimation("bag");
          break;
        case 2:
          if(this.p2FirstTurn){
            p.handPosition();
            p.changeAnimation("iddle");
            this.p2FirstTurn = false;
          }else if(p.numPiece == 0 && nowState.playerTurn == 2){
            p.changeAnimation("bag");
          }else if(p.numPiece == 0){
              p.hide = true;
          }else{
            p.handPosition();
            p.changeAnimation("iddle");
          }
          break;
      }
      this.numHandPiecesP2++;
  	}


  	for(var line=0; line<nowState.board.length; line++){
  		for(var col=0; col<nowState.board[line].length; col++){
  			if(nowState.board[line][col] != "sunTile" && nowState.board[line][col] != "free" && nowState.board[line][col] != "moonTile"){
  				var p = new Piece(this, "board", this.objects['piece'], nowState.board[line][col], line + 1, col + 1);
  			}
  		}
  	}
};


XMLscene.prototype.reloadEntitiesForMovie = function(state,loop){
  this.root.descendants = [];
	for(var i=0; i<this.rootCleanup.length; i++){
		this.root.descendants.push(this.rootCleanup[i]);
	}

	  this.numHandPiecesP1 = 1;
  	this.numHandPiecesP2 = 1;
  	this.changeLinePositionToPlay = -1;
    this.changeColPositionToPlay = -1;

  	for(var i=0; i<state.player1HandPieces.length; i++){
  		var p = new Piece(this, "p1", this.objects['piece'], state.player1HandPieces[i]);
      p.numPiece = i;
      p.handLine = 1;
      if(i > 6){
        p.handLine = 2;
      }
      if(i > 13){
        p.handLine = 3;
      }

      this.numHandPiecesP1++;
  	}

  	for(var i=0; i<state.player2HandPieces.length; i++){
  		var p = new Piece(this, "p2", this.objects['piece'], state.player2HandPieces[i]);
      p.numPiece = i;
      p.handLine = 1;
      if(i > 6){
        p.handLine = 2;
      }
      if(i > 13){
        p.handLine = 3;
      }

      this.numHandPiecesP2++;
  	}


  	for(var line=0; line<state.board.length; line++){
  		for(var col=0; col<state.board[line].length; col++){
  			if(state.board[line][col] != "sunTile" && state.board[line][col] != "free" && state.board[line][col] != "moonTile"){
  				var p = new Piece(this, "board", this.objects['piece'], state.board[line][col], line + 1, col + 1);
          p.changeAnimation("iddle");
  			}
  		}
  	}
}

XMLscene.prototype.movieBagAnimation = function(){
  for (var key in this.objects) {
    if (this.objects.hasOwnProperty(key)) {
      var obj = this.objects[key];
      if(obj instanceof Piece && obj.dest != "board"){
        obj.changeAnimation("bag");
      }
    }
  }
}

XMLscene.prototype.movieDrawPiece = function(){
  for (var key in this.objects) {
    if (this.objects.hasOwnProperty(key)) {
      var obj = this.objects[key];
      if(obj instanceof Piece ){
        if(obj.dest != "board"){
          /* this turn's player hand pieces */
          if(obj.dest == this.moviePlayer && obj.numPiece == 0){
              obj.changeAnimation("bag");
          /* the other player hand pieces */
          }else {
            if (obj.numPiece != 0) {
              obj.handPosition();
              obj.changeAnimation("iddle");
            }
          }
        }
      }
    }
  }
}

XMLscene.prototype.movieLoop = function(){
  this.state = this.gameStatesStack[this.movieIter];
  if(this.movieIter < this.gameStatesStack.length-1){
    if(this.movieIter == 0){
      mat4.identity(this.m);
      this.movie = false;
      this.reloadEntitiesForMovie(this.state,1);
      var movieVars = this.movieStates[this.movieIter];
      this.movieObj = this.objects[movieVars.pid];
      this.movieObj.setBoardPosition(0,0,0);
      this.typeOfMove = movieVars.type;
      this.movieBagAnimation();
    }else {
      this.movie = false;
      this.reloadEntitiesForMovie(this.state,2);
      var movieVars = this.movieStates[this.movieIter];

      switch (movieVars.type) {
        /* Pass */
        case 0:
        this.typeOfMove = movieVars.type;
        this.movieDrawPiece();
          break;
        /* Hand to board */
        case 1:
          this.movieObj = this.objects[movieVars.pid];
          this.movieObj.setBoardPosition(movieVars.x,movieVars.y,movieVars.z);
          this.typeOfMove = movieVars.type;
          this.movieDrawPiece();
          break;
        /* move piece */
        case 2:
          this.movieObj = this.objects[movieVars.pid];
          this.movieObj.setBoardPosition(movieVars.x,movieVars.y,movieVars.z);
          this.typeOfMove = movieVars.type;
          this.movieDrawPiece();
          break;
      }
    }
    this.movieIter++;
  }else {
    this.movie = false;
  }
}


XMLscene.prototype.menuLoop = function () {
	this.logPicking();
};

XMLscene.prototype.clearAllData = function () {
	this.gameStatesStack = [];
	this.loopState = 0;
	this.startGame = false;
	this.hasInited = false;
};

//------------------------------------------------------------------------------------------------------------

/**
* @function Displays the scene
*/
XMLscene.prototype.display = function () {

  /* Game sequence */
	if(this.startGame == true && this.hasInited == false){
		this.hasInited = true;
		this.server.makeRequest("startGame");
	}else if(this.startGame == true && this.hasInited == true){
		this.gameLoop();
	}else{
		this.menuLoop();
	}

  /* Movie sequence */
  if(this.movie){
    this.movieLoop();
  }

	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	for (i = 0; i < this.lights.length; i++){
		this.lights[i].setVisible(this.lightsVisible);
		this.lights[i].update();
	}

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk){

		this.multMatrix(this.m);

		// Draw axis
		if(this.graph.referenceLength != 0 && this.showAxis) this.axis.display();

		this.nodesDisplay();
	}
};

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
      		this.lights[i].enable();
		}else{
      		this.lights[i].disable();
		}

    this.lights[i].ID = light.tagId;
		this.lights[i].setPosition(light.position[0], light.position[1], light.position[2], light.position[3]);
		this.lights[i].setAmbient(light.ambient[0], light.ambient[1], light.ambient[2], light.ambient[3]);
		this.lights[i].setDiffuse(light.diffuse[0], light.diffuse[1], light.diffuse[2], light.diffuse[3]);
		this.lights[i].setSpecular(light.specular[0], light.specular[1], light.specular[2], light.specular[3]);

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

	this.objectsToRegister(obj);

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

  if(obj instanceof Piece){
    if(obj.hide){
      return true;
    }
    if(obj.dest == "p1" && this.hidePlayer1Pieces){
      return true;
    }
    if(obj.dest == "p2" && this.hidePlayer2Pieces){
      return true;
    }
  }

  //Multiply transformations matrix
	this.multMatrix(obj.matx);

  if(obj instanceof Marker){
  	obj.setShaderValues();
  	this.textTexture.bind(1);
  }

	for(var u=0; u < obj.descendants.length; u++){
		if(obj.descendants[u] in this.primitives ){
		  this.processPrimitiveDisplay(this.primitives[ obj.descendants[u] ], mat, tex);
		}
		else{
		  this.processNodeDisplay(this.objects[ obj.descendants[u] ] );
		}
	}

	if(obj instanceof Marker){
		this.setActiveShaderSimple(this.defaultShader);
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
XMLscene.prototype.processPrimitiveDisplay = function (obj, m, t, b) {

	m.apply();
	if(t!=null){
		if(obj.updatableTexCoords) obj.updateTexCoords(t.amplif_factor.s, t.amplif_factor.t);
		t.bind(0);
	}

	obj.display();
};
