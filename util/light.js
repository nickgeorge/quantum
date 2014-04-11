Light = function() {
  this.ambientColor = vec3.create();
  this.directionalColor = vec3.create();
  this.position = vec3.create();
  this.anchor = null;
  this.swappedPosition = vec3.create();
};

Light.prototype.setAmbientColor = function(rgb) {
  vec3.copy(this.ambientColor, rgb);
};

Light.prototype.setDirectionalColor = function(rgb) {
  vec3.copy(this.directionalColor, rgb);
};

Light.prototype.setPosition = function(xyz) {
  vec3.copy(this.position, xyz);
};


Light.prototype.apply = function() {
  if (this.anchor) this.position = this.anchor.position;
  var position = vec3.copy(this.swappedPosition, this.position);
  var swap = this.swappedPosition[2];
  this.swappedPosition[2] = -this.swappedPosition[1];
  this.swappedPosition[1] = swap;
  gl.uniform3fv(shaderProgram.lightingPositionUniform, this.position);
  gl.uniform3fv(shaderProgram.ambientColorUniform, this.ambientColor);
  gl.uniform3fv(shaderProgram.directionalColorUniform, this.directionalColor);
};
