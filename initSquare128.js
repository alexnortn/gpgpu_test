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

// Problem Size
matrixColumns = 128;
matrixRows    = 128;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});


if (gpgpUtility.isFloatingTexture()) {
    let gl = gpgpUtility.getGLContext();
    
    // Manually load up test data into <texture>
    let data = new Float32Array(matrixColumns * matrixRows * 4);
        // data = data.map(() => Math.random() * 128);
        data = data.map((d, i) => i);

  // Height and width are set in the constructor.
  texture      = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
                 gpgpUtility.refreshTexture(texture, gl.FLOAT, data);
  texture2     = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);

  bufferStatus = gpgpUtility.frameBufferIsComplete();

  if (bufferStatus.isComplete) {

    square128 = new NearestVertex(gpgpUtility);
    square128.square(texture, texture2);

    // Delete resources no longer in use.
    square128.done();

    let table = document.createElement("TABLE");
                document.body.appendChild(table);

    // Tests, terminate on first failure.
    square128.test(0, 0, table);
  }
  else {
    alert(bufferStatus.message);
  }
}
else {
  alert("Floating point textures are not supported.");
}