
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

 Triangle.prototype.initBuffers = function() {

   this.primitiveType = this.scene.gl.TRIANGLES;

   this.vertices = [
        this.p1x, this.p1y, this.p1z,
        this.p2x, this.p2y, this.p2z,
        this.p3x, this.p3y, this.p3z
			];

   this.indices = [
            0,1,2
        ];

   this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

   this.texCoords = [
   			0.0, 1.0,
   			this.a, 1.0,
   			this.a - this.c * Math.cos(this.beta), 1 - Math.sqrt( (this.b * this.b) - ((this.a - this.c * Math.cos(this.beta)) * (this.a - this.c * Math.cos(this.beta))))
		];

   this.initGLBuffers();
};

Triangle.prototype.updateTexCoords = function (ampS, ampT) {

	this.texCoords = [
   			0.0, 1.0,
   			this.a/ampS, 1.0,
   			(this.a - this.c * Math.cos(this.beta))/ampS, 1 - (Math.sqrt( (this.b * this.b) - ((this.a - this.c * Math.cos(this.beta)) * (this.a - this.c * Math.cos(this.beta)))))/ampT
		];

	this.updateTexCoordsGLBuffers();
};