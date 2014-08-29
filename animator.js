goog.provide('Animator');

goog.require('Framerate');


/** @private */
Animator = function(world, hud) {
  this.world = world;
  this.hud = hud;
  this.framerate = new Framerate();
  this.paused = true;

  this.boundTick = util.bind(this.tick, this);
};
Animator.instance_ = null;

Animator.initSingleton = function(world, hud) {
  util.assertNull(Animator.instance_,
      'Cannot init Animator: already init\'d');

  Animator.instance_ = new Animator(world, hud);
  return Animator.instance_;
};

Animator.getInstance = function() {
  return Animator.instance_;
}

Animator.prototype.start = function() {
  this.drawScene();
  this.tick();
};


Animator.prototype.setPaused = function(paused) {
  this.paused = paused;
};


Animator.prototype.togglePause = function() {
  this.paused = !this.paused;
};


Animator.prototype.isPaused = function() {
  return this.paused;
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


Animator.prototype.getRollingAverageFramerate = function() {
  return this.framerate.rollingAverage;
};


Animator.prototype.profile = function(t) {
  this.paused = false;
  console.profile();
  setTimeout(function(){
    console.profileEnd();
    this.paused = true;
  }, t*1000);
};