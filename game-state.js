import {accessoryFrame} from './doll-renderer.js';

export const SAVE_KEY = 'chuchu.wardrobe.v1';

function clampAccessoryOffset(character,accessory,offset) {
  const frame=accessoryFrame(character,accessory);
  return {
    x:Math.max(-frame.x,Math.min(600-frame.x-frame.width,Math.round(offset.x*10)/10)),
    y:Math.max(-frame.y,Math.min(700-frame.y-frame.height,Math.round(offset.y*10)/10))
  };
}

export function makeSave(assets, stored = {}) {
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
  return {version:4, characterId:ids.includes(stored?.characterId)?stored.characterId:ids[0],outfits,accessories,accessoryPositions,
    backgroundId:assets.backgrounds.some(b=>b.id===migratedBackground)?migratedBackground:'candy',
    sound:typeof stored?.sound==='boolean'?stored.sound:true};
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
