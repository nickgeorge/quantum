LeafThing = function(message) {
  util.base(this, message);

  this.texture = message.texture;
  this.color = message.color || vec4.WHITE;
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
};
util.inherits(LeafThing, Thing);


LeafThing.prototype.render = function() {
  util.base(this, 'render');
  this.renderSelf();
};


LeafThing.prototype.renderSelf = function() {
  gl.setMatrixUniforms();

  shaderProgram.setUniformColor(this.color);
  shaderProgram.setUseTexture(this.texture && this.texture.loaded);
  shaderProgram.bindTexture(this.texture);
  shaderProgram.bindVertexPositionBuffer(this.vertexBuffer);
  shaderProgram.bindVertexNormalBuffer(this.normalBuffer);
  shaderProgram.bindVertexTextureBuffer(this.textureBuffer);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};


LeafThing.prototype.dispose = function() {
  util.base(this, 'dispose');
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
  this.texture = null;
  this.color = null;
};


LeafThing.prototype.createBuffers = util.unimplemented;