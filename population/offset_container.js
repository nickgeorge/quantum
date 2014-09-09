OffsetContainer = function(message) {
  goog.base(this, message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
goog.inherits(OffsetContainer, Thing);


OffsetBox = function(message) {
  goog.base(this, {
    position: vec3.nullableClone(message.position),
    name: message.name,
  });

  message.position = message.offset;
  message.offset = null;
  this.thing = new Box(message);
  this.addPart(this.thing);
};
goog.inherits(OffsetBox, Thing);
