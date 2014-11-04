goog.provide('Shelf');

goog.require('Box');
goog.require('QuantumTypes');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
Shelf = function(message) {
  message.isRoot = true;
  goog.base(this, message);

  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    invert: true,
    color: message.color,
    isStatic: true
  });

  this.addPart(this.box);
};
goog.inherits(Shelf, Thing);
Types.registerType(Shelf, QuantumTypes.SHELF);

Shelf.prototype.getOuterRadius = function() {
  return this.box.getOuterRadius();
};
