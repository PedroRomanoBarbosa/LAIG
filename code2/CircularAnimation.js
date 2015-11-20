function CircularAnimation(s, c, r, sA, rA) {
     Animation.call(this,s);
     this.center = c;
     this.radius = r;
     this.startAng = sA;
     this.rotAng = rA;

     /* Velocity */
     this.velocity = this.rotAng/this.span;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

Animation.prototype.updateMatrix = function(timePassed){
  this.angle = (timePassed * this.velocity + this.startAng) * Math.PI/180;
  var x = this.radius * Math.cos(this.angle);
  var z = this.radius * Math.sin(this.angle);
  var transformation = {};
  transformation.translation = [x + this.center[0], this.center[1], z + this.center[2]];
  transformation.angle = -1*this.angle;
  if(this.rotAng < 0){
    transformation.angle += Math.PI;
  }
  return transformation;
};

CircularAnimation.prototype.lastTransformation = function(){
  var transformation = {};
  transformation = this.updateMatrix(this.span);
  return transformation;
}
