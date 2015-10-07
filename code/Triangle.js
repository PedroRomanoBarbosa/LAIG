
 function Triangle(scene, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z) {
 	CGFobject.call(this, scene);

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
   (this.p1x - this.p3x) * (this.p1x - this.p3x) +
   (this.p1y - this.p3y) * (this.p1y - this.p3y) +
   (this.p1z - this.p3z) * (this.p1z - this.p3z)
   );

   this.b = Math.sqrt(
   (this.p2x - this.p1x) * (this.p2x - this.p1x) +
   (this.p2y - this.p1y) * (this.p2y - this.p1y) +
   (this.p2z - this.p1z) * (this.p2z - this.p1z)
   );

   this.c = Math.sqrt(
   (this.p3x - this.p2x) * (this.p3x - this.p2x) +
   (this.p3y - this.p2y) * (this.p3y - this.p2y) +
   (this.p3z - this.p2z) * (this.p3z - this.p2z)
   );
   
   this.cosAlpha = (-this.a*this.a + this.b*this.b + this.c * this.c) / (2 * this.b * this.c);
   this.cosBeta =  ( this.a*this.a - this.b*this.b + this.c * this.c) / (2 * this.a * this.c);
   this.cosGamma = ( this.a*this.a + this.b*this.b - this.c * this.c) / (2 * this.a * this.b);

   this.beta = Math.acos(this.cosBeta);
   this.alpha = Math.acos(this.cosAlpha);
   this.gamma = Math.acos(this.cosGamma);

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
   		(this.c - this.a * Math.cos(this.beta)), 0.0,
   		0.0, 1,
   		this.c, 1.0
		];

   this.initGLBuffers();
};
