Thing = function(message) {
  message = message || {};
  this.pitch = message.pitch || 0;
  this.yaw = message.yaw || 0;
  this.roll = message.roll || 0;
  this.rPitch = message.rPitch || 0;
  this.rYaw = message.rYaw || 0;
  this.rRoll = message.rRoll || 0;
  this.leaf = message.leaf || false;

  this.velocity = vec3.nullableClone(message.velocity);
  this.position = vec3.nullableClone(message.position);
  this.lastPosition = vec3.clone(this.position);

  this.alive = message.alive;

  this.parts = [];

  this.age = 0;

  // Leaf attributes 
  this.texture = message.texture;
  this.color = message.color || vec4.WHITE;
  this.vertexBuffer = null;
  this.textureBuffer = null;
  this.indexBuffer = null;
  this.normalBuffer = null;
  // End Leaf Attributes

  this.toWorldTransform = mat4.create();
  this.toLocalTransform = mat4.create();
  this.computeTransforms();

  this.klass = "Thing";
};

Thing.nextId = 0;

Thing.prototype.eachPart = function(fn) {
  util.array.forEach(this.parts, fn, this);
};

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
    var d = vec3.squaredDistance(this.position, thing.position);
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
  if (this.leaf) {
    this.renderSelf();
  }
  this.eachPart(function(part){
    part.draw();
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


Thing.prototype.findThingIntersection = function(thing) {
  return this.findIntersection(thing.lastPosition, thing.position);
};


Thing.prototype.findIntersection = function(p_0, p_1) {
  p_0 = this.toLocalCoords(vec3.create(), p_0);
  p_1 = this.toLocalCoords(vec3.create(), p_1);
  
  for (var i = 0; this.parts[i]; i++) {
    var intersection = this.parts[i].findIntersection(p_0, p_1);
    if (intersection) return intersection;
  };
  return null;
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


Thing.prototype.renderSelf = function() {
  gl.setMatrixUniforms();

  shaderProgram.setUniformColor(this.color);
  shaderProgram.setUseTexture(this.texture && this.texture.loaded);
  shaderProgram.bindTexture(this.texture);
  shaderProgram.bindVertexPositionBuffer(this.vertexBuffer);
  shaderProgram.bindVertexNormalBuffer(this.normalBuffer);
  shaderProgram.bindVertexTextureBuffer(this.textureBuffer);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  shaderProgram.reset();
};