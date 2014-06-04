Fella = function(message) {

  this.legAngle = (Math.random()*2 - 1) * Fella.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.speed = message.speed || 0;

  // if (!message.velocity) {
  //   this.yaw = message.yaw || 0;
  //   message.velocity = [
  //     Math.sin(message.yaw)*this.speed,
  //     0,
  //     Math.cos(message.yaw)*this.speed
  //   ];
  // } else {
  //   message.velocity = vec3.clone(message.velocity);
  //   message.yaw = -Math.atan2(this.velocity[2], this.velocity[0]) + PI/2;
  // }

  this.velocity = [
    0,
    0,
    this.speed
  ];

  util.base(this, message);

  this.color = vec4.nullableClone(message.color);

  this.health = 100;

  this.head = null;
  this.torso = null;
  this.rightLeg = null;
  this.leftLeg = null;
  this.rightArm = null;
  this.leftArm = null;
  this.buildBody();

  this.healthBar = new HealthBar({
    refThing: this,
    position: [0, .8, 0]
  });
  this.addEffect(this.healthBar);
};
util.inherits(Fella, Walker);
Fella.type = Types.FELLA;

Fella.MAX_LEG_ANGLE = PI/6;


Fella.prototype.advance = function(dt) {
  this.advanceWalker(dt);
  if (!this.alive) return;
  if (Math.random() < .02) {
    this.rYaw = Math.random()*2 - 1;
  }
  this.legAngle += this.speed * this.stepDirection * dt;

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


Fella.prototype.getOuterRadius = function() {
  return Hero.HEIGHT * 4;
};

Fella.prototype.die = function() {
  this.alive = false;
  this.velocity = [0, 0, 0];
  this.rYaw = this.rPitch = this.rRoll = 0;
  deathSpeed = 1;
  this.eachPart(function(part) {
    this.alive = false;
    part.isStatic = false;
    var vTheta = Math.random()*2*Math.PI;
    vec3.set(part.velocity, 
        Math.cos(vTheta)*deathSpeed,
        Math.random()/2,
        Math.sin(vTheta)*deathSpeed);
  });
  world.removeEffect(this.healthBar);
};

Fella.prototype.hit = function(bullet, part) {
  this.health -= 20 * part.damageMultiplier;
  if (this.health <= 0) {
    if (this.alive) this.die();
    vec3.copy(
        part.velocity,
        part.worldToLocalCoords(vec3.temp,
            vec3.scale(vec3.temp, 
              bullet.velocity,
              1/25),
            0));
  } else {
    this.healthBar.updateHealth();
  }
};


Fella.prototype.buildBody = function() {  
  this.leftLeg = new OffsetBox({
    size: [.2, 1, .2],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, -Hero.HEIGHT + 1.1, 0],
    isPart: true,
    isStatic: true,
  });
      
  this.rightLeg = new OffsetBox({
    size: [.2, 1, .2],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, -Hero.HEIGHT + 1.1, 0],
    isPart: true,
    isStatic: true,
  });

  this.leftArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [.355, -Hero.HEIGHT + 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: PI/32,
    name: "left leg",
    isPart: true,
    isStatic: true,
    damageMultiplier: .8
  });
  this.rightArm = new OffsetBox({
    size: [.115, .9, .115],
    position: [-.355, -Hero.HEIGHT + 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: -PI/32,
    name: "right leg",
    isPart: true,
    isStatic: true,
    damageMultiplier: .8
  });

  this.head = new Sphere({
    radius: .25,
    position: [0, -Hero.HEIGHT + 2.2, 0],
    texture: Textures.KARL,
    name: "head",
    isPart: true,
    isStatic: true,
    damageMultiplier: 4,
  });

  this.torso = new LeafBox({
    size: [.6, 1, .2],
    position: [0, -Hero.HEIGHT + 1.5, 0],
    color: this.color,
    name: "torso",
    textureCounts: [1, 1],
    isPart: true,
    isStatic: true,
    damageMultiplier: 1.7,
  });

  this.addParts([
    this.head,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
  ]);
};