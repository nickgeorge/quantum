Sun = function(message) {
  this.super(message);
  this.radius = message.radius || .1;
  this.sphere = new Sphere({
    radius: this.radius,
    // color: [1, .75, 0, 1],
    texture: Textures.SUN
  });

  this.parts = [this.sphere];

  this.klass = 'Sun';
};
util.inherits(Sun, Thing);

Sun.prototype.advance = function(dt) {
  this.position = [
    2.75 * Math.sin(this.age / .5/6),
    -3 + 2.75 * Math.sin(this.age / .6/6),
    2.75 * Math.sin(this.age / .4/6),
  ];
  util.base(this, 'advance', dt);
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.sphere.render();
  shaderProgram.setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return 0;
};