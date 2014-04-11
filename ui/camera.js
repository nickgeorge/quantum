Camera = function() {
  this.position = [];
  this.inversePosition_ = [];
  this.vX = 0;
  this.vY = 0;
  this.vTheta = 0;
  this.vPhi = 0;
  this.theta = 0;
  this.phi = 0;

  this.roll = 0;

  this.vPhiMag = 1/2*Math.PI;
  this.vThetaMag = 1/2*Math.PI;
  this.vRMag = 20;

  this.bob = 0;

  this.anchor = null;
};

Camera.prototype.advance = function(dt) {
  this.phi += this.vPhi * dt;
  this.theta += this.vTheta * dt;
  this.roll += .3 * dt;
};

Camera.prototype.transform = function() {
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.phi, [1, 0, 0]);
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.theta, [0, 0, 1]);
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, -this.roll, [0, 1, 0]);
  mat4.translate(gl.mvMatrix, gl.mvMatrix, [
    -this.position[0],
    -this.position[1],
    -this.position[2]
  ]);
};

Camera.prototype.setPosition = function(xyz) {
  vec3.copy(this.position, Vector.invert(xyz));
};

Camera.prototype.center = function() {
  return this.position;
};

StaticAnchor = function() {
  this.theta = 0;
  // this.phi = -PI/4;
  // this.position = [0, -10, 40];
}

StaticAnchor.prototype.eyeLevel = function() {
  return this.position;
}
