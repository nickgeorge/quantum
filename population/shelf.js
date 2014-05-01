Shelf = function(message) {
  this.super(message);
  this.size = message.size;

  this.parts = [
    new Pane({
      texture: Textures.BYZANTINE,
        textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [0, 0, -this.size/2],
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [-this.size/2, 0, 0],
      yaw: PI/2
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [this.size/2, 0, 0],
      yaw: 3*PI/2
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [0, this.size/2, 0],
      pitch: PI/2
    }),
    new Pane({
      // texture: Textures.FLOOR,
      // textureCounts: [150, 150],

      texture: Textures.BYZANTINE,
      textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [0, -this.size/2, 0],
      pitch: 3*PI/2
    }),
    new Pane({
      texture: Textures.BYZANTINE,
      textureCounts: [150, 150],
      size: [this.size, this.size, 0],
      position: [0, 0, this.size/2],
      yaw: PI
    })
  ];
  this.klass = 'Shelf';
};
util.inherits(Shelf, Thing);
Shelf.type = Types.SHELF;

Shelf.prototype.lowBound = function(axis) {
  return -this.size / 2;
};

Shelf.prototype.highBound = function(axis) {
  return this.size / 2;
};
