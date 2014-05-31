Pane = function(message) {
  this.super(message);
  this.size = message.size;
  util.assert(!this.size[2], 'z-size must be 0 or undefined for a pane.');

  this.textureCounts = message.textureCounts ? 
      vec2.clone(message.textureCounts) :
      [1, 1];

  this.texture = message.texture;

  this.verticies = null;
  this.skipCreateBuffers = message.skipCreateBuffers;

  // TODO: this is a hack.  No reason a logical pane has to be static.
  this.isStatic = message.skipCreateBuffers;
  
  if (!this.skipCreateBuffers) this.createBuffers();
  else {
    this.renderSelf = function(){};
  }

  this.objectCache.findEncounter = {
    encounter: {},
    p_0_lc: vec3.create(),
    p_1_lc: vec3.create(),
    delta: vec3.create(),
    encounterPoint: vec3.create()
  }
  
};
util.inherits(Pane, LeafThing);
Pane.type = Types.PANE;

Pane.inited = false;
Pane.normalBuffer = null;
Pane.indexBuffer = null;
Pane.textureBufferCache = {};

Pane.MIN_AND_MAX = [-1, 1];

Pane.prototype.createBuffers = function() {
  if (!Pane.inited) { 
    Pane.init();
  }

  this.createVertexBuffer();
  this.createTextureBuffer();
  this.createNormalBuffer();
  this.createIndexBuffer();
};

Pane.init = function() {
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
  Pane.inited = true;
};

Pane.prototype.createVerticies = function() {
  var halfSize = vec2.scale([], this.size, .5);
  this.verticies = [
    -halfSize[0], -halfSize[1],  0,
     halfSize[0], -halfSize[1],  0,
     halfSize[0],  halfSize[1],  0,
    -halfSize[0],  halfSize[1],  0
  ];
};

Pane.prototype.createVertexBuffer = function() {
  if (!this.verticies) this.createVerticies();
  this.vertexBuffer = util.generateBuffer(this.verticies, 3);
};

Pane.prototype.createNormalBuffer = function() {
  this.normalBuffer = Pane.normalBuffer;
};


Pane.prototype.createIndexBuffer = function() {
  this.indexBuffer = Pane.indexBuffer;
};

Pane.prototype.createTextureBuffer = function(){
  var tc = this.textureCounts;

  if (!Pane.textureBufferCache[tc[0]]) {
    Pane.textureBufferCache[tc[0]] = {};
  }
  if (!Pane.textureBufferCache[tc[0]][tc[1]]) {
    var textureCoords = [
      0, 0,
      tc[0], 0,
      tc[0], tc[1],
      0, tc[1]
    ];

    Pane.textureBufferCache[tc[0]][tc[1]] = util.generateBuffer(textureCoords, 2);
  }
  this.textureBuffer = Pane.textureBufferCache[tc[0]][tc[1]];
};


Pane.prototype.contains_lc = function(p_lc) {
  for (var i = 0; i < 2; i++) {
    var size = this.size[i]/2;
    if (p_lc[i] < -size || p_lc[i] > size) {
      return false;
    }
  }
  return true;
};


Pane.prototype.findEncounter = function(p_0_pc, p_1_pc,
    threshold) {
  var cache = this.objectCache.findEncounter;
  var p_0_lc = this.parentToLocalCoords(cache.p_0_lc, p_0_pc);
  var p_1_lc = this.parentToLocalCoords(cache.p_1_lc, p_1_pc);
  
  var delta = vec3.subtract(cache.delta, p_1_lc, p_0_lc);
  var t_cross = -p_0_lc[2] / delta[2];

  var closestEncounter = cache.encounter;
  closestEncounter.expired = true;
  if (Quadratic.inFrame(t_cross)) {
    var p_int_lc = vec3.scaleAndAdd(cache.encounterPoint,
        p_0_lc,
        delta,
        t_cross);
    if (this.contains_lc(p_int_lc)) {
      // We've intersected the pane in this past frame
      // If threshold is 0 (intersection), this is the only form of
      // encounter we have to consider.
      this.maybeSetEncounter_(threshold, t_cross, 0, p_int_lc);
      if (threshold == 0) return closestEncounter;
    }
  }

  // At this point, there are other points that need to be considered.
  // Make an array of all points that could possibly be the closest.
  // This does not yet consider point-to-point distances for points
  // outside of the pane.

  // Add first/last points, if they're contained
  if (this.contains_lc(p_0_lc)) {
    this.maybeSetEncounter_(threshold, 0, p_0_lc[2], p_0_lc);
  }
  if (this.contains_lc(p_1_lc)) {
    this.maybeSetEncounter_(threshold, 1, p_1_lc[2], p_1_lc);
  }

  // For both axes (not including z), test if we've crossed
  for (var i = 0; i < 2; i++) {
    var halfSize = this.size[i]/2;
    var maxInI = Math.max(p_0_lc[i], p_1_lc[i]);
    var minInI = Math.min(p_0_lc[i], p_1_lc[i]);
    for (var direction = -1; direction <= 1; direction += 2) {
      var bound = direction*halfSize;
      if (maxInI > bound && minInI < bound) {
        var t = (bound - p_0_lc[i]) / delta[i];
        var p = vec3.scaleAndAdd(cache.encounterPoint, p_0_lc, delta, t);
        if (this.contains_lc(p)) {
          this.maybeSetEncounter_(threshold, t, p[2], p);
        }
      }      
    }
  }
  if (closestEncounter.expired) return null;
  return closestEncounter;
};


Pane.prototype.maybeSetEncounter_ = function(threshold, t, distance, point) {
  var cached = this.objectCache.findEncounter.encounter;
  if (Math.abs(distance) > threshold) return;
  if (!cached.expired && t > cached.t) return;
  cached.part = this;
  cached.t = t;
  cached.distance = distance;
  cached.distanceSquared = util.math.sqr(distance);
  cached.point = point;
  cached.expired = false;
  return cached;
};


Pane.prototype.getNormal = function(out) {
  return this.localToWorldCoords(this.objectCache.normal,
      vec3.K,
      0);
};

Pane.prototype.getLeft = function(out) {
  return this.localToWorldCoords(out, vec3.I, 0);
};