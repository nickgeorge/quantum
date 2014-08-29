Bullet = function(message) {
  util.base(this, message);
  this.radius = message.radius;
  this.sphere = new Sphere({
    radius: this.radius,
    position: [0, 0, 0],
    texture: Textures.PLASMA,
    rYaw: 100,
    rPitch: 100,
    rRoll: 100,
    color: [1, .3, .8, 1],
  });
  this.parts = [this.sphere];

  this.damage = 30;

  this.alive = true;
};
util.inherits(Bullet, Thing);
Bullet.type = Types.BULLET;

Bullet.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};