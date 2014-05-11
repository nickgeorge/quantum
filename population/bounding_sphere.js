BoundingSphere = function(message) {
  this.thing = message.thing;
  this.radius = message.radius;
};

BoundingSphere.prototype.check = function(otherThing) {
  var quadratic = Quadratic.newLineToPointQuadratic(
      otherThing.position,
      otherThing.getDeltaP(vec3.temp),
      this.thing.position,
      this.radius);

  return Quadratic.inFrame(quadratic.firstRoot());
};