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
  gl.pMatrix = mat4.create();

  gl.stack = [];
  gl.stackIndex = -1;

  gl.normalMatrix = mat3.create();
  gl.canvas = canvas;

  for (var key in GL.prototype) {
    gl[key] = GL.prototype[key];
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.cullFace(gl.BACK);

  return gl;
}

GL.prototype.pushMatrix = function() {
  this.stackIndex++;
  if (!this.stack[this.stackIndex]) {
    this.stack.push(mat4.create());
  }
  mat4.copy(this.stack[this.stackIndex], this.modelMatrix);
};

GL.prototype.popMatrix = function() {
  if (this.stackIndex == -1) {
    throw 'Invalid popMatrix!';
  }
  mat4.copy(this.modelMatrix, this.stack[this.stackIndex]);
  this.stackIndex--;
};

GL.prototype.setMatrixUniforms = function() {
  this.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
  this.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, this.modelMatrix);
  this.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, this.viewMatrix);

  mat3.fromMat4(this.normalMatrix,
      mat4.invert([], this.modelMatrix));
  mat3.transpose(this.normalMatrix, this.normalMatrix);
  this.uniformMatrix3fv(
      shaderProgram.nMatrixUniform,
      false,
      this.normalMatrix);
};

GL.prototype.rotate = function (angle, axis) {
  mat4.rotate(this.modelMatrix, this.modelMatrix, angle, axis);
};

GL.prototype.translate = function(xyz) {
  mat4.translate(this.modelMatrix, this.modelMatrix, xyz);
};
