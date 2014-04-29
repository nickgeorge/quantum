Pane = function(message) {
  this.super(message);
  this.size = message.size;
  util.assert(this.size[2] == 0, 'z-size must be 0 for a pane.');

  if (!Pane.normalBuffer) Pane.initBuffers();

  this.textureCounts = message.textureCounts ? 
      vec2.clone(message.textureCounts) :
      [1, 1];

  this.texture = message.texture;

  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.createTextureBuffer();

  this.createVertexBuffer(this.size);

  this.klass = 'Pane';
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


Pane.prototype.contains = function(v, opt_extra) {
  var extra = opt_extra || 0;
  for (var i = 0; i < 2; i++) {
    var size = this.size[i]/2 + extra;
    if (v[i] < -size || v[i] > size) {
      return false;
    }
  }
  return true;
};


Pane.prototype.findIntersection = function(p_0, p_1) {
  p_0 = this.toLocalCoords(vec3.create(), p_0);
  p_1 = this.toLocalCoords(vec3.create(), p_1);

  var p_int = [];
  var delta = vec3.subtract([], p_1, p_0);

  p_int[2] = 0;
  var t = -p_0[2] / delta[2];

  if (t < 0 || t > 1) return null;

  p_int[1] = t*(delta[1]) + p_0[1];
  p_int[0] = t*(delta[0]) + p_0[0];
  if (this.contains(p_int)) {
    return {
      part: this,
      point: p_int,
      t: 0
    };
  }
  return null;
};

