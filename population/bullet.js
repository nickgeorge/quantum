Bullet = function(message) {
  this.super(message);
  this.radius = message.radius;
  this.sphere = new Sphere({
    radius: this.radius,
    // color: [.3, 1, .3, 1],
    position: [0, 0, 0],
    texture: Textures.GREEN_PLASMA,
  });
  this.parts = [this.sphere];

  this.alive = true;

  this.klass = 'Bullet';
};
util.inherits(Bullet, Thing);
Bullet.type = Types.BULLET;

Bullet.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
  if (this.alive) {
    this.velocity[1] -= world.G/400;
  }
};

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};