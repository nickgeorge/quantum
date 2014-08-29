goog.provide('Textures');

goog.require('GL');


Textures = {
  gl: null,
  ROOT: 'media/images/',
  byText: {}
};

Textures.initTextures = function(gl) {
  Textures.gl = gl;
  var textures = {
    CRATE: Textures.initTexture(Textures.ROOT + 'crate.png'),
    THWOMP: Textures.initTexture(Textures.ROOT + 'adambw.png'),
    GRASS: Textures.initTexture(Textures.ROOT + 'grass.png'),
    SPARK: Textures.initTexture(Textures.ROOT + 'spark.png'),
    ENERGY: Textures.initTexture(Textures.ROOT + 'energybwa.png'),
    QUESTION: Textures.initTexture(Textures.ROOT + 'question.png'),
    MOON: Textures.initTexture(Textures.ROOT + 'moon.gif'),
    EARTH: Textures.initTexture(Textures.ROOT + 'earth_bright.jpg'),
    SUN: Textures.initTexture(Textures.ROOT + 'sun.gif'),
    FLOOR: Textures.initTexture(Textures.ROOT + 'floor.png'),
    BYZANTINE: Textures.initTexture(Textures.ROOT + 'byzantine.jpg'),
    WALL: Textures.initTexture(Textures.ROOT + 'wall.png'),
    PLASMA: Textures.initTexture(Textures.ROOT + 'plasma.jpg'),
    FACE: Textures.initTexture(Textures.ROOT + 'face.jpg'),
    KARL: Textures.initTexture(Textures.ROOT + 'karl.jpg'),
  };

  for (key in textures) {
    Textures[key] = textures[key];
  }
};


Textures.initTexture = function(src) {
  var texture = Textures.gl.createTexture();
  texture.image = new Image();
  texture.loaded = false;
  texture.image.onload = function() {
    Textures.packageTexture(texture);
  }
  texture.image.src = src;
  return texture;
};

Textures.packageTexture = function(texture) {
  var gl = Textures.gl;
  gl.bindTexture(GL.TEXTURE_2D, texture);
  gl.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
  gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_NEAREST);
  // gl.texParameterf(GL.TEXTURE_2D, GL.extensions.anisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  gl.generateMipmap(GL.TEXTURE_2D);
  texture.loaded = true;
};

Textures.getTextTexture = function(message) {
  if (message.key) {
    var cachedTexture = Textures[message.key];
    if (cachedTexture) {
      return cachedTexture;
    }
  }

  // draw texture

  var hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.id = "hiddenCanvas";
  hiddenCanvas.style.display = "none";
  hiddenCanvas.width = 64;
  hiddenCanvas.height = 64;
  var body = document.getElementsByTagName("body")[0];
  body.appendChild(hiddenCanvas);  


  hiddenCanvas = document.getElementById('hiddenCanvas');
  hiddenCanvas.width = message.width;
  hiddenCanvas.height = message.height;
  var ctx = hiddenCanvas.getContext('2d');
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);            
  ctx.fillStyle = message.backgroundColor || 'rgba(255, 255, 255, 1)';
  ctx.fill();
  ctx.fillStyle = message.textColor || 'rgba(0, 0, 0, 1)';
  ctx.font = message.font || 'bold 60px Monaco';
  ctx.textAlign = 'center';            
  ctx.fillText(message.text, ctx.canvas.width / 2, ctx.canvas.height - 10);
  ctx.restore();        

  // create new texture
  var gl = Textures.gl;
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hiddenCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  // gl.texParameterf(gl.TEXTURE_2D, gl.extensions.anisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  gl.generateMipmap(gl.TEXTURE_2D);

  texture.loaded = true;
  if (message.key) Textures[message.key] = texture;
  return texture;
};
