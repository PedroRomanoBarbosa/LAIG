
function LinearAnimation(something) {
     Animation.call(this);
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.move = function(){
  console.log("LinearAnimation moved!");
}
