HealthBar = function(message) {
  this.super(message);

  this.pane = new Pane({
    size: [1, .2],
    color: [0, 0, 0, 1],
    // position: [0, .8, 0],
    // yaw: PI,
  });

  this.addPart(new PaneOutline({
    pane: this.pane,
    color: vec4.WHITE
  }));
  this.addPart(this.pane);
  this.isRoot = true;

  this.visible = false;
};
util.inherits(HealthBar, Thing);


HealthBar.prototype.advance = function(dt) {
  this.visible = this.parent.alive && this.parent.health < 100;
  if (!this.visible) return;
  if (this.parent) {
    var deltaPitch = vec3.pitchTo(
        this.parent.position,
        world.hero.position);

    quat.multiply(this.upOrientation,
        quat.conjugate([], this.parent.upOrientation),
        world.hero.upOrientation);
  }
};


HealthBar.prototype.getHealthPercent = function() {
  return this.parent.health / 100;
};


HealthBar.prototype.updateHealth = function() {  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.pane.vertexBuffer);
  this.pane.verticies[3] = 
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();
  this.pane.verticies[6] = 
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();

  gl.bufferSubData(gl.ARRAY_BUFFER, 0,
      new Float32Array(this.pane.verticies));

  this.pane.color[0] = (100 - this.parent.health)/ 100.0;
  this.pane.color[1] = this.parent.health / 100.0;
};


HealthBar.prototype.draw = function() {
  if (!this.visible) return;
  shaderProgram.setUseLighting(false);
  util.base(this, 'draw');
  shaderProgram.setUseLighting(true);;
};


HealthBar.prototype.setParent = function(parent) {
  util.base(this, 'setParent', parent);
  this.updateHealth();
};