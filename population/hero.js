Hero = function(message) {
  this.super(message);

  this.keyMove = vec3.create();

  this.viewOrientation = quat.clone(this.upOrientation);


  this.initialViewOrientation = quat.create();
  this.terminalViewOrientation = quat.create();
  this.isViewTransitioning = false;
  this.viewTransitionT = 0;

  this.landed = false;
  this.ground = null;

  this.v_ground = 20;
  this.v_air = 30;
  this.gravity = [0, -world.G, 0];

  this.gimble = new Gimble({
    referenceObject: this
  });

  // world.add(this.plumb);

  this.klass = 'Hero';
};
util.inherits(Hero, Thing);
Hero.type = Types.HERO;

Hero.objectCache = {
  advance: {
    velocityInView: vec3.create(),
    thisNormal: vec3.create(),
    deltaV: vec3.create(),
  }
};

Hero.JUMP_VELOCITY = vec3.fromValues(0, 70, 0);
Hero.HEIGHT = 2;
Hero.WIDTH = .5;


Hero.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  var cache = Hero.objectCache.advance;

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

    var velocityInView = vec3.transformQuat(cache.velocityInView,
        this.velocity,
        this.viewOrientation);

    var thisNormal = this.getNormal(cache.thisNormal);

    vec3.subtract(this.velocity, 
        velocityInView,
        vec3.project(vec3.temp, velocityInView, thisNormal));

    if (this.ground) {
      if (!this.ground.contains_lc(
          this.ground.worldToLocalCoords(vec3.temp, this.position))) {
        this.unland();
      }
    }
  } else {

    var deltaV = vec3.set(cache.deltaV,
      this.v_air * this.keyMove[0],
      0,
      this.v_air * this.keyMove[2]
    );

    var deltaVInView = vec3.transformQuat(deltaV,
        deltaV,
        this.viewOrientation);

    var thisNormal = this.getNormal(cache.thisNormal);

    vec3.subtract(deltaVInView, 
        deltaVInView,
        vec3.project(vec3.temp, deltaVInView, thisNormal));

    vec3.add(deltaVInView,
        deltaVInView,
        vec3.transformQuat(vec3.temp,
            this.gravity,
            this.upOrientation));

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

Hero.prototype.land = function(ground) {
  vec3.set(this.velocity, 0, 0, 0);
  this.landed = true;
  this.ground = ground;

  var rotation = quat.rotationTo(quat.temp,
      this.getNormal([]),
      this.ground.getNormal([]));
  
  quat.multiply(this.groundOrientation, rotation, this.groundOrientation);
  quat.multiply(this.upOrientation, rotation, this.upOrientation);

  quat.copy(this.initialViewOrientation, this.viewOrientation);
  quat.multiply(this.terminalViewOrientation, rotation, this.viewOrientation);
  this.viewTransitionT = 0;
  this.isViewTransitioning = true;
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
  var v = 130;
  var v_shot = [0, 0, -v];
  vec3.transformQuat(v_shot, v_shot, this.viewOrientation);

  // vec3.add(v_shot, v_shot, this.velocity);
  world.projectilesToAdd.push(new Bullet({
    position: this.position,
    velocity: v_shot,
    radius: .075 * 1.5,
    upOrientation: this.upOrientation,
    rYaw: Math.random()*100,
    rPitch: Math.random()*100,
    rRoll: Math.random()*100,
  }))
};


Hero.prototype.getViewNormal = function(out) {
  return vec3.transformQuat(out, vec3.J, this.viewOrientation);
};


Hero.prototype.getViewNose = function(out) {
  return vec3.transformQuat(out, vec3.NEG_K, this.viewOrientation);
};
