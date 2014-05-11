OffsetContainer = function(message) {
  this.super(message);
  this.thing = message.thing;

  this.addPart(this.thing);
};
util.inherits(OffsetContainer, Thing);


OffsetBox = function(message) {
  this.super({
    position: message.position,
    roll: message.roll
  });

  message.position = message.offset;
  message.offset = null;
  message.roll = null;
  this.thing = new Box(message);
  this.addPart(this.thing);
};
util.inherits(OffsetBox, Thing);