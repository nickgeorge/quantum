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

DumbCrate.prototype.contains = function(v, opt_axesToCheck) {
  var axesToCheck = opt_axesToCheck || [true, true, true];
  for (var i = 0; i < 3; i++) {
    if (!axesToCheck[i]) continue;
    if (v[i] < -this.size[i]/2 || v[i] > this.size[i]/2) {
      return false;
    }
  }
  return true;
};

DumbCrate.prototype.glom = function(thing) {
  util.array.remove(world.things, thing);
  this.parts.push(thing);
  vec3.copy(thing.velocity, Vector.ZERO);

  this.toLocalCoords(thing.position, thing.position);
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
  console.log([closestDistance, closestAxis]);
  if (closestDistance > tolerance) {
    v[closestAxis] = (this.size[closestAxis]/2 + extraPush) * direction;
  }
  this.toWorldCoords(v, v);
};