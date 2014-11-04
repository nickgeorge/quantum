goog.provide('Fella');

goog.require('QuantumTypes');
goog.require('SoundList');
goog.require('Thing');
goog.require('Walker');

/**
 * @constructor
 * @extends {Walker}
 * @struct
 */
Fella = function(message) {

  this.legAngle = (Math.random()*2 - 1) * Fella.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.speed = message.speed || 0;
  // vec3.set(this.velocity, 0, 0, this.speed);


  goog.base(this, message);

  this.velocity = vec3.fromValues(0, 0, this.speed);

  this.color = vec4.nullableClone(message.color);

  this.health = 100;

  this.head = null;
  this.sphereHead = null;
  this.torso = null;
  this.rightLeg = null;
  this.leftLeg = null;
  this.rightArm = null;
  this.leftArm = null;
  this.deathSpeed = 1;
  this.buildBody();

  this.healthBar = new HealthBar({

    refThing: this,
    position: [0, .8, 0]
  });
  this.addEffect(this.healthBar);


  // this.dieAudio = Sounds.get(SoundList.GLASS);
};
goog.inherits(Fella, Walker);
Types.registerType(Fella, QuantumTypes.FELLA);

Fella.MAX_LEG_ANGLE = Math.PI/6;


Fella.prototype.advance = function(dt) {
  this.advanceWalker(dt);
  if (!this.alive) return;
  if (this.isLanded()) {
    if (Math.random() < .02) {
      this.rYaw = Math.random()*2 - 1;
    }
    if (Math.random() < .002) {
      this.jump();
    }
  }
  if (this.isLanded()) {
    this.legAngle += this.speed * this.stepDirection * dt;
  } else {
    this.legAngle = Math.PI / 3;
  }

  if (this.legAngle >= Fella.MAX_LEG_ANGLE) {
    this.stepDirection = -1;
  }
  if (this.legAngle <= -Fella.MAX_LEG_ANGLE) {
    this.stepDirection = 1;
  }

  this.leftLeg.setPitchOnly(this.legAngle);
  this.rightLeg.setPitchOnly(-this.legAngle);
  this.rightArm.setPitchOnly(this.legAngle);
  this.leftArm.setPitchOnly(-this.legAngle);
};


Fella.prototype.land = function(ground) {
  goog.base(this, 'land', ground);

  vec3.set(this.velocity, 0, 0, this.speed);
};


Fella.prototype.getOuterRadius = function() {
  return Hero.HEIGHT * 4;
};


Fella.prototype.jump = function() {
  if (!this.isLanded()) return;
  vec3.set(this.velocity,
      this.velocity[0] * 1.25 * 4,
      60,
      this.velocity[2] * 1.25 * 4);
  this.unland(true);
  this.rYaw = 0;
};

Fella.prototype.die = function() {

  Sounds.getAndPlay(SoundList.GLASS);
  this.alive = false;
  this.velocity = [0, 0, 0];
  this.rYaw = this.rPitch = this.rRoll = 0;
  this.eachPart(function(part) {
    this.alive = false;
    part.isStatic = false;
    var vTheta = Math.random()*2*Math.PI;
    vec3.random(part.velocity, this.deathSpeed);
  });
  Env.world.effects.remove(this.healthBar);
};


Fella.prototype.hit = function(bullet, part) {
  this.health -= bullet.damage * part.damageMultiplier;
  if (this.health <= 0) {

    if (this.alive) {
      this.die();
      var owner = bullet.owner;
      owner.railAmmo += 1;

      owner.registerKill(this, bullet);

      // vec3.copy(
      //     part.velocity,
      //     part.worldToLocalCoords(vec3.temp,
      //         vec3.scale(vec3.temp,
      //             vec3.transformQuat(vec3.temp,
      //                 bullet.velocity,
      //                 bullet.upOrientation),
      //             1/25),
      //         0));
    }
  } else {
    this.healthBar.updateHealth();
  }
};


Fella.prototype.buildBody = function() {
  var boxTexture = Textures.get(TextureList.GRANITE);
  this.leftLeg = new OffsetBox({
    size: [.2, 1, .2],
    // color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, -Hero.HEIGHT + 1.1, 0],
    isStatic: true,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: [.5, 1, 1, 1],
    // textureCounts: [1, 10]
  });

  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    // color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -Hero.HEIGHT + 1.1, 0],
    isStatic: true,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: [.5, 1, 1, 1],
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.45, -Hero.HEIGHT + 1.975, 0],
    // color: this.color,
    offset: [0, -.45, 0],
    roll: 0.25,
    name: "left leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: [.5, 1, 1, 1],
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.45, -Hero.HEIGHT + 1.975, 0],
    // color: this.color,
    offset: [0, -.45, 0],
    roll: -0.25,
    name: "right leg",
    isStatic: true,
    damageMultiplier: .85,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: [.5, 1, 1, 1],
  });

  this.sphereHead = new Sphere({
    data: HeadData,
    // uScale: .015,
    position: [0, -Hero.HEIGHT + 2.2, 0],
    name: "head",
    // color: this.color,
    isStatic: true,
    damageMultiplier: 4,
    collideRadius: 1,
    radius: .27,
  });
  this.sphereHead.visible = false;

  this.head = new DataThing({
    texture: boxTexture,
    data: HeadData,
    uScale: .015,
    position: [0, -Hero.HEIGHT + 2.2, 0],
    name: "head",
    color: [.5, 1, 1, 1],
    isStatic: true,
    // damageMultiplier: 4,
    // collideRadius: 1,
    // radius: .27
  });

  this.torso = new Box({
    size: [.6, 1, .2],
    position: [0, -Hero.HEIGHT + 1.5, 0],
    // color: this.color,
    name: "torso",
    textureCounts: [1, 1],
    isStatic: true,
    damageMultiplier: 1.7,
    texture: boxTexture,
    // color: [201/256., 189/256., 107/256., 1.0],
    color: [.5, 1, 1, 1],
  });

  this.addParts([
    this.head,
    this.sphereHead,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
  ]);
};



Fella.prototype.drawHead = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.head.draw();
  Env.gl.popModelMatrix();
};


Fella.prototype.drawNotHead = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.torso.draw();
  this.leftLeg.draw();
  this.rightLeg.draw();
  this.leftArm.draw();
  this.rightArm.draw();
  this.healthBar.draw();
  Env.gl.popModelMatrix();
};


Fella.prototype.drawHealthBar = function() {
  if (this.isDisposed || !this.visible) return;
  Env.gl.pushModelMatrix();
  this.transform();
  this.healthBar.draw();
  Env.gl.popModelMatrix();
};
