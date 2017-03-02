"use strict";

var bufferStatus;
var framebuffer;
var gpgpUtility;
var initializer;
var matrixColumns;
var matrixRows;
var texture;

matrixColumns = 128;
matrixRows    = 128;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

if (GPGPUtility.isFloatingTexture())
{
  // Height and width are set in the constructor.
  texture      = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
  framebuffer  = gpgpUtility.attachFrameBuffer(texture);

  bufferStatus = gpgpUtility.frameBufferIsComplete();

  if (bufferStatus.isComplete)
  {
    initializer = new MatrixInitializer(gpgpUtility);
    initializer.initialize(matrixColumns, matrixRows);

    // Delete resources no longer in use.
    initializer.done();

    // Tests, terminate on first failure.
    initializer.test(  0,   0)
    && initializer.test( 10,  12)
    && initializer.test(100, 100);
  }
  else
  {
    alert(bufferStatus.message);
  }
}
else
{
  alert("Floating point textures are not supported.");
}