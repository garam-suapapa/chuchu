import test from 'node:test';
import assert from 'node:assert/strict';
import {loadExpansionAssets} from './expansion-assets.js';
const base={characters:[{id:'hachuping'}],accessories:[{id:'old-accessory'}],outfits:[{id:'old-outfit'}]};
const sprite='assets/runtime/expansion/props/processed/ball.png';
const fetchFor=entries=>async path=>({ok:true,json:async()=>path.endsWith('props/catalog.json')?entries:[]});
test('only explicit ready entries can load or preload; originals remain untouched',async()=>{
  const entries=[{id:'pending',name:'Pending',sprite,runtimeReady:false},{id:'missing-flag',name:'Missing',sprite},{id:'ready',name:'Ready',sprite,runtimeReady:true}];
  const calls=[];const result=await loadExpansionAssets(base,async path=>calls.push(path),fetchFor(entries));
  assert.deepEqual(result.props.map(p=>p.id),['ready']);assert.deepEqual(calls,[sprite]);assert.equal(base.outfits.length,1);assert.equal(base.accessories.length,1);
});
test('catalog-only mode exposes ready entries without downloading their images',async()=>{
  const entries=[{id:'ready',name:'Ready',sprite,runtimeReady:true}];
  const result=await loadExpansionAssets(base,null,fetchFor(entries));
  assert.deepEqual(result.props.map(p=>p.id),['ready']);assert.deepEqual(result.warnings,[]);
});
test('bad catalogs and failed ready images cannot prevent other ready assets from loading',async()=>{
  const failed=sprite.replace('ball','failed');
  const result=await loadExpansionAssets(base,async path=>{if(path===failed)throw new Error('decode failed')},async path=>{
    if(path.endsWith('accessories/catalog.json'))throw new Error('offline');
    return {ok:true,json:async()=>path.endsWith('props/catalog.json')?[{id:'failed',name:'Failed',sprite:failed,runtimeReady:true},{id:'good',name:'Good',sprite,runtimeReady:true}]:[]};
  });
  assert.deepEqual(result.props.map(p=>p.id),['good']);assert.equal(result.warnings.length,2);
});
test('duplicate identifiers and invalid paths are withheld',async()=>{
  const entries=[{id:'bad-path',name:'Bad',sprite:'https://example.com/image.png',runtimeReady:true},{id:'good',name:'Good',sprite,runtimeReady:true},{id:'good',name:'Duplicate',sprite,runtimeReady:true}];
  const result=await loadExpansionAssets(base,async()=>{},fetchFor(entries));
  assert.deepEqual(result.props.map(p=>p.id),['good']);assert.equal(result.warnings.length,2);
});
