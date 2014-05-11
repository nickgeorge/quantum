DumbCrate = function(message) {
  this.super(message);

  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
  });

  this.addPart(this.box);
};
util.inherits(DumbCrate, Thing);
DumbCrate.type = Types.DUMB_CRATE;

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();  
};