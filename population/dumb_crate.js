DumbCrate = function(message) {
  this.super(message);

  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture
  });

  this.addPart(this.box);
};
util.inherits(DumbCrate, Thing);
DumbCrate.type = Types.DUMB_CRATE;