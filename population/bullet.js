Bullet = function(message) {
  this.super(message);
  this.size = message.size.length ?
      message.size : 
      [message.size, message.size, message.size];
  this.box = new Box({
    size: this.size,
    color: [1, 0, 0, 1],
    position: [0, 0, 0]
  });

  this.parts = [this.box];
};
util.inherits(Bullet, Thing);

Bullet.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};