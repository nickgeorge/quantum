OffsetContainer = function(message) {
  this.super(message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
util.inherits(OffsetContainer, Thing);


OffsetBox = function(message) {
  this.super({
    position: vec3.nullableClone(message.position),
    name: message.name,
  });

  message.position = message.offset;
  message.offset = null;
  this.thing = new LeafBox(message);
  this.addPart(this.thing);
};
util.inherits(OffsetBox, Thing);