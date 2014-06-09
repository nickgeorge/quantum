ThrowinGurnade = function(message) {  
  this.super(message);
  this.radius = message.radius;
  this.sphere = new Sphere({
    radius: this.radius,
    // color: [.3, 1, .3, 1],
    position: [0, 0, 0],
    texture: Textures.PLASMA,
    rYaw: 100,
    rPitch: 100,
    rRoll: 100,
    color: [.3, 1, .8, 1],
  });
  // this.sphere.scale = [1, 2, 1];
  this.parts = [this.sphere];

  this.stage = ThrowinGurnade.Stage.TICKING;

  this.alive = true;
};
util.inherits(ThrowinGurnade, Thing);
ThrowinGurnade.type = Types.THROWIN_GURNADE;

ThrowinGurnade.Stage = {
  TICKING: 'TICKING',
  EXPLODING: 'EXPLODING',
};

ThrowinGurnade.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  // if (this.alive) {
    if (this.stage == ThrowinGurnade.Stage.TICKING) {
      if (!this.landed) this.velocity[1] -= world.G/25;
        vec3.set(this.sphere.scale,
            .5 + Math.random() * this.age*2,
            .5 + Math.random() * this.age*2,
            .5 + Math.random() * this.age*2);
      if (this.age > 3) {
        this.stage = ThrowinGurnade.Stage.EXPLODING;
        vec3.set(this.sphere.scale,
            3, 3, 3);
        vec3.set(this.sphere.color,
            1, 1, 1);
        this.sphere.texture = null;
      }
    }
    // if (this.
  // }
};

ThrowinGurnade.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};