goog.provide('DumbCrate');

goog.require('QuantumTypes');
goog.require('Thing');


/**
 * @constructor
 * @extends {Thing}
 * @struct
 */
DumbCrate = function(message) {
  message.isRoot = true;
  goog.base(this, message);
  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture,
    texturesByFace: message.texturesByFace,
    textureCounts: message.textureCounts,
    textureCountsByFace: message.textureCountsByFace,
    color: message.color || [1, 1, 1, 1],
    isStatic: true,
    glommable: false,
  });

  this.outerRadius = Math.sqrt(
      this.size[0]/2 * this.size[0]/2 +
      this.size[1]/2 * this.size[1]/2 +
      this.size[2]/2 * this.size[2]/2);

  this.claimed = false;

  this.addPart(this.box);
};
goog.inherits(DumbCrate, Thing);
Types.registerType(DumbCrate, QuantumTypes.DUMB_CRATE);


DumbCrate.readMessage = function(reader) {
  return {
    klass: DumbCrate,
    alive: reader.readInt(),
    position: reader.readVec3(),
    velocity: reader.readVec3(),
    upOrientation: reader.readVec4(),
    size: reader.readVec3()
  }
};

DumbCrate.prototype.update = function(message) {
  this.velocity = message.velocity;
  this.position = message.position;
  this.upOrientation = message.upOrientation;
  this.size = message.size;
};

DumbCrate.prototype.getOuterRadius = function() {
  return this.outerRadius;
};

