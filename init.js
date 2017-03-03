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

matrixColumns = 128;
matrixRows    = 128;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

// if (gpgpUtility.isFloatingTexture()) {
//   // Height and width are set in the constructor.
//   texture      = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
//   framebuffer  = gpgpUtility.attachFrameBuffer(texture);

//   bufferStatus = gpgpUtility.frameBufferIsComplete();

//   if (bufferStatus.isComplete) {
//     initializer = new MatrixInitializer(gpgpUtility);
//     initializer.initialize(matrixColumns, matrixRows);

//     // Delete resources no longer in use.
//     initializer.done();

//     // Tests, terminate on first failure.
//     initializer.test(  0,   0)
//     && initializer.test( 10,  10)
//     && initializer.test(100, 100);

//     console.log('p');

//   }
//   else {
//     alert(bufferStatus.message);
//   }
// }
// else {
//   alert("Floating point textures are not supported.");
// }


if (gpgpUtility.isFloatingTexture()) {
  // Height and width are set in the constructor.
  texture      = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
  framebuffer  = gpgpUtility.attachFrameBuffer(texture);

  texture2     = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
  framebuffer2 = gpgpUtility.attachFrameBuffer(texture2);

  bufferStatus = gpgpUtility.frameBufferIsComplete();

  if (bufferStatus.isComplete) {
    square128 = new Square128(gpgpUtility);
    square128.square(texture, texture2);

    // Delete resources no longer in use.
    square128.done();

    let table = document.createElement("TABLE");
                  document.body.appendChild(table);

    // Tests, terminate on first failure.
    square128.test(0, 0, table);

    console.log('p');

  }
  else {
    alert(bufferStatus.message);
  }
}
else {
  alert("Floating point textures are not supported.");
}