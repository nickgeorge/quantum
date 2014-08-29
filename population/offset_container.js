OffsetContainer = function(message) {
  util.base(this, message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
util.inherits(OffsetContainer, Thing);


OffsetBox = function(message) {
  util.base(this, {
    world: message.world,
    position: vec3.nullableClone(message.position),
    name: message.name,

    //TODO: Unhack!!
    isStatic: false
  });

  message.position = message.offset;
  message.offset = null;
  this.thing = new LeafBox(message);
  this.addPart(this.thing);
};
util.inherits(OffsetBox, Thing);