World = function() {
  this.things = [];
  this.thingsById = {};
  this.projectiles = [];
  this.effects = [];
  this.lights = [];
  this.yaw = 0;
  this.rotSpeed = 0;
  this.G = 30;
  this.clearColorRgba = [.0, .0, .0, 1];
  this.camera = null;
  this.shelf = null;

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

World.prototype.remove = function(thing) {
  this.thingsToRemove.push(thing);
};

World.prototype.add = function(thing) {
  this.thingsToAdd.push(thing);
};

World.prototype.addDirectly_ = function(thing) {
  this.things.push(thing);
  this.thingsById[thing.id] = thing;
};

World.prototype.draw = function() {
  gl.pushViewMatrix();

  world.applyLights();
  this.camera.transform();

  mat4.rotate(gl.modelMatrix, gl.modelMatrix, this.yaw, Vector.J);
  shaderProgram.reset();
  this.shelf && this.shelf.draw();
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
  });
  util.array.forEach(this.projectiles, function(projectile) {
    projectile.advance(dt);
  });
  util.array.forEach(this.effects, function(effects) {
    effects.advance(dt);
  });
  this.yaw += this.rotSpeed * dt;
  this.shelf.advance(dt);
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

World.prototype.populate = function() {
  var light = new Light();
  light.setPosition([0, 0, 0])
  light.setAmbientColor([.2, .2, .2]);
  light.setDirectionalColor([1, .6, .3]);
  this.addLight(light);

  this.shelf = new Shelf({
    position: [0, 0, 0],
    size: 15
  })
  // this.add(this.shelf);


  // for (var i = -6; i <= 6; i += 1.5) {
  //   for (var j = -6; j <= 6; j += 1.5) {
  //     for (var k = -6; k <= 6; k += 1.5) {
  //       var cairn = new DumbCrate({
  //         position: [i, j, k],
  //         size: .1
  //       });
  //       world.add(cairn);
  //     }
  //   }
  // }

  this.cairn = new DumbCrate({
    position: [0, 0, 3],
    size: 2,
    texture: Textures.THWOMP,
    rYaw: PI,
    rPitch: 1.1,
    rRoll: 1.2
  });
  world.add(this.cairn);

  var sun = new Sun({
    yaw: 0 * Math.random() * 2 * PI,
    pitch: 0 * Math.random() * 2 * PI,
    position: [0, 0, 0],
    alive: true,
    size: .3
  });
  sun.rPitch = 8 * PI;
  sun.rYaw = 6 * PI;
  light.anchor = sun;
  world.add(sun);

  this.camera = new Camera();
  hero = new Hero({
    position: [0, 0, -5],
    yaw: PI
  });
  this.camera.setAnchor(hero);
  heroListener.hero = hero;
  world.add(hero);

};

World.prototype.reset = function() {
  world.things = [];
  world.effects = [];
  world.projectiles = [];
  Tribe.clear();

  world.populate();
}

World.prototype.inBounds = function(xyz) {
  return this.shelf.inBounds(xyz);
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


World.prototype.checkCollisions = function() {
  // for (var i = 0; this.projectiles[i]; i++) {
  //   for (var j = 0; this.things[j]; j++) {
  //     var projectile = this.projectiles[i];
  //     var thing = this.things[j];
  //     if (projectile.parent == thing) {
  //       continue;
  //     }
  //     if (Collision.check(projectile, thing)) {
  //       if (projectile.parent.tribe == thing.tribe) {
  //         this.projectilesToRemove.push(this);
  //       } else {
  //         if (thing.alive) {
  //           if (thing instanceof DumbCrate &&
  //               projectile.parent instanceof Hero) {
  //             projectile.parent.ammo.arrows += 3;
  //             logger.log("Picked up 3 arrows.");
  //           }
  //           thing.die();
  //           projectile.detonate();
  //         }
  //       }
  //     }
  //   }
  // }
  for (var i = 0, thingA; thingA = this.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.things[j]; j++) {
      if (this.closeEnough(thingA, thingB)) {

        console.log("hit");
        if (thingA == this.cairn) {
          util.array.remove(world.things, thingB);
          thingA.glom(thingB);
        } else if (thingB == this.cairn) {
          util.array.remove(world.things, thingA);
          thingB.glom(thingA);
        }
        // var vectorTo = Vector.difference(thingA.position, thingB.position);
        // var distance = Vector.mag(vectorTo);
        // var outerRadiusA = thingA.getOuterRadius();
        // var outerRadiusB = thingB.getOuterRadius();
        // var delta = distance -
        //     Math.sqrt(outerRadiusA*outerRadiusA + outerRadiusB*outerRadiusB);

        // var push = Vector.multiply(vectorTo, (delta/distance)/2);
        // thingA.position = Vector.minus(thingA.position, push);
        // thingB.position = Vector.sum(thingB.position, push);
      }
    }
  }
};

World.prototype.closeEnough = function(thingA, thingB) {
  var vectorTo = Vector.difference(thingA.position, thingB.position);
  var distance = Vector.mag(vectorTo);
  var outerRadiusA = thingA.getOuterRadius();
  var outerRadiusB = thingB.getOuterRadius();
  // console.log([vectorTo, distance, outerRadiusA, outerRadiusB]);
  return distance <
      Math.sqrt(outerRadiusA*outerRadiusA + outerRadiusB*outerRadiusB); 
};

World.prototype.getThing = function(id) {
  return this.thingsById[id];
};

