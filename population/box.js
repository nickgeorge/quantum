Box = function(message) {
  this.super(message);
  this.size = message.size;

  var frontFace = new Pane({
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, this.size[2]/2],
    texture: message.texture,
  });
  var backFace = new Pane({
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, -this.size[2]/2],
    texture: message.texture,
    yaw: PI
  });
  var rightFace = new Pane({
    size: [this.size[2], this.size[1], 0],
    position: [this.size[0]/2, 0, 0],
    texture: message.texture,
    yaw: PI/2
  });
  var leftFace = new Pane({
    size: [this.size[2], this.size[1], 0],
    position: [-this.size[0]/2, 0, 0],
    texture: message.texture,
    yaw: 3*PI/2
  });
  var topFace = new Pane({
    size: [this.size[0], this.size[2], 0],
    position: [0, this.size[1]/2, 0],
    texture: message.texture,
    pitch: 3*PI/2
  });
  var bottomFace = new Pane({
    size: [this.size[0], this.size[2], 0],
    position: [0, -this.size[1]/2, 0],
    texture: message.texture,
    pitch: PI/2
  });

  this.parts = [
    frontFace,
    backFace,
    rightFace,
    leftFace,
    topFace,
    bottomFace
  ];
};
util.inherits(Box, Thing);
Box.type = Types.BOX;