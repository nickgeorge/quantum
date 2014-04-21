Camera = function() {
  this.bob = 0;

  this.anchor = null;
};
util.inherits(Camera, Thing);

Camera.prototype.transform = function() {
  gl.transformView(this.anchor.toLocalTransform);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};