Thing = function() {
  this.id = Thing.nextId++;
  this.phi =  0;
  this.theta = 0;
  this.position = vec3.create();
  this.fulcrum = null;
  this.color = null;
  this.tribe = null;

  this.klass = "Thing";
  this.outerRadius = null;
};

Thing.nextId = 0;

Thing.prototype.setId = function(id) {
  this.id = id;
  return this;
}

Thing.prototype.setTheta = function(theta) {
  this.theta = theta;
  return this;
};


Thing.prototype.setPhi = function(phi) {
  this.phi = phi;
  return this;
};

Thing.prototype.setPosition = function(a, b, c) {
  if (a.length == 3) {
    vec3.copy(this.position, a);
  } else {
    vec3.set(this.position, a, b, c);
  }
  return this;
};

Thing.prototype.setFulcrum = function(xyz) {
  if (!this.fulcrum) this.fulcrum = vec3.create();
  vec3.copy(this.fulcrum, xyz);
  return this;
};

Thing.prototype.setColor = function(rgba) {
  rgba[3] || (rgba[3] = 1);
  this.color = rgba;
  this.setColorInternal();
  return this;
};

Thing.prototype.setTribe = function(tribe) {
  tribe.add(this);
  this.tribe = tribe;
  return this;
};

Thing.prototype.transform = function(ignorePhi) {
  gl.translate(this.position);
  gl.rotate(this.theta, Vector.K);
  if (!ignorePhi) gl.rotate(this.phi, Vector.J);
};

Thing.prototype.getClosestThing = function() {
  var minDistance = Number.MAX_VALUE;
  var closestThing = null;
  for (var i = 0, thing; thing = world.things[i]; i++) {
    if (!thing.alive || this == thing ||
        (this.tribe && this.tribe == thing.tribe)) {
      continue;
    }
    var d = Vector.distanceSquared(this.position, thing.position);
    if (d < minDistance) {
      minDistance = d;
      closestThing = thing;
    }
  }
  return closestThing;
};

Thing.prototype.center = function() {
  return this.position;
};

Thing.prototype.die = function() {
  this.tribe.remove(this);
};

Thing.prototype.setColorInternal = function() {
  throw 'Error: setColorInternal unimplemented for ' + this.klass
};

Thing.prototype.draw = function() {
  throw 'Error: draw unimplemented for type ' + this.klass;
};

Thing.prototype.advance = function() {
  throw 'Error: advance unimplemented for type ' + this.klass;
};

Thing.prototype.update = function(message) {
  throw 'Error: update unimplemented for type ' + this.klass;
};

Thing.prototype.getOuterRadius = function() {
  if (!this.outerRadius) {
    throw 'Error: outerRadius not set for ' + this.klass;
  }
  return this.outerRadius;
};
