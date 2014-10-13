HealthBar = function(message) {
  goog.base(this, message);

  this.pane = new Pane({
    size: [1, .2],
    color: [0, 0, 0, 1],
    dynamic: true
  });

  this.addPart(new PaneOutline({
    pane: this.pane,
    color: vec4.fromValues(1, 1, 1, 1)
  }));

  this.addPart(this.pane);
  this.isRoot = true;

  this.visible = false;
};
goog.inherits(HealthBar, Thing);


HealthBar.prototype.advance = function(dt) {
  this.visible = this.parent.alive && this.parent.health < 100;
  if (!this.visible) return;
  var hero = Env.world.getHero();
  if (this.parent) {
    var deltaPitch = vec3.pitchTo(
        this.parent.position,
        hero.position);

    quat.multiply(this.upOrientation,
        quat.conjugate([], this.parent.upOrientation),
        hero.upOrientation);
  }
};


HealthBar.prototype.getHealthPercent = function() {
  return this.parent.health / 100;
};


HealthBar.prototype.updateHealth = function() {
  this.pane.verticies[3] =
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();
  this.pane.verticies[6] =
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();

  Env.gl.bindBuffer(GL.ARRAY_BUFFER, this.pane.vertexBuffer);
  Env.gl.bufferSubData(GL.ARRAY_BUFFER, 0,
      new Float32Array(this.pane.verticies));

  this.pane.color[0] = (100 - this.parent.health)/ 100.0;
  this.pane.color[1] = this.parent.health / 100.0;
};


HealthBar.prototype.draw = function() {
  if (!this.visible) return;
  Env.gl.getActiveProgram().setUseLighting(false);
  goog.base(this, 'draw');
  Env.gl.getActiveProgram().setUseLighting(true);
};


HealthBar.prototype.setParent = function(parent) {
  goog.base(this, 'setParent', parent);
};
