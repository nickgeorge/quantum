Sphere = function(message) {
  this.super(message);
  this.radius = message.radius || 1;
  this.longitudeCount = message.longitudeCount || 25;
  this.latitudeCount = message.latitudeCount || 25;
  this.color = message.color;

  this.normalBuffer = null;
  this.vertexBuffer = null;
  this.indexBuffer = null;
  this.textureBuffer = null;

  this.texture = message.texture;

  this.initBuffers();
  this.klass = 'Sphere';
};
util.inherits(Sphere, Thing);

Sphere.prototype.draw = function() {
  gl.pushModelMatrix();
  this.transform();
  this.render();
  gl.popModelMatrix();
};

Sphere.prototype.render = function() {
  Textures.bindTexture(this.texture || Textures.MOON);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  if (this.texture) {
    if (!this.texture.loaded) return;
    shaderProgram.setUseTexture(true);
  } else {
    shaderProgram.setUseTexture(false);
  }
  if (this.color) {
    shaderProgram.setUniformColor(this.color);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};

Sphere.prototype.initBuffers = function() {
  var vertexData = [];
  var normalData = [];
  var indexData = [];
  var textureCoordData = [];
  for (var latitude = 0; latitude <= this.latitudeCount; latitude++) {
    var theta = latitude * Math.PI / this.latitudeCount;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    for (var longitude = 0; longitude <= this.longitudeCount; longitude++) {
      var phi = longitude * 2*Math.PI / this.longitudeCount;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longitude / this.longitudeCount);
      var v = 1 - (latitude / this.latitudeCount);

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
      vertexData.push(this.radius * x);
      vertexData.push(this.radius * y);
      vertexData.push(this.radius * z);
      textureCoordData.push(u);
      textureCoordData.push(v);

      if (longitude == this.longitudeCount || latitude == this.latitudeCount) {
        continue;
      }

      var firstIndex = latitude*(this.longitudeCount + 1) + longitude;
      var secondIndex = firstIndex + this.longitudeCount + 1;
      indexData.push(firstIndex);
      indexData.push(secondIndex);
      indexData.push(firstIndex + 1);

      indexData.push(secondIndex);
      indexData.push(secondIndex + 1);
      indexData.push(firstIndex + 1);
    } 
  }

  this.normalBuffer = util.generateBuffer(normalData, 3);
  this.vertexBuffer = util.generateBuffer(vertexData, 3);
  this.textureBuffer = util.generateBuffer(textureCoordData, 2);
  indexData.reverse();
  this.indexBuffer = util.generateIndexBuffer(indexData);
};

// DumbCrate.prototype.contains = function(v, opt_extra) {
//   var extra = opt_extra || 0;
//   var squaredDistance = vec3.squaredDistance(v, this.position);
//   return squaredDistance > util.square(this.radius + extra);
// };

