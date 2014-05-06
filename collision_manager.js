CollisionManager = function(world) {
  this.world = world;
  this.collisionFunctions = {};

  this.registerCollisionFunctions();
};

CollisionFunctions = {
  GLOM: function(glomee, glomer) {
    var encounter = glomee.findThingEncounter(glomer, 0);
    if (encounter) {
      glomee.glom(glomer, encounter);
    }
  },

  DUMB_CRATE_AND_HERO: function(dumbCrate, hero) {
    var encounter = dumbCrate.findThingEncounter(hero, Hero.HEIGHT);
    if (!encounter) return;
    var part = encounter.part;

    var wasLanded = hero.isLanded();
    var isOnGround = hero.isLandedOn(part);
    if (!isOnGround)
      var plumb = vec3.set(vec3.temp, 0, -Hero.HEIGHT, 0);
      part.worldToLocalCoords(plumb, plumb, 0);
      if (plumb[2] < 0) {
        var cosAngle = vec3.dot(plumb, [0, 0, -1])/Hero.HEIGHT;
        if (cosAngle > .65) {
          hero.land(part);
          isOnGround = true;
        }
      }
      if (!isOnGround) {
        encounter = dumbCrate.findThingEncounter(hero, Hero.WIDTH);
        if (!encounter) {
          return;
        }
        hero.unland();
        var part = encounter.part;
      }
    }

    var heroPosition_lc = part.worldToLocalCoords(vec3.temp, hero.position);
    heroPosition_lc[2] = isOnGround ?
        Hero.HEIGHT + .001 :
        Math.max(Hero.WIDTH + .001, heroPosition_lc[2]);
    part.localToWorldCoords(hero.position, heroPosition_lc);
    hero.computeTransforms();

    var heroVelocity_lc = part.worldToLocalCoords(vec3.temp, hero.velocity, 0);
    heroVelocity_lc[2] = wasLanded ?
        Math.max(0, heroVelocity_lc[2]) :
        Math.abs(heroVelocity_lc[2]);
    part.localToWorldCoords(hero.velocity, heroVelocity_lc, 0);
  }
};


CollisionManager.prototype.test = function(thingA, thingB) {
  var typeA = thingA.getType();
  var typeB = thingB.getType();
  var collisionFunction = this.collisionFunctions[typeA] ? 
      this.collisionFunctions[typeA][typeB] :
      null;
  if (collisionFunction) collisionFunction(thingA, thingB);
};


CollisionManager.prototype.registerCollisionFunction = function(
    classA, classB, fn) {
  var typeA = classA.type;
  var typeB = classB.type;
  this.collisionFunctions[typeA] = this.collisionFunctions[typeA] || {};
  this.collisionFunctions[typeB] = this.collisionFunctions[typeB] || {};

  this.collisionFunctions[typeA][typeB] = fn;
  this.collisionFunctions[typeB][typeA] = function(thingB, thingA) {
    fn(thingA, thingB);
  }
};


CollisionManager.prototype.registerCollisionFunctions = function() {
  this.registerCollisionFunction(DumbCrate, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Sphere, Bullet, CollisionFunctions.GLOM);
  this.registerCollisionFunction(Shelf, Bullet, CollisionFunctions.GLOM);

  this.registerCollisionFunction(Shelf, Hero, CollisionFunctions.DUMB_CRATE_AND_HERO);
  this.registerCollisionFunction(DumbCrate, Hero, CollisionFunctions.DUMB_CRATE_AND_HERO);
};