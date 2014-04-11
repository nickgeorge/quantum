var Physics = {};
var Collision = {};

Collision.check = function(thingA, thingB) {
  if (Collision.closeEnough(thingA, thingB)) {
    for (var i = 0; thingB.parts[i]; i++) {
      for (var j = 0; thingA.parts[j]; j++) {
        if (Collision.checkParts(
            thingA, thingA.parts[j], 
            thingB, thingB.parts[i])) {
          return true;
        }
      }
    }
  }
  return false;
};

Collision.closeEnough = function(thingA, thingB) {
  var centerA = thingA.center();
  var centerB = thingB.center();
  var d_x = centerA[0] - centerB[0];
  var d_y = centerA[1] - centerB[1];
  var d_z = centerA[2] - centerB[2];
  return d_x*d_x + d_y*d_y + d_z*d_z < 
      thingA.getOuterRadius() + thingB.getOuterRadius();
};

// TODO: worst. collision algorithm. ever. 
Collision.checkParts = function(thingA, partA, thingB, partB) {
  var averageA = 
      (partA.size[0] + partA.size[1] + partA.size[2]) / 3;
  var averageB = 
      (partB.size[0] + partB.size[1] + partB.size[2]) / 3;

  var centerA = Vector.sum(thingA.center(), partA.position);
  var centerB = Vector.sum(thingB.center(), partB.position);
  var d_x = centerA[0] - centerB[0];
  var d_y = centerA[1] - centerB[1];
  var d_z = centerA[2] - centerB[2];
  return d_x*d_x + d_y*d_y + d_z*d_z < 
      averageA*averageA + averageB*averageB;  
};