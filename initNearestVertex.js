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

matrixColumns = 1024;
matrixRows    = 1024;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

// Assume contact_count < 21K (65K / 3) ~ 2^8 (256x256) for texture size
function connsToBuffer(conns) {
  let connsList = new Float32Array(matrixColumns * matrixRows * 3);
  let index = 0;
  
  Object.entries(conns).forEach(([cellName, cell]) => {
    cell.forEach(contact => { 
      connsList[index + 0] = contact.post.x;
      connsList[index + 1] = contact.post.y;
      connsList[index + 2] = contact.post.z;
      index += 3;
    });
  });  
  return connsList;
}

// Size = matrixColumns * matrixRows * 3
function makeFloat32Buffer(data, size, elems) {
  let buff = new Float32Array(size * size * elems);
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
        vbuff = makeFloat32Buffer(vbuff, 1024, 3); // Resize buffer for gpu texture 
    let obuff = makeFloat32Buffer(null, 1024, 3);
    let cbuff = connsToBuffer(conns);
    // Then load up the gpu textures, setup the class
    initGPU(vbuff, cbuff, obuff);
});

function initGPU(vbuff, cbuff, obuff) {
  if (gpgpUtility.isFloatingTexture()) {
    let gl = gpgpUtility.getGLContext();

    // Height and width are set in the constructor.
    connsTexture = gpgpUtility.makeTexture(gl.FLOAT, cbuff);
    vertsTexture = gpgpUtility.makeTexture(gl.FLOAT, vbuff);
    outTexture   = gpgpUtility.makeTexture(gl.FLOAT, obuff);

    bufferStatus = gpgpUtility.frameBufferIsComplete();

    if (bufferStatus.isComplete) {

      nearestVertex = new NearestVertex(gpgpUtility);
      
      let now = performance.now();
      nearestVertex.go(connsTexture, vertsTexture, outTexture);
      console.log("finished in ~", (performance.now() - now), "ms");

      // Delete resources no longer in use
      nearestVertex.done();

      let table = document.createElement("TABLE");
                  document.body.appendChild(table);

      // Tests, terminate on first failure.
      nearestVertex.test();

    }
    else {
      alert(bufferStatus.message);
    }
  }
  else {
    alert("Floating point textures are not supported.");
  }
}