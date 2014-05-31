LeafBox = function(message) {
  message.skipCreatePaneBuffers = true;
  util.base(this, message);

  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;

  this.textureCounts = message.textureCounts || [1, 1];

  this.color = message.color || [1, 1, 1, 1];
  this.texture = message.texture;

  this.elementType = message.elementType || gl.TRIANGLES;

  this.createBuffers();
};
util.inherits(LeafBox, Box);
LeafBox.type = Types.LEAF_BOX;

LeafBox.inited = false;
LeafBox.normalBuffer = null;
LeafBox.indexBuffer = null;
LeafBox.textureBufferCache = {};
LeafBox.positionBufferCache = {};

LeafBox.FACE_NORMALS = {
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  right: [1, 0, 0],
  left: [-1, 0, 0],
  front: [0, 0, 1],
  back: [0, 0, -1],
};

LeafBox.init = function() {
  var vertexNormals = [];
  var vertexIndicies = [];
  Box.eachFace(function(faceName, faceIndex) {
    for (var i = 0; i < 4; i++) {
      util.array.pushAll(vertexNormals, LeafBox.FACE_NORMALS[faceName]);
    }
    util.array.pushAll(vertexIndicies, [
      faceIndex*4 + 0, faceIndex*4 + 1, faceIndex*4 + 2,
      faceIndex*4 + 0, faceIndex*4 + 2, faceIndex*4 + 3
    ]);
  });

  LeafBox.normalBuffer = util.generateBuffer(vertexNormals, 3);
  LeafBox.indexBuffer = util.generateIndexBuffer(vertexIndicies);
  LeafBox.inited = true;
};


LeafBox.prototype.createBuffers = function() {
  if (!LeafBox.inited) {
    LeafBox.init();
  }
  this.normalBuffer = LeafBox.normalBuffer;
  this.indexBuffer = LeafBox.indexBuffer;

  this.vertexBuffer = this.generatePositionBuffer();
  this.textureBuffer = this.generateTextureBuffer();
};

LeafBox.prototype.generatePositionBuffer = function() {
  var size = this.size;

  if (!LeafBox.positionBufferCache[size[0]]) {
    LeafBox.positionBufferCache[size[0]] = {};
  }

  if (!LeafBox.positionBufferCache[size[0]][size[1]]) {
    LeafBox.positionBufferCache[size[0]][size[1]] = {};
  }

  if (!LeafBox.positionBufferCache[size[0]][size[1]][size[2]]) {
    var normalPositions = LeafBox.normalVertexPositions;
    var halfSize = vec3.scale([], size, .5);
    var positions = [];
    for (var i = 0; i < normalPositions.length; i++) {
      positions.push(normalPositions[i] * halfSize[i % 3]);
    };
    LeafBox.positionBufferCache[size[0]][size[1]][size[2]] = 
        util.generateBuffer(positions, 3);
  }

  return LeafBox.positionBufferCache[size[0]][size[1]][size[2]];
};

LeafBox.prototype.generateTextureBuffer = function() {
  var tc = this.textureCounts;

  if (!LeafBox.textureBufferCache[tc[0]]) {
    LeafBox.textureBufferCache[tc[0]] = {};
  }
  if (!LeafBox.textureBufferCache[tc[0]][tc[1]]) {
    var vertexTextures = [];
    Box.eachFace(function(faceName) {
      util.array.pushAll(vertexTextures, [
        0, 0,
        tc[0], 0,
        tc[0], tc[1],
        0, tc[1]
      ]);
    });
    LeafBox.textureBufferCache[tc[0]][tc[1]] =
        util.generateBuffer(vertexTextures, 2);
  }
  return LeafBox.textureBufferCache[tc[0]][tc[1]];
};

LeafBox.prototype.render = LeafThing.prototype.render;
LeafBox.prototype.renderSelf = LeafThing.prototype.renderSelf;
LeafBox.prototype.dispose = LeafThing.prototype.dispose;


LeafBox.normalVertexPositions = [
  // Top (y = 1)
  -1, 1, 1,
  1, 1, 1,
  1, 1, -1,
  -1, 1, -1,

  // Bottom (y = -1)
  -1, -1, -1,
  1, -1, -1,
  1, -1, 1,
  -1, -1, 1,

  // Right (x = 1)
  1, -1, -1,
  1, 1, -1,
  1, 1, 1,
  1, -1, 1,

  // Left (x = -1)
  -1, -1, 1,
  -1, 1, 1,
  -1, 1, -1,
  -1, -1, -1,
  
  // Front (z = 1)
  -1, -1, 1,
  1, -1, 1,
  1, 1, 1,
  -1, 1, 1,

  // Back (z = -1)
  -1, 1, -1,
  1, 1, -1,
  1, -1, -1,
  -1, -1, -1,
];


