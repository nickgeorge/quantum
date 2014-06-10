Camera = function() {
  util.base(this, {});
  this.bob = 0;

  this.anchor = null;
  this.objectCache.transform = {
    anchorViewOrientation: quat.create(),
    anchorPosition: vec3.create(),
    negatedAnchorPosition: vec3.create(),
  }
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  var cache = this.objectCache.transform;

  gl.rotateView(
      this.anchor.getViewOrientation(cache.anchorViewOrientation));
  var position = vec3.copy(cache.anchorPosition,
      this.anchor.position);
  // position[1] += Math.cos(this.anchor.bobAge*10)/4;
  gl.translateView(vec3.negate(cache.negatedAnchorPosition, position));
  gl.uniform3fv(shaderProgram.eyeLocationUniform, position);
};

Camera.prototype.advance = function(dt) {
  this.bob = Math.cos(this.age);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};