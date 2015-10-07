
 function Cylinder(scene, slices, stacks, height, topRadius, bottomRadius) {
 	CGFobject.call(this, scene);

   this.slices=slices;
   this.stacks=stacks;
   this.cylHeight=height;
   this.radiusInc=(topRadius - bottomRadius)/stacks;
   this.heightInc=height/stacks;

   this.initBuffers();
 };

 Cylinder.prototype = Object.create(CGFobject.prototype);
 Cylinder.prototype.constructor = Cylinder;

 Cylinder.prototype.initBuffers = function() {

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
     this.vertices.push( (this.bottomRadius + (j*this.radiusInc)) * Math.cos(a_rad*i), (this.bottomRadius + (j*this.radiusInc)) * Math.sin(a_rad*i), (heightInc*j)-0.5);
     this.normals.push(Math.cos(a_rad*i),Math.sin(a_rad*i),0);
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
