Shelf = function(message) {
  this.super(message);
  this.size = message.size;

// debugger;
  this.frontPane = new Pane({
    // texture: Textures.CRATE,
    size: [this.size, this.size, 0],
    position: [0, 0, -this.size/2],
  });

  this.parts = [
    this.frontPane,
    new Pane({
      // texture: Textures.CRATE,
      size: [this.size, this.size, 0],
      position: [-this.size/2, 0, 0],
      yaw: PI/2
    }),
    new Pane({
      // texture: Textures.CRATE,
      size: [this.size, this.size, 0],
      position: [this.size/2, 0, 0],
      yaw: 3*PI/2
    }),
    new Pane({
      // texture: Textures.CRATE,
      size: [this.size, this.size, 0],
      position: [0, this.size/2, 0],
      pitch: PI/2
    }),
    new Pane({
      texture: Textures.FLOOR,
      textureCounts: [120, 120],
      size: [this.size, this.size, 0],
      position: [0, -this.size/2, 0],
      pitch: 3*PI/2
    }),
    new Pane({
      // texture: Textures.CRATE,
      size: [this.size, this.size, 0],
      position: [0, 0, this.size/2],
      yaw: PI,
      roll: PI/2
    })
  ];
  this.klass = "Shelf";
};
util.inherits(Shelf, Thing);

Shelf.prototype.lowBound = function(axis) {
  return -this.size / 2;
};

Shelf.prototype.highBound = function(axis) {
  return this.size / 2;
};


Shelf.prototype.render = function() {
  util.array.apply(this.parts, 'draw');
};

Shelf.prototype.advance = function(dt) {
  util.base(this, 'advance', dt);

  util.array.forEach(this.parts, function(part) {
    part.advance(dt);
  });
};