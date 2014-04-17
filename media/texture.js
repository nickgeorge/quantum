Textures = {};
Textures.ROOT = 'media/images/';

Textures.bindTexture = function(texture) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
};

Textures.initTextures = function() {
  var textures = {
    CRATE: Textures.initTexture(Textures.ROOT + 'crate.png'),
    THWOMP: Textures.initTexture(Textures.ROOT + 'adambw.png'),
    GRASS: Textures.initTexture(Textures.ROOT + 'grass.png'),
    SPARK: Textures.initTexture(Textures.ROOT + 'spark.png'),
    ENERGY: Textures.initTexture(Textures.ROOT + 'energybwa.png'),
    QUESTION: Textures.initTexture(Textures.ROOT + 'question.png'),
    FLOOR: Textures.initTexture(Textures.ROOT + 'floor.png')
  };

  for (key in textures) {
    Textures[key] = textures[key];
  }
};

Textures.initTexture = function(src) {
  var texture = gl.createTexture();
  texture.image = new Image();
  texture.loaded = false;
  texture.image.onload = function() {
    Textures.packageTexture(texture);
  }
  texture.image.src = src;
  return texture;
};

Textures.packageTexture = function(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.loaded = true;
};
