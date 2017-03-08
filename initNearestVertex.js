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
let conns;

matrixColumns = 1024;
matrixRows    = 1024;
gpgpUtility   = new vizit.utility.GPGPUtility(matrixColumns, matrixRows, {premultipliedAlpha:false});

// Load conns data
let connsPromise = fetch(`./conns-10010.json`) // Check if this data exists...
.then(function(res) {
    return res.json();
})
.then(function(data) {
    let connsList = new Float32Array(matrixColumns * matrixRows * 3);
    let index = 0;
    
    Object.entries(data).forEach(([cellName, cell]) => {
      cell.forEach(contact => {
        connsList[index + 0] = contact.post.x;
        connsList[index + 1] = contact.post.y;
        connsList[index + 2] = contact.post.z;
        index += 3;
      });
    });  

    return connsList;

}).catch(() => {
    console.log('conns promise rejected for', reason);
});

// Load verts data
let vertsPromise = fetch("./verts-10010.bin").then((res) => {
    return res.arrayBuffer();
})
.then((ab) => {
    let vbuff = new Float32Array(ab);
        vbuff = makeFloat32Buffer(vbuff, 1024, 3); // Resize buffer for gpu texture 
        return vbuff;
}).catch(() => {
    console.log('geometry promise rejected for', reason);
});

Promise.all([connsPromise, vertsPromise]).then(([cbuff,vbuff]) => {
    window.cbuff = cbuff;
    window.vbuff = vbuff;
    window.conns = conns;
    
    // Then load up the gpu textures, setup the class
    let obuff = makeFloat32Buffer(null, 1024, 3);
    initGPU(vbuff, cbuff, obuff);
});

// Size = matrixColumns * matrixRows * 3
function makeFloat32Buffer(data, size, elems) {
  let buff = new Float32Array(size * size * elems);
  if (data) {
    data.forEach((d, i) => buff[i] = d);
  }  
  return buff;
}

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