Camera = function() {
  this.position = [];
  this.inversePosition_ = [];

  this.yaw = 0;
  this.pitch = 0;
  this.roll = 0;

  this.bob = 0;

  this.anchor = null;
};

Camera.prototype.transform = function() {
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.pitch, [1, 0, 0]);
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.yaw, [0, 1, 0]);
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.roll, [0, 0, 1]);
  mat4.translate(gl.mvMatrix, gl.mvMatrix, [
    -this.position[0],
    -this.position[1],
    -this.position[2]
  ]);
};

Camera.prototype.setPosition = function(xyz) {
  vec3.copy(this.position, xyz);
};

Camera.prototype.center = function() {
  return this.position;
};

StaticAnchor = function() {
  this.yaw = 0;
  // this.pitch = -PI/4;
  // this.position = [0, -10, 40];
}

StaticAnchor.prototype.eyeLevel = function() {
  return this.position;
}
