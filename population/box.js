Box = function(message) {
  this.super(message);
  this.size = message.size;
  this.texturesByFace = message.texturesByFace || [];
  this.invertValue = message.invert ? -1 : 1;
  if (message.texture) {
    util.array.forEach(Box.Faces, function(face) {
      if (!this.texturesByFace[face]) {
        this.texturesByFace[face] = message.texture;
      }
    }, this);
  }
  this.textureCountsByFace = message.textureCountsByFace || [];
  if (message.textureCounts) {
    util.array.forEach(Box.Faces, function(face) {
      if (!this.textureCountsByFace[face]) {
        this.textureCountsByFace[face] = message.textureCounts;
      }
    }, this);
  }

  this.frontFace = new Pane({
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, this.size[2]/2 * this.invertValue],
    texture: this.texturesByFace.front,
    textureCounts: this.textureCountsByFace.front,
  });
  this.backFace = new Pane({
    size: [this.size[0], this.size[1], 0],
    position: [0, 0, -this.size[2]/2 * this.invertValue],
    texture: this.texturesByFace.back,
    textureCounts: this.textureCountsByFace.back,
    yaw: PI,
  });
  this.rightFace = new Pane({
    size: [this.size[2], this.size[1], 0],
    position: [this.size[0]/2 * this.invertValue, 0, 0],
    texture: this.texturesByFace.right,
    textureCounts: this.textureCountsByFace.right,
    yaw: PI/2,
  });
  this.leftFace = new Pane({
    size: [this.size[2], this.size[1], 0],
    position: [-this.size[0]/2 * this.invertValue, 0, 0],
    texture: this.texturesByFace.left,
    textureCounts: this.textureCountsByFace.left,
    yaw: 3*PI/2,
  });
  this.topFace = new Pane({
    size: [this.size[0], this.size[2], 0],
    position: [0, this.size[1]/2 * this.invertValue, 0],
    texture: this.texturesByFace.top,
    textureCounts: this.textureCountsByFace.top,
    pitch: 3*PI/2,
  });
  this.bottomFace = new Pane({
    size: [this.size[0], this.size[2], 0],
    position: [0, -this.size[1]/2 * this.invertValue, 0],
    texture: this.texturesByFace.bottom,
    textureCounts: this.textureCountsByFace.bottom,
    pitch: PI/2,
  });

  this.addParts([
    this.frontFace,
    this.backFace,
    this.rightFace,
    this.leftFace,
    this.topFace,
    this.bottomFace
  ]);
};
util.inherits(Box, Thing);
Box.type = Types.BOX;

Box.Faces = [
  'top', 'bottom', 'left', 'right', 'front', 'back'
];
