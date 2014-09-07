Sun = function(message) {
  goog.base(this, message);
  this.radius = message.radius || 5;
  this.sphere = new Sphere({
    radius: this.radius,
    texture: Textures.get(TextureList.SUN),
    longitudeCount: 20,
    latitudeCount: 20
  });

  this.addPart(this.sphere);
};
goog.inherits(Sun, Thing);
Sun.type = Types.SUN;

Sun.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  var world = Env.world;
  this.position = [
    world.shelf.size[0]*(1/3) * Math.sin(this.age / .5/6),
    -world.shelf.size[1]*(1/2) * Math.sin(this.age / .6/6),
    world.shelf.size[2]*(1/3) * Math.sin(this.age / .4/6),
  ];
};

Sun.prototype.render = function() {
  Env.gl.getActiveProgram().setUseLighting(false);
  this.sphere.render();
  Env.gl.getActiveProgram().setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};
