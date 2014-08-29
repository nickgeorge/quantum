PaneOutline = function(message){
  util.base(this, message);

  this.elementType = GL.LINES;

  this.pane = message.pane;
  this.color = message.color;

  if (!PaneOutline.inited) {
    PaneOutline.init();
  }

  this.position = this.pane.position;
  this.vertexBuffer = Env.gl.generateBuffer(this.pane.verticies, 3);
  this.indexBuffer = PaneOutline.indexBuffer;
  this.normalBuffer = this.pane.normalBuffer;

};
util.inherits(PaneOutline, LeafThing);
PaneOutline.inited = false;

PaneOutline.indexBuffer = null;

PaneOutline.init = function() {
  PaneOutline.inited = true;

  var vertexNormals = [
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
  ];
  PaneOutline.normalBuffer = Env.gl.generateBuffer(vertexNormals, 3);

  var vertexIndices = [
    0, 1, 
    1, 2,
    2, 3,
    3, 0
  ];
  PaneOutline.indexBuffer = Env.gl.generateIndexBuffer(vertexIndices);
};