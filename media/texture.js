Textures = {};
Textures.ROOT = 'media/images/';

Textures.bindTexture = function(texture) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
};

Textures.initTextures = function() {
  var textures = {
    CRATE: Textures.initTexture(Textures.ROOT + 'crate_light.png'),
    THWOMP: Textures.initTexture(Textures.ROOT + 'adambw.png'),
    GRASS: Textures.initTexture(Textures.ROOT + 'grass.png'),
    SPARK: Textures.initTexture(Textures.ROOT + 'spark.png'),
    ENERGY: Textures.initTexture(Textures.ROOT + 'energybwa.png'),
    QUESTION: Textures.initTexture(Textures.ROOT + 'question.png'),
    MOON: Textures.initTexture(Textures.ROOT + 'moon.gif'),
    EARTH: Textures.initTexture(Textures.ROOT + 'earth_light.jpg'),
    SUN: Textures.initTexture(Textures.ROOT + 'sun.gif'),
    FLOOR: Textures.initTexture(Textures.ROOT + 'floor.png'),
    GREEN_PLASMA: Textures.initTexture(Textures.ROOT + 'green_plasma.jpg')
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  // gl.texParameterf(gl.TEXTURE_2D, gl.extensions.anisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  gl.generateMipmap(gl.TEXTURE_2D);
  texture.loaded = true;
};
