Thing = function(message) {
  message = message || {};

  this.upOrientation = quat.nullableClone(message.upOrientation);
  quat.rotateY(this.upOrientation, this.upOrientation, message.yaw || 0);
  quat.rotateX(this.upOrientation, this.upOrientation, message.pitch || 0);
  quat.rotateZ(this.upOrientation, this.upOrientation, message.roll || 0);
  // this.normal = vec3.create();
  // this.upNose = vec3.create();

  if (message.groundOrientation) {
    this.groundOrientation = quat.clone(message.groundOrientation);
  } else {
    this.groundOrientation = quat.clone(this.upOrientation);
  }

  this.rPitch = message.rPitch || 0;
  this.rYaw = message.rYaw || 0;
  this.rRoll = message.rRoll || 0;

  this.velocity = vec3.nullableClone(message.velocity);
  this.position = vec3.nullableClone(message.position);
  this.lastPosition = vec3.clone(this.position);

  this.alive = message.alive !== false;

  this.parts = [];
  this.parent = null;

  this.age = 0;
  this.isRoot = message.isRoot || false;
  this.isPart = message.isPart || false;
  this.isStatic = message.isStatic || false;
  this.name = message.name;

  this.distanceSquaredToCamera = 0;
  this.damageMultiplier = message.damageMultiplier || 1;

  this.objectCache = {
    findEncounter: {
      p_0: vec3.create(),
      p_1: vec3.create(),
    },
    conjugateUp: quat.create()
  };
};
Thing.type = Types.THING;


Thing.prototype.advance = function(dt) {
  this.advanceBasics(dt);
};


Thing.prototype.advanceBasics = function(dt) {
  this.age += dt;
  if (this.isStatic) return;

  if (this.rYaw) {
    quat.rotateY(this.upOrientation,
        this.upOrientation, 
        this.rYaw * dt);
  }
  if (this.rPitch) {
    quat.rotateX(this.upOrientation,
        this.upOrientation, 
        this.rPitch * dt);
  }
  if (this.rRoll) {
    quat.rotateZ(this.upOrientation,
        this.upOrientation, 
        this.rRoll * dt);
  }

  if (this.velocity[0] || this.velocity[1] || this.velocity[2]) { 
    this.saveLastPosition();
    vec3.scaleAndAdd(this.position, this.position,
        this.velocity, dt);
  }

  for (var i = 0; this.parts[i]; i++) {
    this.parts[i].advance(dt);
  }
};



Thing.prototype.findThingEncounter = function(thing, threshold) {
  return this.findEncounter(
    thing.lastPosition, thing.position, threshold);
};


Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold) {
  var cache = this.objectCache.findEncounter;
  var p_0 = this.parentToLocalCoords(cache.p_0, p_0_pc);
  var p_1 = this.parentToLocalCoords(cache.p_1, p_1_pc);
  
  var closestEncounter = null;
  for (var i = 0; this.parts[i]; i++) {
    var encounter = this.parts[i].findEncounter(p_0, p_1, threshold);
    if (!encounter) continue;
    if (!closestEncounter) {
      closestEncounter = encounter;
      continue;
    }

    if (encounter.t < closestEncounter.t) {
      closestEncounter = encounter;
      continue
    }
  };
  return closestEncounter;
};


Thing.prototype.glom = function(thing, intersection) {
  var point = intersection.point;

  world.projectilesToRemove.push(thing);
  world.disposables.push(thing);
  this.addPart(thing);
  vec3.copy(thing.velocity, vec3.ZERO);

  vec3.copy(thing.position, point);
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into parent coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 */
Thing.prototype.localToParentCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  if (w == 1) {
    vec3.transformQuat(out, v, this.upOrientation);
    vec3.add(out, out, this.position);
  } else {
    vec3.transformQuat(out, v, this.upOrientation);
  }
  return out;
};


/**
 * Transforms a vector in parent coordinates to local coordinates
 * @param out The receiving Vector3
 * @param v Vector3 in world coordinates
 */
Thing.prototype.parentToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  quat.conjugate(this.objectCache.conjugateUp, this.upOrientation);
  if (w == 1) {
    vec3.subtract(out, v, this.position);
    vec3.transformQuat(out, out, this.objectCache.conjugateUp);
  } else {
    vec3.transformQuat(out, v, this.objectCache.conjugateUp);
  }
  return out;
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into world coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 */
Thing.prototype.localToWorldCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  this.localToParentCoords(out, v, w);
  if (this.parent) {
    this.parent.localToWorldCoords(out, out, w);
  }
  return out;
};


/**
 * Transforms a vector in world-space
 * into world coordinates for this thing.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 */
Thing.prototype.worldToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  if (this.parent) {
    this.parent.worldToLocalCoords(out, v, w);
    this.parentToLocalCoords(out, out, w);
  } else {
    this.parentToLocalCoords(out, v, w);
  }
  return out;
};

Thing.prototype.draw = function() {
  gl.pushModelMatrix();
  this.transform();
  this.render();
  gl.popModelMatrix();
};


Thing.prototype.render = function() {
  this.eachPart(function(part){
    part.draw();
  });
};


Thing.prototype.transform = function() {
  gl.translate(this.position);
  gl.rotate(this.upOrientation);
};


Thing.prototype.getType = function() {
  return this.constructor.type;
};


Thing.prototype.dispose = function() {
  this.localToParentTransform = null;
  this.parentToLocalTransform = null;
  this.velocity = null;
  this.position = null;
  if (this.parent) {
    this.parent.removePart(this);
  }

  util.array.forEach(this.parts, function(part){
    part.dispose();
  });
};


Thing.prototype.setParent = function(parent) {
  this.parent = parent;
};


Thing.prototype.addPart = function(part) {
  this.parts.push(part);
  part.setParent(this);
};


Thing.prototype.removePart = function(part) {
  util.array.remove(this.parts, part);
  part.setParent(null);
};


Thing.prototype.addParts = function(parts) {
  util.array.forEach(parts, function(part) {
    this.addPart(part);
  }, this);
};


Thing.prototype.saveLastPosition = function() {
  vec3.copy(this.lastPosition, this.position);
};


Thing.prototype.distanceSquaredTo = function(other) {
  return vec3.squaredDistance(this.position, other.position);
};


Thing.prototype.getDeltaP = function(out) {
  vec3.subtract(out, this.position, this.lastPosition);
};


Thing.prototype.setPitchOnly = function(pitch) {
  quat.setAxisAngle(this.upOrientation, vec3.I, pitch);
};


Thing.prototype.getNormal = function(out) {
  return this.localToWorldCoords(out, vec3.J, 0);
};


Thing.prototype.getUpNose = function(out) {
  return this.localToWorldCoords(out, vec3.NEG_K, 0);
};


Thing.prototype.computeDistanceSquaredToCamera = function() {
  this.distanceSquaredToCamera = this.distanceSquaredTo(world.hero);
};

Thing.prototype.getPart = function() {
  if (this.isPart || this.isRoot) return this;
  util.assertNotNull(this.parent, 'No part found.');
  return this.parent.getPart();
};


Thing.prototype.getRoot = function() {
  if (this.isRoot) return this;
  util.assertNotNull(this.parent, 'No root found.');
  return this.parent.getPart();
};


Thing.prototype.eachPart = function(fn) {
  util.array.forEach(this.parts, fn, this);
};



