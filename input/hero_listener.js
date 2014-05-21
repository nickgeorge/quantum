HeroListener = function(container) {
  this.container = container;
  this.keyMap = {};
  this.mouseIsLocked = false;
  this.sensitivityX = .0035;
  this.sensitivityY = .0035;

  this.hero = null;

  this.container.requestFullScreen = container.requestFullScreen ||
      container.mozRequestFullScreen ||
      container.webkitRequestFullScreen;

  this.container.requestPointerLock = this.container.requestPointerLock ||
      this.container.mozRequestPointerLock ||
      this.container.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

  this.objectCache = {
    onMouseMove: {
      rotY: quat.create()
    }
  };
};

HeroListener.prototype.attachEvents = function() {
  document.addEventListener('keydown',
      util.bind(this.onKey, this), true);
  document.addEventListener('keyup',
      util.bind(this.onKey, this), true);
  document.addEventListener('mousedown',
      util.bind(this.onMouseDown, this), true);

  document.addEventListener('pointerlockchange',
      util.bind(this.onPointerLockChange, this), false);
  document.addEventListener('mozpointerlockchange',
      util.bind(this.onPointerLockChange, this), false);
  document.addEventListener('webkitpointerlockchange',
      util.bind(this.onPointerLockChange, this), false);

  document.addEventListener('mousemove',
      util.bind(this.onMouseMove, this), false);
};

HeroListener.prototype.onMouseDown = function(e) {
  if (!document.webkitCurrentFullScreenElement) {
    // this.container.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
  if (!this.mouseIsLocked) {
    // this.enableMouseLock();
    // e.preventDefault();
    // util.log("locked");
    // return;
  }

  if (e.button == 0) {
    this.hero && this.hero.shoot();
  } else if (e.button == 2) {
    e.preventDefault();
  } else {
    util.log(e.button);
  }
};

HeroListener.prototype.enableMouseLock = function() {
  this.container.requestPointerLock();
};

HeroListener.prototype.onMouseMove = function(event) {
  if (!this.hero || this.hero.rotating) return;
  if (this.mouseIsLocked) {
    var movementX = event.movementX ||
        event.mozMovementX ||
        event.webkitMovementX ||
        0;
    var movementY = event.movementY ||
        event.mozMovementY ||
        event.webkitMovementY ||
        0;

    var rotY = this.objectCache.onMouseMove.rotY;
    quat.setAxisAngle(rotY,
        vec3.transformQuat(vec3.temp, vec3.J, this.hero.upOrientation),
        -movementX * this.sensitivityX);
    quat.multiply(this.hero.viewOrientation,
        rotY,
        this.hero.viewOrientation);

    quat.rotateX(this.hero.viewOrientation,
        this.hero.viewOrientation,
        -movementY * this.sensitivityY)

    // this.hero.pitch = Math.max(-PI/2,
    //     Math.min(PI/2, this.hero.pitch));
  }
};

HeroListener.prototype.onPointerLockChange = function(event) {
  if (document.pointerLockElement == this.container ||
    document.mozPointerLockElement == this.container ||
    document.webkitPointerLockElement == this.container) {
    this.mouseIsLocked = true;
  } else {
    this.mouseIsLocked = false;
  }
  animator.setPaused(!this.mouseIsLocked);
};

HeroListener.prototype.onKey = function(event) {
  var isKeydown = event.type == 'keydown';
  var keyCode = event.keyCode;
  var KeyCode = util.events.KeyCode;
  if (isKeydown) {
    if (this.keyMap[keyCode]) return;
    this.keyMap[keyCode] = true;
  } else {
    this.keyMap[keyCode] = false;
  }

  var target = this.hero;
  switch (keyCode) {
    case KeyCode.A:
      target.keyMove[0] = isKeydown ? -1 :
          (this.keyMap[KeyCode.D] ? 1 : 0);
      break;
    case KeyCode.D:
      target.keyMove[0] = isKeydown ? 1 :
          (this.keyMap[KeyCode.A] ? -1 : 0);
      break;
    case KeyCode.W:
      target.keyMove[2] = isKeydown ? -1 :
          (this.keyMap[KeyCode.S] ? 1 : 0);
      break;
    case KeyCode.S:
      target.keyMove[2] = isKeydown ? 1 :
          (this.keyMap[KeyCode.W] ? -1 : 0);
      break;
    case KeyCode.SPACE:
      isKeydown && target.jump();
      break;
    case KeyCode.G:
      this.enableMouseLock();
      break;
    default:
      util.log('Unrecognized key: ' + event.keyCode);
      return;
  }
  event.preventDefault();
  event.stopPropagation();
};
