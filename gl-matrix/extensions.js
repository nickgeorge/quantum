vec3.ZERO = [0, 0, 0];
vec3.I = [1, 0, 0];
vec3.J = [0, 1, 0];
vec3.K = [0, 0, 1];
vec4.WHITE = [1, 1, 1, 1];
vec4.BLACK = [0, 0, 0, 1];

vec3.yawTo = function(v1, v2) {
  return Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
};

vec3.pitchTo = function(v1, v2) {
  var diff = vec3.subtract([], v1, v2);
  var d_ground = Math.sqrt(util.sqr(diff[0]) + util.sqr(diff[1]));

  return Math.atan2(d_ground, diff[2]);
};

vec3.nullableClone = function(a) {
  if (a) {
    return vec3.clone(a);
  } else {
    return vec3.create();
  }
};