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

  this.collisionFunctions = {};
  this.registerCollisionTypes();

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


  for (var k = 0; k < 50; k++) {
    var dumbCrate = new DumbCrate({
      position: [
        (Math.random() - .5) * this.shelf.size[0],
        (Math.random() - .5) * this.shelf.size[1] * .5 - 225,
        (Math.random() - .5) * this.shelf.size[2],
      ],
      size: [
        50,//10 + Math.random() * 60,
        50,//10 + Math.random() * 60,
        50//10 + Math.random() * 60,
      ],
      texture: Textures.THWOMP,
      yaw: Math.random() * PI,
      pitch: Math.random() * PI,
      yaw: Math.random() * PI,
      // rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
      // rPitch: (2*Math.random() - 1) * 2*Math.random() * PI,
    });
    this.add(dumbCrate);

    var sphere = new Sphere({
      position: [
        (Math.random() - .5) * this.shelf.size[0],
        (Math.random() - .5) * this.shelf.size[1] * .7 - 100,
        (Math.random() - .5) * this.shelf.size[2],
      ],
      radius: 3 + Math.random()*30,
      texture: Textures.EARTH,
      rYaw: (2*Math.random() - 1) * 2*Math.random() * PI,
    });
    this.add(sphere);
  }

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
    position: [0, -225, 225]
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
      this.collide(thingA, thingB);
    }
  }
};


World.prototype.registerCollisionTypes = function() {
  this.registerCollisionType(DumbCrate, Bullet, function(dumbCrate, bullet) {
    var encounter = dumbCrate.findThingEncounter(bullet);
    if (encounter) {
      dumbCrate.glom(bullet, encounter);
    }
  });

  this.registerCollisionType(Sphere, Bullet, function(sphere, bullet) {
    var encounter = sphere.findThingEncounter(bullet);
    if (encounter) {
      sphere.glom(bullet, encounter);
    }
  });

  this.registerCollisionType(Shelf, Bullet, function(shelf, bullet) {
    var encounter = shelf.findThingEncounter(bullet);
    if (encounter) {
      shelf.glom(bullet, encounter);
    }
  });

  this.registerCollisionType(Shelf, Hero, function(shelf, hero) {
    var encounter = shelf.findThingEncounter(hero, Hero.WIDTH);
    if (!encounter) return;
    if (encounter.distance < Hero.WIDTH) {
      heroPosition_lc = encounter.part.worldToLocalCoords([], hero.position);
      heroPosition_lc[2] = Hero.WIDTH;
      encounter.part.localToWorldCoords(hero.position, heroPosition_lc);
      hero.computeTransforms();
      // shelf.pushIn(hero, encounter);
    }
  });
  this.registerCollisionType(Pane, Hero, function(shelf, hero) {
    var encounter = shelf.findThingEncounter(hero, Hero.WIDTH + 1000);
    if (!encounter) return;
    
      heroVelocity_lc = encounter.part.worldToLocalCoords([], hero.velocity);
    
      heroVelocity_lc[2] = Math.max(0, heroVelocity_lc[2]);
    
      encounter.part.localToWorldCoords(heroVelocity_lc, heroVelocity_lc);
    
    
  });


  this.registerCollisionType(DumbCrate, Hero, function(dumbCrate, hero) {
    var encounter = dumbCrate.findThingEncounter(hero, Hero.WIDTH);
    if (!encounter) return;
  

    heroPosition_lc = encounter.part.worldToLocalCoords([], hero.position);
    heroPosition_lc[2] = Math.max(Hero.WIDTH, heroPosition_lc[2]);
    encounter.part.localToWorldCoords(hero.position, heroPosition_lc);

    heroVelocity_lc = encounter.part.worldToLocalCoords([], hero.velocity, 0);
    heroVelocity_lc[2] = Math.max(0, heroVelocity_lc[2]);
    encounter.part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);

    hero.computeTransforms();
    // shelf.pushIn(hero, encounter);
  });
}


World.prototype.registerCollisionType = function(classA, classB, fn) {
  var typeA = classA.type;
  var typeB = classB.type;
  this.collisionFunctions[typeA] = this.collisionFunctions[typeA] || {};
  this.collisionFunctions[typeB] = this.collisionFunctions[typeB] || {};

  this.collisionFunctions[typeA][typeB] = fn;
  this.collisionFunctions[typeB][typeA] = function(thingB, thingA) {
    fn(thingA, thingB);
  }
};


World.prototype.collide = function(thingA, thingB) {
  var typeA = thingA.getType();
  var typeB = thingB.getType();
  var collisionFunction = this.collisionFunctions[typeA] ? 
      this.collisionFunctions[typeA][typeB] :
      null;
  if (collisionFunction) collisionFunction(thingA, thingB);
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
