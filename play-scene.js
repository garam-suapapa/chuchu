import {addSceneDoll,moveSceneDoll,removeSceneDoll,clampPosition} from './game-state.js';
import {drawDoll} from './doll-renderer.js';

export function setupPlayScene({assets,images,loadImage,getSave,commit,say,onSelect,onGreet}){
  const $=id=>document.getElementById(id),nodes=new Map();
  let activeId=null,visible=false,drag=null;
  const entries=()=>getSave().scene||[];
  const selected=()=>entries().find(e=>e.id===activeId);
  const options=entry=>({character:assets.characters.find(c=>c.id===entry.characterId),outfit:assets.outfits.find(o=>o.id===entry.outfitId),accessories:assets.accessories.filter(a=>entry.accessories[a.slot]===a.id),accessoryPositions:entry.positions,images});
  const imageSources=entry=>{
    const {character,outfit,accessories}=options(entry);
    return [...new Set([
      ...(outfit?.renderLayers?.length?outfit.renderLayers.map(layer=>layer.src):[outfit?outfit.wornSprite:character.base]),
      ...accessories.flatMap(a=>[a.backSprite,a.frontSprite||a.sprite]).filter(Boolean)
    ])];
  };
  function drawWhenReady(canvas,entry,button){
    const draw=()=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);drawDoll(ctx,options(entry));};
    const missing=imageSources(entry).filter(src=>!images.has(src));
    if(!missing.length){draw();return;}
    button?.setAttribute('aria-busy','true');
    Promise.all(missing.map(loadImage)).then(()=>{if(canvas.isConnected)draw();}).catch(error=>{console.error(error);say('친구 모습을 불러오지 못했어요. 다시 추가해 주세요.');}).finally(()=>button?.removeAttribute('aria-busy'));
  }
  function dimensions(){
    const stage=$('stage');
    const width=Math.min(208,stage.clientWidth*.38,stage.clientHeight*.48*6/7);
    return {width,height:width*7/6};
  }
  function layout(){
    if(!visible)return;
    const bounds=$('stage').getBoundingClientRect(),size=dimensions();
    entries().forEach((entry,index)=>{
      const node=nodes.get(entry.id);if(!node)return;
      const p=clampPosition(entry.x,entry.y,bounds,size);
      Object.assign(node.wrapper.style,{width:size.width+'px',height:size.height+'px',left:p.x*100+'%',top:p.y*100+'%',zIndex:index+1});
    });
  }
  function sync(){
    const entry=selected();
    $('add-friend').textContent=`친구 추가 · ${entries().length}/5`;
    $('add-friend').disabled=entries().length>=5;
    $('remove-friend').disabled=!entry;
    $('scene-selection').textContent=entry?`${options(entry).character.name} · ${entry.name}`:'친구를 추가해 함께 놀아요.';
    $('scene-roster').replaceChildren(...entries().map(e=>{
      const button=document.createElement('button');button.type='button';button.textContent=`${options(e).character.name} · ${e.name}`;
      button.setAttribute('aria-pressed',String(e.id===activeId));
      button.addEventListener('click',()=>{select(e.id);nodes.get(e.id)?.button.focus();});return button;
    }));
    for(const [id,node] of nodes)node.button.setAttribute('aria-pressed',String(id===activeId));
    if(visible){
      $('character-name').textContent=entry?options(entry).character.name:'우리의 놀이터';
      $('current-outfit').textContent=entry?[entry.name,options(entry).outfit?.name||'기본 모습'].join(' · '):'무대에 친구를 추가해 주세요';
    }
  }
  function select(id){
    const entry=entries().find(e=>e.id===id);if(!entry)return;
    if(activeId!==id)onSelect();
    activeId=id;
    commit({...getSave(),scene:[...entries().filter(e=>e.id!==id),entry]});
    layout();sync();
  }
  function updatePosition(id,p,save=true){commit(moveSceneDoll(getSave(),id,p),save);layout();}
  function finish(cancelled=false){
    if(!drag)return;
    const current=drag;drag=null;
    nodes.get(current.id)?.button.classList.remove('dragging');
    if(cancelled)updatePosition(current.id,current.origin);
    else {commit(getSave());if(current.moved)say('여기도 좋다! 다음에는 어디로 갈까?');}
  }
  function render(){
    const valid=new Set(entries().map(e=>e.id));
    for(const [id,node] of nodes)if(!valid.has(id)){node.wrapper.remove();nodes.delete(id);}
    for(const entry of entries()){
      if(nodes.has(entry.id))continue;
      const wrapper=document.createElement('div');wrapper.className='play-doll-position';wrapper.dataset.sceneId=entry.id;
      const button=document.createElement('button');button.type='button';button.className='doll play-doll';button.setAttribute('aria-label',`${options(entry).character.name} · ${entry.name}, 끌거나 화살표 키로 이동`);
      const canvas=document.createElement('canvas');canvas.width=600;canvas.height=700;canvas.setAttribute('aria-hidden','true');
      drawWhenReady(canvas,entry,button);button.append(canvas);wrapper.append(button);$('play-dolls').append(wrapper);
      nodes.set(entry.id,{wrapper,button,canvas});
      let suppressClick=false;
      button.addEventListener('pointerdown',e=>{
        if(e.button!==0||!e.isPrimary||drag)return;
        select(entry.id);button.focus({preventScroll:true});
        const size=dimensions(),bounds=$('stage').getBoundingClientRect(),current=selected();
        drag={id:entry.id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,origin:clampPosition(current.x,current.y,bounds,size),moved:false};
        suppressClick=false;button.setPointerCapture(e.pointerId);e.preventDefault();
      });
      button.addEventListener('pointermove',e=>{
        if(!drag||drag.id!==entry.id||drag.pointerId!==e.pointerId)return;
        if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;
        if(!drag.moved)return;
        const bounds=$('stage').getBoundingClientRect();
        updatePosition(entry.id,clampPosition(drag.origin.x+(e.clientX-drag.x)/bounds.width,drag.origin.y+(e.clientY-drag.y)/bounds.height,bounds,dimensions()),false);
        button.classList.add('dragging');
      });
      button.addEventListener('pointerup',e=>{if(drag?.id===entry.id&&drag.pointerId===e.pointerId){suppressClick=drag.moved;finish();}});
      for(const event of ['pointercancel','lostpointercapture'])button.addEventListener(event,e=>{if(drag?.id===entry.id&&drag.pointerId===e.pointerId){suppressClick=true;finish(true);}});
      button.addEventListener('click',e=>{if(suppressClick&&e.detail>0){suppressClick=false;return;}suppressClick=false;select(entry.id);onGreet();});
      button.addEventListener('keydown',e=>{
        const delta={ArrowLeft:[-.05,0],ArrowRight:[.05,0],ArrowUp:[0,-.05],ArrowDown:[0,.05]}[e.key];if(!delta)return;
        e.preventDefault();select(entry.id);const current=selected(),bounds=$('stage').getBoundingClientRect();
        const p=clampPosition(current.x,current.y,bounds,dimensions());updatePosition(entry.id,clampPosition(p.x+delta[0],p.y+delta[1],bounds,dimensions()));
      });
    }
    if(!selected())activeId=entries().at(-1)?.id||null;
    layout();sync();
  }
  function add(characterId,presetId=null){
    const id=crypto.randomUUID(),next=addSceneDoll(getSave(),id,characterId,presetId);
    if(next===getSave())return;
    commit(next);activeId=id;onSelect();render();$('friends-dialog').close();nodes.get(id)?.button.focus();say('새 친구가 왔어! 같이 놀자!');
  }
  $('add-friend').addEventListener('click',()=>{
    onSelect();const list=$('friend-presets');list.replaceChildren();
    const addCard=(characterId,snapshot,presetId,label)=>{
      const card=document.createElement('button');card.type='button';card.className='friend-preset';
      const canvas=document.createElement('canvas');canvas.width=600;canvas.height=700;canvas.setAttribute('aria-hidden','true');
      drawWhenReady(canvas,{...snapshot,characterId},card);
      const name=document.createElement('span');name.textContent=label;card.append(canvas,name);card.addEventListener('click',()=>add(characterId,presetId));list.append(card);
    };
    const save=getSave(),id=save.characterId,outfitId=save.outfits[id];
    addCard(id,{outfitId,accessories:save.accessories[id],positions:save.accessoryPositions[id]?.[outfitId||'base']||{}},null,`${assets.characters.find(c=>c.id===id).name} · 지금 입은 코디`);
    let count=0;
    for(const c of assets.characters)for(const preset of save.presets[c.id]){addCard(c.id,preset,preset.id,`${c.name} · ${preset.name}`);count++;}
    $('friend-empty').hidden=count>0;$('friends-dialog').showModal();
  });
  $('friends-close').addEventListener('click',()=>$('friends-dialog').close());
  $('remove-friend').addEventListener('click',()=>{
    if(!selected())return;finish(true);onSelect();commit(removeSceneDoll(getSave(),activeId));activeId=null;render();$('add-friend').focus();say('친구를 무대에서 뺐어요. 다시 불러올 수 있어요.');
  });
  window.addEventListener('resize',layout);
  window.addEventListener('blur',()=>finish(true));
  return {
    setVisible(value){finish(true);visible=value;$('play-dolls').hidden=!value;$('doll-position').hidden=value;
      if(value&&getSave().scene===null)commit(addSceneDoll(getSave(),crypto.randomUUID()));
      if(value)render();
    },
    refresh(){if(visible)render();},
    selectedOptions(){return selected()?options(selected()):null;},
    selectedId(){return selected()?.id||null;},
    selectedButton(){return nodes.get(activeId)?.button;},
    setVoiceState(id,state){for(const node of nodes.values())node.wrapper.classList.remove('voice-listening','voice-speaking');const node=nodes.get(id);if(node&&state==='recording')node.wrapper.classList.add('voice-listening');if(node&&state==='playing')node.wrapper.classList.add('voice-speaking');},
    async photo(loadImage,background){
      // Use stage aspect ratio and the same cover crop, size, and stacking as the live scene.
      const bounds=$('stage').getBoundingClientRect(),size=dimensions(),snapshot=entries().map(e=>({...e}));
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=Math.round(1200*bounds.height/bounds.width);
      const ctx=canvas.getContext('2d'),scale=canvas.width/bounds.width;
      await Promise.all([...new Set(snapshot.flatMap(imageSources))].map(loadImage));
      ctx.fillStyle='#fff8f2';ctx.fillRect(0,0,canvas.width,canvas.height);
      if(background.image){const bg=await loadImage(background.image),factor=Math.max(canvas.width/bg.width,canvas.height/bg.height);ctx.drawImage(bg,(canvas.width-bg.width*factor)/2,(canvas.height-bg.height*factor)/2,bg.width*factor,bg.height*factor);}
      for(const entry of snapshot){const p=clampPosition(entry.x,entry.y,bounds,size);ctx.save();ctx.translate((p.x*bounds.width-size.width/2)*scale,(p.y*bounds.height-size.height/2)*scale);ctx.scale(size.width*scale/600,size.height*scale/700);drawDoll(ctx,options(entry));ctx.restore();}
      return canvas;
    }
  };
}
