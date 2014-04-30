Vector = {
  ZERO: [0, 0, 0],
  I: [1, 0, 0],
  J: [0, 1, 0],
  K: [0, 0, 1],
  WHITE: [1, 1, 1],
  BLACK: [0, 0, 0],
};

Vector.yawTo = function(v1, v2) {
  return Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
};

Vector.pitchTo = function(v1, v2) {
  var diff = Vector.difference(v1, v2);
  var d_ground = Math.sqrt(util.sqr(diff[0]) + util.sqr(diff[1]));

  return Math.atan2(d_ground, diff[2]);
};

Vector.average = function(v1, v2) {
  return Vector.multiply(Vector.sum(v1, v2), .5);
};