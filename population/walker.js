Walker = function(message) {
  util.base(this, message);

  this.ground = null;
  this.gravity = [0, -world.G, 0];

  this.isRoot = true;

  this.objectCache.land = {
    rotation: quat.create(),
    viewMultiplier: quat.create(),
  };
};
util.inherits(Walker, Thing);

Walker.prototype.advanceWalker = function(dt) {
  this.advanceBasics(dt); 

  if (this.landed) {
    if (!this.ground.contains_lc(
        this.ground.worldToLocalCoords(vec3.temp, this.position))) {
      this.unland();
    }
  } else {
    vec3.add(this.velocity,
        this.velocity,
        vec3.scale(vec3.temp,
            this.gravity,
            dt));
  }
};

Walker.prototype.land = function(ground) {
  var cache = this.objectCache.land;
  if (this.speed) {
    this.velocity = [
      0,
      0,
      this.speed
    ];
  }

  this.landed = true;
  this.ground = ground;

  var rotation = quat.rotationTo(cache.rotation,
      this.getNormal(),
      this.ground.getNormal());
  var conjugateRotation = quat.conjugate([], rotation);
  var conjugateUp = quat.conjugate([], this.upOrientation);

  

  if (this.viewRotation) {
    if (this.isViewTransitioning) {
      quat.copy(this.viewRotation, this.terminalViewRotation);
    }
    var viewMultiplier = cache.viewMultiplier;
    quat.multiply(viewMultiplier, conjugateUp, conjugateRotation);
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