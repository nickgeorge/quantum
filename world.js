World = function() {
  this.lights = [];
  this.camera = null;
  this.shelf = null;
  this.hero = null;

  this.drawables = new ControlledList();
  
  this.things = new ControlledList();
  this.projectiles = new ControlledList();
  this.effects = new ControlledList();
  this.disposables =  [];

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
    },
    color: [1, 1, 1, 1]
    // roll: PI/8,
  })
  this.addDrawableThing(this.shelf);

  var addThings = true;

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
      this.addDrawableThing(dumbCrate);

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
      this.addDrawableThing(sphere);
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
    this.addDrawableThing(fella);
  }

  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * PI,
    pitch: 0 * Math.random() * 2 * PI,
    position: [0, 0, 0],
    alive: true,
    rPitch: 8*PI,
    rYaw: 8*.9*PI,
    rRoll: 8*.8*PI,
  });
  light.anchor = sun;
  this.addDrawableThing(sun);

  this.camera = new Camera();
  this.hero = new Hero({
    position: [0, -this.shelf.size[1]/2+5, 0]
  });
  this.camera.setAnchor(this.hero);
  heroListener.hero = this.hero;
  this.addDrawableThing(this.hero);
  // this.add(this.hero.gimble);
};


World.prototype.addDrawableThing = function(thing) {
  this.drawables.add(thing);
  this.addThing(thing);
};


World.prototype.addThing = function(thing) {
  this.things.add(thing);
};


World.prototype.addDrawableProjectile = function(projectile) {
  this.drawables.add(projectile);
  this.addProjectile(projectile);
};


World.prototype.addProjectile = function(projectile) {
  this.projectiles.add(projectile);
};


World.prototype.addDrawableEffect = function(effect) {
  this.drawables.add(effect);
  this.addEffect(effect);
};


World.prototype.addEffect = function(effect) {
  this.effects.add(effect);
};


World.prototype.draw = function() {
  util.array.forEach(this.drawables.elements, function(thing) {
    if (thing.isDisposed) return;
    thing.computeDistanceSquaredToCamera();
  });

  this.drawables.elements.sort(function(thingA, thingB) {
    return thingB.distanceSquaredToCamera -
        thingA.distanceSquaredToCamera;
  });

  gl.pushViewMatrix();

  world.applyLights();
  this.camera.transform();
  gl.setViewMatrixUniforms();

  shaderProgram.reset();
  util.array.apply(this.drawables.elements, 'draw');

  gl.popViewMatrix();
};


World.prototype.advance = function(dt) {
  this.updateLists();

  if (this.paused) return;

  for (var i = 0; this.things.get(i); i++) {
    if (!this.things.get(i).isDisposed) this.things.get(i).advance(dt);
  }
  for (var i = 0; this.projectiles.get(i); i++) {
    if (!this.projectiles.get(i).isDisposed) this.projectiles.get(i).advance(dt);
  }
  for (var i = 0; this.effects.get(i); i++) {    
    if (!this.effects.get(i).isDisposed) this.effects.get(i).advance(dt);
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
  this.things.update();
  this.effects.update();
  this.projectiles.update();
  this.drawables.update();

  while (this.disposables.length > 100) {
    this.disposables.shift().dispose();
  }
};
