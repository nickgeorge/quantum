OffsetContainer = function(message) {
  this.super(message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
util.inherits(OffsetContainer, Thing);


OffsetBox = function(message) {
  this.super({
    position: message.position,
  });

  message.position = message.offset;
  message.offset = null;
  this.thing = new Box(message);
  this.addPart(this.thing);
};
util.inherits(OffsetBox, Thing);