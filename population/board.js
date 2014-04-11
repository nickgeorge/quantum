Board = function(size, position, tileCount, heights) {
  this.size = size;
  this.position = position;
  this.tileCount = tileCount;
  this.tileSize = [
    this.size[0] / this.tileCount[0],
    this.size[1] / this.tileCount[1]
  ];

  this.heights = heights;

  this.vertexBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
  this.colorBuffer = null;
  this.textureBuffer = null;

  this.texture = Textures.GRASS;

  this.colorOverride = [1, 1, 1, 1];
  this.generateBuffers();
};

Board.fromMessage = function(boardMessage) {
  return new Board(boardMessage.size, boardMessage.position,
      boardMessage.tileCount, boardMessage.heights);
};


Board.prototype.generateBuffers = function() {
  var verticies = [];
  var indicies = [];
  var normals = [];
  var colors = [];
  var textures = [];
  var count = 0;

  for (var i = 0; i < this.tileCount[0]; i++) {
    for (var j = 0; j < this.tileCount[1]; j++) {
      verticies.pushAll([
        i * this.tileSize[0] + this.min(0),     j * this.tileSize[1] + this.min(1),     this.heights[i][j],
        (i+1) * this.tileSize[0] + this.min(0), j * this.tileSize[1] + this.min(1),     this.heights[i + 1][j],
        (i+1) * this.tileSize[0] + this.min(0), (j+1) * this.tileSize[1] + this.min(1), this.heights[i + 1][j + 1],
        i * this.tileSize[0] + this.min(0),     j * this.tileSize[1] + this.min(1),     this.heights[i][j],
        (i+1) * this.tileSize[0] + this.min(0), (j+1) * this.tileSize[1] + this.min(1), this.heights[i + 1][j + 1],
        i * this.tileSize[0] + this.min(0),     (j+1) * this.tileSize[1] + this.min(1), this.heights[i][j + 1]
      ]);
      var index = count * 3;
      var n1 = Vector.normal(
          [
            verticies[index+3] - verticies[index],
            verticies[index+4] - verticies[index+1],
            verticies[index+5] - verticies[index+2]
          ],[
            verticies[index+6] - verticies[index],
            verticies[index+7] - verticies[index+1],
            verticies[index+8] - verticies[index+2]
          ]);
      var n2 = Vector.normal(
          [
            verticies[index+12] - verticies[index+9],
            verticies[index+13] - verticies[index+10],
            verticies[index+14] - verticies[index+11]
          ],[
            verticies[index+15] - verticies[index+9],
            verticies[index+16] - verticies[index+10],
            verticies[index+17] - verticies[index+11]
          ]);
      normals.pushAll([
        n1[0], n1[1], n1[2],
        n1[0], n1[1], n1[2],
        n1[0], n1[1], n1[2],
        n2[0], n2[1], n2[2],
        n2[0], n2[1], n2[2],
        n2[0], n2[1], n2[2],
      ]);
      colors.pushAll([
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
      ]);
      textures.pushAll(Board.TEXTURE_LISTS[Math.floor(Math.random() * 3)]);
      indicies.pushAll([
        count, count + 1, count + 2,
        count + 3, count + 4, count + 5
      ]);
      count += 6;
    }
  }
  this.vertexBuffer = util.generateBuffer(verticies, 3);
  this.normalBuffer = util.generateBuffer(normals, 3);
  this.colorBuffer = util.generateBuffer(colors, 3);
  this.textureBuffer = util.generateBuffer(textures, 2);
  this.indexBuffer = util.generateIndexBuffer(indicies);
};

Board.prototype.draw = function() {

  gl.uniform4fv(shaderProgram.colorOverrideUniform, this.colorOverride);
  if (this.texture || true) {
    if (!this.texture.loaded) return;
    gl.uniform1i(shaderProgram.useTextureUniform, true);
    Textures.bindTexture(this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  };

  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.setMatrixUniforms();

  gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};

Board.prototype.min = function(index) {
  return this.position[index] - this.size[index]/2;
};

Board.prototype.max = function(index) {
  return this.position[index] + this.size[index]/2;
};

Board.prototype.getHeight = function(x_or_thing, y) {
  if (x_or_thing.position) {
    var thing = x_or_thing;
    return this.getHeight(thing.position[0], thing.position[1]);
  }
  var x = x_or_thing;
  if (!this.inBounds([x, y, 0])) {
    return 0;
  }
  var bX = (x - this.min(0)) / this.tileSize[0];
  var bY = (y - this.min(1)) / this.tileSize[1];

  var fX = Math.floor(bX);
  var fY = Math.floor(bY);

  var tX = bX - fX;
  var tY = bY - fY;

  if (tX > tY) {
    var zP = this.heights[fX][fY];
    var zR = this.heights[fX+1][fY];
    var zQ = this.heights[fX+1][fY+1];
    var N = [
      zP - zR,
      zR - zQ
    ];
  } else {
    var zP = this.heights[fX][fY];
    var zR = this.heights[fX][fY+1];
    var zQ = this.heights[fX+1][fY+1];
    var N = [
      zR - zQ,
      zP - zR
    ];
  }
  return zP - N[0]*tX - N[1]*tY
};

Board.prototype.relativeHeight = function(thing) {
  return thing.position[2] - this.getHeight(thing);
}

Board.prototype.inBounds = function(xyz) {
  return Math.abs(xyz[0]) < this.max(0)
      && Math.abs(xyz[1]) < this.max(1);
};

Board.TEXTURE_LISTS = [
  [ // 0
    0, 0,
    1, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1,
  ],
  [ // 1
    1, 0,
    0, 0,
    1, 1,
    1, 0,
    1, 1,
    0, 1,
  ],
  [ // 2
    1, 1,
    1, 0,
    0, 0,
    1, 1,
    0, 1,
    0, 0
  ]
]
