Hero = function(message) {
  this.super(message);

  this.keyMove = vec3.create();

  this.viewOrientation = quat.clone(this.upOrientation);


  this.initialViewOrientation = quat.create();
  this.terminalViewOrientation = quat.create();
  this.isViewTransitioning = false;
  this.viewTransitionT = 0;

  this.v_ground = 20;
  this.v_air = 30;

  this.gimble = new Gimble({
    referenceObject: this
  });
};
util.inherits(Hero, Walker);
Hero.type = Types.HERO;

Hero.objectCache = {
  advance: {
    velocityInView: vec3.create(),
    thisNormal: vec3.create(),
    deltaV: vec3.create(),
  },
  normal: vec3.create()
};

Hero.JUMP_VELOCITY = vec3.fromValues(0, 70, 0);
Hero.HEIGHT = 2;
Hero.WIDTH = .5;


Hero.prototype.advance = function(dt) {
  this.advanceWalker(dt);
  var cache = Hero.objectCache;

  if (this.isViewTransitioning) {
    this.viewTransitionT += 3 * dt;
    if (this.viewTransitionT >= 1) {
      this.viewTransitionT = 1;
      this.isViewTransitioning = false;
    }
    quat.slerp(this.viewOrientation,
        this.initialViewOrientation,
        this.terminalViewOrientation,
        this.viewTransitionT);
  } 

  if (this.landed) {
    var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
    var factor = sum == 2 ? 1/ROOT_2 : 1;
    this.velocity[0] = factor * this.v_ground * (this.keyMove[0]);
    this.velocity[1] = 0;
    this.velocity[2] = factor * this.v_ground * (this.keyMove[2]);
  } else {

    var deltaV = vec3.set(cache.advance.deltaV,
      this.v_air * this.keyMove[0],
      0,
      this.v_air * this.keyMove[2]
    );

    var deltaVInView = vec3.transformQuat(deltaV,
        deltaV,
        this.viewOrientation);

    var thisNormal = this.getNormal();

    vec3.subtract(deltaVInView, 
        deltaVInView,
        vec3.project(vec3.temp, deltaVInView, thisNormal));

    vec3.add(this.velocity,
        this.velocity,
        vec3.scale(deltaVInView, deltaVInView, dt));
  }
};

Hero.prototype.jump = function() {
  if (!this.isLanded()) return;
  vec3.transformQuat(this.velocity, Hero.JUMP_VELOCITY, this.upOrientation);
  this.unland();
};


Hero.prototype.shoot = function(e) {
  if (e.button == 0) {
    var v = 130;
    var v_shot = [0, 0, -v];
    // vec3.transformQuat(v_shot, v_shot, this.viewOrientation);

    // vec3.add(v_shot, v_shot, this.velocity);
    world.projectilesToAdd.push(new Bullet({
      position: this.position,
      velocity: v_shot,
      radius: .075 * 1.5,
      upOrientation: this.viewOrientation
    }));
  } else {    
    var v = 20;
    var v_shot = [0, 0, -v];
    vec3.transformQuat(v_shot, v_shot, this.viewOrientation);

    var fella = new Fella({
      position: this.position,
      upOrientation: this.upOrientation,
      speed: 5,
      color: vec4.randomColor([]),
      velocity: v_shot,
    });
    world.add(fella);
  }
};


Hero.prototype.getViewNormal = function(out) {
  return vec3.transformQuat(out, vec3.J, this.viewOrientation);
};


Hero.prototype.getViewNose = function(out) {
  return vec3.transformQuat(out, vec3.NEG_K, this.viewOrientation);
};
