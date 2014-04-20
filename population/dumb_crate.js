DumbCrate = function(message) {
  this.super(message);

  this.size = message.size.length ?
      message.size : 
      [message.size, message.size, message.size];
  this.box = new Box({
    size: this.size,
    color: message.color
  });
  this.bump = new Bullet({
    size: [.25, .25, .25],
    color: [0.25, 0.25, 0.25, 1],
    position: [1, 1, 1]
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

DumbCrate.prototype.dispose = function() {
  this.box.dispose();
};

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};

DumbCrate.prototype.glom = function(thing) {
  this.parts.push(thing);
  vec3.copy(thing.velocity, Vector.ZERO);
  // vec3.copy(thing.position, [3, 0, 0])
  this.relativeCoord(thing.position, thing.position);
  thing.computeBaseTransform();
};