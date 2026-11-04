import test from 'node:test';
import assert from 'node:assert/strict';
import {createShaderWarmup} from '../js/shader-warmup.mjs';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('compila uma área por vez, compartilha requisições e reutiliza resultado',async()=>{
  const calls=[],done=[];
  const w=createShaderWarmup(group=>new Promise(resolve=>{calls.push(group);done.push(resolve)}));
  const a={ctx:{group:'a'}},b={ctx:{group:'b'}};
  const p=w.request(a);assert.equal(w.request(a),p);const q=w.request(b);
  await tick();assert.deepEqual(calls,['a']);assert.equal(w.isBusy(a),true);assert.equal(w.isBusy(b),true);
  done.shift()(true);assert.equal(await p,true);await tick();assert.deepEqual(calls,['a','b']);done.shift()(true);assert.equal(await q,true);
  assert.equal(w.isBusy(a),false);assert.equal(await w.request(a),true);assert.deepEqual(calls,['a','b']);
});
test('mudança de qualidade ou reconstrução invalida o contexto e permite nova compilação',async()=>{
  let count=0;const w=createShaderWarmup(async()=>{count++;return true}),a={ctx:{group:{}}};
  await w.request(a);w.invalidate();await w.request(a);a.ctx={group:{}};await w.request(a);assert.equal(count,3);
});
test('falha não bloqueia a fila e pode ser tentada de novo',async()=>{
  let n=0;const original=console.warn;console.warn=()=>{};
  try {const w=createShaderWarmup(async()=>{if(++n===1)throw Error('gpu');return true}),a={ctx:{group:{}}};
    assert.equal(await w.request(a),false);assert.equal(await w.request(a),true);assert.equal(n,2);
  } finally {console.warn=original;}
});
test('descarte de área antes do início impede compilação de contexto obsoleto',async()=>{
  let release;const called=[];const w=createShaderWarmup(g=>{called.push(g);return new Promise(r=>release=r)});
  const a={ctx:{group:'a'}},b={ctx:{group:'b'}};const p=w.request(a),q=w.request(b);await tick();b.ctx=null;release(true);
  await p;assert.equal(await q,false);assert.deepEqual(called,['a']);assert.equal(w.isBusy(b),false);
});
