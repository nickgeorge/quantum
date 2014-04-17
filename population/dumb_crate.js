DumbCrate = function(message) {
  this.super(message);

  this.size = message.size || 1;
  this.box = new Box({
    size: [this.size, this.size, this.size]
  });

  this.parts = [this.box];
  this.outerRadius = Math.sqrt(this.size * this.size/2);

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
  // this.position[0] = 2*Math.sin(this.age)
  // this.t += Number(dt);
};

DumbCrate.prototype.render = function() {
  this.box.draw();
};

DumbCrate.prototype.dispose = function() {
  this.box.dispose();
};

DumbCrate.prototype.getOuterRadius = function() {
  return this.outerRadius;
};