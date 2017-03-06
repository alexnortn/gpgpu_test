"use strict";

let bufferStatus;
let gpgpUtility;
let initializer;
let nearestVertex;
let matrixColumns;
let matrixRows;
let framebuffer;
let framebuffer2;
let connsTexture;
let vertsTexture;
let outTexture;

// Assume vertex_count  < 5M (16M / 3) ~ 2^12 (2048x2048) for texture size
matrixColumns = 128;
matrixRows    = 128;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

// Assume contact_count < 21K (65K / 3) ~ 2^8 (256x256) for texture size
function connsToBuffer(conns) {
  let connsList = new Float32Array(matrixColumns * matrixRows * 3);
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

// Size = matrixColumns * matrixRows * 3
function makeFloat32Buffer(data) {
  let buff = new Float32Array(1024 * 1024 * 3);
  
  if (data) {
    data.forEach((d, i) => buff[i] = d);
  }  
  return buff;
}

fetch("./verts-10010.bin").then((res) => {
    return res.arrayBuffer();
})
.then((ab) => {
    let vbuff = new Float32Array(ab);
        vbuff = makeFloat32Buffer(vbuff); // Resize buffer for gpu texture 
    let obuff = makeFloat32Buffer();
    let cbuff = connsToBuffer(conns);
    // Then load up the gpu textures, setup the class
    initGPU(vbuff, cbuff, obuff);
});

function initGPU(vbuff, cbuff, obuff) {
  if (gpgpUtility.isFloatingTexture()) {
    let gl = gpgpUtility.getGLContext();

    // Height and width are set in the constructor.
    connsTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
                  gpgpUtility.refreshTexture(connsTexture, gl.FLOAT, cbuff);

    vertsTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
                  gpgpUtility.refreshTexture(vertsTexture, gl.FLOAT, vbuff);

    outTexture = gpgpUtility.makeTexture(WebGLRenderingContext.FLOAT, null);
                  gpgpUtility.refreshTexture(outTexture, gl.FLOAT, obuff);

    bufferStatus = gpgpUtility.frameBufferIsComplete();

    if (bufferStatus.isComplete) {

      nearestVertex = new NearestVertex(gpgpUtility);
      
      for (let i=0; i < 10; i++) {
        let now = performance.now();
        nearestVertex.go(connsTexture, vertsTexture, outTexture);
        console.log("finished in ", (performance.now() - now), "ms");
      }
      
      // Delete resources no longer in use.
      nearestVertex.done();

      let table = document.createElement("TABLE");
                  document.body.appendChild(table);

      // Tests, terminate on first failure.
      nearestVertex.test(0, 0, table);
      debugger;
    }
    else {
      alert(bufferStatus.message);
    }
  }
  else {
    alert("Floating point textures are not supported.");
  }
}