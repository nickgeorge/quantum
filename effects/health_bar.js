HealthBar = function(message) {
  this.super(message);
  this.refThing = message.refThing;

  this.pane = new Pane({
    size: [1, .2],
    color: [0, 0, 0, 1]
  });

  this.paneOffset = [0, 2.6, 0];
  this.transformedOffset = vec3.create();


  this.addPart(new PaneOutline({
    pane: this.pane,
    color: vec4.WHITE
  }));
  this.addPart(this.pane);
  this.isRoot = true;

  this.visible = false;

  this.updateHealth();
};
util.inherits(HealthBar, Thing);


HealthBar.prototype.advance = function(dt) {
  if (this.refThing.health < 100) {
    this.visible = true;
  }
  if (!this.visible) return;
  this.advanceBasics(dt);
  if (this.refThing) {
    this.refThing.localToWorldCoords(this.position,
        this.paneOffset);

    var normalToCamera = vec3.pointToLine(vec3.create(),
        this.position,
        world.hero.position,
        this.refThing.getNormal(vec3.create()));

    var spriteRotation = quat.rotationTo(quat.create(),
        this.refThing.getUpNose(vec3.create()),
        normalToCamera);

    var deltaPitch = vec3.pitchTo(
        world.hero.position,
        this.position);

    quat.rotateX(spriteRotation,
        spriteRotation,
        deltaPitch);
    quat.multiply(this.upOrientation,
        this.refThing.upOrientation,
        spriteRotation);

    // TODO: Figure out why this is backwards.
    quat.rotateY(this.upOrientation,
        this.upOrientation,
        PI)
  }
};


HealthBar.prototype.getHealthPercent = function() {
  return this.refThing.health / 100;
};


HealthBar.prototype.updateHealth = function() {  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.pane.vertexBuffer);
  this.pane.verticies[3] = 
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();
  this.pane.verticies[6] = 
      this.pane.verticies[0] + this.pane.size[0] * this.getHealthPercent();

  gl.bufferSubData(gl.ARRAY_BUFFER, 0,
      new Float32Array(this.pane.verticies));

  this.pane.color[0] = (100 - this.refThing.health)/ 100.0;
  this.pane.color[1] = this.refThing.health / 100.0;
};


HealthBar.prototype.draw = function() {
  if (!this.visible) return;
  shaderProgram.setUseLighting(false);
  util.base(this, 'draw');
  shaderProgram.setUseLighting(true);
}