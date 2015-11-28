
function Piece(scene, id, symbolTex, bodyTex, material) {
  CGFobject.call(this, scene);

	this.scene = scene;
  this.ID = id;
	this.updatableTexCoords=false;
  this.sTex = symbolTex;
  this.bTex = bodyTex;
  this.mat = material;

	this.corner = new Patch(this.scene, "", 2, 2, 5, 5,
	[
		[
			[0, 0, 1, 1],
			[0, 0.707106781, 0.707106781, 1],
			[0, 1, 0, 1]
		],
		[
			[0.707106781, 0, 0.707106781, 1],
			[0.707106781, 0.707106781, 0.707106781, 1],
			[0, 1, 0, 1]
		],
		[
			[1, 0, 0, 1],
			[0.707106781, 0.707106781, 0, 1],
			[0, 1, 0, 1]
		]
	]);

  this.side = new Patch(this.scene, "", 2, 2, 5, 5,
	[
    [
			[0, 0, 1, 1],
			[0, 0.707106781, 0.707106781, 1],
			[0, 1, 0, 1]
		],
    [
			[1.5, 0, 1, 1],
			[1.5, 0.707106781, 0.707106781, 1],
			[1.5, 1, 0, 1]
		],
    [
			[3, 0, 1, 1],
			[3, 0.707106781, 0.707106781, 1],
			[3, 1, 0, 1]
		]
	]);

  this.corner2 = new Patch(this.scene, "", 2, 2, 5, 5,
	[
    [
			[0, 0, 1, 1],
			[0, 0.707106781, 0.707106781, 1],
			[0, 1, 0, 1]
		],
		[
			[0.707106781, 0, 0.707106781, 1],
			[0.707106781, 0.707106781, 0.707106781, 1],
			[0, 1, 0, 1]
		],
		[
			[1, 0, 0, 1],
			[0.707106781, 0.707106781, 0, 1],
			[0, 1, 0, 1]
		]
	]);

  this.square = new Rectangle(this.scene,"",0.5,0.5,-0.5,-0.5);

};

Piece.prototype = Object.create(CGFobject.prototype);
Piece.prototype.constructor = Piece;

Piece.prototype.display = function() {

	var deg2rad=Math.PI/180.0;

  this.mat.apply();
  this.scene.scale(0.4,0.4,0.4);

  //Display bottom
  for (var i = 0; i < 4; i++) {
    this.scene.pushMatrix();
    this.scene.translate(0,-0.4,0);
    this.scene.rotate(180*deg2rad,0,0,1);
    this.scene.rotate(90*i*deg2rad,0,1,0);

      //Corner
      this.scene.pushMatrix();
      this.scene.translate(3,0,3);
      this.corner.display();
      this.scene.popMatrix();

      //Side 1
      this.scene.pushMatrix();
      this.scene.translate(3,0,3);
      this.scene.rotate(90*deg2rad,0,1,0);
      this.side.display();
      this.scene.popMatrix();

      //Side 2
      this.scene.pushMatrix();
      this.scene.translate(0,0,3);
      this.side.display();
      this.scene.popMatrix();

    this.scene.popMatrix();
  }
  this.scene.pushMatrix();
    this.scene.translate(0,-1.4,0);
    this.scene.scale(6,6,6);
    this.scene.rotate(-90*degToRad,1,0,0);
    this.sTex.bind();
    this.square.display();
    this.sTex.unbind();
  this.scene.popMatrix();

  //Display middle
  for (var i = 0; i < 4; i++) {
    this.scene.pushMatrix();
    this.scene.translate(0,0.4,0);
    this.scene.rotate(90*i*deg2rad,0,1,0);

      this.scene.pushMatrix();
      this.scene.translate(3,0,3);
      this.scene.scale(1,0.3,1);
      this.scene.rotate(-90*deg2rad,0,0,1);
      this.side.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(0,-0.4,-4);
      this.scene.scale(6,0.8,6);
      this.square.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.square.display();
      this.scene.popMatrix();

    this.scene.popMatrix();
  }

  //Display top
  for (var i = 0; i < 4; i++) {
    this.scene.pushMatrix();
    this.scene.translate(0,0.4,0);
    this.scene.rotate(90*i*deg2rad,0,1,0);
      this.scene.pushMatrix();
      this.scene.translate(3,0,3);
      this.corner.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(3,0,3);
      this.scene.rotate(90*deg2rad,0,1,0);
      this.side.display();
      this.scene.popMatrix();

      this.scene.pushMatrix();
      this.scene.translate(0,0,3);
      this.side.display();
      this.scene.popMatrix();
    this.scene.popMatrix();
  }
  this.scene.pushMatrix();
    this.scene.translate(0,1.4,0);
    this.scene.scale(6,6,6);
    this.scene.rotate(90*degToRad,1,0,0);
    this.sTex.bind();
    this.square.display();
    this.sTex.unbind();
  this.scene.popMatrix();

};
