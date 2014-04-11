GL = function(){}

GL.createGL = function(canvas) {
  var gl;
  try {
    gl = canvas.getContext('experimental-webgl');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {console.log('Didn\'t init GL')}

  gl.mvMatrix = mat4.create();
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
  mat4.copy(this.stack[this.stackIndex], this.mvMatrix);
};

GL.prototype.popMatrix = function() {
  if (this.stackIndex == -1) {
    throw 'Invalid popMatrix!';
  }
  mat4.copy(this.mvMatrix, this.stack[this.stackIndex]);
  this.stackIndex--;
};

GL.prototype.setMatrixUniforms = function(opt_shaderProgram) {
  var thisShaderProgram = opt_shaderProgram || shaderProgram;
  this.uniformMatrix4fv(thisShaderProgram.pMatrixUniform, false, this.pMatrix);
  this.uniformMatrix4fv(thisShaderProgram.mvMatrixUniform, false, this.mvMatrix);

  mat3.fromMat4(this.normalMatrix,
      mat4.invert([], this.mvMatrix));
  mat3.transpose(this.normalMatrix, this.normalMatrix);
  this.uniformMatrix3fv(
      thisShaderProgram.nMatrixUniform,
      false,
      this.normalMatrix);
};

GL.prototype.rotate = function (angle, axis) {
  mat4.rotate(this.mvMatrix, this.mvMatrix, angle, axis);
};

GL.prototype.translate = function(xyz) {
  mat4.translate(this.mvMatrix, this.mvMatrix, xyz);
};
