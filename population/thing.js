Thing = function(message) {
  message = message || {};
  this.pitch = message.pitch || 0;
  this.yaw = message.yaw || 0;
  this.roll = message.roll || 0;
  this.rPitch = message.rPitch || 0;
  this.rYaw = message.rYaw || 0;
  this.rRoll = message.rRoll || 0;

  this.velocity = vec3.nullableClone(message.velocity);
  this.position = vec3.nullableClone(message.position);
  this.lastPosition = vec3.clone(this.position);

  this.alive = message.alive;

  this.parts = [];
  this.parent = null;

  this.age = 0;

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
  vec3.copy(this.lastPosition, this.position);
  this.age += dt;
  this.yaw += this.rYaw * dt;
  this.pitch += this.rPitch * dt;
  this.roll += this.rRoll * dt;
  vec3.scaleAndAdd(this.position, this.position,
      this.velocity, dt);

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


Thing.prototype.addParts = function(parts) {
  util.array.forEach(parts, function(part) {
    this.addPart(part);
  }, this);
};


Thing.prototype.findThingEncounter = function(thing, opt_threshold) {
  return this.findEncounter(
    thing.lastPosition, thing.position, opt_threshold || 0);
};


Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, threshold) {
  p_0 = this.parentToLocalCoords([], p_0_pc);
  p_1 = this.parentToLocalCoords([], p_1_pc);
  
  var closestEncounter = null;
  var encounters = [];
  for (var i = 0; this.parts[i]; i++) {
    var encounter = this.parts[i].findEncounter(p_0, p_1, threshold);
    if (!encounter) continue;
    if (!closestEncounter) {
      closestEncounter = encounter;
      encounters.push(i +" : " +  encounter.t);
      continue;
    }

    if (encounter.t < closestEncounter.t) {
      closestEncounter = encounter;
      encounters.push(i +" : " +  encounter.t);
      continue
    }
  };
  if (this.getType() == Types.BOX && encounters.length > 0) {
    // console.log(encounters);
    // console.log(closestEncounter);
    // console.log(p_0 + " __ " + p_1)
  }
  return closestEncounter;
};


Thing.prototype.glom = function(thing, intersection) {
  var point = intersection.point;

  if (intersection.part != this) {
    intersection.part.localToParentCoords(point, point);
  }

  util.array.remove(world.things, thing);
  this.parts.push(thing);
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
  vec3.copy(out, v);
  vec3.transformMat4(out, out, this.localToParentTransform, w);
  return out;
};


/**
 * Transforms a vector in parent coordinates to local coordinates
 * @param out The receiving Vector3
 * @param v Vector3 in world coordinates
 */
Thing.prototype.parentToLocalCoords = function(out, v, opt_w) {
  var w = opt_w === undefined ? 1 : opt_w;
  vec3.copy(out, v);
  vec3.transformMat4(out, out, this.parentToLocalTransform, w);
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
  vec3.copy(out, v);
  vec3.transformMat4(out, out, this.localToParentTransform, w);
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
  vec3.copy(out, v);
  if (this.parent) {
    this.parent.worldToLocalCoords(out, out, w);
  }
  vec3.transformMat4(out, out, this.parentToLocalTransform, w);
  return out;
};


Thing.prototype.computeTransforms = function() {
  mat4.identity(this.localToParentTransform);
  mat4.translate(this.localToParentTransform,
      this.localToParentTransform, this.position);
  mat4.rotate(this.localToParentTransform,
      this.localToParentTransform,
      this.yaw,
      vec3.J);
  mat4.rotate(this.localToParentTransform,
      this.localToParentTransform,
      this.pitch,
      vec3.I);
  mat4.rotate(this.localToParentTransform,
      this.localToParentTransform,
      this.roll,
      vec3.K); 

  mat4.invert(this.parentToLocalTransform, this.localToParentTransform);


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

  util.array.forEach(this.parts, function(part){
    part.dispose();
  });
};


Thing.prototype.makeEncounter = util.unimplemented;