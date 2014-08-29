ThrowinGurnade = function(message) {  
  util.base(this, message);
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
  EXPLODED: 'EXPLODED',
};

ThrowinGurnade.prototype.advance = function(dt) {
  if (this.isDisposed) return;
  this.advanceBasics(dt);
  if (this.stage == ThrowinGurnade.Stage.TICKING) {
    if (!this.landed) this.velocity[1] -= Env.world.G/25;
    vec3.set(this.sphere.scale,
        .5 + Math.random() * this.age*2,
        .5 + Math.random() * this.age*2,
        .5 + Math.random() * this.age*2);
    if (this.age > 3) {
      this.stage = ThrowinGurnade.Stage.EXPLODING;
      vec3.set(this.sphere.scale,
          3, 3, 3);
      vec4.set(this.sphere.color,
          1, 1, 1, 1);
      this.sphere.texture = null;
    }
  }
  if (this.stage == ThrowinGurnade.Stage.EXPLODING) {
    this.stage == ThrowinGurnade.Stage.EXPLODING;
    vec4.set(this.sphere.color, 0, 0, 0, 1);
    vec3.set(this.sphere.scale, 2, 2, 2);
  }
};

ThrowinGurnade.prototype.getOuterRadius = function() {
  return this.stage == ThrowinGurnade.Stage.EXPLODING ? 
      25 : 
      this.sphere.getOuterRadius();
};