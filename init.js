"use strict";

let bufferStatus;
let gpgpUtility;
let initializer;
let square128;
let matrixColumns;
let matrixRows;
let framebuffer;
let texture;
let framebuffer2;
let texture2;

// Assume vertex_count  < 5M (16M / 3) ~ 2^12 (2048x2048) for texture size
matrixColumns = 128;
matrixRows    = 128;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

if (gpgpUtility.isFloatingTexture()) {
  // Height and width are set in the constructor.
  texture      = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
  framebuffer  = gpgpUtility.attachFrameBuffer(texture);

  bufferStatus = gpgpUtility.frameBufferIsComplete();

  if (bufferStatus.isComplete) {
    initializer = new MatrixInitializer(gpgpUtility);
    initializer.initialize(matrixColumns, matrixRows);

    // Delete resources no longer in use.
    initializer.done();

    // Tests, terminate on first failure.
    initializer.test(  0,   0)
    && initializer.test( 10,  10)
    && initializer.test(100, 100);

    console.log('p');

  }
  else {
    alert(bufferStatus.message);
  }
}
else {
  alert("Floating point textures are not supported.");
}