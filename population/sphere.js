Sphere = function(message) {
  message.leaf = true;
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

  this.createBuffers();
  this.klass = 'Sphere';
};
util.inherits(Sphere, Thing);


Sphere.prototype.findIntersection = function(p_0, p_1) {
  p_0 = this.toLocalCoords(vec3.create(), p_0);
  p_1 = this.toLocalCoords(vec3.create(), p_1);
  var delta = vec3.subtract([], p_1, p_0);
  var a = 0, b = 0, c = 0;

  for (var i = 0; i < 3; i++) {
    a += util.math.sqr(delta[i]);
    b += 2 * delta[i] * (p_0[i]);
    c += util.math.sqr(p_0[i]);
  }
  c -= util.math.sqr(this.radius);

  var discriminant = b*b - 4*a*c;
  if (discriminant < 0) return null;

  // TODO: If both points are on one side, we can return.

  var rootDiscriminant = Math.sqrt(discriminant);
  // n.b. t_0 < t_1 because a > 0 (local min)
  var t_0 = (-b - rootDiscriminant)/(2*a);
  var t_1 = (-b + rootDiscriminant)/(2*a);
  var t = t_0 >= 0 ? t_0 : t_1;
  if (t < 0 || t > 1) return null;


  var closestPoint = vec3.scaleAndAdd([], p_0, delta, t);
  return {
    part: this,
    t: t,
    point: closestPoint
  }
};

Sphere.prototype.createBuffers = function() {
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
