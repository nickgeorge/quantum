Box = function(message) {
  this.super(message);
  if (!Box.normalBuffer) Box.initBuffers();

  this.size = message.size;
  this.color = message.color;
  this.fulcrum = null;

  this.vertexBuffer = null;
  this.texture = message.texture || null;
  this.textureBuffer = null;

  this.createVertexBuffer(this.size);

  if (!this.textureBuffer) this.createTextureBuffer();

  this.outerRadius = Math.sqrt(
    util.sqr(this.size[0]/2) +
    util.sqr(this.size[1]/2) +
    util.sqr(this.size[2]/2));

  this.alive = true;

  this.klass = 'Box';
};
util.inherits(Box, Thing);

Box.normalBuffer = null;
Box.indexBuffer = null;

Box.prototype.advance = function(dt) {};

Box.prototype.draw = function() {
  gl.pushModelMatrix();
  this.transform();
  this.render();
  gl.popModelMatrix();

};

Box.prototype.render = function() {
  // console.log(this.texture || Textures.CRATE);
  Textures.bindTexture(this.texture || Textures.CRATE);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  if (this.texture) {
    if (!this.texture.loaded) return;
    shaderProgram.setUseTexture(true);
  } else {
    shaderProgram.setUseTexture(false);
  }
  if (this.color) {
    shaderProgram.setUniformColor(this.color);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, Box.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, Box.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Box.indexBuffer);
  gl.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, Box.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};

Box.prototype.min = function(index) {
  return this.position[index] - this.size[index]/2;
};

Box.prototype.max = function(index) {
  return this.position[index] + this.size[index]/2;
};

Box.prototype.setTexture = function(texture, opt_buildBuffer) {
  this.texture = texture;
  return this;
};

Box.prototype.createVertexBuffer = function(size) {
  var halfSize = Vector.multiply(size, .5);
  var verticies = [
    // Top face
    -halfSize[0], -halfSize[1],  halfSize[2],
     halfSize[0], -halfSize[1],  halfSize[2],
     halfSize[0],  halfSize[1],  halfSize[2],
    -halfSize[0],  halfSize[1],  halfSize[2],

    // bottom face
    -halfSize[0], -halfSize[1], -halfSize[2],
    -halfSize[0],  halfSize[1], -halfSize[2],
     halfSize[0],  halfSize[1], -halfSize[2],
     halfSize[0], -halfSize[1], -halfSize[2],

    // Top face
    -halfSize[0],  halfSize[1], -halfSize[2],
    -halfSize[0],  halfSize[1],  halfSize[2],
     halfSize[0],  halfSize[1],  halfSize[2],
     halfSize[0],  halfSize[1], -halfSize[2],

    // Bottom face
    -halfSize[0], -halfSize[1], -halfSize[2],
     halfSize[0], -halfSize[1], -halfSize[2],
     halfSize[0], -halfSize[1],  halfSize[2],
    -halfSize[0], -halfSize[1],  halfSize[2],

    // Right face
     halfSize[0], -halfSize[1], -halfSize[2],
     halfSize[0],  halfSize[1], -halfSize[2],
     halfSize[0],  halfSize[1],  halfSize[2],
     halfSize[0], -halfSize[1],  halfSize[2],

    // Left face
    -halfSize[0], -halfSize[1], -halfSize[2],
    -halfSize[0], -halfSize[1],  halfSize[2],
    -halfSize[0],  halfSize[1],  halfSize[2],
    -halfSize[0],  halfSize[1], -halfSize[2]
  ];

  this.vertexBuffer = util.generateBuffer(verticies, 3);
};

Box.ALL_FACES = {
  front: [0, 1, 0, 1],
  back: [0, 1, 0, 1],
  left: [0, 1, 0, 1],
  right: [0, 1, 0, 1],
  top: [0, 1, 0, 1],
  bottom: [0, 1, 0, 1]
};

Box.prototype.createTextureBuffer = function(opt_faces){
  var faces = opt_faces || Box.ALL_FACES;
  for (var face in Box.ALL_FACES) {
    if (!faces[face]) faces[face] = [-1, -1, -1, -1];
  };
  var textureCoords = [
    // Top' face
    faces.top[0], faces.top[2],
    faces.top[1], faces.top[2],
    faces.top[1], faces.top[3],
    faces.top[0], faces.top[3],

    // Bottom' face
    faces.bottom[1], faces.bottom[2],
    faces.bottom[1], faces.bottom[3],
    faces.bottom[0], faces.bottom[3],
    faces.bottom[0], faces.bottom[2],

    // Left' face
    faces.left[0], faces.left[3],
    faces.left[0], faces.left[2],
    faces.left[1], faces.left[2],
    faces.left[1], faces.left[3],

    // Right' face
    faces.right[1], faces.right[3],
    faces.right[0], faces.right[3],
    faces.right[0], faces.right[2],
    faces.right[1], faces.right[2],

    // Front face
    faces.front[0], faces.front[2],
    faces.front[1], faces.front[2],
    faces.front[1], faces.front[3],
    faces.front[0], faces.front[3],

    // Back' face
    faces.back[0], faces.back[2],
    faces.back[1], faces.back[2],
    faces.back[1], faces.back[3],
    faces.back[0], faces.back[3]
  ];

  this.textureBuffer = util.generateBuffer(textureCoords, 2);
  return this;
};

Box.initBuffers = function() {
  var vertexNormals = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,

      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
  ];
  Box.normalBuffer = util.generateBuffer(vertexNormals, 3);

  var vertexIndices = [
     0,  1,  2,    0,  2,  3,  // Front face
     4,  5,  6,    4,  6,  7,  // Back face
     8,  9, 10,    8, 10, 11, // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  Box.indexBuffer = util.generateIndexBuffer(vertexIndices);
};

Box.prototype.dispose = function() {
  util.base(this, 'dispose');
  this.vertexBuffer = null;
  this.vertexBuffer = null;
  this.texture = null;
};

Box.prototype.getOuterRadius = function() {
  return this.outerRadius;
};
