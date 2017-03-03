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
matrixColumns = 2048;
matrixRows    = 2048;
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

// Assume contact_count < 21K (65K / 3) ~ 2^8 (256x256) for texture size
function connsToBuffer(conns) {
  let connsList = new Float32Array(Math.pow(Math.pow(2,8), 2));
  let index = 0;
  
  let now = performance.now();
  Object.entries(conns).forEach(([cellName, cell]) => {
    cell.forEach(contact => { 
      connsList[index]     = contact.post.x;
      connsList[index + 1] = contact.post.y;
      connsList[index + 2] = contact.post.z;
      index += 3;
    });
  });

  // console.log('done in', (performance.now() - now), 'ms');
  return connsList;
}

let connsBuffer = connsToBuffer(conns);
debugger;


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

    square128 = new Square128(gpgpUtility);
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