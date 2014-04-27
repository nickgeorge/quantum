DumbCrate = function(message) {
  this.super(message);

  this.size = message.size.length ?
      message.size : 
      [message.size, message.size, message.size];
  this.box = new Box({
    size: this.size,
    color: message.color
  });

  this.parts = [this.box];
  this.outerRadius = 1;
  if (message.texture) {
    this.box.setTexture(message.texture);
  }

  this.klass = "DumbCrate";
};
util.inherits(DumbCrate, Thing);

DumbCrate.DEFAULT_SPEED = 60;

DumbCrate.prototype.die = function() {
  util.base(this, 'die');

  this.box.setColor([1, 1, 1, 1]);
  this.box.texture = null;
  this.alive = false;
};

DumbCrate.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
  util.array.forEach(this.parts, function(part) {
    part.advance(dt);
  });
};

DumbCrate.prototype.render = function() {
  util.array.forEach(this.parts, function(part) {
    part.draw();
  });
};

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};

DumbCrate.prototype.contains = function(v, opt_extra) {
  var extra = opt_extra || 0;
  var axesToCheck = [true, true, true];
  for (var i = 0; i < 3; i++) {
    if (!axesToCheck[i]) continue;
    var size = this.size[i]/2 + extra;
    if (v[i] < -size || v[i] > size) {
      return false;
    }
  }
  return true;
};

DumbCrate.prototype.glom = function(thing, point) {
  util.array.remove(world.things, thing);
  this.parts.push(thing);
  vec3.copy(thing.velocity, Vector.ZERO);

  vec3.copy(thing.position, point);
  thing.computeTransforms();
};

DumbCrate.prototype.pushOut = function(v, opt_tolerance, opt_extraPush) {
  var tolerance = opt_tolerance || 0;
  var extraPush = opt_extraPush || 0;
  this.toLocalCoords(v, v); 
  var closestAxis = undefined;
  var closestDistance = undefined;
  var direction = undefined;
  for (var i = 0; i < 3; i++) {
    var delta = Math.abs(v[i]) - Math.abs(this.size[i] / 2);
    if (!closestDistance || Math.abs(delta) < closestDistance ) {
      closestDistance = Math.abs(delta);
      closestAxis = i;
      direction = v[i] > 0 ? 1 : -1;
    }
  }
  if (closestDistance > tolerance) {
    v[closestAxis] = (this.size[closestAxis]/2 + extraPush) * direction;
  }
  this.toWorldCoords(v, v);
};

DumbCrate.prototype.findThingIntersection = function(thing) {
  return this.findIntersection(thing.lastPosition, thing.position);
};


DumbCrate.prototype.findIntersection = function(p_0, p_1) {  
  p_0 = this.toLocalCoords(vec3.create(), p_0);
  p_1 = this.toLocalCoords(vec3.create(), p_1);

  var crossedPlanes = [];
  for (var i = 0; i < 3; i++) {
    var halfSize = this.size[i]/2;
    if (p_0[i] > halfSize && p_1[i] < halfSize) {
      crossedPlanes.push([i, 1]);
    }
    if (p_0[i] < -halfSize && p_1[i] > -halfSize) {
      crossedPlanes.push([i, -1]);
    }
  }

  // an intersection is of the form:
  // {plane: [axis, direction], point: vec3}
  var intersections = [];
  util.array.forEach(crossedPlanes, function(crossedPlane) {
    var axis_c0 = crossedPlane[0];
    var axis_c1 = (axis_c0 + 1) % 3;
    var axis_c2 = (axis_c0 + 2) % 3;

    var sign = crossedPlane[1];
    var halfSize = this.size[axis_c0]/2;

    var p_int = [];

    p_int[axis_c0] = sign * halfSize;
    var t = (p_int[axis_c0] -  p_0[axis_c0]) / (p_1[axis_c0] - p_0[axis_c0]);

    p_int[axis_c1] = t*(p_1[axis_c1] - p_0[axis_c1]) + p_0[axis_c1];
    p_int[axis_c2] = t*(p_1[axis_c2] - p_0[axis_c2]) + p_0[axis_c2];
    if (this.contains(p_int)) {
      intersections.push({
        plane: crossedPlane,
        point: p_int
      });
    }
  }, this);

  return intersections.length ? intersections[0] : null;
};