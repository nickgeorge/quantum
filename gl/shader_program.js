ShaderProgram = function() {}

ShaderProgram.USE_TEXTURE_DEFAULT = false;
ShaderProgram.USE_LIGHTING_DEFAULT = true;
ShaderProgram.UNIFORM_COLOR_DEFAULT = [1, 1, 1, 1];

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

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.perspectiveMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPerspectiveMatrix');
  shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
  shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
  shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, 'uAmbientColor');
  shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingLocation');
  shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, 'uPointLightingColor');

  shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, 'uUseLighting');
  shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, 'uUseTexture');
  shaderProgram.uniformColor = gl.getUniformLocation(shaderProgram, 'uColor');

  for (var key in ShaderProgram.prototype) {
    shaderProgram[key] = ShaderProgram.prototype[key];
  }

  shaderProgram.reset();
  return shaderProgram;
};

ShaderProgram.prototype.reset = function() {
  this.setUseLighting(ShaderProgram.USE_LIGHTING_DEFAULT);
  this.setUseTexture(ShaderProgram.USE_TEXTURE_DEFAULT)
  this.setUniformColor(ShaderProgram.UNIFORM_COLOR_DEFAULT)
};

ShaderProgram.prototype.setUseLighting = function(useLighting) {
  gl.uniform1i(this.useLightingUniform, useLighting);
};

ShaderProgram.prototype.setUseTexture = function(useTexture) {
  gl.uniform1i(this.useTextureUniform, useTexture);
};

ShaderProgram.prototype.setUniformColor = function(uniformColor) {
  gl.uniform4fv(this.uniformColor, uniformColor);
};

