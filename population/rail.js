/**
 * @contstructor
 * @extends {LeafThing)
 */
Rail = function(message) {
  message.drawType = LeafThing.DrawType.ELEMENTS;
  message.upOrientation =
      message.anchor.getViewOrientation(quat.create());

  var middle = message.anchor.fromViewOrientation(
      Rail.offset);
  this.normalMultiplier = 1;
  vec3.add(middle, middle, message.anchor.position);
  message.position = middle;

  this.centers = this.makeCenters();

  message.color = [1, 1, 0, 1];
  goog.base(this, message);

  this.transluscent = true;

  this.owner = message.owner;
  this.anchor = message.anchor;
  this.alive = true;
  this.firstFrame = true;
  this.p1 = this.localToWorldCoords([], [0, -.2, -300]);
  this.damage = 200;
  this.finalize();

};
goog.inherits(Rail, LeafThing);
Types.registerType(Rail, QuantumTypes.RAIL);

Rail.offset = vec3.fromValues(0, -.2, 0);


Rail.prototype.getP0 = function() {
  return this.position;
};


Rail.prototype.getP1 = function() {
  return this.p1;
};

Rail.prototype.advance = function(dt) {
  this.color[3] -= dt;
  if (this.color[3] < 0) {
    Env.world.projectiles.remove(this);
    Env.world.drawables.remove(this);
  }
  if (Math.random() < .7) {
    quat.rotateZ(this.upOrientation,
        this.upOrientation,
        Math.random() * 2 * Math.PI);
  }
  if (this.firstFrame) {
    this.firstFrame = false;
  } else if (this.alive) {
    this.alive = !this.alive;
  }
};


Rail.prototype.makeCenters = function() {
  var centers = [];
  for (var i = -300; i < -1; i += .5) {
    centers.push([
      (Math.random()*2 - 1) * .17,
      (Math.random()*2 - 1) * .17,
      i
    ]);
  }
  centers.push([0, 0, -.7])
  centers.push([0, 0, 0]);

  return centers;
};


Rail.prototype.getPositionBuffer = function() {
  var vertexPositionCoordinates = [];
  var size = .025;
  for (var i = 0; i < this.centers.length - 1; i++) {
    util.array.pushAll(vertexPositionCoordinates, [
      // Top (y = 1)
      this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],

      // Bottom (y = -1)
      this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],
      this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],

      // Right (x = 1)
      this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],

      // Left (x = -1)
      this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],
      this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],
      this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],

      // // // Front (z = 1)
      // this.centers[i+1][0] - size, this.centers[i+1][1] - size, this.centers[i+1][2],
      // this.centers[i+1][0] + size, this.centers[i+1][1] - size, this.centers[i+1][2],
      // this.centers[i+1][0] + size, this.centers[i+1][1] + size, this.centers[i+1][2],
      // this.centers[i+1][0] - size, this.centers[i+1][1] + size, this.centers[i+1][2],

      // // Back (z = -1)
      // this.centers[i  ][0] - size, this.centers[i  ][1] + size, this.centers[i  ][2],
      // this.centers[i  ][0] + size, this.centers[i  ][1] + size, this.centers[i  ][2],
      // this.centers[i  ][0] + size, this.centers[i  ][1] - size, this.centers[i  ][2],
      // this.centers[i  ][0] - size, this.centers[i  ][1] - size, this.centers[i  ][2],
    ]);
  }
  return Env.gl.generateBuffer(vertexPositionCoordinates, 3);
};


Rail.indexBuffer = null;


Rail.prototype.getIndexBuffer = function() {
  if (!Rail.indexBuffer) {
    var vertexIndicies = [];
    for (var i = 0; i < this.centers.length - 1; i++) {
      Box.eachFace(function(faceName, faceIndex) {
        if (faceName == 'front' || faceName == 'back') return;
        util.array.pushAll(vertexIndicies, [
          faceIndex*4 + 0 + i*16, faceIndex*4 + 1 + i*16, faceIndex*4 + 2 + i*16,
          faceIndex*4 + 0 + i*16, faceIndex*4 + 2 + i*16, faceIndex*4 + 3 + i*16
        ]);
      });
    }
    Rail.indexBuffer = Env.gl.generateIndexBuffer(vertexIndicies);
  }
  return Rail.indexBuffer;
};


Rail.prototype.getNormalBuffer = function() {
  var vertexNormals = [];
  for (var k = 0; k < this.centers.length - 1; k++) {
    Box.eachFace(function(faceName, faceIndex) {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < Box.FACE_NORMALS[faceName].length; j++) {
          vertexNormals.push(
              this.normalMultiplier * Box.FACE_NORMALS[faceName][j]);
        }
      }
    }, this);
  }
  return Env.gl.generateBuffer(vertexNormals, 3);
};



Rail.prototype.getOuterRadius = function() {
  return 100;
};
