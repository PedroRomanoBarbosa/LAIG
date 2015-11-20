/**
* @constructs Rectangle constructor
* @param {XMLscene} scene The scene object
* @param {string} id The id of the new rectangle
* @param {Float} p1x X coordinate of first point of the rectangle
* @param {Float} p1y Y coordinate of first point of the rectangle
* @param {Float} p1z Z coordinate of first point of the rectangle
* @param {Float} p2x X coordinate of second point of the rectangle
* @param {Float} p2y Y coordinate of second point of the rectangle
* @param {Float} p2z Z coordinate of second point of the rectangle
*/
function Rectangle(scene, id, p1x, p1y, p2x, p2y) {
	CGFobject.call(this, scene);

	this.ID = id;
	this.updatableTexCoords=true;

	this.p1x = p1x;
	this.p1y = p1y;
	this.p2x = p2x;
	this.p2y = p2y;

	this.rectHeight = Math.abs(p2y - p1y);
	this.rectWidth = Math.abs(p2x - p1x);

	this.initBuffers();
};

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor=Rectangle;

/**
* @function Initializes buffers of the rectangle
*/
Rectangle.prototype.initBuffers = function () {

	this.primitiveType=this.scene.gl.TRIANGLES;

	this.vertices = [
            this.p1x, this.p1y, 0,
            this.p2x, this.p1y, 0,
            this.p1x, this.p2y, 0,
            this.p2x, this.p2y, 0
			];

	this.indices = [
            2,1,0,
            3,1,2
        ];

	this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

	this.texCoords = [
   		0,0,
   		this.rectWidth,0,
   		0,this.rectHeight,
   		this.rectWidth,this.rectHeight
		];

	this.initGLBuffers();
};

/**
* @function Updates texture coordinates
* @param ampS amplification factor in S
* @param ampT amplification factor in T
*/
Rectangle.prototype.updateTexCoords = function (ampS, ampT) {

	this.texCoords = [
   		0,0,
   		this.rectWidth/ampS,0,
   		0,this.rectHeight/ampT,
   		this.rectWidth/ampS,this.rectHeight/ampT
		];

	this.updateTexCoordsGLBuffers();
};
