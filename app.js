import {SAVE_KEY,makeSave,equip,equipAccessory,setAccessoryPosition,resetAccessoryPositions,replyFor} from './game-state.js';
import {drawDoll,accessoryFrame} from './doll-renderer.js';
import {accessories,extraBackgrounds} from './decor-catalog.js';
import {setupPresets} from './preset-ui.js';
import {setupPlayScene} from './play-scene.js';
import {loadExpansionAssets} from './expansion-assets.js';
import {createVoiceRepeater} from './voice-repeat.js';

const $=id=>document.getElementById(id);
let assets,save,step='dress',chestOpen=false,accessoryEditId=null;
let voiceAllowed=false,voiceRepeater=null,voiceTargetId=null,audioContext=null;
let toastTimer=null;
let playScene;
const imageCache=new Map();
const decodedImages=new Map();
let dollLoadRevision=0;
const steps=['dress','accessory','background','play'];
const icons=name=>`<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const selectedCharacter=()=>assets.characters.find(c=>c.id===save.characterId);
const selectedOutfit=()=>assets.outfits.find(o=>o.id===save.outfits[save.characterId]);
const selectedBackground=()=>assets.backgrounds.find(b=>b.id===save.backgroundId);
const selectedAccessories=()=>assets.accessories.filter(a=>save.accessories[save.characterId][a.slot]===a.id);
const selectedPoseId=()=>selectedOutfit()?.id||'base';
const selectedAccessoryPositions=()=>save.accessoryPositions?.[save.characterId]?.[selectedPoseId()]||{};

function persist(next=save){try{localStorage.setItem(SAVE_KEY,JSON.stringify(next));return true;}catch{toast('이 브라우저에서는 코디를 저장할 수 없어요. 지금 놀이는 계속할 수 있어요.');return false;}}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2600);}
function say(line,read=false){voiceRepeater?.cancel({clearRecording:true,silent:true});$('speech').textContent=line;if(read&&save.sound&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(line);u.lang='ko-KR';u.rate=.92;u.pitch=1.2;speechSynthesis.speak(u);}}
function chime(){
  if(!save.sound)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    audioContext||=new AC();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
    const osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
    osc.type='sine';osc.frequency.setValueAtTime(740,now);osc.frequency.exponentialRampToValueAtTime(1100,now+.13);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+.22);
    osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+.24);
  }catch{/* Sound must never interrupt touch play. */}
}
function animateDoll(kind='equipped'){const doll=step==='play'?playScene?.selectedButton():$('doll');if(!doll)return;doll.classList.remove('twirl','equipped');void doll.offsetWidth;doll.classList.add(kind);setTimeout(()=>doll.classList.remove(kind),760);}
function particles(kind='sparkle',origin={x:50,y:64}){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<9;i++){
    const p=document.createElement('span');p.className='particle'+(kind==='bubbles'?' bubble-particle':'');
    p.textContent=kind==='bubbles'?'':['♡','✦','✧'][i%3];p.style.left=(origin.x+(Math.random()-.5)*23)+'%';p.style.top=(origin.y+(Math.random()-.5)*15)+'%';p.style.setProperty('--dx',(Math.random()-.5)*100+'px');p.style.animationDelay=(i*.035)+'s';
    $('effects').append(p);setTimeout(()=>p.remove(),2100);
  }
}
function loadImage(src){if(imageCache.has(src))return imageCache.get(src);const promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{decodedImages.set(src,image);resolve(image);};image.onerror=()=>{imageCache.delete(src);reject(new Error('이미지를 읽을 수 없어요: '+src));};image.src=src;});imageCache.set(src,promise);return promise;}
function dollImageSources(c=selectedCharacter(),o=selectedOutfit(),chosen=selectedAccessories()){
  return [...new Set([
    ...(o?.renderLayers?.length?o.renderLayers.map(layer=>layer.src):[o?o.wornSprite:c.base]),
    ...chosen.flatMap(a=>[a.backSprite,a.frontSprite||a.sprite]).filter(Boolean)
  ])];
}
async function ensureDollImages(c,o,chosen){await Promise.all(dollImageSources(c,o,chosen).map(loadImage));}
async function queueDollRender(){
  const revision=++dollLoadRevision,doll=$('doll');doll.setAttribute('aria-busy','true');
  try{await ensureDollImages();if(revision===dollLoadRevision)renderDoll();}
  catch(error){if(revision===dollLoadRevision){toast('선택한 꾸미기를 불러오지 못했어요. 다시 눌러 주세요.');console.error(error);}}
  finally{if(revision===dollLoadRevision)doll.removeAttribute('aria-busy');}
}
function setCatalogImage(image,src,eager){
  image.alt='';image.draggable=false;image.decoding='async';
  if(eager)image.src=src;else{image.loading='lazy';image.dataset.src=src;}
}
function hydrateImages(container){
  for(const image of container.querySelectorAll('img[data-src]')){image.src=image.dataset.src;delete image.dataset.src;}
}

function renderCharacters(){
  const fragment=document.createDocumentFragment();
  for(const c of assets.characters){
    const button=document.createElement('button');button.className='character-card';button.dataset.character=c.id;button.style.setProperty('--character-accent',c.accent);button.setAttribute('aria-label',c.name+' 선택');button.setAttribute('aria-pressed',String(c.id===save.characterId));
    const portrait=document.createElement('span');portrait.className='character-portrait';const img=document.createElement('img');setCatalogImage(img,c.base,true);portrait.append(img);
    const label=document.createElement('span');label.textContent=c.name;button.append(portrait,label);
    button.addEventListener('click',()=>{
      if(step==='play')setStep('dress');
      if(c.id===save.characterId)return;
      abortVoice();save={...save,characterId:c.id};persist();renderAll();say(`안녕! 나는 ${c.name}이야. 내 옷장도 구경해 줘!`);animateDoll();particles();chime();
    });fragment.append(button);
  }$('characters').replaceChildren(fragment);
}

function renderOutfits(){
  const fragment=document.createDocumentFragment();
  for(const o of assets.outfits.filter(o=>o.characterId===save.characterId)){
    const button=document.createElement('button');button.className='outfit-card';button.dataset.outfit=o.id;button.setAttribute('aria-label',o.name+' 입히기');button.setAttribute('aria-pressed',String(o.id===save.outfits[save.characterId]));
    const image=document.createElement('img');setCatalogImage(image,o.sprite,step==='dress');
    const label=document.createElement('span');label.className='item-name';label.textContent=o.name;
    const check=document.createElement('span');check.className='selected-check';check.innerHTML=icons('check');
    button.append(image,label,check);button.addEventListener('click',()=>wear(o.id));attachOutfitDrag(button,o);fragment.append(button);
  }$('outfits').replaceChildren(fragment);
  $('dress-panel').querySelector('.count-badge').textContent=assets.outfits.filter(o=>o.characterId===save.characterId).length+'벌';
  $('undress-button').setAttribute('aria-pressed',String(!selectedOutfit()));
}
function wear(outfitId){
  const next=equip(save,outfitId,assets);if(next===save)return;
  save=next;persist();renderDoll();
  for(const button of document.querySelectorAll('.outfit-card[data-outfit]'))button.setAttribute('aria-pressed',String(button.dataset.outfit===outfitId));
  $('undress-button').setAttribute('aria-pressed',String(outfitId===null));
  say(selectedOutfit()?`${selectedOutfit().name}! 나에게 잘 어울리지?`:'옷을 벗었어! 다른 옷도 골라 볼까?');animateDoll();particles();chime();
}
$('undress-button').addEventListener('click',()=>wear(null));

function renderDoll(){
  const c=selectedCharacter(),o=selectedOutfit(),chosen=selectedAccessories(),positions=selectedAccessoryPositions();
  const editAccessory=chosen.find(a=>a.id===accessoryEditId)||chosen[0];
  document.documentElement.style.setProperty('--accent',c.accent);
  $('character-name').textContent=c.name;
  $('wardrobe-subtitle').textContent=c.name+'만의 '+c.motif+' 옷장';
  $('doll').dataset.character=c.id;$('doll').dataset.outfit=o?.id||'none';
  $('doll').dataset.accessories=chosen.map(a=>a.id).join(',');
  if(step!=='accessory')$('doll').classList.remove('accessory-hover');
  $('doll').setAttribute('aria-label',step==='play'?c.name+' 이동하고 인사하기':step==='accessory'?(editAccessory?`${c.name}의 ${editAccessory.name} 위치 조절. 끌거나 화살표 키를 사용하세요.`:`${c.name} 악세서리 위치 조절`):c.name+'에게 인사하기');
  if(step==='accessory')$('doll').setAttribute('aria-describedby','accessory-position-instructions');else $('doll').removeAttribute('aria-describedby');
  $('current-outfit').textContent=[o?.name||'기본 모습',...chosen.map(a=>a.name)].join(' · ');
  if(dollImageSources().some(src=>!decodedImages.has(src))){queueDollRender();return;}
  const canvas=$('doll-canvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  drawDoll(ctx,{character:c,outfit:o,accessories:chosen,accessoryPositions:positions,images:decodedImages});
  if(accessoryDrag?.accessoryId){
    const active=chosen.find(a=>a.id===accessoryDrag.accessoryId);
    if(active){
      const frame=accessoryFrame(c,active,positions[active.id]);
      ctx.save();ctx.setLineDash([8,6]);ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.shadowColor=c.accent;ctx.shadowBlur=8;
      ctx.strokeRect(frame.x+1.5,frame.y+1.5,frame.width-3,frame.height-3);ctx.restore();
    }
  }
  const reset=$('reset-accessory-position');if(reset)reset.disabled=Object.keys(positions).length===0;
}

function renderAccessories(){
  const chosen=selectedAccessories();if(!chosen.some(a=>a.id===accessoryEditId))accessoryEditId=chosen[0]?.id||null;
  const fragment=document.createDocumentFragment();
  for(const a of assets.accessories){
    const selected=save.accessories[save.characterId][a.slot]===a.id;
    const button=document.createElement('button');button.className='accessory-card';button.dataset.accessory=a.id;
    button.setAttribute('aria-label',selected?`${a.name} 장착됨${a.id===accessoryEditId?'. 위치 조절 중. 화살표 키로 이동할 수 있어요.':''}`:a.name+' 고르기');button.setAttribute('aria-pressed',String(selected));button.classList.toggle('position-target',selected&&a.id===accessoryEditId);
    const image=document.createElement('img');setCatalogImage(image,a.sprite,step==='accessory');
    const name=document.createElement('span');name.className='item-name';name.textContent=a.name;
    const slot=document.createElement('span');slot.className='slot-badge';slot.textContent=a.slot==='head'?'머리':'가방';
    const check=document.createElement('span');check.className='selected-check';check.innerHTML=icons('check');
    button.append(image,name,slot,check);button.addEventListener('click',()=>{
      const remove=save.accessories[save.characterId][a.slot]===a.id;
      save=equipAccessory(save,remove?null:a.id,a.slot,assets);accessoryEditId=remove?(selectedAccessories()[0]?.id||null):a.id;persist();renderDoll();
      // Preserve the tapped node so a compatibility click cannot toggle its replacement.
      syncAccessoryTargets();
      say(remove?`${a.name}을 벗었어. 다른 것도 골라 볼까?`:`${a.name}! 반짝반짝 잘 어울려!`);animateDoll();particles();chime();
    });button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&save.accessories[save.characterId][a.slot]===a.id){e.preventDefault();accessoryEditId=a.id;nudgeAccessory(a.id,e.key,e.shiftKey);}});fragment.append(button);
  }$('accessories').replaceChildren(fragment);
  $('accessory-panel').querySelector('.count-badge').textContent=assets.accessories.length+'개';
}
function syncAccessoryTargets(){
  for(const card of $('accessories').querySelectorAll('.accessory-card')){
    const item=assets.accessories.find(item=>item.id===card.dataset.accessory),equipped=save.accessories[save.characterId][item.slot]===item.id,active=equipped&&item.id===accessoryEditId;
    card.setAttribute('aria-pressed',String(equipped));card.classList.toggle('position-target',active);card.setAttribute('aria-label',equipped?`${item.name} 장착됨${active?'. 위치 조절 중. 화살표 키로 이동할 수 있어요.':''}`:item.name+' 고르기');
  }
}
function nudgeAccessory(accessoryId,key,large=false){
  const accessory=selectedAccessories().find(a=>a.id===accessoryId);if(!accessory)return;
  const current=selectedAccessoryPositions()[accessory.id]||{x:0,y:0},amount=large?15:5;
  const delta={ArrowLeft:{x:-amount,y:0},ArrowRight:{x:amount,y:0},ArrowUp:{x:0,y:-amount},ArrowDown:{x:0,y:amount}}[key];if(!delta)return;
  save=setAccessoryPosition(save,accessory.id,selectedOutfit()?.id,{x:current.x+delta.x,y:current.y+delta.y},assets);persist();renderDoll();
  syncAccessoryTargets();
}
$('reset-accessory-position').addEventListener('click',()=>{
  const next=resetAccessoryPositions(save,selectedOutfit()?.id);if(next===save)return;
  save=next;persist();renderDoll();say('악세서리 위치를 처음 자리로 돌렸어!');toast('악세서리 위치를 처음대로 돌렸어요.');
});

function renderBackgrounds(){
  const fragment=document.createDocumentFragment();
  for(const b of assets.backgrounds){
    const button=document.createElement('button');button.className='background-card';button.dataset.background=b.id;button.setAttribute('aria-label',b.name+' 선택');button.setAttribute('aria-pressed',String(save.backgroundId===b.id));
    const preview=document.createElement('div');preview.className='background-preview';
    if(b.image){const img=document.createElement('img');setCatalogImage(img,b.image,step==='background');preview.append(img);}else preview.textContent='✿';
    const name=document.createElement('span');name.className='background-name';name.textContent=b.name;
    const caption=document.createElement('span');caption.className='background-caption';caption.textContent=b.caption;
    button.append(preview,name,caption);button.addEventListener('click',()=>{save={...save,backgroundId:b.id};persist();renderBackgrounds();renderStage();say(`${b.name}에서 함께 놀자!`);chime();});fragment.append(button);
  }$('backgrounds').replaceChildren(fragment);
}

function playWithProp(prop){
  if(step!=='play')return;
  const displayed=$('featured-prop');displayed.hidden=false;displayed.dataset.prop=prop.id;
  displayed.querySelector('img').src=prop.sprite;displayed.setAttribute('aria-label',prop.name+' 다시 놀기');
  displayed.querySelector('span').textContent=prop.name;
  for(const card of $('play-props').querySelectorAll('button'))card.setAttribute('aria-pressed',String(card.dataset.prop===prop.id));
  say(prop.line||`${prop.name}으로 함께 놀자!`);
  animateDoll(prop.action==='twirl'?'twirl':'equipped');particles(prop.action==='bubbles'?'bubbles':'sparkle',{x:73,y:67});chime();
}
function renderPlayProps(){
  $('extra-props-section').hidden=!assets.props.length;
  const fragment=document.createDocumentFragment();
  for(const prop of assets.props){
    const button=document.createElement('button');button.type='button';button.className='play-prop-card';button.dataset.prop=prop.id;
    button.setAttribute('aria-label',prop.name+' 가지고 놀기');button.setAttribute('aria-pressed','false');
    const image=document.createElement('img');setCatalogImage(image,prop.sprite,step==='play');
    const name=document.createElement('span');name.textContent=prop.name;button.append(image,name);
    button.addEventListener('click',()=>playWithProp(prop));fragment.append(button);
  }
  $('play-props').replaceChildren(fragment);
}
$('featured-prop').addEventListener('click',()=>{const prop=assets.props.find(p=>p.id===$('featured-prop').dataset.prop);if(prop)playWithProp(prop);});

function renderStage(){
  const b=selectedBackground(),image=b.image,stage=$('stage');
  stage.classList.toggle('image-background',Boolean(image));for(const id of ['candy','observatory','school','night','studio','garden'])stage.classList.toggle(id,b.id===id);stage.style.backgroundImage=image?`url("${image}")`:'';
  $('stage').dataset.background=b.id;
  $('scene-props').hidden=step!=='play';
  $('stage-chip').innerHTML=icons(step==='play'?'star':'heart');$('stage-chip').append(document.createTextNode(b.name));
  $('stage-kicker').textContent=step==='dress'?'오늘의 주인공':step==='accessory'?'반짝이는 나의 코디':step==='background'?'우리의 놀이터':'나만의 티니핑 친구';
  $('stage-tip').textContent=step==='dress'?'옷을 톡 누르거나 친구에게 끌어다 놓아요':step==='accessory'?'장착한 악세서리를 직접 끌어 원하는 위치에 놓아요':step==='background'?'어디든 좋아! 함께 가 볼까?':'친구를 잡고 옮겨 봐요 · 화살표 키로도 움직여요';
  applyPosition();
  playScene?.refresh();
}
function applyPosition(){
  const stage=$('stage'),width=Math.min(innerWidth>=1400?460:400,stage.clientWidth*.88,stage.clientHeight*.88*6/7);
  Object.assign($('doll-position').style,{width:width+'px',height:width*7/6+'px',maxHeight:'none',left:'50%',top:'56%'});
}

function renderAll(){renderCharacters();renderOutfits();renderAccessories();renderDoll();renderBackgrounds();renderStage();updateSound();}
function setStep(next){
  if(!steps.includes(next))return;
  abortVoice();step=next;
  playScene?.setVisible(step==='play');
  if(step==='accessory'&&!selectedAccessories().some(a=>a.id===accessoryEditId))accessoryEditId=selectedAccessories()[0]?.id||null;
  syncAccessoryTargets();
  steps.forEach((id,i)=>{const b=document.querySelector(`[data-step="${id}"]`);b.disabled=false;b.classList.toggle('active',id===step);b.classList.toggle('done',i<steps.indexOf(step));if(id===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');$(id+'-panel').hidden=id!==step;});
  hydrateImages($(step+'-panel'));if(step==='play')hydrateImages($('scene-props'));
  const texts={dress:['다음! 악세서리 고르기','옷 · 악세서리 · 배경은 자동으로 기억해요'],accessory:['완성! 배경 고르기','머리 장식과 가방을 함께 할 수 있어요'],background:['이곳에서 놀기','마음에 드는 배경을 골라 주세요'],play:['다시 꾸미러 가기','위 메뉴에서 언제든 코디를 바꿀 수 있어요']};
  $('next-button').replaceChildren(document.createTextNode(texts[step][0]));$('next-button').insertAdjacentHTML('beforeend',icons('arrow'));$('footer-note').textContent=texts[step][1];
  renderDoll();renderStage();
  say(step==='dress'?'다른 옷도 입어 볼까?':step==='accessory'?'리본도 가방도 좋아! 나에게 골라 줄래?':step==='background'?'정말 마음에 들어! 이제 어디에서 놀까?':`${selectedBackground().name}에 도착했어! 나를 움직여 봐.`);
  if(step==='play')playScene?.refresh();
  particles();updateVoiceUI();
}

function attachOutfitDrag(button,outfit){
  let active=null,ghost=null,suppressClick=false;
  button.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
  button.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;active={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};button.setPointerCapture(e.pointerId);});
  button.addEventListener('pointermove',e=>{
    if(!active||active.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-active.x,e.clientY-active.y)>8)active.moved=true;
    if(!active.moved)return;
    if(!ghost){ghost=document.createElement('img');ghost.className='drag-ghost';ghost.src=outfit.sprite;ghost.alt='';document.body.append(ghost);}
    ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';$('stage').classList.toggle('drop-ready',insideStage(e.clientX,e.clientY));
  });
  function end(e,cancelled){
    if(!active||active.id!==e.pointerId)return;
    const moved=active.moved;active=null;ghost?.remove();ghost=null;$('stage').classList.remove('drop-ready');
    if(moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);if(!cancelled&&insideStage(e.clientX,e.clientY))wear(outfit.id);else if(!cancelled)toast('친구가 있는 곳에 옷을 놓아 줘!');}
  }
  button.addEventListener('pointerup',e=>end(e,false));button.addEventListener('pointercancel',e=>end(e,true));button.addEventListener('lostpointercapture',e=>{if(active)end(e,true);});
}
function insideStage(x,y){const r=$('stage').getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}

// Touch browsers may suppress the first compatibility click after a drag.
// Activate ordinary controls on a completed tap; swallow only its later duplicate click.
let controlTap=null,lastTouchControl=null,lastTouchTime=0;
document.addEventListener('pointerdown',e=>{
  const button=e.target.closest?.('button');
  if(e.pointerType!=='touch'||!e.isPrimary||!button||button.disabled||button.matches('.outfit-card,.play-doll,#doll,#mic-button'))return;
  controlTap={button,id:e.pointerId,x:e.clientX,y:e.clientY};
});
document.addEventListener('pointercancel',()=>{controlTap=null;});
document.addEventListener('pointerup',e=>{
  const tap=controlTap;if(!tap||tap.id!==e.pointerId)return;controlTap=null;
  if(Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>8||e.target.closest?.('button')!==tap.button)return;
  e.preventDefault();lastTouchControl=tap.button;lastTouchTime=performance.now();tap.button.click();
});
document.addEventListener('click',e=>{
  if(lastTouchControl&&e.isTrusted&&e.detail>0&&e.target.closest?.('button')===lastTouchControl&&performance.now()-lastTouchTime<750){e.preventDefault();e.stopImmediatePropagation();}
},true);

let accessoryDrag=null,dollClickSuppressed=false;
const alphaHitCanvas=document.createElement('canvas');alphaHitCanvas.width=alphaHitCanvas.height=1;
const alphaHitContext=alphaHitCanvas.getContext('2d',{willReadFrequently:true});
function canvasPoint(e){const r=$('doll').getBoundingClientRect();return{x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*700/r.height};}
function visibleAccessoryAt(point){
  const positions=selectedAccessoryPositions(),character=selectedCharacter();
  return [...selectedAccessories()].reverse().find(accessory=>{
    const frame=accessoryFrame(character,accessory,positions[accessory.id]);
    if(point.x<frame.x||point.y<frame.y||point.x>=frame.x+frame.width||point.y>=frame.y+frame.height)return false;
    return [accessory.frontSprite||accessory.sprite,accessory.backSprite].filter(Boolean).some(sprite=>{
      const image=decodedImages.get(sprite);if(!image)return false;
      const sx=Math.max(0,Math.min(image.naturalWidth-1,Math.floor((point.x-frame.x)/frame.width*image.naturalWidth)));
      const sy=Math.max(0,Math.min(image.naturalHeight-1,Math.floor((point.y-frame.y)/frame.height*image.naturalHeight)));
      alphaHitContext.clearRect(0,0,1,1);alphaHitContext.drawImage(image,sx,sy,1,1,0,0,1,1);
      return alphaHitContext.getImageData(0,0,1,1).data[3]>24;
    });
  });
}
$('doll').addEventListener('pointerdown',e=>{
  if(e.button!==0||!e.isPrimary)return;
  if(step==='accessory'){
    const point=canvasPoint(e),accessory=visibleAccessoryAt(point);if(!accessory)return;
    const origin=selectedAccessoryPositions()[accessory.id]||{x:0,y:0};
    accessoryEditId=accessory.id;syncAccessoryTargets();accessoryDrag={id:e.pointerId,accessoryId:accessory.id,start:point,startClient:{x:e.clientX,y:e.clientY},pointerType:e.pointerType,origin:{...origin},saveBeforeDrag:save,moved:false};
    $('doll').setPointerCapture(e.pointerId);e.preventDefault();return;
  }
});
$('doll').addEventListener('pointermove',e=>{
  if(accessoryDrag&&accessoryDrag.id===e.pointerId){
    const point=canvasPoint(e),distance=Math.hypot(e.clientX-accessoryDrag.startClient.x,e.clientY-accessoryDrag.startClient.y),threshold=accessoryDrag.pointerType==='touch'?10:5;
    if(distance>threshold)accessoryDrag.moved=true;if(!accessoryDrag.moved)return;
    const accessory=assets.accessories.find(a=>a.id===accessoryDrag.accessoryId),base=accessoryFrame(selectedCharacter(),accessory);
    const rawX=accessoryDrag.origin.x+point.x-accessoryDrag.start.x,rawY=accessoryDrag.origin.y+point.y-accessoryDrag.start.y;
    const offset={x:Math.max(-base.x,Math.min(600-base.x-base.width,rawX)),y:Math.max(-base.y,Math.min(700-base.y-base.height,rawY))};
    save=setAccessoryPosition(save,accessory.id,selectedOutfit()?.id,offset,assets);$('doll').classList.add('accessory-editing');renderDoll();return;
  }
  if(step==='accessory'){$('doll').classList.toggle('accessory-hover',Boolean(visibleAccessoryAt(canvasPoint(e))));return;}
});
function endAccessoryDrag(e,cancelled=false){
  if(!accessoryDrag||accessoryDrag.id!==e.pointerId)return false;
  const drag=accessoryDrag;accessoryDrag=null;
  if(cancelled)save=drag.saveBeforeDrag;else if(drag.moved)persist();
  $('doll').classList.remove('accessory-editing');renderDoll();
  if(drag.moved){dollClickSuppressed=true;setTimeout(()=>dollClickSuppressed=false,0);if(!cancelled){const accessory=assets.accessories.find(a=>a.id===drag.accessoryId);say(`${accessory.name} 위치를 옮겼어!`);toast('원하는 자리에 놓았어요.');}}
  return true;
}
$('doll').addEventListener('pointerup',e=>endAccessoryDrag(e));$('doll').addEventListener('pointercancel',e=>endAccessoryDrag(e,true));$('doll').addEventListener('lostpointercapture',e=>endAccessoryDrag(e,true));
$('doll').addEventListener('pointerleave',()=>{if(!accessoryDrag)$('doll').classList.remove('accessory-hover');});
$('doll').addEventListener('click',()=>{if(dollClickSuppressed)return;say('헤헤, 네가 톡 눌러 주니 간질간질해!');animateDoll();particles();chime();});
$('doll').addEventListener('keydown',e=>{if(step!=='accessory'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();nudgeAccessory(accessoryEditId||selectedAccessories()[0]?.id,e.key,e.shiftKey);});
window.addEventListener('resize',applyPosition);

function toggleChest(){chestOpen=!chestOpen;$('chest').classList.toggle('open',chestOpen);$('chest').setAttribute('aria-expanded',String(chestOpen));$('chest').setAttribute('aria-label',chestOpen?'선물 상자 닫기':'선물 상자 열기');say(chestOpen?'우와! 반짝이는 별 선물이 들어 있었어!':'상자를 살포시 닫았어. 다시 열어도 좋아!');if(chestOpen)particles('sparkle',{x:18,y:75});chime();}
$('chest').addEventListener('click',toggleChest);
function pose(){animateDoll('twirl');say('빙그르르! 오늘의 코디, 정말 마음에 들어!');particles();chime();}
$('pose-button').addEventListener('click',pose);$('mirror').addEventListener('click',pose);
$('bubble-toy').addEventListener('click',()=>{particles('bubbles',{x:18,y:70});say('몽글몽글 비눗방울! 저기까지 날아가네!');chime();});
function talk(text){const friend=step==='play'?playScene?.selectedOptions():null;if(step==='play'&&!friend){say('먼저 함께 놀 친구를 추가해 주세요.');return;}const answer=replyFor(text,{character:friend?.character||selectedCharacter(),outfit:friend?friend.outfit:selectedOutfit(),background:selectedBackground(),chestOpen});say(answer.line,true);if(answer.action==='twirl')animateDoll('twirl');else animateDoll();particles(answer.action==='bubbles'?'bubbles':'sparkle');}
for(const button of document.querySelectorAll('[data-talk]'))button.addEventListener('click',()=>talk(button.dataset.talk));
for(const button of document.querySelectorAll('[data-step]'))button.addEventListener('click',()=>setStep(button.dataset.step));
$('next-button').addEventListener('click',()=>setStep(steps[(steps.indexOf(step)+1)%steps.length]));

function updateSound(){$('sound-button').setAttribute('aria-pressed',String(save.sound));$('sound-button').setAttribute('aria-label',save.sound?'소리 끄기':'소리 켜기');}
$('sound-button').addEventListener('click',()=>{save={...save,sound:!save.sound};persist();updateSound();if(!save.sound){abortVoice();if('speechSynthesis'in window)speechSynthesis.cancel();}else chime();updateVoiceUI();});
$('settings-button').addEventListener('click',()=>{abortVoice();$('settings-dialog').showModal();});
for(const button of document.querySelectorAll('.close-dialog'))button.addEventListener('click',()=>$('settings-dialog').close());
function updateVoiceUI(){
  if(!voiceRepeater)return;
  const state=voiceRepeater.state,busy=['requesting','recording','processing'].includes(state);
  $('mic-button').disabled=!voiceRepeater.supported||state==='processing';
  $('mic-label').textContent=state==='requesting'?'녹음 취소':state==='recording'?'녹음 멈추기':state==='processing'?'목소리를 바꾸는 중…':state==='playing'?'새로 녹음하기':'녹음 시작';
  $('mic-button').classList.toggle('listening',state==='recording');$('mic-button').classList.toggle('processing',state==='processing');
  $('replay-button').hidden=!voiceRepeater.hasRecording;$('replay-button').disabled=busy;$('replay-button').textContent=state==='playing'?'멈추기':'다시 듣기';
  $('voice-player').hidden=!voiceRepeater.hasRecording;
  $('voice-enabled').disabled=!voiceRepeater.supported;
  if(!voiceRepeater.supported)$('voice-hint').textContent='이 브라우저에서는 따라 말하기를 사용할 수 없어요. 이야기 버튼으로 놀아 주세요.';
  else if(!voiceAllowed)$('voice-hint').textContent='목소리 따라 말하기는 보호자 설정에서 켤 수 있어요.';
  playScene?.setVoiceState(voiceTargetId,state);
}
function voiceMessage(text){$('voice-hint').textContent=text;$('speech').textContent=text;updateVoiceUI();if(text)requestAnimationFrame(()=>$('voice-hint').textContent=text);}
voiceRepeater=createVoiceRepeater({mediaDevices:navigator.mediaDevices,MediaRecorderCtor:window.MediaRecorder,audioElement:$('voice-player'),
  onState:()=>updateVoiceUI(),onMessage:voiceMessage,onPlayTarget:(id,active)=>playScene?.setVoiceState(id,active?'playing':'ready')});
$('voice-enabled').addEventListener('change',()=>{voiceAllowed=$('voice-enabled').checked;if(!voiceAllowed)abortVoice();updateVoiceUI();});
function abortVoice(clearRecording=true){voiceTargetId=null;voiceRepeater?.cancel({clearRecording});if(assets)updateVoiceUI();}
function startVoice(){
  if(['requesting','recording'].includes(voiceRepeater.state)){voiceRepeater.stop();return;}
  if(!voiceRepeater.supported)return;
  if(!voiceAllowed){$('settings-dialog').showModal();return;}
  if(!save.sound){voiceMessage('소리를 켜면 친구 목소리를 들을 수 있어요.');return;}
  const friend=playScene?.selectedOptions(),instanceId=playScene?.selectedId();
  if(!friend||!instanceId){voiceMessage('먼저 함께 놀 친구를 골라 주세요.');return;}
  if('speechSynthesis'in window)speechSynthesis.cancel();voiceTargetId=instanceId;
  voiceRepeater.start({instanceId,characterId:friend.character.id});
}
$('mic-button').addEventListener('click',startVoice);
$('replay-button').addEventListener('click',()=>{if(voiceRepeater.state==='playing')voiceRepeater.cancel({clearRecording:false});else voiceRepeater.replay();updateVoiceUI();});
window.addEventListener('pagehide',()=>abortVoice());document.addEventListener('visibilitychange',()=>{if(document.hidden){abortVoice();if('speechSynthesis'in window)speechSynthesis.cancel();}});

$('photo-button').addEventListener('click',async()=>{
  const button=$('photo-button');button.disabled=true;
  try{
    if(step==='play'){
      const canvas=await playScene.photo(loadImage,selectedBackground());
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Empty image');
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='chuchu-friends.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('친구들과 단체 사진을 저장했어요!');return;
    }
    const c=selectedCharacter(),o=selectedOutfit(),b=selectedBackground(),chosen=selectedAccessories();const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;const ctx=canvas.getContext('2d');
    await ensureDollImages(c,o,chosen);
    ctx.fillStyle='#fff8f2';ctx.fillRect(0,0,1200,900);
    if(b.image){const bg=await loadImage(b.image);const factor=Math.max(1200/bg.width,770/bg.height);ctx.drawImage(bg,(1200-bg.width*factor)/2,(770-bg.height*factor)/2,bg.width*factor,bg.height*factor);}else{const gradient=ctx.createLinearGradient(0,0,0,770);gradient.addColorStop(0,'#fff9f3');gradient.addColorStop(1,'#f4dce7');ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,770);}
    ctx.save();ctx.fillStyle='#79546d2e';ctx.beginPath();ctx.ellipse(600,738,105,16,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(300,55);drawDoll(ctx,{character:c,outfit:o,accessories:chosen,accessoryPositions:selectedAccessoryPositions(),images:decodedImages});ctx.restore();
    ctx.fillStyle='#fffaf6';ctx.fillRect(0,770,1200,130);ctx.fillStyle='#775267';ctx.textAlign='center';ctx.font='bold 34px sans-serif';ctx.fillText(c.name+'와 함께한 하루',600,824);ctx.font='22px sans-serif';ctx.fillText([o?.name||'기본 모습',...chosen.map(a=>a.name),b.name].join(' · '),600,862,1120);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Empty image');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=c.id+'-my-outfit.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('오늘의 코디 사진을 저장했어요!');
  }catch{toast('사진을 저장하지 못했어요. 다시 시도해 주세요.');}finally{button.disabled=false;}
});

async function init(){
  try{
    const response=await fetch('assets/runtime/game-assets.json');if(!response.ok)throw new Error('옷장 정보를 불러오지 못했어요.');assets=await response.json();
    assets.accessories=[...accessories];assets.backgrounds.push(...extraBackgrounds);
    const expansion=await loadExpansionAssets(assets);
    assets.accessories.push(...expansion.accessories);assets.outfits.push(...expansion.outfits);assets.props=expansion.props;
    let stored={};try{stored=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');}catch{}
    save=makeSave(assets,stored);
    await ensureDollImages();
    playScene=setupPlayScene({assets,images:decodedImages,loadImage,getSave:()=>save,commit:(next,store=true)=>{save=next;if(store)persist();},say,onSelect:()=>{abortVoice();if('speechSynthesis'in window)speechSynthesis.cancel();},onGreet:()=>{talk('안녕');animateDoll();chime();}});
    renderAll();renderPlayProps();setStep('dress');updateVoiceUI();
    setupPresets({assets,getSave:()=>save,commit:next=>{if(!persist(next))return false;save=next;return true;},onApply:preset=>{accessoryEditId=null;if(step==='play')setStep('dress');renderAll();say(`${preset.name} 코디를 입었어! 함께 놀자!`);animateDoll();},onOpen:abortVoice});
    $('presets-button').disabled=false;
    $('loading').hidden=true;$('app').setAttribute('aria-busy','false');$('app').dataset.ready='true';
    if(expansion.warnings.length)toast('일부 새 아이템을 불러오지 못했어요. 다른 아이템으로 계속 놀 수 있어요.');
  }catch(error){$('loading').classList.add('error');$('loading').querySelector('p').textContent='옷장을 열지 못했어요. 새로고침해 주세요.';const retry=document.createElement('button');retry.className='primary-button';retry.textContent='다시 열기';retry.addEventListener('click',()=>location.reload());$('loading').append(retry);console.error(error);}
}
init();
