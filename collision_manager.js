CollisionManager = function(world) {
  this.world = world;
  this.collisionFunctions = {};

  this.registerCollisionFunctions();
};

CollisionManager.maybeGlom = function(glomee, glomer) {
  var encounter = glomee.findThingEncounter(glomer, 0);
  if (encounter) {
    encounter.part.glom(glomer, encounter.point);
    glomer.alive = false;
    glomer.landed = true;
  }
};

CollisionFunctions = {
  FELLA_AND_BULLET: function(fella, bullet) {
    var encounter = fella.findThingEncounter(bullet, 0);
    if (encounter) {
      bullet.alive = false;
      // TODO: this is the worst line of code in the program
      var partLevelPart = encounter.part.getPart();
      fella.hit(bullet, partLevelPart);
      encounter.part.glom(bullet, encounter.point);
    }
  },

  GRENADE_AND_FELLA: function(fella, grenade) {
    if (!glomer.alive) return;
    if (grenade.stage == ThrowinGurnade.Stage.EXPLODING) {
      var encounter = fella.findThingEncounter(grenade, 25);
      if (encounter) {
        console.log("bang!");
      }
    } else {
      CollisionManager.maybeGlom(glomee, glomer);
    }

  },

  GLOM: function(glomee, glomer) {
    if (!glomer.alive) return;
    CollisionManager.maybeGlom(glomee, glomer);
  },

  BOXLIKE_AND_HERO: function(boxlike, hero) {
    var encounter = boxlike.findThingEncounter(hero, Hero.HEIGHT);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();
    var isOnGround = hero.isLandedOn(part);
    if (!isOnGround) {
      var plumb = vec3.set(vec3.temp, 0, -Hero.HEIGHT, 0);
      vec3.transformQuat(plumb, plumb, hero.upOrientation);
      part.worldToLocalCoords(plumb, plumb, 0);
      if (plumb[2] < 0 || true) {
        var cosAngle = vec3.dot(plumb, vec3.NEG_K)/Hero.HEIGHT;
        if (cosAngle > .55 || true) {
          hero.land(part);
          isOnGround = true;
        }
      }
      if (!isOnGround) {
        encounter = boxlike.findThingEncounter(hero, Hero.WIDTH);
        if (!encounter) {
          return;
        }
        var part = encounter.part;
      }
    }

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    heroPosition_lc[2] = isOnGround ?
        Hero.HEIGHT + .001 :
        Math.max(Hero.WIDTH + .001, heroPosition_lc[2]);
    part.localToWorldCoords(hero.position, heroPosition_lc);
  },

  SPHERELIKE_AND_HERO: function(spherelike, hero) {
    var encounter = spherelike.findThingEncounter(hero, Hero.WIDTH);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    vec3.scale(heroPosition_lc, heroPosition_lc,
        (part.radius + Hero.WIDTH + .001)/vec3.length(heroPosition_lc));
    part.localToWorldCoords(hero.position, heroPosition_lc);

    var heroVelocity_lc = part.worldToLocalCoords(vec3.temp, hero.velocity, 0);
    var normal = vec3.normalize([], heroPosition_lc);
    vec3.scaleAndAdd(heroVelocity_lc, heroVelocity_lc,
        normal, -2*vec3.dot(heroVelocity_lc, normal));
    part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);
  }
};


CollisionManager.prototype.test = function(shapeLike, pointLike) {
  var shapeLikeType = shapeLike.getType();
  var pointLikeType = pointLike.getType();
  var key = CollisionManager.getKey(shapeLikeType, pointLikeType);
  var collisionFunction = this.collisionFunctions[key];

  if (!collisionFunction) return;

  collisionFunction(shapeLike, pointLike);
};


CollisionManager.prototype.registerCollisionFunction = function(
    classA, classB, fn) {
  var typeA = classA.type;
  var typeB = classB.type;
  var key = CollisionManager.getKey(typeA, typeB);
  var reverseKey = CollisionManager.getKey(typeB, typeA);

  this.collisionFunctions[key] = fn;
  this.collisionFunctions[reverseKey] = function(thingB, thingA) {
    fn(thingA, thingB);
  }
};


CollisionManager.prototype.registerCollisionFunctions = function() {
  this.registerCollisionFunction(DumbCrate, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Sphere, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Shelf, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(DumbCrate, ThrowinGurnade, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Sphere, ThrowinGurnade, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Shelf, ThrowinGurnade, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Fella, ThrowinGurnade, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Fella, Bullet, CollisionFunctions.FELLA_AND_BULLET);

  this.registerCollisionFunction(Shelf, Hero, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(Shelf, Fella, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(DumbCrate, Fella, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(DumbCrate, Hero, CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionFunction(Sphere, Hero, CollisionFunctions.SPHERELIKE_AND_HERO);
};


CollisionManager.prototype.checkCollisions = function() {
  this.thingOnThing();
  this.thingOnProjectile();
};


CollisionManager.prototype.thingOnProjectile = function() {
  for (var i = 0, thing; thing = this.world.things[i]; i++) {
    for (var j = 0, projectile; projectile = this.world.projectiles[j]; j++) {
      if (util.math.sqr(thing.getOuterRadius() + projectile.getOuterRadius()) < 
          thing.distanceSquaredTo(projectile)) {
        continue;
      }
      this.test(thing, projectile);
    }
  }
};

CollisionManager.prototype.thingOnThing = function() {
  // TODO: Check everything, collide with the collision with min
  // value of t
  for (var i = 0, thingA; thingA = this.world.things[i]; i++) {
    for (var j = i + 1, thingB; thingB = this.world.things[j]; j++) {
      var minDistance = thingA.distanceSquaredTo(thingB);
      if (util.math.sqr(thingA.getOuterRadius() + thingB.getOuterRadius()) < 
          minDistance) {
        continue;
      }
      this.test(thingA, thingB);
    }
  }
};


CollisionManager.getKey = function(typeA, typeB) {
  return typeA*1000 + typeB;
};


