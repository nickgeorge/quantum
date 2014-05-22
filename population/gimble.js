Gimble = function(message) {
  this.super(message);
  this.referenceObject = message.referenceObject;

  this.sphere = new Sphere({
    radius: .008,
    color: [1, 1, 1, .2]
  });
  this.downPointer = new OffsetBox({
    size: [.0015, .008, .0015],
    color: [1, 0, 0, .5],
    offset: [0, -.004, 0],
    position: [0, 0, 0]
  });
  this.upPointer = new OffsetBox({
    size: [.0015, .008, .0015],
    color: [0, 1, 0, .5],
    offset: [0, .004, 0],
    position: [0, 0, 0]
  });
  this.plane = new LeafBox({
    size: [.012, .001, .012],
    color: [0, 0, 1, .5],
    position: [0, 0, 0]
  });

  this.offset = [-.08, 0, -.2];

  this.addPart(this.downPointer);
  this.addPart(this.upPointer);
  this.addPart(this.plane);
  this.addPart(this.sphere);

  this.isRoot = true;
};
util.inherits(Gimble, Thing);
Gimble.type = Types.Gimble;


Gimble.prototype.advance = function(dt) {
  this.advanceBasics(dt);
  this.saveLastPosition();
  if (this.referenceObject) {
    vec3.add(this.position, this.referenceObject.position,
        vec3.transformQuat(vec3.temp,
            this.offset,
            this.referenceObject.viewOrientation));

    quat.copy(this.upOrientation, this.referenceObject.upOrientation);

    // var normalToCamera = vec3.pointToLine(vec3.create(),
    //     this.position,
    //     world.hero.position,
    //     this.getNormal(vec3.create()));

    // var spriteRotation = quat.rotationTo(quat.create(),
    //     this.getUpNose(vec3.create()),
    //     normalToCamera);

    // quat.multiply(this.upOrientation,
    //     this.upOrientation,
    //     spriteRotation);


  }
};


Gimble.prototype.getOuterRadius = function() {
  return 0;
};