Hero = function(message) {
  goog.base(this, message);

  this.keyMove = vec3.create();

  this.viewRotation = quat.create();

  this.initialViewRotation = quat.create();
  this.terminalViewRotation = quat.create();
  this.isViewTransitioning = false;
  this.viewTransitionT = 0;

  this.v_ground = 20;
  this.v_air = 30;
  this.bobAge = 0;

  this.walkAudio = Sounds.get(SoundList.STEP);
  this.walkAudio.loop = true;
  this.landAudio = Sounds.get(SoundList.LAND);
  this.jumpAudio = Sounds.get(SoundList.JUMP);


  // this.gimble = new Gimble({
  //   referenceObject: this
  // });

  this.sensitivityX = .0035;
  this.sensitivityY = .0035;


  this.objectCache.onMouseMove = {
    rotY: quat.create()
  };

  this.inputAdapter = new WorldInputAdapter().
      setKeyHandler(this.onKey, this).
      setMouseButtonHandler(this.onMouseButton, this).
      setMouseMoveHandler(this.onMouseMove, this);
};
goog.inherits(Hero, Walker);
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
    quat.slerp(this.viewRotation,
        this.initialViewRotation,
        this.terminalViewRotation,
        this.viewTransitionT);
  }

  if (this.landed) {
    var sum = Math.abs(this.keyMove[0]) + Math.abs(this.keyMove[2]);
    var factor = sum == 2 ? 1/util.math.ROOT_2 : 1;
    this.velocity[0] = factor * this.v_ground * (this.keyMove[0]);
    this.velocity[1] = 0;
    this.velocity[2] = factor * this.v_ground * (this.keyMove[2]);
    if (sum) {
      this.bobAge += dt * 2 * Math.PI / .522;
      if (this.walkAudio.paused) {
        this.walkAudio.loop = true;
        this.walkAudio.currentTime = 0;
        this.walkAudio.play();
      }
    } else {
      this.walkAudio.loop = false;
      this.bobAge = 0;
    }

  } else {

    var deltaV = vec3.set(cache.advance.deltaV,
      this.v_air * this.keyMove[0],
      0,
      this.v_air * this.keyMove[2]
    );

    vec3.add(this.velocity,
        this.velocity,
        vec3.scale(deltaV, deltaV, dt));

    this.walkAudio.loop = false;;
    this.bobAge = 0;
  }
};


Hero.prototype.land = function(ground) {
  goog.base(this, 'land', ground);

  this.landAudio.currentTime = 0;
  this.landAudio.play();
};

Hero.prototype.jump = function() {
  if (!this.isLanded()) return;
  vec3.copy(this.velocity, Hero.JUMP_VELOCITY);
  this.unland();

  this.jumpAudio.currentTime = 0;
  this.jumpAudio.play();
};


Hero.prototype.onKey = function(event) {
  var isKeydown = event.type == 'keydown';
  var keyCode = event.keyCode;

  var containerManager = ContainerManager.getInstance();
  switch (keyCode) {
    case KeyCode.A:
      this.keyMove[0] = isKeydown ? -1 :
          (this.inputAdapter.isKeyDown(KeyCode.D) ? 1 : 0);
      break;
    case KeyCode.D:
      this.keyMove[0] = isKeydown ? 1 :
          (this.inputAdapter.isKeyDown(KeyCode.A) ? -1 : 0);
      break;
    case KeyCode.W:
      this.keyMove[2] = isKeydown ? -1 :
          (this.inputAdapter.isKeyDown(KeyCode.S) ? 1 : 0);
      break;
    case KeyCode.S:
      this.keyMove[2] = isKeydown ? 1 :
          (this.inputAdapter.isKeyDown(KeyCode.W) ? -1 : 0);
      break;
    case KeyCode.SPACE:
      isKeydown && this.jump();
      break;
  }
};


Hero.prototype.onMouseButton = function(event) {
  if (Animator.getInstance().isPaused()) return;
  if (event.type != 'mousedown') return;
  if (event.button == 0) {
    var v_shot = [0, 0, -130];
    vec3.transformQuat(v_shot, v_shot, this.viewRotation);

    Env.world.addProjectile(new Bullet({

      position: this.position,
      velocity: v_shot,
      radius: .075 * 1.5,
      upOrientation: this.upOrientation
    }));

    Sounds.getAndPlay(SoundList.ARROW);

  } else {
    var v_shot = [0, 0, -100];
    vec3.transformQuat(v_shot, v_shot, this.viewRotation);

    Env.world.addProjectile(new ThrowinGurnade({

      position: this.position,
      velocity: v_shot,
      radius: .075 * 1.5,
      upOrientation: this.upOrientation
    }));
  }
};


Hero.prototype.onMouseMove = function(event) {
  if (this.rotating) return;
  var movementX = this.inputAdapter.getMovementX(event);
  var movementY = this.inputAdapter.getMovementY(event);

  var rotY = this.objectCache.onMouseMove.rotY;
  quat.setAxisAngle(rotY,
      vec3.transformQuat(vec3.temp, vec3.J, this.upOrientation),
      -movementX * this.sensitivityX);

  quat.multiply(this.upOrientation,
      rotY,
      this.upOrientation);

  if ((this.viewRotation[0] < 1/util.math.ROOT_2 || movementY > 0) &&
      (this.viewRotation[0] > -1/util.math.ROOT_2 || movementY < 0)) {
    quat.rotateX(this.viewRotation,
        this.viewRotation,
        -movementY * this.sensitivityY);
  }
};


Hero.prototype.getViewOrientation = function(out) {
  return quat.multiply(out, this.upOrientation, this.viewRotation);
};
