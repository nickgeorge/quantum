Gimble = function(message) {
  message.rYaw = -2.76;
  goog.base(this, message);
  this.referenceObject = message.referenceObject;

  this.sphere = new Sphere({
    radius: .008,
    color: [1, 1, 1, .2]
  });
  this.downPointer = new OffsetBox({
    size: [.001, .008, .001],
    color: [1, 0, 0, .5],
    offset: [0, -.004, 0],
    position: [0, 0, 0]
  });
  this.upPointer = new OffsetBox({
    size: [.001, .008, .001],
    color: [0, 1, 0, .5],
    offset: [0, .004, 0],
    position: [0, 0, 0]
  });
  this.plane = new Box({
    size: [.012, .0005, .012],
    color: [0, 0, 1, .5],
    position: [0, 0, 0]
  });

  this.offset = [-.12, 0, -.2];

  this.addPart(this.downPointer);
  this.addPart(this.upPointer);
  this.addPart(this.plane);
  this.addPart(this.sphere);

  this.isRoot = true;

  this.objectCache.gimble = {
    eyePosition: vec3.create()
  };
};
goog.inherits(Gimble, Thing);
Gimble.type = Types.Gimble;


Gimble.prototype.advance = function(dt) {
  if (this.referenceObject) {
    var cache = this.objectCache.gimble;
    vec3.add(this.position,
        this.referenceObject.getEyePosition(cache.eyePosition),
        vec3.transformQuat(vec3.temp,
            vec3.transformQuat(vec3.temp,
                this.offset,
                this.referenceObject.viewRotation),
            this.referenceObject.upOrientation));

    quat.rotateY(this.upOrientation,
        this.referenceObject.upOrientation,
        2.6);
  }
};


Gimble.prototype.getOuterRadius = function() {
  return 0;
};
