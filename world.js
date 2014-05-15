World = function() {
  this.lights = [];
  this.camera = null;
  this.shelf = null;
  this.hero = null;
  
  this.things = [];
  this.projectiles = [];
  this.effects = [];
  this.disposables = [];

  this.thingsToAdd = [];
  this.effectsToAdd = [];
  this.projectilesToAdd = [];

  this.thingsToRemove = [];
  this.effectsToRemove = [];
  this.projectilesToRemove = [];

  this.collisionManager = new CollisionManager(this);

  this.paused = false;
  this.G = 62.5;
};


World.prototype.populate = function() {
  var light = new Light({
    ambientColor: [.29, .29, .29],
    directionalColor: [.7, .5, .3]
  });
  this.addLight(light);

  var texturesByFace = {};
  texturesByFace 
  this.shelf = new Shelf({
    position: [0, 0, 0],
    size: [500, 500, 500],
    texture: Textures.BYZANTINE,
    texturesByFace: {
      top: Textures.GRASS
    },
    textureCounts: [100, 100],
    textureCountsByFace: {
      top: [400, 400]
    }
    // roll: PI/8,
  })
  this.add(this.shelf);

  var addThings = true;

  if (addThings) {
    for (var k = 0; k < 60; k++) {
      var dumbCrate = new DumbCrate({
        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        size: [
          20 + Math.random() * 60,
          20 + Math.random() * 60,
          20 + Math.random() * 60,
        ],
        texture: Textures.THWOMP,
        // rYaw: (2*Math.random() - 1) * (1/4)*Math.random() * PI,
        pitch: 2*Math.random() * PI,
        yaw: 2*Math.random() * PI,
      });
      // dumbCrate.randomizeAngle();
      this.add(dumbCrate);

    }
    for (var k = 0; k < 20; k++) {
      var sphere = new Sphere({
        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        radius: 3 + Math.random()*30,
        texture: Textures.EARTH,
        pitch: Math.random()*2*PI,
        roll: Math.random()*2*PI,
        rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
        latitudeCount: 25,
        longitudeCount: 25
      });
      // this.add(sphere);
    }
  }

  var dumbCrate = new DumbCrate({
    position: [0, -225, 0],
    size: [25, 25, 25],
    pitch: PI / 4,
    texture: Textures.THWOMP
  });
  // dumbCrate.randomizeAngle();
  // this.add(dumbCrate);

  for (var i = 0; i < 40; i++) {
    var fella = new Fella({
      position: [util.math.random(-20, 20), -250, util.math.random(-20, 20)],
      yaw: Math.random()*2*PI,
      velocity: [0, 0, 1],
      color: vec4.randomColor([])
    });
    this.add(fella);
  }

  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * PI,
    pitch: 0 * Math.random() * 2 * PI,
    position: [0, 0, 0],
    alive: true,
    rPitch: 8*PI,
    rYaw: 8*.9*PI,
  });
  light.anchor = sun;
  this.add(sun);

  this.camera = new Camera();
  this.hero = new Hero({
    position: [0, -200, 0]
  });
  this.camera.setAnchor(this.hero);
  heroListener.hero = this.hero;
  this.add(this.hero);
};


World.prototype.checkCollisions = function() {
  // TODO: Check everything, collide with the collision with min
  // value of t
  for (var i = 0, thingA; thingA = this.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.things[j]; j++) {
      // if (util.math.sqr(thingA.getOuterRadius() + thingB.getOuterRadius()) < 
      //     thingA.distanceSquaredTo(thingB)) {
      //   continue;
      // }
      this.collisionManager.test(thingA, thingB);
    }
  }
  for (var i = 0, thing; thing = this.things[i]; i++) {
    for (var j = 0, projectile; projectile = this.projectiles[j]; j++) {
      // if (util.math.sqr(thing.getOuterRadius() + projectile.getOuterRadius()) < 
      //     thing.distanceSquaredTo(projectile)) {
      //   continue;
      // }
      this.collisionManager.test(thing, projectile);
    }
  }
};





World.prototype.remove = function(thing) {
  this.thingsToRemove.push(thing);
};


World.prototype.add = function(thing) {
  this.thingsToAdd.push(thing);
};


World.prototype.addDirectly_ = function(thing) {
  this.things.push(thing);
};


World.prototype.draw = function() {
  gl.pushViewMatrix();

  world.applyLights();
  this.camera.transform();
  gl.setViewMatrixUniforms();

  shaderProgram.reset();
  util.array.apply(this.things, 'draw');
  util.array.apply(this.effects, 'draw');
  util.array.apply(this.projectiles, 'draw');

  gl.popViewMatrix();
};


World.prototype.advance = function(dt) {
  this.updateLists();

  if (this.paused) return;

  util.array.forEach(this.things, function(thing) {
    thing.advance(dt);
    thing.computeTransforms();
  });
  util.array.forEach(this.projectiles, function(projectile) {
    projectile.advance(dt);
    projectile.computeTransforms();
  });
  util.array.forEach(this.effects, function(effect) {
    effect.advance(dt);
    effect.computeTransforms();
  });
  this.collisionManager.checkCollisions();
};


World.prototype.addLight = function(light) {
  this.lights.push(light);
};


World.prototype.applyLights = function() {
  for (var i = 0, light; light = this.lights[i]; i++) {
    light.apply();
  }
};


World.prototype.reset = function() {
  world.things = [];
  world.effects = [];
  world.projectiles = [];

  world.populate();
};


World.prototype.updateLists = function() {
  util.array.pushAll(this.things, this.thingsToAdd);
  util.array.pushAll(this.effects, this.effectsToAdd);
  util.array.pushAll(this.projectiles, this.projectilesToAdd);

  util.array.removeAll(this.things, this.thingsToRemove);
  util.array.removeAll(this.effects, this.effectsToRemove);
  util.array.removeAll(this.projectiles, this.projectilesToRemove);

  this.thingsToAdd.length = 0;
  this.effectsToAdd.length = 0;
  this.projectilesToAdd.length = 0;

  this.thingsToRemove.length = 0;
  this.effectsToRemove.length = 0;
  this.projectilesToRemove.length = 0;

  while (this.disposables.length > 50) {
    this.disposables.shift().dispose();
  }
};
