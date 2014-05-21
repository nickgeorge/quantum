Shelf = function(message) {
  this.super(message);
  
  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    invert: true
  });

  this.addPart(this.box);
};
util.inherits(Shelf, Thing);
Shelf.type = Types.SHELF;

Shelf.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();  
};

// Shelf.prototype.render = function(){}