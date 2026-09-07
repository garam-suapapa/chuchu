import {accessoryFrame} from './doll-renderer.js';

const root='assets/runtime/expansion/';
const isSprite=path=>typeof path==='string'&&path.startsWith(root)&&!path.includes('..')&&/\.(png|webp)$/.test(path);
const isFrame=frame=>frame&&['x','y','width','height'].every(key=>Number.isFinite(frame[key]))&&frame.width>0&&frame.height>0;

// Expansion catalogs are optional. A failed catalog or image must not prevent
// the established wardrobe from opening, and unfinished originals stay hidden.
export async function loadExpansionAssets(assets,loadImage,fetchCatalog=fetch){
  const result={accessories:[],outfits:[],props:[],warnings:[]};
  const groups=[['accessories','accessories/catalog.json'],['props','props/catalog.json'],...assets.characters.map(c=>['outfits',`outfits/${c.id}/catalog.json`])];
  const loaded=await Promise.all(groups.map(async([kind,path])=>{
    try{
      const response=await fetchCatalog(root+path);if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const entries=await response.json();if(!Array.isArray(entries))throw new Error('Invalid catalog');
      return {kind,path,entries};
    }catch(error){return {kind,path,entries:[],error};}
  }));
  const seen={accessories:new Set(assets.accessories.map(a=>a.id)),outfits:new Set(assets.outfits.map(o=>o.id)),props:new Set()};
  for(const group of loaded){
    if(group.error){result.warnings.push(group.path);continue;}
    const candidates=[];
    for(const entry of group.entries){
      if(entry?.runtimeReady!==true)continue;
      try{
        if(typeof entry.id!=='string'||!entry.id||typeof entry.name!=='string'||!entry.name||seen[group.kind].has(entry.id))throw new Error('Invalid or duplicate asset');
        const sprites=[entry.sprite];
        if(group.kind==='outfits'){
          if(!assets.characters.some(c=>c.id===entry.characterId))throw new Error('Unknown character');
          sprites.push(entry.wornSprite,...(entry.renderLayers||[]).map(layer=>layer.src));
        }else if(group.kind==='accessories'){
          if(!['head','bag'].includes(entry.slot)||!assets.characters.every(c=>isFrame(accessoryFrame(c,entry))))throw new Error('Invalid accessory frame');
          sprites.push(...[entry.backSprite,entry.frontSprite].filter(Boolean));
        }
        if(!sprites.every(isSprite))throw new Error('Invalid sprite path');
        seen[group.kind].add(entry.id);candidates.push({entry,sprites});
      }catch{result.warnings.push(entry?.id||group.path);}
    }
    const ready=await Promise.all(candidates.map(async({entry,sprites})=>{
      try{await Promise.all(sprites.map(loadImage));return entry;}catch{result.warnings.push(entry.id);return null;}
    }));
    result[group.kind].push(...ready.filter(Boolean));
  }
  return result;
}
