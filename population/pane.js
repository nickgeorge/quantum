Pane = function(message) {
  this.super(message);
  this.size = message.size;
  util.assert(!this.size[2], 'z-size must be 0 or undefined for a pane.');

  this.textureCounts = message.textureCounts ? 
      vec2.clone(message.textureCounts) :
      [1, 1];

  this.texture = message.texture;

  this.createBuffers();

  this.klass = 'Pane';
};
util.inherits(Pane, LeafThing);
Pane.type = Types.PANE;

Pane.prototype.createBuffers = function() {
  this.createVertexBuffer();
  this.createTextureBuffer();
  this.createNormalBuffer();
  this.createIndexBuffer();
};

Pane.prototype.createVertexBuffer = function() {
  var halfSize = vec2.scale([], this.size, .5);
  var verticies = [
    -halfSize[0], -halfSize[1],  0,
     halfSize[0], -halfSize[1],  0,
     halfSize[0],  halfSize[1],  0,
    -halfSize[0],  halfSize[1],  0
  ];

  this.vertexBuffer = util.generateBuffer(verticies, 3);
};

Pane.prototype.createNormalBuffer = function() {
  var vertexNormals = [
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
  ];
  this.normalBuffer = util.generateBuffer(vertexNormals, 3);
};


Pane.prototype.createIndexBuffer = function() {
  var vertexIndices = [
    0, 1, 2,    0, 2, 3
  ];
  this.indexBuffer = util.generateIndexBuffer(vertexIndices);
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


Pane.prototype.contains = function(p_local, opt_extra) {
  var extra = opt_extra || 0;
  for (var i = 0; i < 2; i++) {
    var size = this.size[i]/2 + extra;
    if (p_local[i] < -size || p_local[i] > size) {
      return false;
    }
  }
  return true;
};


Pane.prototype.findIntersection = function(p_0, p_1) {
  p_0 = this.toLocalCoords([], p_0);
  p_1 = this.toLocalCoords([], p_1);

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
      t: t
    };
  }
  return null;
};

