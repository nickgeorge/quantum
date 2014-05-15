Hero = function(message) {
  this.super(message);

  this.keyMove = vec3.create();

  this.viewOrientation = quat.clone(this.upOrientation);

  this.landed = false;
  this.ground = null;

  this.v_ground = 30;
  this.v_air = 60;

  this.targetViewOrientation = quat.create();
  this.originalViewOrientation = quat.create();
  this.rotationTransitionT = false;
  this.rotating = false;

  this.playingWalking = false;
  this.walkingAudio = null;
  this.bobAge = 0;

  this.plumb = new Box({
    size: [.05, .05, .05],
    position: [0, 0, -1],
    texture: Textures.CRATE,
    textureCounts: [1, 1],
    color: [1, 1, 1, 1]
  });
  // this.addPart(this.plumb);

  this.root = true;

  this.klass = 'Hero';
};
util.inherits(Hero, Thing);
Hero.type = Types.HERO;

Hero.JUMP_VELOCITY = 125;
Hero.HEIGHT = 2.2;
Hero.WIDTH = .5;


Hero.prototype.advance = function(dt) {
  util.base(this, 'advance', dt, true);

  if (this.rotating) {
    this.rotationTransitionT += dt * 12;
    if (this.rotationTransitionT > 1) {
      this.rotationTransitionT = 1;
      this.rotating = false;
    }
    quat.slerp(this.viewOrientation,
        this.originalViewOrientation,
        this.targetViewOrientation,
        this.rotationTransitionT);
  }

  if (this.landed) {
    var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
    var factor = sum == 2 ? 1/ROOT_2 : 1;
    this.velocity[0] = factor * this.v_ground * (this.keyMove[0]);
    this.velocity[1] = 0;
    this.velocity[2] = factor * this.v_ground * (this.keyMove[2]);

    if (sum > 0) {
      this.bobAge += dt;
      if (!this.playingWalking) {
        this.playWalking();
      }
    } else if (this.playingWalking) {
      this.walkingAudio.pause();
      this.playingWalking = false;
    }

    if (this.ground) {
      if (!this.ground.contains_lc(
          this.ground.worldToLocalCoords(vec3.temp, this.position))) {
        this.unland();
      } else {
        
        // var heroVelocity_lc = this.ground.worldToLocalCoords(vec3.temp, this.velocity, 0);
        // heroVelocity_lc[2] = 0
        // this.ground.localToWorldCoords(this.velocity, heroVelocity_lc, 0);

      }
    }
  } else {
    this.velocity[0] += this.v_air * dt * this.keyMove[0];
    this.velocity[2] += this.v_air * dt * this.keyMove[2];

    this.velocity[0] = Math.min(60, Math.max(-60, this.velocity[0]));
    this.velocity[2] = Math.min(60, Math.max(-60, this.velocity[2]));
    this.velocity[1] -= world.G*dt;
  }

  vec3.transformQuat(this.plumb.position, [0, 0, -1],
      this.viewOrientation);
  vec3.transformQuat(this.plumb.position, this.plumb.position, 
      quat.invert([], this.upOrientation));
};

Hero.prototype.playWalking = function() {        
  this.playingWalking = true;
  this.walkingAudio = SoundManager.play(Sounds.WALK, util.bind(function() {
    this.playingWalking = false;
  }, this));
};


Hero.prototype.jump = function() {
  if (!this.isLanded()) return;
  if (this.walkingAudio) {
    this.walkingAudio.pause();
    this.playingWalking = false;
  }
  SoundManager.play(Sounds.SHU);
  this.velocity[1] = Hero.JUMP_VELOCITY;
  this.unland();
};

Hero.prototype.land = function(ground) {
  vec3.set(this.velocity, 0, 0, 0);
  SoundManager.play(Sounds.JUMP);
  this.landed = true;
  this.ground = ground;


  var rotation = quat.rotationTo([],
      this.getNormal([]),
      this.ground.getNormal([]));

  quat.multiply(this.groundOrientation, rotation, this.groundOrientation);
  quat.multiply(this.upOrientation, rotation, this.upOrientation);

  quat.multiply(this.targetViewOrientation, rotation, this.viewOrientation);
  quat.copy(this.originalViewOrientation, this.viewOrientation);
  
  this.rotationTransitionT = 0;
  this.rotating = true;

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
  // var v = 100;
  // var v_shot = [0, 0, -v];
  // // vec3.transformQuat(v_shot, v_shot, this.viewOrientation);

  // // vec3.add(v_shot, v_shot, this.velocity);
  // world.projectilesToAdd.push(new Bullet({
  //   position: this.position,
  //   velocity: v_shot,
  //   radius: .075,
  //   upOrientation: this.upOrientation,
  //   groundOrientation: quat.rotationTo([], vec3.J, this.ground.getNormal([]))
  //   // rYaw: 50,
  //   // rPitch: 55
  // }))
};

Hero.prototype.draw = function() {
  util.base(this, 'draw');
};