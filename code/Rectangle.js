function Rectangle(scene, p1x, p1y, p2x, p2y) {
	CGFobject.call(this, scene);

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

Rectangle.prototype.initBuffers = function () {

	this.primitiveType=this.scene.gl.TRIANGLES;
	
	this.vertices = [
            (-1*(this.rectWidth/2)),(this.rectHeight/2),0,
            (this.rectWidth/2),(this.rectHeight/2),0,
            (-1*(this.rectWidth/2)),(-1*(this.rectHeight/2)),0,
            (this.rectWidth/2),(-1*(this.rectHeight/2)),0
			];

	this.indices = [
            0,1,2,
            2,1,3
        ];

	this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

	this.texCoords = [
   		0,0,
   		1,0,
   		0,1,
   		1,1
		];
	
	this.initGLBuffers();
};
