import {accessoryFrame} from './doll-renderer.js';

export const SAVE_KEY = 'chuchu.wardrobe.v1';

function clampAccessoryOffset(character,accessory,offset) {
  const frame=accessoryFrame(character,accessory);
  return {
    x:Math.max(-frame.x,Math.min(600-frame.x-frame.width,Math.round(offset.x*10)/10)),
    y:Math.max(-frame.y,Math.min(700-frame.y-frame.height,Math.round(offset.y*10)/10))
  };
}

function makeCurrentSave(assets, stored = {}) {
  const ids=assets.characters.map(c=>c.id);
  const outfits={},accessories={},accessoryPositions={};
  for(const id of ids){
    const choices=assets.outfits.filter(o=>o.characterId===id);
    const saved=stored?.outfits?.[id];
    outfits[id]=choices.find(o=>o.id===saved)?.id || null;
    accessories[id]={};
    for(const slot of ['head','bag']){
      const accessoryId=stored?.accessories?.[id]?.[slot];
      accessories[id][slot]=(assets.accessories||[]).find(a=>a.id===accessoryId&&a.slot===slot)?.id||null;
    }
    accessoryPositions[id]={};
    const validPoses=new Set(['base',...choices.map(o=>o.id)]);
    for(const [poseId,positions] of Object.entries(stored?.accessoryPositions?.[id]||{})){
      if(!validPoses.has(poseId)||!positions||typeof positions!=='object')continue;
      const clean={};
      for(const [accessoryId,offset] of Object.entries(positions)){
        const accessory=(assets.accessories||[]).find(a=>a.id===accessoryId);
        if(!accessory||!offset||!Number.isFinite(offset.x)||!Number.isFinite(offset.y))continue;
        clean[accessoryId]=clampAccessoryOffset(assets.characters.find(c=>c.id===id),accessory,offset);
      }
      if(Object.keys(clean).length)accessoryPositions[id][poseId]=clean;
    }
  }
  const migratedBackground={studio:'observatory',garden:'school'}[stored?.backgroundId]||stored?.backgroundId;
  return {version:5, characterId:ids.includes(stored?.characterId)?stored.characterId:ids[0],outfits,accessories,accessoryPositions,
    backgroundId:assets.backgrounds.some(b=>b.id===migratedBackground)?migratedBackground:'candy',
    sound:typeof stored?.sound==='boolean'?stored.sound:true};
}

// A preset owns a snapshot of the visible outfit, not references to the live edit.
function outfitSnapshot(save) {
  const id=save.characterId,outfitId=save.outfits[id]||null;
  const accessories={...save.accessories[id]},positions={};
  for(const accessoryId of Object.values(accessories)){
    const offset=save.accessoryPositions?.[id]?.[outfitId||'base']?.[accessoryId];
    if(offset)positions[accessoryId]={...offset};
  }
  return {outfitId,accessories,positions};
}

export function makeSave(assets,stored={}) {
  const save=makeCurrentSave(assets,stored),presets={};
  for(const character of assets.characters){
    const id=character.id,seen=new Set();presets[id]=[];
    const entries=stored?.presets?.[id];
    if(!Array.isArray(entries))continue;
    for(const preset of entries){
      if(!preset||typeof preset.id!=='string'||! /^[\w-]{1,80}$/.test(preset.id)||seen.has(preset.id)||typeof preset.name!=='string'||!preset.name.trim())continue;
      if(preset.outfitId!==null&&!assets.outfits.some(o=>o.id===preset.outfitId&&o.characterId===id))continue;
      const normalized=makeCurrentSave(assets,{characterId:id,outfits:{[id]:preset.outfitId},accessories:{[id]:preset.accessories},accessoryPositions:{[id]:{[preset.outfitId||'base']:preset.positions}}});
      presets[id].push({id:preset.id,name:preset.name.trim().slice(0,40),...outfitSnapshot(normalized)});seen.add(preset.id);
    }
  }
  const scene=Array.isArray(stored?.scene)?[]:null,seen=new Set();
  for(const entry of Array.isArray(stored?.scene)?stored.scene:[]){
    if(scene.length===5)break;
    if(!entry||typeof entry.id!=='string'||! /^[\w-]{1,80}$/.test(entry.id)||seen.has(entry.id)||!assets.characters.some(c=>c.id===entry.characterId))continue;
    const id=entry.characterId;
    const normalized=makeCurrentSave(assets,{characterId:id,outfits:{[id]:entry.outfitId},accessories:{[id]:entry.accessories},accessoryPositions:{[id]:{[entry.outfitId||'base']:entry.positions}}});
    scene.push({id:entry.id,characterId:id,name:typeof entry.name==='string'?entry.name.slice(0,40):'친구',...outfitSnapshot(normalized),x:Number.isFinite(entry.x)?Math.max(0,Math.min(1,entry.x)):.5,y:Number.isFinite(entry.y)?Math.max(0,Math.min(1,entry.y)):.55});seen.add(entry.id);
  }
  return {...save,presets,scene};
}

