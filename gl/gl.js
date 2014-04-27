GL = function(){}

GL.createGL = function(canvas) {
  var gl;
  try {
    gl = canvas.getContext('experimental-webgl');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {console.log('Didn\'t init GL')}

  gl.modelMatrix = mat4.create();
  gl.viewMatrix = mat4.create();
  gl.perspectiveMatrix = mat4.create();
  gl.normalMatrix = mat3.create();

  gl.modelMatrixStack = new MatrixStack();
  gl.viewMatrixStack = new MatrixStack();

  gl.canvas = canvas;

  for (var key in GL.prototype) {
    gl[key] = GL.prototype[key];
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.cullFace(gl.BACK);

  gl.extensions = {};
  gl.extensions.anisotropicFilter

  return gl;
}

GL.prototype.pushModelMatrix = function() {
  this.modelMatrixStack.push(this.modelMatrix);
};

GL.prototype.popModelMatrix = function() {
  mat4.copy(this.modelMatrix, this.modelMatrixStack.pop());
};

GL.prototype.pushViewMatrix = function() {
  this.viewMatrixStack.push(this.viewMatrix);
};

GL.prototype.popViewMatrix = function() {
  mat4.copy(this.viewMatrix, this.viewMatrixStack.pop());
};

GL.prototype.setMatrixUniforms = function() {
  this.uniformMatrix4fv(shaderProgram.perspectiveMatrixUniform, false, this.perspectiveMatrix);
  this.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, this.modelMatrix);
  this.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, this.viewMatrix);

  mat3.fromMat4(this.normalMatrix,
      mat4.invert([], this.modelMatrix));
  mat3.transpose(this.normalMatrix, this.normalMatrix);
  this.uniformMatrix3fv(
      shaderProgram.normalMatrixUniform,
      false,
      this.normalMatrix);
};

GL.prototype.rotate = function (angle, axis) {
  mat4.rotate(this.modelMatrix, this.modelMatrix, angle, axis);
};

GL.prototype.translate = function(xyz) {
  mat4.translate(this.modelMatrix, this.modelMatrix, xyz);
};

GL.prototype.transform = function(transformation) {
  mat4.multiply(this.modelMatrix, this.modelMatrix, transformation);
};

GL.prototype.transformView = function(transformation) {
  mat4.multiply(this.viewMatrix, this.viewMatrix, transformation);
};
