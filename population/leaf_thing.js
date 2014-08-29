LeafThing = function(message) {
  util.base(this, message);

  this.elementType = message.elementType || GL.TRIANGLES;
  this.texture = message.texture;
  this.color = message.color || vec4.WHITE;
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
};
util.inherits(LeafThing, Thing);


LeafThing.prototype.render = function() {
  this.renderSelf();
  if (this.effects.length) {
    this.eachEffect(function(effect){
      effect.draw();
    });
  }
};


LeafThing.prototype.renderSelf = function() {
  var gl = Env.gl;
  gl.setModelMatrixUniforms();

  var shaderProgram = gl.getActiveProgram();
  shaderProgram.setUniformColor(this.color);
  shaderProgram.setUseTexture(!!(this.texture && this.texture.loaded));
  if (this.texture) {
    shaderProgram.bindTexture(this.texture);
  }
  shaderProgram.bindVertexPositionBuffer(this.vertexBuffer);
  shaderProgram.bindVertexNormalBuffer(this.normalBuffer);
  if (this.textureBuffer) shaderProgram.bindVertexTextureBuffer(this.textureBuffer);
  shaderProgram.bindVertexIndexBuffer(this.indexBuffer);

  gl.drawElements(this.elementType, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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