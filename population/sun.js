Sun = function(message) {
  this.super();

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
  util.base(this, 'advance', dt);
  this.position = [
    6.25,// * Math.sin(this.age / .4/6),
    6.25,// * Math.sin(this.age / .5/6),
    6.25,// * Math.sin(this.age / .6/6)
  ];
  // this.position = [6, 6, 5];
};

Sun.prototype.render = function() {
  shaderProgram.setUseLighting(false);
  this.box.draw();
  shaderProgram.setUseLighting(true);
};

Sun.prototype.getOuterRadius = function() {
  return 0;
};