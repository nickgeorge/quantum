Hero = function(message) {
  this.super(message);

  this.keyMove = vec3.create();

  this.landed = false;
  this.ground = null;

  this.klass = 'Hero';
};
util.inherits(Hero, Thing);

Hero.JUMP_VELOCITY = 4;
Hero.HEIGHT = .06;


Hero.prototype.advance = function(dt) {
  // not sure it's ok to do basic advance first...
  // might add a frame of latency.
  // TODO: think about this more.
  util.base(this, 'advance', dt, true);
  var landedHeight = world.shelf.lowBound(i) + Hero.HEIGHT;

  if (this.position[1] < landedHeight && this.velocity[1] <= 0) {
    this.position[1] = landedHeight 
    this.land();
  }


  if (this.landed) {
    this.velocity[0] = .4 * (Math.cos(this.yaw)*this.keyMove[0] +
        Math.sin(this.yaw)*this.keyMove[2]);
    this.velocity[2] = .4 * (-Math.sin(this.yaw)*this.keyMove[0] +
        Math.cos(this.yaw)*this.keyMove[2]);

    if (this.ground) {
      var relPosition = this.ground.toLocalCoords(vec3.create(), this.position);
      // if (!this.ground.contains(relPosition, [true, false, true])){
      //   this.landed = false;
      //   this.ground = null;
      // }

    }
  } else {
    this.velocity[0] += 2 * dt * (Math.cos(this.yaw)*this.keyMove[0] +
        Math.sin(this.yaw)*this.keyMove[2]);
    this.velocity[2] += 2 * dt * (-Math.sin(this.yaw)*this.keyMove[0] +
        Math.cos(this.yaw)*this.keyMove[2]);

    this.velocity[0] = Math.min(1, Math.max(-1, this.velocity[0]));
    this.velocity[2] = Math.min(1, Math.max(-1, this.velocity[2]));
    this.velocity[1] -= .03;
  }

  for (var i = 0; i < 3; i++) {
    if (this.position[i] > world.shelf.highBound(i)) {
      this.position[i] = world.shelf.highBound(i);
      this.velocity[i] = -Math.abs(this.velocity[i]);
    }
    if (this.position[i] < world.shelf.lowBound(i) + Hero.HEIGHT) {
      this.position[i] = world.shelf.lowBound(i) + Hero.HEIGHT;
      if (i == 1 ) {
        this.velocity[1] = Math.max(0, this.velocity[1]);
      } else {
        this.velocity[i] = Math.abs(this.velocity[i]);
      }
    }
  }
};

Hero.prototype.jump = function() {
  this.velocity[1] = Hero.JUMP_VELOCITY;
  this.landed = false;
};

Hero.prototype.land = function(ground) {
  this.velocity[1] = 0;
  this.landed = true;
  this.ground = ground;
};

Hero.prototype.getOuterRadius = function() {
  return Hero.HEIGHT;
};


Hero.prototype.shoot = function() {
  var v = 20;
  var v_xz =  Math.cos(this.pitch)*v;

  var v_shot = [
    -v_xz*Math.sin(this.yaw),
    v*Math.sin(this.pitch),
    -v_xz*Math.cos(this.yaw)
  ];
  world.add(new Bullet({
    position: this.position,
    velocity: v_shot,
    radius: .015,
    yaw: this.yaw,
    pitch: this.pitch,
    roll: this.roll,
    texture: Textures.CRATE,
    rYaw: 50,
    rPitch: 55
  }))
};