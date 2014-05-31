vec3.ZERO = vec3.fromValues(0, 0, 0);
vec3.I = vec3.fromValues(1, 0, 0);
vec3.J = vec3.fromValues(0, 1, 0);
vec3.K = vec3.fromValues(0, 0, 1);
vec3.NEG_K = vec3.fromValues(0, 0, -1);
vec4.WHITE = vec4.fromValues(1, 1, 1, 1);
// vec4.WHITE = [1, 1, 1, 1];
vec4.BLACK = vec4.fromValues(0, 0, 0, 1);
quat.IDENTITY = quat.create();

/**
 * A vector that can be used as a temporary container.
 * This avoids having to create a lot of extra vectors.
 * @type {vec3}
 */
vec3.temp = vec3.create();
mat4.temp = mat4.create();
quat.temp = quat.create();

/**
 * Clones the passed vec3 if it exists.
 * Otherwise creates and returns a new one.
 * @param {vec3} a the vector to clone, if it exists
 * @returns {vec3} the nullably-cloned vector
 */
vec3.nullableClone = function(a) {
  if (a) {
    return vec3.clone(a);
  } else {
    return vec3.create();
  }
};


vec3.equals = function(a, b) {
  return a[0] == b[0] &&
      a[1] == b[1] &&
      a[2] == b[2];
};


vec4.equals = function(a, b) {
  return a[0] == b[0] &&
      a[1] == b[1] &&
      a[2] == b[2] &&
      a[3] == b[3];
};


quat.equals = vec4.equals;

/**
 * Clones the passed vec4 if it exists.
 * Otherwise creates and returns a new one.
 * @param {vec4} a the vector to clone, if it exists
 * @returns {vec4} the nullably-cloned vector
 */
vec4.nullableClone = function(a) {
  if (a) {
    return vec4.clone(a);
  } else {
    return vec4.create();
  }
};


vec4.randomColor = function(out) {
  var r = GLMAT_RANDOM() * Math.PI;
  var z = (GLMAT_RANDOM());
  var zScale = Math.sqrt(1.0-z*z);

  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z;
  out[3] = 1;
  return out;
};

/**
 * Clones the passed quat if it exists.
 * Otherwise creates and returns a new one.
 * @param {quat} a the vector to clone, if it exists
 * @returns {quat} the nullably-cloned vector
 */
quat.nullableClone = function(a) {
  if (a) {
    return quat.clone(a);
  } else {
    return quat.create();
  }
};

/**
 * Overrides transformMat4 to take an optional w value,
 * rather than assuming 1.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m, opt_w) {
    var w = opt_w === undefined ? 1 : opt_w;
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + w * m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + w * m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + w * m[14];
    return out;
};


vec3.project = function(out, a, b) {
  var a_dot_b = vec3.dot(a, b);
  var b_dot_b = vec3.dot(b, b);
  var scale = a_dot_b / b_dot_b;
  return vec3.scale(out, b, scale)
};

vec3.pitch = function(a) {
  var opposite = a[1];
  var adjacent = Math.sqrt(util.math.sqr(a[0]) + util.math.sqr(a[2]));
  return Math.atan2(opposite, adjacent);
};


vec3.pitchTo = (function() {
  var tmpvec3 = vec3.create();
  return function(v2, v1) {
    var diff = vec3.subtract(tmpvec3, v2, v1);
    var d_ground = Math.sqrt(util.sqr(diff[0]) + util.sqr(diff[2]));

    return Math.atan2(diff[1], d_ground);
  };
})();


vec3.pointToLine = (function() {
  var tmpvec3 = vec3.create();
  return function(out, a, point_on_line, line_vector) {
    var vDelta = vec3.subtract(tmpvec3,
        point_on_line,
        a);
    return vec3.normalize(out,
        vec3.subtract(out,
            vDelta,
            vec3.scale(out,
                line_vector,
                vec3.dot(vDelta, line_vector))));
  };
})();