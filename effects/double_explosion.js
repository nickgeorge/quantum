DoubleExplosion = function(message) {
  this.super();
  this.yaw = message.yaw;
  this.pitch = message.pitch;
  this.position = message.position;
  this.alive = message.alive;
  this.size = message.size;
  this.small = new ImageCross().
      setColor([1, 0, 0]).
      setTexture(Textures.SPARK, true);

  this.big = new ImageCross().
      setColor([1, 1, 0]).
      setTexture(Textures.ENERGY, true);
};
util.inherits(DoubleExplosion, Thing);

DoubleExplosion.prototype.update = function(message) {
  this.yaw = message.yaw;
  this.pitch = message.pitch;
  this.position = message.position;
  this.alive = message.alive;
  this.size = message.size;
}

DoubleExplosion.prototype.advance = function(dt) {};

DoubleExplosion.prototype.draw = function() {
  gl.enable(gl.BLEND);
  gl.depthMask(false);

  gl.pushModelMatrix();
  this.transform();

  gl.uniform3fv(shaderProgram.scaleUniform,
      [this.size, this.size, this.size]);
  this.small.draw();

  gl.uniform3fv(shaderProgram.scaleUniform, [
    this.size*1.2,
    this.size*1.2,
    this.size*1.2
  ]);
  this.big.draw();

  gl.depthMask(true);
  gl.popModelMatrix();
  shaderProgram.reset();
};
