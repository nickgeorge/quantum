DumbCrate = function(message) {
  this.super(message);

  this.size = message.size || 1;
  this.box = new Box([this.size, this.size, this.size]).
      setColor([1, 1, 1]).
      setTexture(Textures.CRATE, true);

  this.parts = [this.box];

  this.klass = "DumbCrate";
};
util.inherits(DumbCrate, Thing);

DumbCrate.DEFAULT_SPEED = 60;

DumbCrate.prototype.die = function() {
  util.base(this, 'die');

  this.box.setColor([1, 1, 1, 1]);
  this.box.texture = null;
  this.alive = false;
};

DumbCrate.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);
  this.t += Number(dt);
};

DumbCrate.prototype.render = function() {
  this.box.draw();
};

DumbCrate.prototype.dispose = function() {
  this.box.dispose();
};