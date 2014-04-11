

util.generateBuffer = function(primitives, itemSize, opt_bufferType) {
  var bufferType = opt_bufferType || gl.ARRAY_BUFFER;
  var buffer = gl.createBuffer();
  gl.bindBuffer(bufferType, buffer);
  gl.bufferData(bufferType,
      new Float32Array(primitives), gl.STATIC_DRAW);
  buffer.itemSize = itemSize;
  buffer.numItems = primitives.length / itemSize;
  return buffer;
};

util.generateIndexBuffer = function(primitives) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(primitives), gl.STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numItems = primitives.length;

  return buffer;
};