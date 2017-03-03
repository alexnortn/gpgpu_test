"use strict";

let bufferStatus;
let gpgpUtility;
let initializer;
let nearestVertex;
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
let vertsBuffer;

fetch("./verts-10010.bin").then((res) => {
    return res.arrayBuffer();
})
.then((ab) => {
    vertsBuffer = new Float32Array(ab);
});

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

    // nearestVertex = new NearestVertex(gpgpUtility);
    // nearestVertex.go(texture, texture2);

    // Delete resources no longer in use.
    // nearestVertex.done();

    let table = document.createElement("TABLE");
                document.body.appendChild(table);

    // Tests, terminate on first failure.
    // nearestVertex.test(0, 0, table);
  }
  else {
    alert(bufferStatus.message);
  }
}
else {
  alert("Floating point textures are not supported.");
}