
 function Sphere(scene, id, radius, stacks, slices) {
 	CGFobject.call(this, scene);

 	this.ID=id;
 	this.updatableTexCoords=false;

   this.radius=radius;

   if(stacks<2) this.stacks=2;
   else this.stacks=stacks;

   if(slices<3) this.slices=3;
   else this.slices=slices;

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
  var angH = 360/this.slices;
  var angV = 180/this.stacks;
  var aH=angH*deg2rad;
  var aV=angV*deg2rad;

  //CALCULO DOS VERTICES E DAS NORMAIS
  for(var j = 0; j < this.stacks+1; j++){
    for(var i = 0; i < this.slices+1; i++){
      this.vertices.push(this.radius*Math.cos(i*aH)*Math.cos(j*aV-Math.PI/2), this.radius*Math.sin(i*aH)*Math.cos(j*aV-Math.PI/2), this.radius*Math.sin(j*aV-Math.PI/2));
      this.normals.push(Math.cos(i*aH)*Math.sin(j*aV), Math.sin(i*aH)*Math.sin(j*aV), Math.cos(j*aV));
      this.texCoords.push(Math.cos(i*aH)*Math.cos(j*aV-Math.PI/2), Math.sin(i*aH)*Math.cos(j*aV-Math.PI/2));
    }
 }

 //CALCULO DOS INDICES
 for(var j = 0; j < this.stacks; j++){
   for(var i = 0; i < this.slices; i++){
    this.indices.push(i + 1 + ( j + 1 ) * ( this.slices + 1 ), i + j * ( this.slices + 1 ), i + 1 + j * ( this.slices + 1 ));
    this.indices.push(i + j * ( this.slices + 1 ), i + 1 + ( j + 1 ) * ( this.slices + 1 ), i + ( j + 1 ) * ( this.slices + 1 ));
   }
 }


this.primitiveType = this.scene.gl.TRIANGLES;
this.initGLBuffers();

};
