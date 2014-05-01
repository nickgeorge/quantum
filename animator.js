Animator = function(world, hud, gl, framerate) {
  this.world = world;
  this.hud = hud;
  this.gl = gl;
  this.framerate = framerate;
  this.paused = false;
};


Animator.prototype.start = function() {
  this.drawScene();
  this.tick();
};


Animator.prototype.setPaused = function(paused) {
  this.paused = paused;
};


Animator.prototype.tick = function() {
  window.requestAnimationFrame(util.bind(this.tick, this));
  if (this.paused) return;
  this.advanceWorld();
  this.drawScene();
};


Animator.prototype.drawScene = function() {
  this.gl.reset();
  this.world.draw();
  this.hud.render();
};


Animator.prototype.advanceWorld = function() {
  var timeNow = new Date().getTime();
  if (this.framerate.lastTime != 0) {
    var elapsed = timeNow - this.framerate.lastTime;
    if (elapsed < 100) {
      var dt = elapsed/1000;
      this.world.advance(dt);
    }
    this.framerate.snapshot();
  }
  this.framerate.lastTime = timeNow;
};