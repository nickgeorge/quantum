Thing = function(message) {
  message = message || {};

  this.upOrientation = quat.nullableClone(message.upOrientation);
  quat.rotateY(this.upOrientation, this.upOrientation, message.yaw || 0);
  quat.rotateX(this.upOrientation, this.upOrientation, message.pitch || 0);
  quat.rotateZ(this.upOrientation, this.upOrientation, message.roll || 0);

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
  this.root = false;
  this.name = message.name;

  this.distanceSquaredToCamera = 0;

  this.localToParentTransform = mat4.create();
  this.parentToLocalTransform = mat4.create();
  this.computeTransforms();
};
Thing.type = Types.THING;


Thing.prototype.eachPart = function(fn) {
  util.array.forEach(this.parts, fn, this);
};


Thing.prototype.draw = function() {
  gl.pushModelMatrix();
  this.transform();
  this.render();
  gl.popModelMatrix();
};


Thing.prototype.advance = function(dt) {
  this.saveLastPosition();
  this.age += dt;

  this.rYaw && quat.rotateY(this.upOrientation, this.upOrientation, this.rYaw * dt);
  this.rPitch && quat.rotateX(this.upOrientation, this.upOrientation, this.rPitch * dt);
  this.rRoll && quat.rotateZ(this.upOrientation, this.upOrientation, this.rRoll * dt);

  if (this.velocity[0] || this.velocity[1] || this.velocity[2]) { 
    vec3.scaleAndAdd(this.position, this.position,
        this.velocity, dt);
  }

  this.eachPart(function(part){
    part.advance(dt);
  });
};


Thing.prototype.render = function() {
  this.eachPart(function(part){
    part.draw();
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


Thing.prototype.findThingEncounter = function(thing, threshold) {
  return this.findEncounter(
    thing.lastPosition, thing.position, threshold);
};


Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold) {
  var p_0 = this.parentToLocalCoords([], p_0_pc);
  var p_1 = this.parentToLocalCoords([], p_1_pc);
  
  var closestEncounter = null;
  var encounters = [];
  for (var i = 0; this.parts[i]; i++) {
    var encounter = this.parts[i].findEncounter(p_0, p_1, threshold);
    if (!encounter) continue;
    encounters.push(i +" : " +  encounter.t);
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
  thing.computeTransforms();
};


Thing.prototype.transform = function() {
  gl.transform(this.localToParentTransform);
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into parent coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 */
Thing.prototype.localToParentCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  vec3.transformMat4(out, v, this.localToParentTransform, w);
  return out;
};


/**
 * Transforms a vector in parent coordinates to local coordinates
 * @param out The receiving Vector3
 * @param v Vector3 in world coordinates
 */
Thing.prototype.parentToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  vec3.transformMat4(out, v, this.parentToLocalTransform, w);
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
  vec3.transformMat4(out, v, this.localToParentTransform, w);
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
    vec3.transformMat4(out, out, this.parentToLocalTransform, w);
  } else {
    vec3.transformMat4(out, v, this.parentToLocalTransform, w);
  }
  return out;
};


Thing.prototype.computeTransforms = function() {
  if (this.upOrientation) {
    mat4.fromRotationTranslation(this.localToParentTransform,
        this.upOrientation, this.position);

    var conjugateUp = quat.conjugate(quat.temp, this.upOrientation);
    mat4.fromRotationTranslation(this.parentToLocalTransform,
        conjugateUp,
        vec3.transformQuat(vec3.temp,
            vec3.negate(vec3.temp, this.position),
            conjugateUp));


    if (this == world.hero) {
       // debugger;
       this.doGreatStuff;
    }
  }

  this.eachPart(function(part){
    part.computeTransforms();
  });
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


// Thing.prototype.randomizeAngle = function() {
//   this.yaw = Math.random() * 2*PI;
//   this.pitch = Math.random() * 2*PI;
//   this.roll = Math.random() * 2*PI;
// };


Thing.prototype.saveLastPosition = function() {
  this.lastPosition[0] = this.localToParentTransform[12];
  this.lastPosition[1] = this.localToParentTransform[13];
  this.lastPosition[2] = this.localToParentTransform[14];
};


// Thing.prototype.getPosition = function(out) {
//   vec3.set(out,
//       this.localToParentTransform[12],
//       this.localToParentTransform[13],
//       this.localToParentTransform[14])
//   return out;
// };

// Thing.prototype.setPosition = function(position) {
//   this.localToParentTransform[12] = position[0];
//   this.localToParentTransform[13] = position[1];
//   this.localToParentTransform[14] = position[2];
// };


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






