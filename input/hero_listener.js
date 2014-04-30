HeroListener = function(canvas) {
  this.canvas = canvas;
  this.keyMap = {};
  this.mouseIsLocked = false;
  this.sensitivityX = .0035;
  this.sensitivityY = .0035;

  this.hero = null;

  this.canLockPointer = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

  this.canvas.requestFullScreen = canvas.requestFullScreen ||
      canvas.mozRequestFullScreen ||
      canvas.webkitRequestFullScreen;

  this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
      this.canvas.mozRequestPointerLock ||
      this.canvas.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;
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
    // this.canvas.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
  if (!this.mouseIsLocked) {
    // this.enableMouseLock();
    // e.preventDefault();
    // console.log("locked");
    // return;
  }

  if (e.button == 0) {
    this.hero && this.hero.shoot();
  } else if (e.button == 2) {
    console.log("Bang!");
    e.preventDefault();
  } else {
    console.log(e.button);
  }
};

HeroListener.prototype.enableMouseLock = function() {
  if (this.canLockPointer) {
    this.canvas.requestPointerLock();
  } else {
    console.log('Ye canna\' do that.');
  }
};

HeroListener.prototype.onMouseMove = function(event) {
  if (!this.hero) return;
  if (this.mouseIsLocked) {
    var movementX = event.movementX ||
        event.mozMovementX ||
        event.webkitMovementX ||
        0;
    var movementY = event.movementY ||
        event.mozMovementY ||
        event.webkitMovementY ||
        0;

    this.hero.yaw -= movementX * this.sensitivityX;
    this.hero.pitch -= movementY * this.sensitivityY;

    this.hero.pitch = Math.max(-PI/2,
        Math.min(PI/2, this.hero.pitch));
  }
};

HeroListener.prototype.onPointerLockChange = function(event) {
  if (document.pointerLockElement == this.canvas ||
    document.mozPointerLockElement == this.canvas ||
    document.webkitPointerLockElement == this.canvas) {
    this.mouseIsLocked = true;
  } else {
    this.mouseIsLocked = false;
  }
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
      target.jump();
      break;
    case KeyCode.G:
      this.enableMouseLock();
      break;
    default:
      console.log('Unrecognized key: ' + event.keyCode);
      return;
  }
  event.preventDefault();
  event.stopPropagation();
};
