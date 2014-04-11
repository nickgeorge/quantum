Box = function(size) {
  this.super();
  if (!Box.normalBuffer) Box.initBuffers();

  this.size = size;
  this.fulcrum = null;

  this.colorBuffer = null;
  this.vertexBuffer = null;
  this.texture = null;
  this.textureBuffer = null;

  this.createVertexBuffer(this.size);

  this.alive = true;
};
util.inherits(Box, Thing);

Box.normalBuffer = null;
Box.indexBuffer = null;

Box.prototype.advance = function(dt) {};

Box.prototype.draw = function() {
  gl.pushMatrix();
  if (this.fulcrum) {
    mat4.translate(gl.mvMatrix, gl.mvMatrix, vec3.add([], this.position, this.fulcrum));
    mat4.rotate(gl.mvMatrix, gl.mvMatrix, this.theta, Vector.K);
    mat4.rotate(gl.mvMatrix, gl.mvMatrix, this.phi, Vector.J);
    mat4.translate(gl.mvMatrix, gl.mvMatrix, vec3.scale([], this.fulcrum, -1));
  } else {
    mat4.translate(gl.mvMatrix, gl.mvMatrix, this.position);

    mat4.rotate(gl.mvMatrix, gl.mvMatrix, this.theta, Vector.K);
    mat4.rotate(gl.mvMatrix, gl.mvMatrix, this.phi, Vector.J);
  }
  this.render();
  gl.popMatrix();

};

Box.prototype.render = function() {
  !this.colorBuffer && this.setColor(Vector.WHITE);

    
  if (this.texture) {
    if (!this.texture.loaded) return;
    gl.uniform1i(shaderProgram.useTextureUniform, true);
    Textures.bindTexture(this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, Box.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, Box.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Box.indexBuffer);
  gl.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, Box.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};

Box.prototype.setColorInternal = function() {
  var unpackedColors = [];
  for (var j = 0; j < 24; j++) {
    unpackedColors = unpackedColors.concat(this.color);
  }
  this.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
  this.colorBuffer.itemSize = 4;
  this.colorBuffer.numItems = 24;
  return this;
};

Box.prototype.setSwirl = function(rgba1, rgba2) {
  var unpackedColors = [];
  for (var j = 0; j < 24; j++) {
    unpackedColors = Math.random() > .5 ? unpackedColors.concat(rgba1) : unpackedColors.concat(rgba2);
  }
  this.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
  this.colorBuffer.itemSize = 4;
  this.colorBuffer.numItems = 24;
  return this;
};

Box.prototype.min = function(index) {
  return this.position[index] - this.size[index]/2;
};

Box.prototype.max = function(index) {
  return this.position[index] + this.size[index]/2;
};

Box.prototype.setTexture = function(texture, opt_buildBuffer) {
  this.texture = texture;
  if (opt_buildBuffer) this.createTextureBuffer();
  console.log(this.texture);
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
    -1.0,  0.0,  0.0
  ];
  Box.normalBuffer = util.generateBuffer(vertexNormals, 3);

  var vertexIndices = [
    0, 1, 2,    0, 2, 3,  // Front face
    4, 5, 6,    4, 6, 7,  // Back face
    8, 9, 10,   8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  Box.indexBuffer = util.generateIndexBuffer(vertexIndices);
};

Box.prototype.dispose = function() {
  this.colorBuffer = null;
  this.vertexBuffer = null;
  this.texture = null;
};
