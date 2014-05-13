Camera = function() {
  this.bob = 0;

  this.anchor = null;
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  gl.rotateView(quat.invert(quat.temp, this.anchor.viewOrientation));
  gl.translateView(vec3.negate(vec3.temp, this.anchor.position));
  gl.uniform3fv(shaderProgram.eyeLocationUniform, this.anchor.position);
};

Camera.prototype.advance = function(dt) {
  this.bob = Math.cos(this.age);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};