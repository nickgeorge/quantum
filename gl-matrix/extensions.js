vec3.ZERO = [0, 0, 0];
vec3.I = [1, 0, 0];
vec3.J = [0, 1, 0];
vec3.K = [0, 0, 1];
vec4.WHITE = [1, 1, 1, 1];
vec4.BLACK = [0, 0, 0, 1];

/**
 * A vector that can be used as a temporary container.
 * This avoids having to create a lot of extra vectors.
 * @type {vec3}
 */
vec3.temp = vec3.create();

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