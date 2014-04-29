Box = function(message) {
  this.super(message);
  this.size = message.size;

  this.parts = [
    new Pane({
      texture: Textures.BYZANTINE,
      size: [this.size, this.size, 0],
      position: [0, 0, this.size/2],
      texture: message.texture,
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      size: [this.size, this.size, 0],
      position: [0, 0, -this.size/2],
      texture: message.texture,
      yaw: PI
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      size: [this.size, this.size, 0],
      position: [this.size/2, 0, 0],
      texture: message.texture,
      yaw: PI/2
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      size: [this.size, this.size, 0],
      position: [-this.size/2, 0, 0],
      texture: message.texture,
      yaw: 3*PI/2
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      size: [this.size, this.size, 0],
      position: [0, -this.size/2, 0],
      texture: message.texture,
      pitch: PI/2
    }),
    new Pane({
      texture: Textures.FLOOR,
      size: [this.size, this.size, 0],
      position: [0, this.size/2, 0],
      texture: message.texture,
      pitch: 3*PI/2
    })
  ];
};
util.inherits(Box, Thing);