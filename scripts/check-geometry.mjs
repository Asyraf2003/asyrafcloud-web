import assert from 'node:assert/strict';
import {buildSculptureMesh} from '../dist/webgl.js';
let triangles=0;
for(let part=0;part<8;part++){
  const mesh=buildSculptureMesh(part);
  assert.equal(mesh.length%24,0,'Each triangle has three interleaved vertices');
  for(let i=0;i<mesh.length;i+=8){
    for(let j=0;j<8;j++)assert.ok(Number.isFinite(mesh[i+j]),'Coordinates, normals and UVs must be finite');
    assert.ok(Math.abs(Math.hypot(mesh[i+3],mesh[i+4],mesh[i+5])-1)<.001,'Lighting requires unit normals');
    assert.ok(Math.hypot(mesh[i],mesh[i+1],mesh[i+2])<4,'Members stay within the framing envelope');
  }
  triangles+=mesh.length/24;
}
console.log(`PASS: ${triangles} sculpture triangles, finite attributes, unit normals, bounded geometry.`);
