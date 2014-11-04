goog.provide('ThrowinGurnade');

goog.require('QuantumTypes');
goog.require('TextureList');
goog.require('Thing');


/**
 * @constructor
 * @struct
 * @extends {Thing}
 */
ThrowinGurnade = function(message) {
  goog.base(this, message);
  this.radius = message.radius;
  this.sphere = new Sphere({
    radius: this.radius,
    position: [0, 0, 0],
    texture: Textures.get(TextureList.PLASMA),
    rYaw: 100,
    rPitch: 100,
    rRoll: 100,
    color: [.3, 1, .8, 1],
  });
  this.parts = [this.sphere];

  this.stage = ThrowinGurnade.Stage.TICKING;

  this.alive = true;
};
goog.inherits(ThrowinGurnade, Thing);
Types.registerType(ThrowinGurnade, QuantumTypes.THROWIN_GURNADE);

ThrowinGurnade.Stage = {
  TICKING: 'TICKING',
  EXPLODING: 'EXPLODING',
  EXPLODED: 'EXPLODED',
};

ThrowinGurnade.prototype.advance = function(dt) {
  if (this.isDisposed) return;
  this.advanceBasics(dt);
  if (this.stage == ThrowinGurnade.Stage.TICKING) {
    this.velocity[1] -= Env.world.G/25;
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
    this.stage = ThrowinGurnade.Stage.EXPLODING;
    vec4.set(this.sphere.color, 0, 0, 0, 1);
    vec3.set(this.sphere.scale, 2, 2, 2);
  }
};

ThrowinGurnade.prototype.getOuterRadius = function() {
  return this.stage == ThrowinGurnade.Stage.EXPLODING ?
      25 :
      this.sphere.getOuterRadius();
};
