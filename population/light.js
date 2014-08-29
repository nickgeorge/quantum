Light = function(message) {
  this.ambientColor = vec3.nullableClone(message.ambientColor);
  this.directionalColor = vec3.nullableClone(message.directionalColor);
  this.anchor = message.anchor;
};

Light.prototype.setAmbientColor = function(rgb) {
  vec3.copy(this.ambientColor, rgb);
};

Light.prototype.setDirectionalColor = function(rgb) {
  vec3.copy(this.directionalColor, rgb);
};

Light.prototype.apply = function() {
  var shaderProgram = Env.gl.getActiveProgram();
  Env.gl.uniform3fv(shaderProgram.ambientColorUniform, this.ambientColor);
  Env.gl.uniform3fv(shaderProgram.pointLightingLocationUniform, this.anchor.position);
  Env.gl.uniform3fv(shaderProgram.pointLightingColorUniform, this.directionalColor);
};
