
function Animation(s) {
  this.span = s;
  this.matrix = mat4.create();
  mat4.identity(this.matrix);
};

Animation.prototype.updateMatrix = function(timePassed){
  return this.matrix;
};
