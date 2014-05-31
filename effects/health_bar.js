HealthBar = function(message) {
  this.super(message);

  this.pane = new Pane({
    size: [1, .2],
    color: [0, 0, 0, 1],
    position: [0, .8, 0],
    yaw: PI,
  });

  this.transformedOffset = vec3.create();


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
  if (this.parent.health < 100) {
    this.visible = true;
  }
  if (!this.visible) return;
  if (this.parent) {
    var oldref = this.parent.position[1];

    var normalToCamera = vec3.pointToLine(vec3.create(),
        this.position,
        world.hero.position,
        this.parent.getNormal());

    var spriteRotation = quat.rotationTo(quat.create(),
        this.parent.getUpNose(),
        normalToCamera);

    var deltaPitch = vec3.pitchTo(
        world.hero.position,
        this.position);

    quat.rotateX(spriteRotation,
        spriteRotation,
        deltaPitch);
    quat.multiply(this.upOrientation,
        this.parent.upOrientation,
        spriteRotation);

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
  shaderProgram.setUseLighting(true);
}