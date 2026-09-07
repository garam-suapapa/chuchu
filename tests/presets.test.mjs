import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeSave,equip,equipAccessory,setAccessoryPosition,storePreset,applyPreset,renamePreset,deletePreset} from '../game-state.js';
import {accessories,extraBackgrounds} from '../decor-catalog.js';

const assets=JSON.parse(fs.readFileSync(new URL('../assets/runtime/game-assets.json',import.meta.url),'utf8'));
assets.accessories=accessories;
assets.backgrounds.push(...extraBackgrounds);
const outfit=assets.outfits.find(o=>o.characterId==='hachuping').id;
const otherOutfit=assets.outfits.find(o=>o.characterId==='soraping').id;
function dressed(){
  let save=equip(makeSave(assets),outfit,assets);
  save=equipAccessory(save,'heart-bow','head',assets);
  save=equipAccessory(save,'heart-bag','bag',assets);
  return setAccessoryPosition(save,'heart-bow',outfit,{x:12,y:24},assets);
}

test('existing version 4 data keeps current outfits, accessories, positions and settings',()=>{
  const old={...dressed(),version:4,backgroundId:'night',sound:false};delete old.presets;
  const migrated=makeSave(assets,old);
  for(const field of ['outfits','accessories','accessoryPositions','backgroundId','sound'])assert.deepEqual(migrated[field],old[field]);
  assert.equal(migrated.version,5);
  assert.deepEqual(migrated.presets,{hachuping:[],soraping:[],challangping:[],bangulping:[]});
});

test('multiple presets restore outfit, both accessories and positions after serialization',()=>{
  let save=storePreset(dressed(),'party','파티복');
  save=equip(save,null,assets);save=equipAccessory(save,null,'head',assets);save=equipAccessory(save,null,'bag',assets);
  save=storePreset(save,'base','기본 모습');
  save=makeSave(assets,JSON.parse(JSON.stringify(save)));
  save=applyPreset(save,'party');
  assert.equal(save.outfits.hachuping,outfit);
  assert.deepEqual(save.accessories.hachuping,{head:'heart-bow',bag:'heart-bag'});
  assert.deepEqual(save.accessoryPositions.hachuping[outfit]['heart-bow'],{x:12,y:24});
  save=applyPreset(save,'base');
  assert.equal(save.outfits.hachuping,null);
  assert.deepEqual(save.accessories.hachuping,{head:null,bag:null});
});

test('editing and loading never mutate stored presets or earlier state',()=>{
  const saved=storePreset(dressed(),'party','파티복');
  let live=applyPreset(saved,'party');
  live=setAccessoryPosition(live,'heart-bow',outfit,{x:30,y:40},assets);
  live=equip(live,null,assets);
  assert.equal(live.presets.hachuping[0].outfitId,outfit);
  assert.deepEqual(live.presets.hachuping[0].positions['heart-bow'],{x:12,y:24});
  assert.notEqual(applyPreset(saved,'party').accessoryPositions.hachuping[outfit]['heart-bow'],saved.presets.hachuping[0].positions['heart-bow']);
  assert.equal(saved.outfits.hachuping,outfit);
});

test('same-outfit presets restore distinct offsets, including default positions',()=>{
  let save=storePreset(dressed(),'moved','이동한 리본');
  save={...save,accessoryPositions:{...save.accessoryPositions,hachuping:{}}};
  save=storePreset(save,'default','기본 위치');
  save=applyPreset(save,'moved');
  assert.deepEqual(save.accessoryPositions.hachuping[outfit]['heart-bow'],{x:12,y:24});
  save=applyPreset(save,'default');
  assert.deepEqual(save.accessoryPositions.hachuping[outfit],{});
});

test('presets are isolated per character and applying keeps background and other poses',()=>{
  let save=storePreset(dressed(),'party','파티복');
  save={...save,characterId:'soraping'};
  assert.equal(applyPreset(save,'party'),save);
  save=equip(save,otherOutfit,assets);save=storePreset(save,'sea','바다');
  const sora=save.outfits.soraping;
  save={...save,characterId:'hachuping',backgroundId:'night'};
  save=setAccessoryPosition(save,'heart-bag',null,{x:3,y:4},assets);
  save=applyPreset(save,'party');
  assert.equal(save.outfits.soraping,sora);assert.equal(save.backgroundId,'night');
  assert.deepEqual(save.accessoryPositions.hachuping.base['heart-bag'],{x:3,y:4});
  assert.equal(save.presets.soraping.length,1);
});

test('overwrite and rename target only the selected preset; delete leaves current outfit',()=>{
  let save=storePreset(dressed(),'one','첫 코디');save=storePreset(save,'two','둘째 코디');
  save=equip(save,null,assets);save=storePreset(save,'one','첫 코디',true);
  assert.equal(save.presets.hachuping.length,2);assert.equal(save.presets.hachuping[0].outfitId,null);
  assert.equal(save.presets.hachuping[1].outfitId,outfit);
  save=renamePreset(save,'one','  잠옷  ');assert.equal(save.presets.hachuping[0].name,'잠옷');
  save=applyPreset(save,'two');save=deletePreset(save,'two');
  assert.equal(save.outfits.hachuping,outfit);assert.equal(save.presets.hachuping.length,1);
  assert.equal(deletePreset(save,'missing'),save);assert.equal(renamePreset(save,'missing','이름'),save);
  assert.equal(storePreset(save,'missing','없음',true),save);
  assert.equal(storePreset(save,'one','중복'),save);
});

test('empty and oversized names are rejected without losing saved data',()=>{
  const save=storePreset(dressed(),'one','코디');
  assert.throws(()=>storePreset(save,'two','   '));
  assert.throws(()=>renamePreset(save,'one','x'.repeat(41)));
  assert.equal(save.presets.hachuping[0].name,'코디');
});

test('malformed stored presets are sanitized without blocking load',()=>{
  const good=storePreset(dressed(),'one','코디').presets.hachuping[0];
  const stored={presets:{hachuping:[null,42,{},good,good,{...good,id:'cross',outfitId:otherOutfit},{...good,id:'bad',name:' '},{...good,id:'clean',accessories:{head:'heart-bag',bag:'missing'},positions:{'heart-bow':{x:'bad',y:Infinity}}}],soraping:'bad'}};
  const save=makeSave(assets,stored);
  assert.deepEqual(save.presets.hachuping.map(p=>p.id),['one','clean']);
  assert.deepEqual(save.presets.hachuping[1].accessories,{head:null,bag:null});
  assert.deepEqual(save.presets.hachuping[1].positions,{});
  assert.deepEqual(makeSave(assets,null).presets.hachuping,[]);
});
