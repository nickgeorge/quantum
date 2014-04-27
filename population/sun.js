Sun = function(message) {
  this.super(message);
  this.radius = message.radius || .1;
  this.sphere = new Sphere({
    radius: this.radius,
    // color: [1, .75, 0, 1],
    texture: Textures.SUN
  });

  this.parts = [this.sphere];

  this.klass = "Sun";
};
util.inherits(Sun, Thing);

Sun.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
  this.position = [
    6.25 * Math.sin(this.age / .5/6),
    -5 + 2 * Math.sin(this.age / .6/6),
    6.25 * Math.sin(this.age / .4/6),
  ];
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.sphere.render();
  shaderProgram.setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return 0;
};