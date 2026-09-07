import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadExpansionAssets} from './expansion-assets.js';
import {accessories,extraBackgrounds} from './decor-catalog.js';
import {makeSave,equip,equipAccessory,setAccessoryPosition,storePreset,applyPreset} from './game-state.js';

const read=path=>fs.readFile(new URL(path,import.meta.url),'utf8');
const assets=JSON.parse(await read('assets/runtime/game-assets.json'));
assets.accessories=[...accessories];assets.backgrounds.push(...extraBackgrounds);
const expanded=await loadExpansionAssets(assets,path=>read(path),async path=>({ok:true,json:async()=>JSON.parse(await read(path))}));
assets.outfits.push(...expanded.outfits);assets.accessories.push(...expanded.accessories);

test('all completed expansion assets load without dropping any candidates',()=>{
  assert.deepEqual(expanded.warnings,[]);
  assert.equal(expanded.outfits.length,16);
  assert.equal(expanded.accessories.length,6);
  assert.equal(expanded.props.length,6);
  assert.equal(assets.outfits.length,40);
  assert.equal(assets.accessories.length,12);
  assert.equal(assets.backgrounds.length,8);
});

test('each new outfit and accessory keeps its selection and moved position across save and preset restore',()=>{
  for(const outfit of expanded.outfits){
    for(const accessory of expanded.accessories){
      let save={...makeSave(assets),characterId:outfit.characterId};
      save=equip(save,outfit.id,assets);
      save=equipAccessory(save,accessory.id,accessory.slot,assets);
      save=setAccessoryPosition(save,accessory.id,outfit.id,{x:13,y:17},assets);
      save=storePreset(save,'expanded','새 코디');
      const restored=makeSave(assets,JSON.parse(JSON.stringify(save)));
      assert.equal(restored.outfits[outfit.characterId],outfit.id);
      assert.equal(restored.accessories[outfit.characterId][accessory.slot],accessory.id);
      assert.deepEqual(restored.accessoryPositions[outfit.characterId][outfit.id][accessory.id],{x:13,y:17});
      const switched=equipAccessory(equip(restored,null,assets),null,accessory.slot,assets);
      const preset=applyPreset(switched,'expanded');
      assert.equal(preset.outfits[outfit.characterId],outfit.id);
      assert.equal(preset.accessories[outfit.characterId][accessory.slot],accessory.id);
      assert.deepEqual(preset.accessoryPositions[outfit.characterId][outfit.id][accessory.id],{x:13,y:17});
    }
  }
});

test('a new character-specific outfit cannot overwrite another character selection',()=>{
  const save=makeSave(assets);
  const foreign=expanded.outfits.find(o=>o.characterId!==save.characterId);
  assert.equal(equip(save,foreign.id,assets),save);
});
