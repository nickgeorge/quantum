Sun = function(message) {
  this.super(message);
  this.radius = message.radius || 3;
  this.sphere = new Sphere({
    radius: this.radius,
    texture: Textures.SUN
  });

  this.addPart(this.sphere);
};
util.inherits(Sun, Thing);
Sun.type = Types.SUN;

Sun.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  this.position = [
    world.shelf.size[0]*(1/3) * Math.sin(this.age / .5/6),
    -world.shelf.size[1]*(1/2) * Math.sin(this.age / .6/6),
    world.shelf.size[2]*(1/3) * Math.sin(this.age / .4/6),
  ];
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.sphere.render();
  shaderProgram.setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return this.sphere.getOuterRadius();
};