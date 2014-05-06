World = function() {
  this.lights = [];
  this.camera = null;
  this.shelf = null;
  
  this.things = [];
  this.projectiles = [];
  this.effects = [];

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
    position: [0, 0, 10],
    size: [500, 500, 500],
    texture: Textures.BYZANTINE,
    textureCounts: [100, 100],
    yaw: PI/4
  })
  this.add(this.shelf);


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
      yaw: Math.random() * PI,
      pitch: Math.random() * PI,
      roll: Math.random() * PI,
      // rYaw: (2*Math.random() - 1) * (1/4)*Math.random() * PI,
      // rPitch: (2*Math.random() - 1) * (1/4)*Math.random() * PI,
    });
    this.add(dumbCrate);

  }
  for (var k = 0; k < 15; k++) {
    var sphere = new Sphere({
      position: [
        (Math.random() - .5) * this.shelf.size[0],
        (Math.random() - .5) * this.shelf.size[1],
        (Math.random() - .5) * this.shelf.size[2],
      ],
      radius: 3 + Math.random()*30,
      texture: Textures.EARTH,
      rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
    });
    this.add(sphere);
  }

    var dumbCrate = new DumbCrate({
      position: [
        0, -225, 0
      ],
      size: [
        25, 25, 25
      ],
      texture: Textures.THWOMP,
      yaw: Math.random() * PI,
      pitch: Math.random() * PI,
      roll: Math.random() * PI,
      // rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
      // rPitch: (2*Math.random() - 1) * 2*Math.random() * PI,
    });
    // this.add(dumbCrate);

  var pane = new Pane({
    size: [40, 40],
    position: [0, -230, 75],
    // pitch: PI/4
  });
  // world.add(pane);

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
  hero = new Hero({
    position: [0, -245, 0]
  });
  this.camera.setAnchor(hero);
  heroListener.hero = hero;
  this.add(hero);
};


World.prototype.checkCollisions = function() {
  // TODO: Check everything, collide with the collision with min
  // value of t
  for (var i = 0, thingA; thingA = this.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.things[j]; j++) {
      this.collisionManager.test(thingA, thingB);
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
  });
  util.array.forEach(this.effects, function(effects) {
    effects.advance(dt);
  });
  this.checkCollisions();

  while (this.projectiles.length > 200) this.projectiles.shift().dispose();
  while (this.effects.length > 200) this.effects.shift().dispose();
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
  util.array.forEach(this.thingsToAdd, this.addDirectly_, this);

  util.array.pushAll(this.effects, this.effectsToAdd);
  util.array.pushAll(this.projectiles, this.projectilesToAdd);

  util.array.removeAll(this.things, this.thingsToRemove);
  util.array.removeAll(this.effects, this.effectsToRemove);
  util.array.removeAll(this.projectiles, this.projectilesToRemove);

  this.thingsToAdd = [];
  this.effectsToAdd = [];
  this.projectilesToAdd = [];

  this.thingsToRemove = [];
  this.effectsToRemove = [];
  this.projectilesToRemove = [];

  while (this.projectiles.length > 200) this.projectiles.shift().dispose();
  while (this.effects.length > 200) this.effects.shift().dispose();
};
