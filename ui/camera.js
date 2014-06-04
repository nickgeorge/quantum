Camera = function() {
  this.bob = 0;

  this.anchor = null;
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  gl.rotateView(this.anchor.getViewRotation([]));
  var position = vec3.copy(vec3.temp, this.anchor.position);
  // position[1] += Math.cos(this.anchor.bobAge*10)/4;
  gl.translateView(vec3.negate(vec3.temp, position));
  gl.uniform3fv(shaderProgram.eyeLocationUniform, position);
};

Camera.prototype.advance = function(dt) {
  this.bob = Math.cos(this.age);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};