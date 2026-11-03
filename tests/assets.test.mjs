import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const models = [
  ['assets/personagens/jill.glb', true, ['Walking','Running']],
  ['assets/personagens/dra-lima.glb', true, ['Walking','Running']],
  ['assets/armas/glock.glb', false, [], 4],
  ['assets/armas/escopeta.glb', false, []],
  ['assets/armas/mp5.glb', false, [], 3],
];
for (const [path, rig, clips, parts] of models) test(`${path}: GLB íntegro e conteúdo disponível`, () => {
  const bytes = parts ? Buffer.concat(Array.from({length:parts}, (_, i) => readFileSync(new URL('../'+path+'.part'+String(i).padStart(2,'0'), import.meta.url)))) : readFileSync(new URL('../'+path,import.meta.url));
  assert.equal(bytes.readUInt32LE(0), 0x46546c67); assert.equal(bytes.readUInt32LE(4), 2); assert.equal(bytes.readUInt32LE(8), bytes.length);
  const size=bytes.readUInt32LE(12), data=JSON.parse(bytes.subarray(20,20+size).toString('utf8'));
  const bin=20+size; assert.equal(bytes.readUInt32LE(bin+4),0x004e4942);
  const binSize=bytes.readUInt32LE(bin); assert.equal(bin+8+binSize,bytes.length);
  for(const v of data.bufferViews) assert.ok((v.byteOffset||0)+v.byteLength<=binSize);
  assert.ok(data.meshes?.length); assert.ok(data.images?.every(image=>image.bufferView !== undefined && !image.uri));
  if(rig) { assert.ok(data.skins?.length); assert.ok(data.nodes.some(n=>n.name==='mixamorig:RightHand')); }
  for(const name of clips) assert.ok(data.animations.some(a=>a.name===name));
});