// Array order is also paint order. Scene outfits are independent snapshots.
export function addSceneDoll(save,id,characterId=save.characterId,presetId=null){
  const entries=save.scene||[];
  if(entries.length>=5||entries.some(e=>e.id===id)||typeof id!=='string'||! /^[\w-]{1,80}$/.test(id)||!save.presets[characterId])return save;
  const preset=presetId===null?null:save.presets[characterId].find(p=>p.id===presetId);
  if(presetId!==null&&!preset)return save;
  const snapshot=preset||outfitSnapshot({...save,characterId});
  const slots=[{x:.5,y:.55},{x:.25,y:.65},{x:.75,y:.65},{x:.3,y:.35},{x:.7,y:.35}];
  const spot=slots.reduce((best,slot)=>{
    const distance=p=>entries.length?Math.min(...entries.map(e=>Math.hypot(e.x-p.x,e.y-p.y))):0;
    return distance(slot)>distance(best)?slot:best;
  },slots[0]);
  const entry={id,characterId,name:preset?.name||'지금 입은 코디',outfitId:snapshot.outfitId,accessories:{...snapshot.accessories},positions:Object.fromEntries(Object.entries(snapshot.positions).map(([key,value])=>[key,{...value}])),...spot};
  return {...save,scene:[...entries,entry]};
}

export function moveSceneDoll(save,id,position){
  if(!Number.isFinite(position.x)||!Number.isFinite(position.y)||!save.scene?.some(e=>e.id===id))return save;
  return {...save,scene:save.scene.map(e=>e.id===id?{...e,x:Math.max(0,Math.min(1,position.x)),y:Math.max(0,Math.min(1,position.y))}:e)};
}

export function removeSceneDoll(save,id){
  if(!save.scene?.some(e=>e.id===id))return save;
  return {...save,scene:save.scene.filter(e=>e.id!==id)};
}

function presetName(name) {
  if(typeof name!=='string'||!name.trim())throw new Error('프리셋 이름을 입력해 주세요.');
  if(name.trim().length>40)throw new Error('이름은 40자 이내로 입력해 주세요.');
  return name.trim();
}

export function storePreset(save,id,name,replace=false) {
  const entries=save.presets[save.characterId],existing=entries.find(p=>p.id===id);
  if(typeof id!=='string'||! /^[\w-]{1,80}$/.test(id)||Boolean(existing)!==replace)return save;
  const preset={id,name:presetName(name),...outfitSnapshot(save)};
  return {...save,presets:{...save.presets,[save.characterId]:replace?entries.map(p=>p.id===id?preset:p):[...entries,preset]}};
}

export function renamePreset(save,id,name) {
  const entries=save.presets[save.characterId];if(!entries.some(p=>p.id===id))return save;
  const cleanName=presetName(name);
  return {...save,presets:{...save.presets,[save.characterId]:entries.map(p=>p.id===id?{...p,name:cleanName}:p)}};
}

export function deletePreset(save,id) {
  const entries=save.presets[save.characterId];if(!entries.some(p=>p.id===id))return save;
  return {...save,presets:{...save.presets,[save.characterId]:entries.filter(p=>p.id!==id)}};
}

export function applyPreset(save,id) {
  const characterId=save.characterId,preset=save.presets[characterId].find(p=>p.id===id);if(!preset)return save;
  const positions=Object.fromEntries(Object.entries(preset.positions).map(([key,value])=>[key,{...value}]));
  return {...save,outfits:{...save.outfits,[characterId]:preset.outfitId},accessories:{...save.accessories,[characterId]:{...preset.accessories}},
    accessoryPositions:{...save.accessoryPositions,[characterId]:{...save.accessoryPositions[characterId],[preset.outfitId||'base']:positions}}};
}

