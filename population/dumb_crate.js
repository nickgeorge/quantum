DumbCrate = function(message) {
  goog.base(this, message);
  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    color: [1, 1, 1, 1],
    isStatic: true,
    glommable: false,
  });

  this.addPart(this.box);
};
goog.inherits(DumbCrate, Thing);
DumbCrate.type = Types.DUMB_CRATE;

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};
