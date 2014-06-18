Animator = function(world, hud, gl, framerate) {
  this.world = world;
  this.hud = hud;
  this.gl = gl;
  this.framerate = framerate;
  this.paused = false;

  this.boundTick = util.bind(this.tick, this);
};


Animator.prototype.start = function() {
  this.drawScene();
  this.tick();
};


Animator.prototype.setPaused = function(paused) {
  this.paused = paused;
};


Animator.prototype.tick = function() {
  window.requestAnimationFrame(this.boundTick);
  if (this.paused) {
    this.hud.render();
    return;
  }
  this.advanceWorld();
  this.drawScene();
  this.hud.render();
};


Animator.prototype.drawScene = function() {
  this.gl.reset();
  this.world.draw();
};


Animator.prototype.advanceWorld = function() {
  var timeNow = new Date().getTime();
  if (this.framerate.lastTime != 0) {
    var elapsed = timeNow - this.framerate.lastTime;
    if (elapsed < 100) {
      var dt = elapsed/1000;
      this.world.advance(dt);
      this.framerate.snapshot();
    }
  }
  this.framerate.lastTime = timeNow;
};