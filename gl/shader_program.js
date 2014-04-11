ShaderProgram = function() {}

ShaderProgram.USE_TEXTURE_DEFAULT = false;
ShaderProgram.SCALE_DEFAULT = [1, 1, 1];
ShaderProgram.USE_LIGHTING_DEFAULT = true;

ShaderProgram.getShader = function(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = shaderScript.firstChild.textContent;

  var shader;
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

ShaderProgram.createShaderProgram = function() {
  var shaderProgram = gl.createProgram();
  var fragmentShader = ShaderProgram.getShader(gl, 'fragment-shader');
  var vertexShader = ShaderProgram.getShader(gl, 'vertex-shader');

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialise shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = 
      gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
  shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");


  shaderProgram.useTextureUniform = 
      gl.getUniformLocation(shaderProgram, 'uUseTexture');

  for (var key in ShaderProgram.prototype) {
    shaderProgram[key] = ShaderProgram.prototype[key];
  }

  shaderProgram.reset();
  return shaderProgram;
};

ShaderProgram.prototype.reset = function() {
  this.setUseLighting(ShaderProgram.USE_LIGHTING_DEFAULT);
};

ShaderProgram.prototype.setUseLighting = function(useLighting) {
  gl.uniform1i(this.useLightingUniform, useLighting);
};
