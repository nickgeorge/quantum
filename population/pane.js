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
  if (!this.skipCreateBuffers) this.createBuffers();
  else {
    this.renderSelf = function(){};
  }

  this.klass = 'Pane';
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
  var p_0_lc = this.parentToLocalCoords([], p_0_pc);
  var p_1_lc = this.parentToLocalCoords([], p_1_pc);
  
  var delta = vec3.subtract(vec3.temp, p_1_lc, p_0_lc);
  var t_cross = -p_0_lc[2] / delta[2];

  var encounters = [];
  var intersectionEncounter = null;
  if (Quadratic.inFrame(t_cross)) {
    var p_int_lc = vec3.scaleAndAdd([], p_0_lc, delta, t_cross);
    if (this.contains_lc(p_int_lc)) {
      // We've intersected the pane in this past frame
      intersectionEncounter = this.makeEncounter(t_cross, 0, p_int_lc);
      encounters.push(intersectionEncounter);
    }
  }
  // If threshold is 0 (intersection), this is the only form of encounter
  // we have to consider.
  if (threshold == 0) return intersectionEncounter;

  // At this point, there are other points that need to be considered.
  // Make an array of all points that could possibly be the closest.
  // This does not yet consider point-to-point distances for points
  // outside of the pane.

  // Add first/last points, if they're contained
  if (this.contains_lc(p_0_lc)) {
    encounters.push(this.makeEncounter(0, p_0_lc[2], p_0_lc));
  }
  if (this.contains_lc(p_1_lc)) {
    encounters.push(this.makeEncounter(1, p_1_lc[2], p_1_lc));
  }

  // For both axes (not including z), test if we've crossed
  for (var i = 0; i < 2; i++) {
    var halfSize = this.size[i]/2;
    var maxInI = Math.max(p_0_lc[i], p_1_lc[i]);
    var minInI = Math.min(p_0_lc[i], p_1_lc[i]);
    util.array.forEach(Pane.MIN_AND_MAX, function(direction) {
      var bound = direction*halfSize;
      if (maxInI > bound && minInI < bound) {
        var t = (bound - p_0_lc[i]) / delta[i];
        var p = vec3.scaleAndAdd([], p_0_lc, delta, t);
        if (this.contains_lc(p)) {
          encounters.push(this.makeEncounter(t, p[2], p));
        }
      }      
    }, this);
  }

  if (encounters.length == 0) {
    return null;
  }


  var closestEncounter = null;
  for (var i = 0; i < encounters.length; i++) {
    if (Math.abs(encounters[i].distance) < threshold && (!closestEncounter ||
        encounters[i].t < closestEncounter.t)) {
      closestEncounter = encounters[i];
    }
  }
  return closestEncounter;
};


Pane.prototype.makeEncounter = function(t, distance, point) {
  return {
    part: this,
    t: t,
    distance: distance,
    distanceSquared: util.math.sqr(distance),
    point: point
  }
};


Pane.prototype.getNormal = function(out) {
  return this.localToWorldCoords(out, vec3.K, 0);
};

Pane.prototype.getLeft = function(out) {
  return this.localToWorldCoords(out, vec3.I, 0);
};