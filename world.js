World = function() {
  this.things = [];
  this.thingsById = {};
  this.projectiles = [];
  this.effects = [];
  this.lights = [];
  this.yaw = 0;
  this.rotSpeed = .1;
  this.board = null;
  this.G = 30;
  this.clearColorRgba = [.0, .0, .0, 1];
  this.camera = null;


  this.thingsToAdd = [];
  this.effectsToAdd = [];
  this.projectilesToAdd = [];

  this.thingsToRemove = [];
  this.effectsToRemove = [];
  this.projectilesToRemove = [];

  this.paused = false;

  this.scoresMap = [];

  this.heroId = -1;
  hero = null;
};

World.prototype.add = function(thing) {
  this.things.push(thing);
  this.thingsById[thing.id] = thing;
};

World.prototype.draw = function() {

  world.applyLights();
  this.camera.transform();

  mat4.rotate(gl.mvMatrix, gl.mvMatrix, this.yaw, Vector.K);
  shaderProgram.reset();
  this.board && this.board.draw();
  util.array.apply(this.things, 'draw');
  util.array.apply(this.effects, 'draw');
  util.array.apply(this.projectiles, 'draw');
};


World.prototype.advance = function(dt) {
  this.updateLists();

  if (this.paused) return;

  util.array.apply(this.things, 'advance', dt);
  util.array.apply(this.projectiles, 'advance', dt);
  util.array.apply(this.effects, 'advance', dt);
  // txhis.checkCollisions();

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

World.prototype.populate = function() {
  this.camera = new Camera();
  this.camera.setPosition([0, 0, 9])
  // camera.yaw = Math.PI;


  var light = new Light();
  light.setPosition([0, 0, 0])
  light.setAmbientColor([.175, .175, .175]);
  light.setDirectionalColor([1, .6, .3]);
  this.addLight(light);

  var crate = new DumbCrate({
    yaw: 0 * Math.random() * 2 * PI,
    pitch: 0 * Math.random() * 2 * PI,
    position: [0, 0, 0],
    alive: true,
    size: 1.5
  });

  crate.box.setTexture(Textures.THWOMP);

  crate.rYaw = .6;
  crate.rPitch = .8;


  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * PI,
    pitch: 0 * Math.random() * 2 * PI,
    position: [0, 0, 0],
    alive: true,
    size: .075
  });
  sun.rPitch = 8 * PI;
  sun.rYaw = 6 * PI;
  light.anchor = sun;
  world.add(sun);



  var shelf = new Shelf({
    position: [0, 0, 0]
  })

  // var sphere = new Sphere(1, [1, 1, 1]);
  // sphere.position = [0, 2, 0];
  // this.add(sphere);

  this.add(shelf);
  this.add(crate);
};

World.prototype.reset = function() {
  world.things = [];
  world.effects = [];
  world.projectiles = [];
  Tribe.clear();

  world.populate();
}

World.prototype.inBounds = function(xyz) {
  return this.board.inBounds(xyz);
};

World.prototype.updateLists = function() {
  this.thingsToAdd.forEach(
    function(thing) {
      this.add(thing);
    }, this);

  util.array.pushAll(this.effects, this.effectsToAdd);
  util.array.pushAll(this.projectiles, this.projectilesToAdd);

  // this.things = World.filterOutThings(this.things, this.thingsToRemove);
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


World.prototype.checkCollisions = function() {
  for (var i = 0; this.projectiles[i]; i++) {
    for (var j = 0; this.things[j]; j++) {
      var projectile = this.projectiles[i];
      var thing = this.things[j];
      if (projectile.parent == thing) {
        continue;
      }
      if (Collision.check(projectile, thing)) {
        if (projectile.parent.tribe == thing.tribe) {
          this.projectilesToRemove.push(this);
        } else {
          if (thing.alive) {
            if (thing instanceof DumbCrate &&
                projectile.parent instanceof Hero) {
              projectile.parent.ammo.arrows += 3;
              logger.log("Picked up 3 arrows.");
            }
            thing.die();
            projectile.detonate();
          }
        }
      }
    }
  }
  for (var i = 0, thingA; thingA = this.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.things[j]; j++) {
      if (Collision.closeEnough(thingA, thingB)) {
        var vectorTo = Vector.difference(thingA.position, thingB.position);
        var distance = Vector.mag(vectorTo);
        var outerRadiusA = thingA.getOuterRadius();
        var outerRadiusB = thingB.getOuterRadius();
        var delta = distance -
            Math.sqrt(outerRadiusA*outerRadiusA + outerRadiusB*outerRadiusB);

        var push = Vector.multiply(vectorTo, (delta/distance)/2);
        thingA.position = Vector.minus(thingA.position, push);
        thingB.position = Vector.sum(thingB.position, push);
      }
    }
  }
};

World.prototype.getThing = function(id) {
  return this.thingsById[id];
};

