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
  this.position = [
    // 0, 0, 0
    80 * Math.sin(this.age / .5/6),
    80 * Math.sin(this.age / .6/6) - 100,
    80 * Math.sin(this.age / .4/6),
  ];
  util.base(this, 'advance', dt);
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.sphere.render();
  shaderProgram.setUseLighting(true);
};