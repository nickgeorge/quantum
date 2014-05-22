Fella = function(message) {
  this.super(message);

  this.legAngle = (Math.random()*2 - 1) * Fella.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.speed = 1;

  this.color = vec4.nullableClone(message.color);

  this.health = 100;

  this.leftLeg = new OffsetBox({
    size: [.25, 1.1, .25],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, 1.1, 0],
    isPart: true,
    isStatic: true,
  });
      
  this.rightLeg = new OffsetBox({
    size: [.25, 1.1, .25],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, 1.1, 0],
    isPart: true,
    isStatic: true,
  });

  this.leftArm = new OffsetBox({
    size: [.125, .9, .125],
    position: [.355, 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: PI/32,
    name: "left leg",
    isPart: true,
    isStatic: true,
    damageMultiplier: .8
  });
  this.rightArm = new OffsetBox({
    size: [.125, .9, .125],
    position: [-.355, 1.95, 0],
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
    position: [0, 2.2, 0],
    texture: Textures.KARL,
    name: "head",
    isPart: true,
    isStatic: true,
    damageMultiplier: 4,
  });

  this.torso = new LeafBox({
    size: [.6, 1, .3],
    position: [0, 1.5, 0],
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

  this.isRoot = true;

  this.boundingSphere = new BoundingSphere({
    thing: this,
  radius: 10
  })
  this.healthBar = new HealthBar({
    refThing: this
  });
  world.effectsToAdd.push(this.healthBar);
};
util.inherits(Fella, Thing);
Fella.type = Types.FELLA;

Fella.MAX_LEG_ANGLE = PI/6;


Fella.prototype.advance = function(dt) {
  this.advanceBasics(dt);

  if (!this.alive) return;
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
  deathSpeed = 1;
  this.eachPart(function(part) {
    this.alive = false;
    part.isStatic = false;
    var vTheta = Math.random()*2*Math.PI;
    vec3.set(
        part.velocity, 
          Math.cos(vTheta)*deathSpeed,
          Math.random()/2,
          Math.sin(vTheta)*deathSpeed
        );
  });
  world.removeEffect(this.healthBar);
};

Fella.prototype.hit = function(bullet, part) {
  this.health -= 20 * part.damageMultiplier;
  if (this.health <= 0) {
    if (this.alive) this.die();
    vec3.copy(
        part.velocity,
        // [0, 0, 1]);
        part.worldToLocalCoords(vec3.temp,
            vec3.scale(vec3.temp, 
              bullet.velocity, 
              // [0, 0, 1],
              1/25), 0));
  } else {
    this.healthBar.updateHealth();
  }
};