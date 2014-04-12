Shelf = function(message) {
  this.super();
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


Shelf.prototype.render = function() {
  util.array.apply(this.parts, 'draw');
};