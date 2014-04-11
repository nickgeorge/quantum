ImageCross = function(size) {
  this.super();
  if (!ImageCross.normalBuffer) ImageCross.initBuffers();
  // scalar
  this.texture = null;

  this.colorOverride = [1, 1, 1, 1];
  this.textureBuffer = null;
  
  
};
util.inherits(ImageCross, Thing);

ImageCross.normalBuffer = null;
ImageCross.indexBuffer = null;
ImageCross.vertexBuffer = null;


ImageCross.prototype.advance = function(dt) {};

ImageCross.prototype.draw = function() {
  gl.pushMatrix();

  if (this.texture && this.texture.loaded) {
    gl.uniform1i(shaderProgram.useTextureUniform, true);
    Textures.bindTexture(this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  };

  gl.uniform4fv(shaderProgram.colorOverrideUniform, this.colorOverride);

  gl.bindBuffer(gl.ARRAY_BUFFER, ImageCross.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ImageCross.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, ImageCross.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, ImageCross.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ImageCross.indexBuffer);
  gl.setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, ImageCross.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  gl.popMatrix();

  shaderProgram.reset();
};

ImageCross.prototype.setTexture = function(texture, opt_buildBuffer) {
  this.texture = texture;
  if (opt_buildBuffer) this.createTextureBuffer();
  return this;
};

ImageCross.initBuffers = function() {
  ImageCross.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ImageCross.vertexBuffer);
  var vertices = [
    // Top face
    -.5, -.5, 0,
     .5, -.5, 0,
     .5,  .5, 0,
    -.5,  .5, 0,

    // Back face
    -.5, -.5, 0,
    -.5,  .5, 0,
     .5,  .5, 0,
     .5, -.5, 0,

    // Top face
    -.5, 0, -.5,
    -.5, 0,  .5,
     .5, 0,  .5,
     .5, 0, -.5,

    // Bottom face
    -.5, 0, -.5,
     .5, 0, -.5,
     .5, 0,  .5,
    -.5, 0,  .5,

    // Right face
     0, -.5, -.5,
     0,  .5, -.5,
     0,  .5,  .5,
     0, -.5,  .5,

    // Left face
     0, -.5, -.5,
     0, -.5,  .5,
     0,  .5,  .5,
     0,  .5, -.5
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  ImageCross.vertexBuffer.itemSize = 3;
  ImageCross.vertexBuffer.numItems = 24;

  ImageCross.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ImageCross.normalBuffer);
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
  ImageCross.normalBuffer.itemSize = 3;
  ImageCross.normalBuffer.numItems = 24;

  ImageCross.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ImageCross.indexBuffer);
  var vertexIndices = [
    0, 1, 2,    0, 2, 3,  // Front face
    4, 5, 6,    4, 6, 7,  // Back face
    8, 9, 10,   8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
  ImageCross.indexBuffer.itemSize = 1;
  ImageCross.indexBuffer.numItems = 36;
};

ImageCross.prototype.setColorInternal = function() {
  this.colorOverride = this.color;
  return this;
};

ImageCross.prototype.dispose = function() {
  this.colorBuffer = null;
  this.texture = null;
};

ImageCross.prototype.createTextureBuffer = function(opt_faces){
  var faces = opt_faces || Box.ALL_FACES;
  for (var face in Box.ALL_FACES) {
    if (!faces[face]) faces[face] = [-1, -1, -1, -1];
  };
  this.textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
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

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  this.textureBuffer.itemSize = 2;
  this.textureBuffer.numItems = textureCoords.length/2;
  return this;
};