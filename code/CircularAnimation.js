function CircularAnimation(s, c, r, sA, rA) {
     Animation.call(this,s);
     this.center = c;
     this.radius = r;
     this.startAng = sA;
     this.rotAng = rA;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

Animation.prototype.updateMatrix = function(timePassed){

};
