Camera = function() {
  util.base(this, {});
  this.bob = 0;

  this.anchor = null;
  this.objectCache.transform = {
    viewOrientation: quat.create(),
    conjugateViewOrientation: quat.create(),
    anchorPosition: vec3.create(),
    bobOffset: vec3.create(),
    negatedAnchorPosition: vec3.create(),
  }
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  var cache = this.objectCache.transform;

  var viewOrientation = this.anchor.getViewOrientation(cache.viewOrientation)
  var conjugateViewOrientation = quat.conjugate(
      cache.conjugateViewOrientation,
      viewOrientation);
  gl.rotateView(conjugateViewOrientation);
  var position = vec3.copy(cache.anchorPosition,
      this.anchor.position);

  var bobOffset = vec3.set(cache.bobOffset,
      0, Math.cos(this.anchor.bobAge*10)/3, 0);
  vec3.transformQuat(bobOffset,
      bobOffset,
      viewOrientation);

  vec3.add(position, position, bobOffset);
  gl.translateView(vec3.negate(cache.negatedAnchorPosition, position));
  gl.uniform3fv(shaderProgram.eyeLocationUniform, position);
};

Camera.prototype.advance = function(dt) {
  this.bob = Math.cos(this.age);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};