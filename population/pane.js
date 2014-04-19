Pane = function(message) {
  this.super(message);
  this.size = message.size;

  if (!Pane.normalBuffer) Pane.initBuffers();

  this.textureCounts = message.textureCounts ? 
      vec2.clone(message.textureCounts) :
      [1, 1];

  this.motley = message.motley;

  this.vertexBuffer = null;
  this.texture = message.texture;
  this.textureBuffer = null;
  if (this.texture) this.createTextureBuffer();

  this.createVertexBuffer(this.size);

};
util.inherits(Pane, Thing);


Pane.prototype.render = function() {
  if (this.texture) {
    if (!this.texture.loaded) return;
    shaderProgram.setUseTexture(true);
    Textures.bindTexture(this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  } else {
    shaderProgram.setUseTexture(false);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, Pane.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, Pane.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Pane.indexBuffer);
  gl.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, Pane.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};


Pane.prototype.createVertexBuffer = function(size) {
  var halfSize = Vector.multiply(size, .5);
  var verticies = [
    -halfSize[0], -halfSize[1],  0,
     halfSize[0], -halfSize[1],  0,
     halfSize[0],  halfSize[1],  0,
    -halfSize[0],  halfSize[1],  0
  ];

  this.vertexBuffer = util.generateBuffer(verticies, 3);
};

Pane.initBuffers = function() {
  var vertexNormals = [
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
  ];
  Pane.normalBuffer = util.generateBuffer(vertexNormals, 3);

  var vertexIndices = [
    0, 1, 2,    0, 2, 3
  ];
  Pane.indexBuffer = util.generateIndexBuffer(vertexIndices);
};

Pane.prototype.createTextureBuffer = function(){

  var textureCoords = [
    0, 0,
    this.textureCounts[0], 0,
    this.textureCounts[0], this.textureCounts[1],
    0, this.textureCounts[1]
  ];

  this.textureBuffer = util.generateBuffer(textureCoords, 2);
  return this;
};