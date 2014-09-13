Walker = function(message) {
  goog.base(this, message);

  this.ground = null;
  this.gravity = vec3.create();

  this.isRoot = true;

  this.landed = false;

  this.movementUp = quat.create();

  this.objectCache.land = {
    rotation: quat.create(),
    viewMultiplier: quat.create(),
    conjugateRotation: quat.create()
  };
};
goog.inherits(Walker, Thing);

Walker.prototype.advanceWalker = function(dt) {
  this.advanceBasics(dt);

  if (this.landed) {
    if (!this.ground.contains_lc(
        this.ground.worldToLocalCoords(vec3.temp, this.position))) {
      this.unland();
    }
  } else {
    this.gravity[1] = -Env.world.G;
    vec3.add(this.velocity,
        this.velocity,
        vec3.scale(vec3.temp,
            this.gravity,
            dt));
  }
};

// TODO: Adjust height
Walker.prototype.land = function(ground) {
  var cache = this.objectCache.land;
  if (this.speed) {
    vec3.set(this.velocity, 0, 0, this.speed);
  }

  this.landed = true;
  this.ground = ground;

  var rotation = quat.rotationTo(cache.rotation,
      this.getNormal(),
      this.ground.getNormal());

  if (this.viewRotation) {
    if (this.isViewTransitioning) {
      quat.copy(this.viewRotation, this.terminalViewRotation);
    }
    var conjugateRotation = quat.conjugate(cache.conjugateRotation, rotation);
    var viewMultiplier = quat.multiply(cache.viewMultiplier,
        quat.conjugate(quat.temp,
            this.upOrientation),
        conjugateRotation);
    quat.multiply(viewMultiplier, viewMultiplier, this.upOrientation);

    quat.multiply(this.initialViewRotation, viewMultiplier, this.viewRotation);
    quat.copy(this.terminalViewRotation, this.viewRotation);
    quat.copy(this.viewRotation, this.initialViewRotation);
    this.viewTransitionT = 0;
    this.isViewTransitioning = true;
  }
  quat.multiply(this.upOrientation, rotation, this.upOrientation);
};

Walker.prototype.unland = function() {
  this.landed = false;
  this.ground = null;

  quat.copy(this.movementUp, this.upOrientation);
};

Walker.prototype.isLandedOn = function(ground) {
  return this.ground == ground;
};

Walker.prototype.isLanded = function() {
  return this.landed;
};


Walker.prototype.getOuterRadius = function() {
  return Walker.HEIGHT;
};
