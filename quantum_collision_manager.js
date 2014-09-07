goog.require('CollisionManager');

goog.provide('QuantumCollisionManager');

/**
 * @param {World}
 * @constructor
 * @extends {CollisionManager}
 */
QuantumCollisionManager = function(world) {
  goog.base(this, world);
};
goog.inherits(QuantumCollisionManager, CollisionManager);


QuantumCollisionManager.prototype.registerCollisionConditions = function() {
  this.registerCollisionCondition(DumbCrate, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  this.registerCollisionCondition(Sphere, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  this.registerCollisionCondition(Shelf, Bullet,
      util.fn.constant(0),
      CollisionFunctions.GLOM);
  // this.registerCollisionCondition(DumbCrate, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Sphere, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Shelf, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  // this.registerCollisionCondition(Fella, ThrowinGurnade,
  //     function(){},
  //     CollisionFunctions.GLOM);
  this.registerCollisionCondition(Fella, Bullet,
      util.fn.constant(0),
      CollisionFunctions.FELLA_AND_BULLET);

  this.registerCollisionCondition(Shelf, Hero,
      util.fn.constant(Hero.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(Shelf, Fella,
      util.fn.constant(Hero.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(DumbCrate, Fella,
      util.fn.constant(Hero.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(DumbCrate, Hero,
      util.fn.constant(Hero.HEIGHT),
      CollisionFunctions.BOXLIKE_AND_HERO);
  this.registerCollisionCondition(Sphere, Hero,
      util.fn.constant(Hero.HEIGHT),
      CollisionFunctions.SPHERELIKE_AND_HERO);
};


// TODO: This is a really degenerate function.  Kill it.
QuantumCollisionManager.maybeGlom = function(glomee, glomer) {
  var encounter = glomee.findThingEncounter(glomer, 0);
  if (encounter) {
    encounter.part.glom(glomer, encounter.point);
    glomer.alive = false;
    glomer.landed = true;
  }
};


// TODO: Move these into individual things.
CollisionFunctions = {
  FELLA_AND_BULLET: function(fella, bullet) {
    var encounter = fella.findThingEncounter(bullet, 0);
    if (encounter) {
      bullet.alive = false;
      var bodyPart = encounter.part.getGlommable();
      fella.hit(bullet, bodyPart);
      encounter.part.glom(bullet, encounter.point);
    }
  },

  GLOM: function(glomee, glomer) {
    if (!glomer.alive) return;
    QuantumCollisionManager.maybeGlom(glomee, glomer);
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
          // TODO: Adjust height
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
    var encounter = spherelike.findThingEncounter(hero, Hero.HEIGHT);
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
