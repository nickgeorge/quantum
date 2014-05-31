World = function() {
  this.lights = [];
  this.camera = null;
  this.shelf = null;
  this.hero = null;

  this.drawables = [];
  
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
    ambientColor: [.32, .32, .32],
    directionalColor: [.7, .5, .3]
  });
  this.addLight(light);

  var texturesByFace = {};
  texturesByFace 
  this.shelf = new Shelf({
    position: [0, 0, 0],
    size: [150, 150, 150],
    texture: Textures.BYZANTINE,
    // texturesByFace: {
    //   top: Textures.GRASS
    // },
    textureCounts: [100, 100],
    textureCountsByFace: {
      top: [300, 300]
    }
    // roll: PI/8,
  })
  this.add(this.shelf);

  var addThings = false;

  if (addThings) {
    for (var k = 0; k < 20; k++) {
      var dumbCrate = new DumbCrate({
        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          // -75,
          (Math.random() - .5) * this.shelf.size[2],
        ],
        size: [
          10 + Math.random() * 30,
          10 + Math.random() * 30,
          10 + Math.random() * 30,
        ],
        texture: Textures.THWOMP,
        textureCounts: [1, 1],
        pitch: 2*Math.random() * PI,
        yaw: 2*Math.random() * PI,
        roll: 2*Math.random() * PI,
        isStatic: true
      });
      this.add(dumbCrate);

    }
    for (var k = 0; k < 5; k++) {
      var sphere = new Sphere({
        position: [
          (Math.random() - .5) * this.shelf.size[0],
          (Math.random() - .5) * this.shelf.size[1],
          (Math.random() - .5) * this.shelf.size[2],
        ],
        radius: 1.5 + Math.random()*7,
        texture: Textures.EARTH,
        pitch: Math.random()*2*PI,
        roll: Math.random()*2*PI,
        rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
        latitudeCount: 25,
        longitudeCount: 25
      });
      this.add(sphere);
    }
  }

  for (var i = 0; i < 300; i++) {
    var fella = new Fella({
      position: [
        0, 0, 0
        // util.math.random(-40, 40),
        // -world.shelf.size[1]/2 + 5,
        // util.math.random(-40, 40)
      ],
      // speed: .25 + Math.random() * .1,
      speed: 5,
      color: vec4.randomColor([]),
      yaw: Math.random()*2*PI,
      pitch: Math.random()*2*PI,
      rYaw: Math.random()*2 - 1
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
    position: [0, -this.shelf.size[1]/2+5, 0]
  });
  this.camera.setAnchor(this.hero);
  heroListener.hero = this.hero;
  this.add(this.hero);
  this.add(this.hero.gimble);
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
      if (util.math.sqr(thing.getOuterRadius() + projectile.getOuterRadius()) < 
          thing.distanceSquaredTo(projectile)) {
        continue;
      }
      this.collisionManager.test(thing, projectile);
    }
  }
};


World.prototype.remove = function(thing) {
  this.thingsToRemove.push(thing);
};


World.prototype.removeEffect = function(effect) {
  this.effectsToRemove.push(effect);
};


World.prototype.add = function(thing) {
  this.thingsToAdd.push(thing);
};


World.prototype.addDirectly_ = function(thing) {
  this.things.push(thing);
};


World.prototype.draw = function() {

  util.array.forEach(this.drawables, function(thing) {
    thing.computeDistanceSquaredToCamera();
  });

  this.drawables.sort(function(thingA, thingB) {
    return thingB.distanceSquaredToCamera -
        thingA.distanceSquaredToCamera;
  });

  gl.pushViewMatrix();

  world.applyLights();
  this.camera.transform();
  gl.setViewMatrixUniforms();

  shaderProgram.reset();
  util.array.apply(this.drawables, 'draw');

  gl.popViewMatrix();
};


World.prototype.advance = function(dt) {
  this.updateLists();

  if (this.paused) return;

  for (var i = 0; this.things[i]; i++) {
    this.things[i].advance(dt);
  }
  for (var i = 0; this.projectiles[i]; i++) {
    this.projectiles[i].advance(dt);
  }
  for (var i = 0; this.effects[i]; i++) {    
    this.effects[i].advance(dt);
  }
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

  util.array.pushAll(this.drawables, this.thingsToAdd);
  util.array.pushAll(this.drawables, this.effectsToAdd);
  util.array.pushAll(this.drawables, this.projectilesToAdd);

  util.array.removeAll(this.things, this.thingsToRemove);
  util.array.removeAll(this.effects, this.effectsToRemove);
  util.array.removeAll(this.projectiles, this.projectilesToRemove);

  util.array.removeAll(this.drawables, this.thingsToRemove);
  util.array.removeAll(this.drawables, this.effectsToRemove);
  util.array.removeAll(this.drawables, this.projectilesToRemove);

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
