Camera = function() {
  this.bob = 0;

  this.anchor = null;
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  gl.transformView(this.anchor.toLocalTransform);
  gl.uniform3fv(shaderProgram.eyeLocationUniform, this.anchor.position);
};

Camera.prototype.advance = function(dt) {
  this.bob = Math.cos(this.age);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};