
function LinearAnimation(id, s, cP) {
     Animation.call(this,s,id);
     this.controlPoints = cP;
     this.controlPointsDistance = [];
     this.distance = 0;
     this.controlPointsAngle = [];

     /* get the total distance and push to arrays */
     for (var i = 0; i < this.controlPoints.length-1; i++) {
       var dist = distance(this.controlPoints[i], this.controlPoints[i+1]);
       this.controlPointsDistance.push(dist);
       var angle = this.calculateAngle(this.controlPoints[i], this.controlPoints[i+1]);
       // If its a fully vertical animation
       if(angle == null){
         if(i == 0){
           angle = 0;
         }else{
          angle = this.controlPointsAngle[i-1];
         }
       }
       this.controlPointsAngle.push(angle);
       this.distance += dist;
     }
     /* get the velocity */
     this.velocity = this.distance/this.span;
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.updateMatrix = function(timePassed){
  var distance = timePassed * this.velocity;
  var distanceSum = 0;
  var transformation = {};
  transformation.translation = [];
  for (var i = 0; i < this.controlPoints.length-1; i++) {
    distanceSum += this.controlPointsDistance[i];
    if(distanceSum > distance){
      transformation.translation = pointBetweenPoints(this.controlPoints[i],this.controlPoints[i+1],distance - (distanceSum - this.controlPointsDistance[i]), this.controlPointsDistance[i]);
      transformation.angle = this.controlPointsAngle[i];
      return transformation;
    }
  }
  return [0,0,0];
};

var distance = function(p1, p2){
    var dx = (p1[0] - p2[0]).toFixed(10);
    var dy = (p1[1] - p2[1]).toFixed(10);
    var dz = (p1[2] - p2[2]).toFixed(10);

    return Math.sqrt( dx*dx + dy*dy + dz*dz );
}

var pointBetweenPoints = function(p1,p2,t,max){
  var percentage = t/max;
  var x = p1[0] + percentage*(p2[0] - p1[0]);
  var y = p1[1] + percentage*(p2[1] - p1[1]);
  var z = p1[2] + percentage*(p2[2] - p1[2]);
  return [x,y,z];
}

LinearAnimation.prototype.calculateAngle = function(p1,p2){
  var x = p2[0] - p1[0];
  var z = p2[2] - p1[2];

  // If the vector is fully vertical
  if(x == 0 && z == 0 ){
    return null;
  }

  // If z coord is negative
  if(z == 0){
    if(x < 0){
      return Math.PI * 0.5;
    }else{
      return Math.PI * -0.5;
    }
  }

  // Else
  return Math.atan2(x,z);
}

LinearAnimation.prototype.lastTransformation = function(){
  var transformation = {};
  transformation.translation = this.controlPoints[this.controlPoints.length-1];
  transformation.angle = this.controlPointsAngle[this.controlPointsAngle.length-1];
  return transformation;
}
