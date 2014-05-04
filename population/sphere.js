Sphere = function(message) {
  message.leaf = true;
  this.super(message);
  this.radius = message.radius || 1;
  this.longitudeCount = message.longitudeCount || 25;
  this.latitudeCount = message.latitudeCount || 25;

  this.createBuffers();
  this.klass = 'Sphere';
};
util.inherits(Sphere, LeafThing);
Sphere.type = Types.SPHERE;


/** Parent Coords! */
Sphere.prototype.findEncounter = function(p_0_pc, p_1_pc,
    opt_intersectionOnly) {
  var p_0 = this.toLocalCoords([], p_0_pc);
  var delta = this.toLocalCoords([], p_1_pc);
  vec3.subtract(delta, delta, p_0);

  var quadratic = Quadratic.newLineToPointQuadratic(p_0, delta, this.radius);
  if (quadratic.rootCount() > 0) {
    // n.b. t_0 <= t_1 because a > 0 (local min), so we only care about the 
    // root that uses the negative discriminant. 
    // If t_1 ∈ [0, 1], but t_0 is not, that means the object originated
    // from within the sphere.  Maybe someday I'll care about that, for now I don't.
    var t = quadratic.firstRoot();
    if (Quadratic.inFrame(t)) {
      // We've got a relevant root.  Closest distance is zero
      return this.makeEncounter(t, 0, vec3.scaleAndAdd([], p_0, delta, t));
    }
  }
  if (opt_intersectionOnly) return null;

  // No roots in range t ∈ [0, 1].  Test if there is a local min.
  var localMinT = quadratic.minT();
  if (Quadratic.inFrame(localMinT)) {
    return this.makeEncounter(localMinT, quadratic.valueAt(localMinT));
  }

  // No local min.  Return min of the extremes.
  var valueAtZero = quadratic.valueAt(0);
  var valueAtOne = quadratic.valueAt(1);
  if (valueAtZero < valueAtOne) {
    return this.makeEncounter(0, valueAtZero);
  }  else {
    return this.makeEncounter(1, valueAtOne);
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


Sphere.prototype.makeEncounter = function(t, distanceSquared, point) {
  return {
    part: this,
    t: t,
    distanceSquared: distanceSquared,
    point: point
  }
};

