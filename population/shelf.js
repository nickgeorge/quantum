Shelf = function(message) {
  this.theta = message.theta || 0;
  this.phi = message.phi || 0;
  this.rTheta = message.rTheta || 0;
  this.rPhi = message.rPhi || 0;
  this.velocity = message.velocity || [0, 0, 0];

  this.position = message.position;
  this.alive = message.alive;
  this.parts = [
    new Box([10, 10, .1]).
        setPosition(0, 0, -5).
        setColor([1, 1, 1]).
        setTexture(Textures.CRATE, true),
    new Box([.1, 10, 10]).
        setPosition(-5, 0, 0).
        setColor([1, 1, 1]).
        setTexture(Textures.CRATE, true),
    new Box([.1, 10, 10]).
        setPosition(5, 0, 0).
        setColor([1, 1, 1]).
        setTexture(Textures.CRATE, true),
    new Box([10, .1, 10]).
        setPosition(0, 5, 0).
        setColor([1, 1, 1]).
        setTexture(Textures.CRATE, true),
    new Box([10, .1, 10]).
        setPosition(0, -5, 0).
        setColor([1, 1, 1]).
        setTexture(Textures.CRATE, true),
  ];
  this.klass = "Shelf";
};
util.inherits(Shelf, Thing);


Shelf.prototype.draw = function() {
  gl.pushMatrix();

  gl.translate(this.position);
  gl.rotate(this.theta, [0, 0, 1]);
  gl.rotate(this.phi, [0, 1, 0]);
  util.array.apply(this.parts, 'draw');


  gl.popMatrix();
};

Shelf.prototype.advance = function(dt) {
  
};