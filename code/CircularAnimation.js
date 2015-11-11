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
  var angle = (timePassed * this.velocity + this.startAng) * Math.PI/180;
  var x = this.radius * Math.cos(angle);
  var z = this.radius * Math.sin(angle);
  var transformation = {};
  transformation.translation = [x + this.center[0], this.center[1], z + this.center[2]];
  transformation.angle = -1*angle;
  return transformation;
};

var calculateAngle = function(){

}
