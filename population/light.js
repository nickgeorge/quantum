Light = function() {
  this.ambientColor = vec3.create();
  this.directionalColor = vec3.create();
  this.position = vec3.create();
  this.anchor = null;
  this.finalPosition = vec3.create();
  this.cameraMatrix = mat3.create();
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

  gl.uniform3fv(shaderProgram.ambientColorUniform, this.ambientColor);
  gl.uniform3fv(shaderProgram.pointLightingLocationUniform, this.position);
  gl.uniform3fv(shaderProgram.pointLightingColorUniform, this.directionalColor);
};
