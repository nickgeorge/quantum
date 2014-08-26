HUD = function(world, canvas, heroListener, framerate) {
  this.world = world;
  this.canvas = canvas;
  this.heroListener = heroListener;
  this.context = canvas.getContext('2d');
  this.hero = null;
  this.framerate = framerate;
  this.isRendering = true;
  this.logger = new Logger(this.context, 25, -300);

  this.widgets = [];

  this.widgets.push(this.logger);
  this.widgets.push(new Crosshair(this.context));
  this.widgets.push(new Fraps(this.context, -100, 25, framerate));
  var thisHud = this;
  setTimeout(function(){
    thisHud.widgets.push(new StartButton(thisHud.context, thisHud.heroListener,
        thisHud.canvas.height/2, thisHud.canvas.width/2))}, 0);
};

HUD.prototype.render = function() {
  if (this.isRendering) {
    this.clear();
    util.array.forEach(this.widgets, function(widget) {
      widget.render();
    });
  }
};

HUD.prototype.resize = function() {
  util.array.forEach(this.widgets, function(widget) {
    widget.resize();
  });
};

HUD.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

HUD.prototype.getLogger = function() {
  return this.logger;
};

Widget = function(context, x, y, font, fillStyle) {
  this.context = context;
  this.x = x;
  this.y = y;
  this.font = font;
  this.fillStyle = fillStyle;

  this.resize();
};

Widget.prototype.resize = function() {
  this.position = [
    this.x > 0 ? this.x : this.context.canvas.width + this.x,
    this.y > 0 ? this.y : this.context.canvas.height + this.y
  ];
};

Widget.prototype.setFont = function(opt_font, opt_fillStyle) {
  this.context.font = opt_font || this.font;
  this.context.fillStyle = opt_fillStyle || this.fillStyle;
};

Fraps = function(context, x, y, framerate) {
  util.base(this, context, x, y, 'bold 16px courier');
  this.framerate = framerate;
};
util.inherits(Fraps, Widget);

Fraps.prototype.render = function() {
  var fraps = this.framerate.rollingAverage;
  this.setFont(null, fraps < 45 ? '#F00' : '#0F0');
  this.context.fillText('FPS: ' + fraps,
      this.position[0], this.position[1]);
};

Crosshair = function(context, world) {
  util.base(this, context,
      context.canvas.width / 2,
      context.canvas.height / 2);
  this.world = world;
};
util.inherits(Crosshair, Widget);

Crosshair.prototype.resize = function() {
  this.position = [
    this.context.canvas.width / 2,
    this.context.canvas.height / 2
  ];
};

Crosshair.prototype.render = function() {
  this.context.strokeStyle = '#ff0000';
  this.context.translate(this.position[0], this.position[1]);
  this.context.beginPath();
  this.context.moveTo(-10,  0);
  this.context.lineTo(10, 0);
  this.context.stroke();
  this.context.beginPath();
  this.context.moveTo(0, -10);
  this.context.lineTo(0, 10);
  this.context.stroke();
  this.context.translate(-this.position[0], -this.position[1]);
};

Logger = function(context, x, y) {
  util.base(this, context, x, y, 'bold 20px courier', '#0F0');

  this.activeLines = 0;
  this.maxLinesToShow = 3;
  this.index = 0;
  this.lines = [];
};
util.inherits(Logger, Widget);

Logger.prototype.log = function(line) {
  this.lines.push(line);
  this.activeLines = Math.min(this.maxLinesToShow, this.activeLines + 1);
  setTimeout(util.bind(this.fade, this), 5000);
};

Logger.prototype.fade = function() {
  this.activeLines = Math.max(0, this.activeLines - 1);
};

Logger.prototype.render = function() {
  if (!this.activeLines) return;
  this.setFont();
  var length = this.lines.length;

  this.context.fillText(this.lines[length - 1],
      this.position[0], this.position[1]);
  this.setFont('16px courier', '#AAA');
  for (var i = 1; i < this.activeLines && i < this.maxLinesToShow; i++) {
    var line = this.lines[length - i - 1];
    if (!line) return;
    this.context.fillText(line,
        this.position[0], this.position[1] + 25*(i));
  }
};

StartButton = function(context, heroListener, x, y) {
  util.base(this, context, x, y, '56px wolfenstein', '#FFF');
  this.heroListener = heroListener;
};
util.inherits(StartButton, Widget);


StartButton.prototype.render = function() {
  if (this.heroListener.mouseIsLocked) return;
  this.setFont();
  this.context.fillText('Klicken f' + String.fromCharCode(252) + 'r St' + String.fromCharCode(228) + 'rten',
      this.context.canvas.width/2 - 200, this.context.canvas.height/2 - 75); 
};

