
function LinearAnimation(s, cP) {
     Animation.call(this,s);
     this.controlPoints = cP;
     this.controlPointsDistance = [];
     this.distance = 0;

     /* get the total distance */
     for (var i = 0; i < this.controlPoints.length-1; i++) {
       var dist = distance(this.controlPoints[i], this.controlPoints[i+1]);
       this.controlPointsDistance.push(dist);
       this.distance += dist;
     }

     /* get the velocity */
     this.velocity = this.distance/this.span;
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.updateMatrix = function(timePassed){
  var distance = timePassed*this.velocity;
  var distanceSum = 0;
  for (var i = 0; i < this.controlPoints.length-1; i++) {
    distanceSum += this.controlPointsDistance[i];
    if(distanceSum > distance){
      return pointBetweenPoints(this.controlPoints[i],this.controlPoints[i+1],(distanceSum - this.controlPointsDistance[i]), this.controlPointsDistance[i]);
    }
  }
};

var distance = function(p1, p2){
    var dx = (p1[0] - p2[0]).toFixed(10);
    var dy = (p1[1] - p2[1]).toFixed(10);
    var dz = (p1[2] - p2[2]).toFixed(10);

    return Math.sqrt( dx*dx + dy*dy + dz*dz );
}

var pointBetweenPoints = function(p1,p2,t,max){
  return [1,1,1];
}
