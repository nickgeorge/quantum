goog.provide('QuantumWorld');

goog.require('World');


/**
 * @constructor
 * @extends {World}
 */
QuantumWorld = function() {
  goog.base(this);
  this.shelf = null;
  this.hero = null;
  this.setBackgroundColor([0, 0, 0, 1]);
  this.setCollisionManager(new QuantumCollisionManager(this));

  this.playMusic = false;
  this.music = Sounds.get(SoundList.SPLIT_YOUR_INFINITIVES);
  this.music.loop = true;

  this.score = 0;
  this.maxTime = 180;

  this.thingsByType = {};

  this.G = 35;

  this.inputAdapter = new WorldInputAdapter().
      setMouseButtonHandler(this.onMouseButton, this).
      setKeyHandler(this.onKey, this).
      setPointerLockChangeHandler(this.onPointerLockChange, this);
};
goog.inherits(QuantumWorld, World);


QuantumWorld.prototype.addThing = function(thing) {
  goog.base(this, 'addThing', thing);

  var key = thing.getType();
  if (!this.thingsByType[key]) {
    this.thingsByType[key] = [];
  }
  this.thingsByType[key].push(thing);
};


QuantumWorld.prototype.removeThing = function(thing) {
  goog.base(this, 'removeThing', thing);

  var key = thing.getType();
  util.array.remove(this.thingsByType[key], thing);
};


/**
 * @param {boolean} isPaused
 */
QuantumWorld.prototype.onPauseChanged = function(isPaused) {
  if (this.playMusic) this.setMusicPaused(isPaused);
};


/**
 * @param {boolean} isPaused
 */
QuantumWorld.prototype.setMusicPaused = function(isPaused) {
  if (isPaused) {
    this.music.pause();
  } else {
    this.music.play();
  }
};


QuantumWorld.prototype.advance = function(dt) {
  goog.base(this, 'advance', dt);

  var claimedCrates = 0;

  this.things.forEach(function(thing) {
    if (thing.getType() == DumbCrate.type) {
      if (thing.claimed) claimedCrates++;
    }
  });
  this.killsLeft = 15 - claimedCrates;

  if (this.killsLeft == 0) {
    Animator.getInstance().setPaused(true);
    Animator.getInstance().setPaused = function(){};
  }
};


QuantumWorld.prototype.populate = function() {
  var light = new Light({
    ambientColor: [.4, .4, .4],
    directionalColor: [.8, .6, .4]
  });
  this.addLight(light);

  var texturesByFace = {};
  texturesByFace
  this.shelf = new Shelf({
    position: [0, 0, 0],
    size: [200, 200, 200],
    texture: Textures.get(TextureList.WALL),
    textureCounts: [50, 50],
    color: [1, 1, 1, 1]
  })
  this.addThing(this.shelf);

  var addThings = true;

  if (addThings) {
    for (var k = 0; k < 15; k++) {
      var dumbCrate = new DumbCrate({

        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        size: [
          10 + Math.random() * 30,
          10 + Math.random() * 30,
          10 + Math.random() * 30,
        ],
        texture: Textures.get(TextureList.THWOMP),
        textureCounts: [1, 1],
        pitch: Math.random() * 2*Math.PI,
        yaw: Math.random() * 2*Math.PI,
        roll: Math.random() * 2*Math.PI,
        isStatic: true
      });
      this.addThing(dumbCrate);

    }
    for (var k = 0; k < 0; k++) {
      var sphere = new Sphere({

        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        radius: 1.5 + Math.random()*7,
        texture: Textures.get(TextureList.EARTH),
        pitch: Math.random()*2*Math.PI,
        roll: Math.random()*2*Math.PI,
        rYaw: (2*Math.random() - 1) * 2*Math.random() * Math.PI,
        latitudeCount: 25,
        longitudeCount: 25
      });
      this.addThing(sphere);
    }
  }

  for (var i = 0; i < 300; i++) {
    var fella = new Fella({
      position: [
        0, 0, 0
        // util.math.random(-40, 40),
        // -this.shelf.size[1]/2 + 5,
        // util.math.random(-40, 40)
      ],
      // speed: 4 + Math.random() * 2,
      speed: 5,
      color: vec4.randomColor([]),
      yaw: Math.random()*2*Math.PI,
      pitch: Math.random()*2*Math.PI,
      rYaw: Math.random()*2 - 1
    });
    this.addThing(fella);
  }

  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * Math.PI,
    pitch: 0 * Math.random() * 2 * Math.PI,
    position: [0, 0, 0],
    alive: true,
    rPitch: 8*Math.PI,
    rYaw: 8*.9*Math.PI,
    rRoll: 8*.8*Math.PI,
  });
  light.anchor = sun;
  this.addThing(sun);

  this.camera = new FpsCamera();
  this.hero = new Hero({
    position: [0, -this.shelf.size[1]/2+5, 0]
  });
  this.camera.setAnchor(this.hero);
  this.addThing(this.hero);
};


