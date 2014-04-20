Sun = function(message) {
  this.super(message);
  this.size = message.size || 1;
  this.box = new Box({
    size: [this.size, this.size, this.size],
    color: [.25, .5, 1, 1]
  });

  this.parts = [this.box];

  this.klass = "Sun";
};
util.inherits(Sun, Thing);

Sun.prototype.advance = function(dt) {
  // this.position = [
  //   6.25 * Math.sin(this.age / .5/6),
  //   0 * Math.sin(this.age / .6/6),
  //   0 * Math.sin(this.age / .4/6),
  // ];
  this.position = [6, 6, 6];
  util.base(this, 'advance', dt);
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.box.render();
  shaderProgram.setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};