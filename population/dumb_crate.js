DumbCrate = function(message) {
  this.theta = message.theta || 0;
  this.phi = message.phi || 0;
  this.rTheta = message.rTheta || 0;
  this.rPhi = message.rPhi || 0;
  this.velocity = message.velocity || [0, 0, 0];

  this.position = message.position;
  this.alive = message.alive;
  this.size = message.size || 1;
  this.box = new Box([this.size, this.size, this.size]).
      setColor([1, 1, 1]).
      setTexture(Textures.CRATE, true);

  this.parts = [this.box];

  this.outerRadius = .867;
  this.klass = "DumbCrate";

  this.t = 0;
};
util.inherits(DumbCrate, Thing);

DumbCrate.DEFAULT_SPEED = 60;

DumbCrate.prototype.die = function() {
  //util.base(this, 'die');

  this.box.setColor([1, 1, 1, 1]);
  this.box.texture = Textures.CRATE;
  this.alive = false;
};

DumbCrate.prototype.advance = function(dt) {
  this.t += Number(dt);

  this.theta += this.rTheta * dt;
  this.phi += this.rPhi * dt;
};

DumbCrate.prototype.draw = function() {
  gl.pushMatrix();

  this.transform();
  this.box.draw();

  gl.popMatrix();

  gl.pushMatrix();

};
DumbCrate.prototype.dispose = function() {
  this.box.dispose();
};

DumbCrate.newRandom = function() {
  var x = Math.random()*world.board.size[0] + world.board.min(0);
  var y = Math.random()*world.board.size[1] + world.board.min(1);
  return new DumbCrate([1, 1, 1]).
      setTheta(Math.random() * Math.PI*2).
      setPosition([
        x,
        y,
        world.board.getHeight(x, y) + Math.random(10) + 5
      ]);
};
