Sphere = function(radius, rgba1) {
  this.radius = radius || 1;
  this.longitudeCount = 15;
  this.latitudeCount = 15;
  this.rgba1 = rgba1;
  this.rgba2 = Vector.reverseColor(this.rgba1);
  this.orientation = [2*Math.random() - .5, 2*Math.random() - .5, 0];
  this.rotationSpeed = Math.random();
  this.phase = 0;

  this.position = [0, 0, 0];

  this.normalBuffer = null;
  this.colorBuffer = null;
  this.vertexBuffer = null;
  this.indexBuffer = null;

  this.initBuffers();
};

Sphere.prototype.advance = function(dt){
  this.phase += this.rotationSpeed * dt;
};

Sphere.prototype.draw = function() {
  gl.pushMatrix();

  mat4.translate(gl.mvMatrix, gl.mvMatrix, this.position);
  mat4.rotate(gl.mvMatrix, gl.mvMatrix, util.degToRad(this.phase), this.orientation);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  gl.popMatrix();
};

Sphere.prototype.initBuffers = function() {
  var vertexData = [];
  var normalData = [];
  var indexData = [];
  var colorData = [];
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

      var color = Math.random() > .5 ? this.rgba1 : this.rgba2;

      colorData.push(color[0]);
      colorData.push(color[1]);
      colorData.push(color[2]);
      colorData.push(color[3]);

      normalData.push(x);
      normalData.push(y);
      normalData.push(z);
      vertexData.push(this.radius * x);
      vertexData.push(this.radius * y);
      vertexData.push(this.radius * z);

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

  this.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData),
      gl.STATIC_DRAW);
  this.normalBuffer.itemSize = 3;
  this.normalBuffer.numItems = normalData.length/3;

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
      gl.STATIC_DRAW);
  this.vertexBuffer.itemSize = 3;
  this.vertexBuffer.numItems = vertexData.length/3;

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData),
      gl.STATIC_DRAW);
  this.indexBuffer.itemSize = 1;
  this.indexBuffer.numItems = indexData.length;

  this.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData),
    gl.STATIC_DRAW);
  this.colorBuffer.itemSize = 4;
  this.colorBuffer.numItems = colorData.length/4;
};
