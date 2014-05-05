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

Pane.MIN_AND_MAX = [-1, 1];

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


Pane.prototype.contains = function(p_lc, opt_extra) {
  var extra = opt_extra || 0;
  for (var i = 0; i < 2; i++) {
    var size = this.size[i]/2 + extra;
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
  
  var delta = vec3.subtract([], p_1_lc, p_0_lc);
  var t_cross = -p_0_lc[2] / delta[2];

  var encounters = [];
  var intersectionEncounter = null;
  if (Quadratic.inFrame(t_cross)) {
    var p_int_lc = vec3.scaleAndAdd([], p_0_lc, delta, t_cross);
    if (this.contains(p_int_lc)) {
      // We've intersected the pane in this past frame
      intersectionEncounter = this.makeEncounter(t_cross, 0, p_int_lc);
      encounters.push(intersectionEncounter);
    }
  }
  if (threshold == 0) return intersectionEncounter;

  // At this point, there are other points that need to be considered.
  // Make an array of all points that could possibly be the closest.
  // This does not yet consider point-to-point distances for points
  // outside of the pane.
  if (this.contains(p_0_lc)) {
    encounters.push(this.makeEncounter(0, p_0_lc[2], p_0_lc));
  }
  if (this.contains(p_1_lc)) {
    encounters.push(this.makeEncounter(1, p_1_lc[2], p_1_lc));
  }

  for (var i = 0; i < 2; i++) {
    var halfSize = this.size[i]/2;
    var maxInI = Math.max(p_0_lc[i], p_1_lc[i]);
    var minInI = Math.min(p_0_lc[i], p_1_lc[i]);
    util.array.forEach(Pane.MIN_AND_MAX, function(direction) {
      var bound = direction*halfSize;
      if (maxInI > bound && minInI < bound) {
        var t = (bound - p_0_lc[i]) / delta[i];
        var p = vec3.scaleAndAdd([], p_0_lc, delta, t);
        if (this.contains(p)) {
          encounters.push(this.makeEncounter(t, p[2], p));
        }
      }      
    }, this);
  }

  if (encounters.length == 0) {
    return null;
  }

  // util.assertEquals(2, encounters.length,
  //     'Awkward number of points of interest found: ' +
  //     encounters.length + '.');

  var closestEncounter = null;
  for (var i = 0; i < encounters.length; i++) {
    if (Math.abs(encounters[i].distance) < threshold && (!closestEncounter ||
        encounters[i].t < closestEncounter.t)) {
      closestEncounter = encounters[i];
    }
  }
  // closestEncounter && console.log(encounters);
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

