Sun = function(message) {
  this.theta = message.theta || 0;
  this.phi = message.phi || 0;
  this.rTheta = message.rTheta || 0;
  this.rPhi = message.rPhi || 0;
  this.velocity = message.velocity || [0, 0, 0];

  this.position = message.position;
  this.alive = message.alive;
  this.size = message.size || 1;
  this.box = new Box([this.size, this.size, this.size]).
      setColor([1, 1, 0]);

  this.parts = [this.box];

  this.outerRadius = .867;
  this.klass = "Sun";

  this.t = 0;
};
util.inherits(Sun, Thing);

Sun.prototype.advance = function(dt) {
  this.t += Number(dt);

  this.theta += this.rTheta * dt;
  this.phi += this.rPhi * dt;

  // this.position = [
  //   4.25 * Math.sin(this.t / 400),
  //   4.25 * Math.sin(this.t / 500),
  //   4.25 * Math.sin(this.t / 600)
  // ];
};

Sun.prototype.draw = function() {
  gl.pushMatrix();

  this.transform();
  shaderProgram.setUseLighting(false);
  this.box.draw();
  shaderProgram.setUseLighting(true);

  gl.popMatrix();

  gl.pushMatrix();

};