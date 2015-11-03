function CircularAnimation(s, c, r, sA, rA) {
     Animation.call(s);
     this.center = c;
     this.radius = r;
     this.startAng = sA;
     this.rotAng = rA;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.move = function(){

}
