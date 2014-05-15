Fella = function(message) {
  this.super(message);

  this.legAngle = (Math.random()*2 - 1) * Fella.MAX_LEG_ANGLE;
  this.stepDirection = 1;
  this.speed = 1;

  this.color = vec4.nullableClone(message.color);

  this.leftLeg = new OffsetBox({
    size: [.25, 1.1, .25],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [.1875, 1.1, 0],
  });
      
  this.rightLeg = new OffsetBox({
    size: [.25, 1.1, .25],
    color: this.color,
    offset: [0, -.5, 0],
    name: "left leg",
    position: [-.1875, 1.1, 0],
  });

  this.leftArm = new OffsetBox({
    size: [.125, .9, .125],
    position: [.355, 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: PI/32,
    name: "left leg",
  });
  this.rightArm = new OffsetBox({
    size: [.125, .9, .125],
    position: [-.355, 1.95, 0],
    color: this.color,
    offset: [0, -.45, 0],
    roll: -PI/32,
    name: "right leg",
  });

  this.head = new Sphere({
    radius: .25,
    position: [0, 2.2, 0],
    yaw: PI/2,
    texture: Textures.KARL,
    name: "head",
  });
  this.torso = new Box({
    size: [.6, 1, .3],
    position: [0, 1.5, 0],
    color: this.color,
    name: "torso",
  });

  this.addParts([
    this.head,
    this.torso,
    this.rightLeg,
    this.leftLeg,
    this.rightArm,
    this.leftArm,
  ]);

  this.root = true;

  this.boundingSphere = new BoundingSphere({
    thing: this,
  radius: 10
  })
};
util.inherits(Fella, Thing);
Fella.type = Types.FELLA;

Fella.MAX_LEG_ANGLE = PI/6;


Fella.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
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
  return Hero.HEIGHT;
};