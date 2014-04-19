Camera = function() {
  this.bob = 0;

  this.anchor = null;
};

Camera.prototype.transform = function() {
  mat4.rotate(gl.viewMatrix, gl.viewMatrix, -this.anchor.roll, [0, 0, 1]);
  mat4.rotate(gl.viewMatrix, gl.viewMatrix, -this.anchor.pitch, [1, 0, 0]);
  mat4.rotate(gl.viewMatrix, gl.viewMatrix, -this.anchor.yaw, [0, 1, 0]);
  mat4.translate(gl.viewMatrix, gl.viewMatrix, [
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