export function equipAccessory(save,accessoryId,slot,assets) {
  if(!['head','bag'].includes(slot))return save;
  if(accessoryId!==null&&!(assets.accessories||[]).some(a=>a.id===accessoryId&&a.slot===slot))return save;
  return {...save,accessories:{...save.accessories,[save.characterId]:{...save.accessories[save.characterId],[slot]:accessoryId}}};
}

export function equip(save, outfitId, assets) {
  if(outfitId===null)return {...save,outfits:{...save.outfits,[save.characterId]:null}};
  const outfit=assets.outfits.find(o=>o.id===outfitId);
  if(!outfit||outfit.characterId!==save.characterId)return save;
  return {...save,outfits:{...save.outfits,[save.characterId]:outfit.id}};
}

export function setAccessoryPosition(save,accessoryId,outfitId,offset,assets) {
  const accessory=(assets.accessories||[]).find(a=>a.id===accessoryId);
  if(!accessory||!offset||!Number.isFinite(offset.x)||!Number.isFinite(offset.y))return save;
  const poseId=outfitId||'base';
  if(poseId!=='base'&&!assets.outfits.some(o=>o.id===poseId&&o.characterId===save.characterId))return save;
  const characterPositions=save.accessoryPositions?.[save.characterId]||{};
  const posePositions=characterPositions[poseId]||{};
  const next=clampAccessoryOffset(assets.characters.find(c=>c.id===save.characterId),accessory,offset);
  return {...save,accessoryPositions:{...save.accessoryPositions,[save.characterId]:{...characterPositions,[poseId]:{...posePositions,[accessoryId]:next}}}};
}

export function resetAccessoryPositions(save,outfitId) {
  const poseId=outfitId||'base';
  const characterPositions={...(save.accessoryPositions?.[save.characterId]||{})};
  if(!characterPositions[poseId])return save;
  delete characterPositions[poseId];
  return {...save,accessoryPositions:{...save.accessoryPositions,[save.characterId]:characterPositions}};
}

export function clampPosition(x,y,stage,doll) {
  const halfX=Math.min(.5,doll.width/(2*stage.width));
  const halfY=Math.min(.5,doll.height/(2*stage.height));
  return {x:Math.max(halfX,Math.min(1-halfX,x)),y:Math.max(halfY,Math.min(1-halfY,y))};
}

export function replyFor(text,{character,outfit,background,chestOpen}) {
  const t=String(text).slice(0,200).replaceAll(' ','');
  if(/전화|주소|비밀번호|학교|사는곳|\d{3,}/.test(t))return {line:'그런 정보는 말하지 않아도 괜찮아. 우리 같이 옷을 골라 볼까?',action:'sparkle'};
  if(/상자|선물|보물/.test(t))return {line:chestOpen?'반짝이는 선물을 찾았어! 다시 톡 누르면 닫혀.':'상자를 톡 눌러 봐. 안에 뭐가 있을까?',action:'chest'};
  if(/옷|코디|예뻐|예쁘|입었|어울/.test(t))return {line:outfit?`${outfit.name}, 마음에 쏙 들어! 네가 골라 줘서 더 특별해.`:'아직 옷을 고르지 않았어. 어떤 옷을 입어 볼까?',action:'twirl'};
  if(/잘자|잠|졸려|다음에/.test(t))return {line:'오늘 함께 놀아서 즐거웠어. 포근하게 쉬고 또 만나!',action:'sparkle'};
  if(/안녕|반가|이름/.test(t))return {line:`안녕! 나는 ${character.name}이야. 오늘은 ${background.name}에서 함께 놀자!`,action:'sparkle'};
  if(/어디|배경|여기/.test(t))return {line:`여기는 ${background.name}! 나를 살짝 잡고 다른 곳으로 옮겨 줘.`,action:'sparkle'};
  if(/거울|돌아|포즈/.test(t))return {line:'빙그르르! 오늘 코디로 멋진 포즈를 보여 줄게.',action:'twirl'};
  if(/놀|재미|하고싶/.test(t))return {line:'비눗방울을 톡 터뜨려 볼까? 무지개처럼 반짝여!',action:'bubbles'};
  return {line:'함께 이야기하니 좋아! 내 옷은 어때? 아니면 선물 상자를 열어 볼까?',action:'sparkle'};
}
