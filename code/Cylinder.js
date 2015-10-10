
 function Cylinder(scene, id, height, bottomRadius, topRadius, stacks, slices) {
 	CGFobject.call(this, scene);

  this.ID = id;

   if(stacks < 1){ this.stacks=1; }
   else{ this.stacks=stacks; }

   if(stacks < 3){ this.slices=3; }
   else{ this.slice=slices; }

   this.slices=slices;
   this.cylHeight=height;
   this.bottomRadius = bottomRadius;
   this.topRadius = topRadius;
   this.radiusInc=(topRadius - bottomRadius)/stacks;
   this.heigthInc = height/stacks;

   this.initBuffers();
 };

 Cylinder.prototype = Object.create(CGFobject.prototype);
 Cylinder.prototype.constructor = Cylinder;

 Cylinder.prototype.initBuffers = function() {

  this.vertices = [];
  this.normals = [];
  this.indices = [];
  this.texCoords = [];

  //Normals z-angle
  var ang_z = Math.atan( (this.topRadius - this.bottomRadius)/this.cylHeight);
  var normal_z = Math.cos(ang_z);

  var deg2rad=Math.PI/180.0;
  var ang = 360/this.slices;
  var a_rad=ang*deg2rad;
  //Vertices, normals, and textures
 for(var j = 0; j < this.stacks+1; j++){
   for(var i = 0; i < this.slices; i++){
    this.vertices.push( (this.topRadius-j*this.radiusInc)*Math.cos(a_rad*i), (this.topRadius-j*this.radiusInc)*Math.sin(a_rad*i), (this.cylHeight/2) - j*this.heigthInc);
    this.normals.push(Math.cos(a_rad*i),Math.sin(a_rad*i),normal_z);
    this.texCoords.push((ang*i)/360, this.heigthInc*j);
   }
 }

 //Indexes
 var init, init2;
 for(var j = 0; j < this.stacks; j++){
   for(var i = 0; i < (this.slices-1); i++){
    init = i+j*this.slices;
    init2 = i+(j+1)*this.slices;
    this.indices.push(init, init2, init2+1);
    this.indices.push(init, init2+1, init+1);
   }
   //Last side
   init = i+j*this.slices;
   init2 = i+(j+1)*this.slices;
   this.indices.push(init, init2, init2-(this.slices-1));
   this.indices.push(init, init2-(this.slices-1), init-(this.slices-1));
 }

this.primitiveType = this.scene.gl.TRIANGLES;
this.initGLBuffers();

};