QuantumWorld.prototype.getHero = function() {
  return this.hero;
};


QuantumWorld.prototype.onMouseButton = function(event) {
  if (!this.inputAdapter.isPointerLocked()) {
    ContainerManager.getInstance().setPointerLock(true);
    Animator.getInstance().setPaused(false);
  }
};


QuantumWorld.prototype.onKey = function(event) {
  if (event.type == 'keydown') {
    switch (event.keyCode) {
      case KeyCode.F:
        ContainerManager.getInstance().setFullScreen(true);
        break;

      case KeyCode.M:
        this.setMusicPaused(!this.music.paused);
        break;

      case KeyCode.ESC:
        Animator.getInstance().setPaused(true);
        break
    }
  }
};


QuantumWorld.prototype.onPointerLockChange = function(event) {
  if (!ContainerManager.getInstance().isPointerLocked()) {
    Animator.getInstance().setPaused(true);
  }
};




QuantumWorld.prototype.draw = function() {
  Env.gl.reset(this.backgroundColor);

  Env.gl.pushViewMatrix();

  this.applyLights();
  this.camera.transform();
  Env.gl.setViewMatrixUniforms();

  if (this.sortBeforeDrawing) {
    var cameraPosition = this.camera.getPosition();

    this.transluscent.length = 0;
    this.opaque.length = 0;

    this.drawables.forEach(function(drawable) {
      if (drawable.isDisposed) return;
      drawable.computeDistanceSquaredToCamera(cameraPosition);
      if (drawable.transluscent) {
        this.transluscent.push(drawable);
      } else {
        this.opaque.push(drawable);
      }
    }, this);

    this.transluscent.sort(function(thingA, thingB) {
      return thingB.distanceSquaredToCamera -
          thingA.distanceSquaredToCamera;
    });

    // for (var type in this.thingsByType) {
    //   var things = this.thingsByType[type];
    //   if (type == Fella.type && false) {
    //     this.drawFellas(things);
    //   } else {
    //     util.array.forEach(things, function(thing) {
    //       thing.draw();
    //     });
    //   }
    // }
    util.array.forEach(this.opaque, function(opaqueDrawable) {
      opaqueDrawable.draw();
    });

    util.array.forEach(this.transluscent, function(transluscentDrawable) {
      transluscentDrawable.draw();
    });

  } else {
    this.drawables.forEach(function(drawable) {
      drawable.draw();
    });
  }

  Env.gl.popViewMatrix();
};

QuantumWorld.prototype.drawFellas = function(fellas) {
  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('head');
  });

  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('torso');
  });
  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('rightLeg');
  });
  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('leftLeg');
  });
  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('rightArm');
  });
  util.array.forEach(fellas, function(fella) {
    fella.drawPartByName('leftArm');
  });
};

