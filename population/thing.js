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

  this.age = 0;

  this.toWorldTransform = mat4.create();
  this.toLocalTransform = mat4.create();
  this.computeTransforms();
};
Thing.klass = Types.THING;


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


Thing.prototype.findThingEncounter = function(thing, opt_hitOnly,
    opt_hitThreshold) {
  return this.findEncounter(
    thing.lastPosition, thing.position,
    opt_hitOnly, opt_hitThreshold);
};


Thing.prototype.findEncounter = function(p_0_pc, p_1_pc, opt_hitOnly,
    opt_hitThreshold) {
  p_0 = this.toLocalCoords([], p_0_pc);
  p_1 = this.toLocalCoords([], p_1_pc);
  
  var closestEncounter = null;
  for (var i = 0; this.parts[i]; i++) {
    var encounter = this.parts[i].findEncounter(p_0, p_1,
        opt_hitOnly, opt_hitThreshold);
    if (!encounter) continue;
    if (!closestEncounter) {
      closestEncounter = encounter;
      continue;
    }

    if (opt_hitOnly) {
      if (encounter.t < closestEncounter.t) {
        closestEncounter = encounter;
        continue
      }
    }

    if (encounter.distanceSquared < closestEncounter.distanceSquared) {
      closestEncounter = encounter;
      continue
    }
  };
  return closestEncounter;
};


Thing.prototype.glom = function(thing, intersection) {
  var point = intersection.point;

  if (intersection.part != this) {
    intersection.part.toWorldCoords(point, point);
  }

  util.array.remove(world.things, thing);
  this.parts.push(thing);
  vec3.copy(thing.velocity, vec3.ZERO);

  vec3.copy(thing.position, point);
  thing.computeTransforms();
};


Thing.prototype.transform = function() {
  gl.transform(this.toWorldTransform);
};


/**
 * Transforms a vector in "thing-space" for this thing
 * into world coordinates.
 * @param out The receiving Vector3
 * @param v Vector3 in "thing-space"
 */
Thing.prototype.toWorldCoords = function(out, v) {
  vec3.transformMat4(out, v, this.toWorldTransform);
  return out;
};


/**
 * Transforms a vector in world coordinates to local coordinates
 * @param out The receiving Vector3
 * @param v Vector3 in world coordinates
 */
Thing.prototype.toLocalCoords = function(out, v) {
  vec3.transformMat4(out, v, this.toLocalTransform);
  return out;
};


Thing.prototype.computeTransforms = function() {
  mat4.identity(this.toWorldTransform);
  mat4.translate(this.toWorldTransform,
      this.toWorldTransform, this.position);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.yaw,
      vec3.J);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.pitch,
      vec3.I);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.roll,
      vec3.K); 

  mat4.invert(this.toLocalTransform, this.toWorldTransform);

  this.eachPart(function(part){
    part.computeTransforms();
  });
};


Thing.prototype.getType = function() {
  return this.constructor.type;
};


Thing.prototype.dispose = function() {
  this.toWorldTransform = null;
  this.toLocalTransform = null;
  this.velocity = null;
  this.position = null;

  util.array.forEach(this.parts, function(part){
    part.dispose();
  });
};


Thing.prototype.makeEncounter = util.unimplemented;