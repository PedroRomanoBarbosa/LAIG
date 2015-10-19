/**
* @constructs Triangle constructor
* @param {XMLscene} scene The scene object
* @param {string} id The id of the new triangle
* @param {Float} p1x X coordinate of first point of the triangle
* @param {Float} p1y Y coordinate of first point of the triangle
* @param {Float} p1z Z coordinate of first point of the triangle
* @param {Float} p2x X coordinate of second point of the triangle
* @param {Float} p2y Y coordinate of second point of the triangle
* @param {Float} p2z Z coordinate of second point of the triangle
* @param {Float} p3x X coordinate of third point of the triangle
* @param {Float} p3y Y coordinate of third point of the triangle
* @param {Float} p3z Z coordinate of third point of the triangle
*/
 function Triangle(scene, id, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z) {
 	CGFobject.call(this, scene);

 	this.ID=id;
 	this.updatableTexCoords=true;

	this.p1x = p1x;
   	this.p1y = p1y;
   	this.p1z = p1z;

   	this.p2x = p2x;
   	this.p2y = p2y;
   	this.p2z = p2z;

   	this.p3x = p3x;
   	this.p3y = p3y;
   	this.p3z = p3z;

   	this.a = Math.sqrt(
   	(this.p2x - this.p1x) * (this.p2x - this.p1x) +
   	(this.p2y - this.p1y) * (this.p2y - this.p1y) +
   	(this.p2z - this.p1z) * (this.p2z - this.p1z)
   	);

   	this.b = Math.sqrt(
   	(this.p1x - this.p3x) * (this.p1x - this.p3x) +
   	(this.p1y - this.p3y) * (this.p1y - this.p3y) +
   	(this.p1z - this.p3z) * (this.p1z - this.p3z)
   	);

   	this.c = Math.sqrt(
   	(this.p3x - this.p2x) * (this.p3x - this.p2x) +
   	(this.p3y - this.p2y) * (this.p3y - this.p2y) +
   	(this.p3z - this.p2z) * (this.p3z - this.p2z)
   	);

   	this.cosA = ( (-1) * this.c * this.c + this.b * this.b + this.a * this.a) / ( 2 * this.b * this.a);

   	this.angA = Math.acos(this.cosA);

   	this.ang = ( this.c * this.c - this.b * this.b + this.a * this.a ) / ( 2 * this.a * this.c );
   	this.beta = Math.acos(this.ang);

   	this.initBuffers();
 };

 Triangle.prototype = Object.create(CGFobject.prototype);
 Triangle.prototype.constructor = Triangle;

 /**
 * @function Initializes buffers of the triangle
 */
 Triangle.prototype.initBuffers = function() {

   this.primitiveType = this.scene.gl.TRIANGLES;

   //Vertex
   this.vertices = [
        this.p1x, this.p1y, this.p1z,
        this.p2x, this.p2y, this.p2z,
        this.p3x, this.p3y, this.p3z
			];

  //Indexes
   this.indices = [
            0,1,2
        ];

  //Normals
   this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

  //Texture coordinates
   this.texCoords = [
   			0.0, 1.0,
   			this.a, 1.0,
   			this.a - this.c * Math.cos(this.beta), 1 - Math.sqrt( (this.b * this.b) - ((this.a - this.c * Math.cos(this.beta)) * (this.a - this.c * Math.cos(this.beta))))
		];

   this.initGLBuffers();
};

/**
* @function Updates texture coordinates
* @param ampS amplification factor in S
* @param ampT amplification factor in T
*/
Triangle.prototype.updateTexCoords = function (ampS, ampT) {

	this.texCoords = [
   			0.0, 1.0,
   			this.a/ampS, 1.0,
   			(this.a - this.c * Math.cos(this.beta))/ampS, 1 - (Math.sqrt( (this.b * this.b) - ((this.a - this.c * Math.cos(this.beta)) * (this.a - this.c * Math.cos(this.beta)))))/ampT
		];

	this.updateTexCoordsGLBuffers();
};
