
function LinearAnimation(s, cP) {
     Animation.call(s);
     this.controlPoints = cP;
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.move = function(){

}
