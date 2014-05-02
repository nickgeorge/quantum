Quadratic = function(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
  this.discriminant = b*b - 4*a*c;
};


Quadratic.prototype.valueAt = function(t) {
  return this.a*t*t + this.b*t + this.c;
};


Quadratic.prototype.rootCount = function() {
  if (this.discriminant > 0) return 2;
  if (this.discriminant == 0) return 1;
  return 0;
};

/** returns the lower root */
Quadratic.prototype.firstRoot = function() {
  return (-this.b - Math.sqrt(this.discriminant)) / (2*this.a);
};


Quadratic.prototype.minT = function() {
  return -this.b / (2*this.a);
};


Quadratic.prototype.minValue = function() {
  return this.valueAt(this.minT());
};