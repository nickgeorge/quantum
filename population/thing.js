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

  this.alive = message.alive;

  this.parts = [];

  this.age = 0;

  this.toWorldTransform = mat4.create();
  this.toLocalTransform = mat4.create();
  this.computeTransforms();

  this.klass = "Thing";
};

Thing.nextId = 0;

Thing.prototype.setId = function(id) {
  this.id = id;
  return this;
}

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

Thing.prototype.setTribe = function(tribe) {
  tribe.add(this);
  this.tribe = tribe;
  return this;
};

Thing.prototype.transform = function() {
  gl.transform(this.toWorldTransform);
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

Thing.prototype.draw = function() {
  gl.pushModelMatrix();

  this.transform();
  this.render();

  gl.popModelMatrix();
}

Thing.prototype.advance = function(dt) {
  this.age += dt;
  this.yaw += this.rYaw * dt;
  this.pitch += this.rPitch * dt;
  this.roll += this.rRoll * dt;
  vec3.scaleAndAdd(this.position, this.position,
      this.velocity, dt);
  this.computeTransforms();


  util.array.forEach(this.parts, function(part){
    part.advance(dt);
  });
};

Thing.prototype.computeTransforms = function() {
  mat4.identity(this.toWorldTransform);
  mat4.translate(this.toWorldTransform,
      this.toWorldTransform, this.position);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.yaw,
      Vector.J);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.pitch,
      Vector.I);
  mat4.rotate(this.toWorldTransform,
      this.toWorldTransform,
      this.roll,
      Vector.K); 

  mat4.invert(this.toLocalTransform, this.toWorldTransform);
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


Thing.prototype.render = function() {
  util.array.forEach(this.parts, function(part){
    part.render();
  });
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

Thing.prototype.update = util.unimplemented;
Thing.prototype.getOuterRadius = util.unimplemented;