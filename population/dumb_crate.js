DumbCrate = function(message) {
  util.base(this, message);
  this.size = message.size;
  this.box = new LeafBox({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    isStatic: true
  });

  this.addPart(this.box);
};
util.inherits(DumbCrate, Thing);
DumbCrate.type = Types.DUMB_CRATE;

DumbCrate.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();  
};