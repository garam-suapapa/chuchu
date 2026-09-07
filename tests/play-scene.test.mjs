import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeSave,equip,equipAccessory,setAccessoryPosition,storePreset,deletePreset,addSceneDoll,moveSceneDoll,removeSceneDoll} from '../game-state.js';
import {accessories} from '../decor-catalog.js';
const assets=JSON.parse(fs.readFileSync(new URL('../assets/runtime/game-assets.json',import.meta.url),'utf8'));assets.accessories=accessories;
const outfit=assets.outfits.find(o=>o.characterId==='hachuping').id;
function dressed(){let save=equip(makeSave(assets),outfit,assets);save=equipAccessory(save,'heart-bow','head',assets);return setAccessoryPosition(save,'heart-bow',outfit,{x:12,y:24},assets);}
test('legacy saves initialize lazily; intentionally empty scenes survive reload',()=>{
  const save=makeSave(assets);assert.equal(save.scene,null);
  assert.deepEqual(makeSave(assets,removeSceneDoll(addSceneDoll(save,'first'),'first')).scene,[]);
});
test('five independent copies across characters; a sixth and invalid presets are rejected',()=>{
  let save=storePreset(dressed(),'party','파티복');
  for(let i=0;i<4;i++)save=addSceneDoll(save,'friend-'+i,'hachuping','party');
  save=addSceneDoll(save,'other','soraping');assert.equal(save.scene.length,5);
  assert.equal(addSceneDoll(save,'sixth'),save);
  assert.equal(addSceneDoll(removeSceneDoll(save,'other'),'invalid','hachuping','missing').scene.length,4);
  assert.notEqual(save.scene[0].positions['heart-bow'],save.scene[1].positions['heart-bow']);
  save=deletePreset(save,'party');save=equip(save,null,assets);
  const loaded=makeSave(assets,JSON.parse(JSON.stringify(save)));
  assert.equal(loaded.scene[0].outfitId,outfit);assert.deepEqual(loaded.scene[0].positions['heart-bow'],{x:12,y:24});
});
test('movement, order and removal survive serialization without changing presets',()=>{
  let save=storePreset(dressed(),'party','파티복');save=addSceneDoll(save,'a','hachuping','party');save=addSceneDoll(save,'b');
  const before=save;save=moveSceneDoll(save,'a',{x:.2,y:.7});assert.notEqual(save,before);assert.notEqual(before.scene[0].x,.2);
  save={...save,scene:[save.scene[1],save.scene[0]]};const loaded=makeSave(assets,JSON.parse(JSON.stringify(save)));
  assert.deepEqual(loaded.scene,save.scene);assert.equal(removeSceneDoll(loaded,'a').presets.hachuping.length,1);
  assert.equal(moveSceneDoll(save,'a',{x:NaN,y:1}),save);
});
test('corrupt scene rows, duplicate IDs, missing assets and excessive counts are sanitized',()=>{
  const save=addSceneDoll(dressed(),'a'),entry=save.scene[0];
  const loaded=makeSave(assets,{...save,scene:[null,{...entry,characterId:'missing'},entry,entry,{...entry,id:'b',outfitId:'missing',x:Infinity,y:-5},...Array.from({length:7},(_,i)=>({...entry,id:'extra-'+i}))]});
  assert.equal(loaded.scene.length,5);assert.deepEqual(loaded.scene.map(e=>e.id),['a','b','extra-0','extra-1','extra-2']);
  assert.equal(loaded.scene[1].outfitId,null);assert.equal(loaded.scene[1].x,.5);assert.equal(loaded.scene[1].y,0);
});
