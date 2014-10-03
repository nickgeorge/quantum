Head = function(msg) {
  goog.base(this, msg);

  this.scale = [.012, .012, .012];

  this.finalize();
};
goog.inherits(Head, LeafThing);

Head.positionBuffer = null;
Head.prototype.getPositionBuffer = function() {
  if (!Head.positionBuffer) {
    Head.positionBuffer = Env.gl.generateBuffer(HeadData.vertexCoordinates, 3);
  }
  return Head.positionBuffer;
};


Head.normalBuffer = null;
Head.prototype.getNormalBuffer = function() {
  if (!Head.normalBuffer) {
    Head.normalBuffer = Env.gl.generateBuffer(HeadData.normalCoordinates, 3);
  }
  return Head.normalBuffer;
};
