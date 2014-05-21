GL = function(){}

GL.createGL = function(canvas) {
  var gl;
  try {
    gl = canvas.getContext('experimental-webgl');
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {util.log('Didn\'t init GL')}

  gl.modelMatrix = mat4.create();
  gl.invertedModelMatrix = mat4.create();
  gl.viewMatrix = mat4.create();
  gl.perspectiveMatrix = mat4.create();
  gl.normalMatrix = mat3.create();

  gl.modelMatrixStack = new MatrixStack();
  gl.viewMatrixStack = new MatrixStack();

  gl.canvas = canvas;

  for (var key in GL.prototype) {
    gl[key] = GL.prototype[key];
  }       

  return gl;
};

GL.prototype.reset = function() {  
  util.assert(this.modelMatrixStack.nextIndex == 0, 
      'Model matrix stack not fully unloaded');
  util.assert(this.viewMatrixStack.nextIndex == 0, 
      'View matrix stack not fully unloaded');      
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(gl.perspectiveMatrix,
      PI/4, gl.viewportWidth/gl.viewportHeight,
      .1, 400.0);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND)
  gl.enable(gl.CULL_FACE);  
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  mat4.identity(gl.modelMatrix);
};

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

GL.prototype.setModelMatrixUniforms = function() {
  this.computeNormalMatrix();
  this.uniformMatrix4fv(shaderProgram.modelMatrixUniform, false, this.modelMatrix);
  this.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, this.normalMatrix);
};

GL.prototype.setViewMatrixUniforms = function() {
  this.uniformMatrix4fv(shaderProgram.perspectiveMatrixUniform, false, this.perspectiveMatrix);
  this.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, this.viewMatrix);
};

GL.prototype.computeNormalMatrix = function() {
  // TODO: figure out what's going on here
  mat3.fromMat4(this.normalMatrix,
      mat4.invert(this.invertedModelMatrix, this.modelMatrix));
  mat3.transpose(this.normalMatrix, this.normalMatrix);
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

GL.prototype.rotateView = function(rotation) {
  mat4.multiply(this.viewMatrix, this.viewMatrix,
      mat4.fromQuat(mat4.temp, rotation));
};

GL.prototype.translateView = function(translation) {
  mat4.translate(this.viewMatrix, this.viewMatrix,
      translation);
};
