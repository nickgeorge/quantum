DumbCrate = function(message) {
  this.super(message);

  this.size = message.size;
  this.box = new Box({
    size: message.size,
    texture: message.texture
  });

  this.parts = [this.box];
};
util.inherits(DumbCrate, Thing);
DumbCrate.type = Types.DUMB_CRATE;

// DumbCrate.prototype.pushOut = function(v, opt_tolerance, opt_extraPush) {
//   var tolerance = opt_tolerance || 0;
//   var extraPush = opt_extraPush || 0;
//   this.toLocalCoords(v, v); 
//   var closestAxis = undefined;
//   var closestDistance = undefined;
//   var direction = undefined;
//   for (var i = 0; i < 3; i++) {
//     var delta = Math.abs(v[i]) - Math.abs(this.size[i] / 2);
//     if (!closestDistance || Math.abs(delta) < closestDistance ) {
//       closestDistance = Math.abs(delta);
//       closestAxis = i;
//       direction = v[i] > 0 ? 1 : -1;
//     }
//   }
//   if (closestDistance > tolerance) {
//     v[closestAxis] = (this.size[closestAxis]/2 + extraPush) * direction;
//   }
//   this.toWorldCoords(v, v);
// };
