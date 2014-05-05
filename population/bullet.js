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

  this.klass = 'Bullet';
};
util.inherits(Bullet, Thing);
Bullet.type = Types.BULLET;

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};