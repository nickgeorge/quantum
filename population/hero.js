Hero = function(message) {
  this.super(message);

  this.keyMove = vec3.create();

  this.landed = false;
  this.ground = null;

  this.klass = 'Hero';
};
util.inherits(Hero, Thing);
Hero.type = Types.HERO;

Hero.JUMP_VELOCITY = 125;
Hero.HEIGHT = 1.8;
Hero.WIDTH = .5;


Hero.prototype.advance = function(dt) {
  util.base(this, 'advance', dt, true);
  var landedHeight = world.shelf.lowBound(1) + Hero.HEIGHT;

  if (this.position[1] < landedHeight && this.velocity[1] <= 0) {
    this.position[1] = landedHeight 
    this.land();
  }


  if (this.landed) {
    var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
    var factor = sum == 2 ? 1/ROOT_2 : 1;
    this.velocity[0] = factor * 50 * (Math.cos(this.yaw)*this.keyMove[0] +
        Math.sin(this.yaw)*this.keyMove[2]);
    this.velocity[2] = factor * 50 * (-Math.sin(this.yaw)*this.keyMove[0] +
        Math.cos(this.yaw)*this.keyMove[2]);
    this.velocity[1] = 0;

    if (this.ground) {
      if (!this.ground.contains(this.ground.worldToLocalCoords(vec3.temp, this.position))) {
        this.unland();
      } else {
        
        var heroVelocity_lc = this.ground.worldToLocalCoords(vec3.temp, this.velocity, 0);
        heroVelocity_lc[2] = 0
        this.ground.localToWorldCoords(this.velocity, heroVelocity_lc, 0);

      }
    }
  } else {
    this.velocity[0] += 60 * dt * (Math.cos(this.yaw)*this.keyMove[0] +
        Math.sin(this.yaw)*this.keyMove[2]);
    this.velocity[2] += 60 * dt * (-Math.sin(this.yaw)*this.keyMove[0] +
        Math.cos(this.yaw)*this.keyMove[2]);

    this.velocity[0] = Math.min(30, Math.max(-30, this.velocity[0]));
    this.velocity[2] = Math.min(30, Math.max(-30, this.velocity[2]));
    this.velocity[1] -= world.G*dt;
  }
};

Hero.prototype.jump = function() {
  if (!hero.isLanded()) return;
  this.velocity[1] = Hero.JUMP_VELOCITY;
  this.unland();
};

Hero.prototype.land = function(ground) {
  vec3.set(this.velocity, 0, 0, 0);
  this.landed = true;
  this.ground = ground;
};

Hero.prototype.unland = function() {
  this.landed = false;
  this.ground = null;
};

Hero.prototype.isLandedOn = function(ground) {
  return this.ground == ground;
};

Hero.prototype.isLanded = function() {
  return this.landed;
};


Hero.prototype.getOuterRadius = function() {
  return Hero.HEIGHT;
};


Hero.prototype.shoot = function() {
  var v = 600;
  var v_xz =  Math.cos(this.pitch)*v;

  var v_shot = [
    -v_xz*Math.sin(this.yaw),
    v*Math.sin(this.pitch),
    -v_xz*Math.cos(this.yaw)
  ];
  world.add(new Bullet({
    position: this.position,
    velocity: v_shot,
    radius: .45,
    yaw: this.yaw,
    pitch: this.pitch,
    roll: this.roll,
    texture: Textures.CRATE,
    rYaw: 50,
    rPitch: 55
  }))
};

Hero.prototype.draw = function() {
  util.base(this, 'draw');
};