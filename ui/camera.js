Camera = function() {
  this.bob = 0;

  this.anchor = null;
};

Camera.prototype.transform = function() {
  mat4.rotate(gl.modelMatrix, gl.modelMatrix, -this.anchor.roll, [0, 0, 1]);
  mat4.rotate(gl.modelMatrix, gl.modelMatrix, -this.anchor.pitch, [1, 0, 0]);
  mat4.rotate(gl.modelMatrix, gl.modelMatrix, -this.anchor.yaw, [0, 1, 0]);
  mat4.translate(gl.modelMatrix, gl.modelMatrix, [
    -this.anchor.position[0],
    -this.anchor.position[1],
    -this.anchor.position[2]
  ]);
};

Camera.prototype.setAnchor = function(anchor) {
  this.anchor = anchor;
};

Camera.prototype.center = function() {
  return this.position;
};

Camera.prototype.getPosition = function() {
  return this.anchor.position;
}