
 function Sphere(scene, radius, stacks, slices) {
 	CGFobject.call(this, scene);

   this.radius=radius;
   this.stacks=stacks;
   this.slices=slices;

   this.initBuffers();
 };

 Sphere.prototype = Object.create(CGFobject.prototype);
 Sphere.prototype.constructor = Sphere;

 Sphere.prototype.initBuffers = function() {

  this.vertices = [];
  this.normals = [];
  this.indices = [];
  this.texCoords = [];
  
  var deg2rad=Math.PI/180.0;
  var ang = 360/this.slices;
  var a_rad=ang*deg2rad;

  //CALCULO DOS VERTICES E DAS NORMAIS
  for(var j = 0; j < this.stacks+1; j++){
    for(var i = 0; i < this.slices+1; i++){
     this.vertices.push(this.radius*Math.cos());
     this.normals.push();
     this.texCoords.push((ang*i)/360, heightInc*j);
    }
 }

 //CALCULO DOS INDICES
 for(var j = 0; j < this.stacks; j++){
   for(var i = 0; i < this.slices; i++){
    this.indices.push(i + j * ( this.slices + 1 ), i + 1 + j * ( this.slices + 1 ), i + 1 + ( j + 1 ) * ( this.slices + 1 ));
    this.indices.push(i + j * ( this.slices + 1 ), i + 1 + ( j + 1 ) * ( this.slices + 1 ), i + ( j + 1 ) * ( this.slices + 1 ));
   }
 }


this.primitiveType = this.scene.gl.TRIANGLES;
this.initGLBuffers();

};
