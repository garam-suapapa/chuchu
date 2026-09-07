import {storePreset,renamePreset,deletePreset,applyPreset} from './game-state.js';

export function setupPresets({assets,getSave,commit,onApply,onOpen}) {
  const $=id=>document.getElementById(id),dialog=$('presets-dialog');
  let deleted=null;
  const selected=()=>getSave().presets[getSave().characterId].find(p=>p.id===$('preset-select').value);
  const summary=(outfitId,accessories)=>[
    assets.outfits.find(o=>o.id===outfitId)?.name||'기본 모습',
    ...Object.values(accessories).filter(Boolean).map(id=>assets.accessories.find(a=>a.id===id)?.name).filter(Boolean)
  ].join(' · ');
  function updateSelection(){
    const preset=selected();
    $('preset-summary').textContent=preset?summary(preset.outfitId,preset.accessories):'마음에 드는 코디를 위에서 저장해 보세요.';
    for(const action of ['apply','replace','rename','delete'])$('preset-'+action).disabled=!preset;
  }
  function render(selectedId=$('preset-select').value){
    const save=getSave(),entries=save.presets[save.characterId];
    $('presets-title').textContent=assets.characters.find(c=>c.id===save.characterId).name+' 코디 보관함';
    $('preset-current-summary').textContent=summary(save.outfits[save.characterId],save.accessories[save.characterId]);
    $('preset-count').textContent=`(${entries.length}개)`;
    $('preset-select').replaceChildren(...entries.map(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=p.name;return option;}));
    if(!entries.length){const option=document.createElement('option');option.textContent='아직 저장한 프리셋이 없어요';option.value='';$('preset-select').append(option);}
    $('preset-select').disabled=!entries.length;
    if(entries.some(p=>p.id===selectedId))$('preset-select').value=selectedId;
    updateSelection();
  }
  function change(next,message,id){
    if(next===getSave())return false;
    if(!commit(next)){$('preset-status').textContent='저장하지 못했어요. 브라우저 저장 공간을 확인한 뒤 다시 시도해 주세요.';return false;}
    render(id);$('preset-status').textContent=message;return true;
  }
  function run(action){try{action();}catch(error){$('preset-status').textContent=error.message;$('preset-name').focus();}}
  $('presets-button').addEventListener('click',()=>{
    onOpen();deleted=null;$('preset-undo').hidden=true;$('preset-status').textContent='';$('preset-name').value='';render();dialog.showModal();$('preset-name').focus();
  });
  $('presets-close').addEventListener('click',()=>dialog.close());
  $('preset-select').addEventListener('change',()=>{updateSelection();$('preset-name').value=selected()?.name||'';$('preset-status').textContent='';});
  $('preset-create').addEventListener('click',()=>run(()=>{
    const id=crypto.randomUUID();
    change(storePreset(getSave(),id,$('preset-name').value),'새 프리셋을 저장했어요.',id);
  }));
  $('preset-apply').addEventListener('click',()=>{
    const preset=selected();if(!preset)return;
    if(change(applyPreset(getSave(),preset.id),`${preset.name} 코디를 불러왔어요.`,preset.id)){onApply(preset);dialog.close();}
  });
  $('preset-replace').addEventListener('click',()=>{
    const preset=selected();if(!preset)return;
    change(storePreset(getSave(),preset.id,preset.name,true),`${preset.name}을 현재 코디로 덮어썼어요.`,preset.id);
  });
  $('preset-rename').addEventListener('click',()=>run(()=>{
    const preset=selected();if(preset)change(renamePreset(getSave(),preset.id,$('preset-name').value),'프리셋 이름을 변경했어요.',preset.id);
  }));
  $('preset-delete').addEventListener('click',()=>{
    const preset=selected();if(!preset)return;
    const save=getSave(),index=save.presets[save.characterId].indexOf(preset);
    if(change(deletePreset(save,preset.id),`${preset.name}을 삭제했어요. 보관함을 닫기 전까지 취소할 수 있어요.`)){
      deleted={characterId:save.characterId,preset,index};$('preset-undo').hidden=false;
    }
  });
  $('preset-undo').addEventListener('click',()=>{
    const save=getSave();if(!deleted||deleted.characterId!==save.characterId)return;
    const entries=[...save.presets[save.characterId]];entries.splice(deleted.index,0,deleted.preset);
    if(change({...save,presets:{...save.presets,[save.characterId]:entries}},'삭제한 프리셋을 되돌렸어요.',deleted.preset.id)){deleted=null;$('preset-undo').hidden=true;$('preset-select').focus();}
  });
}
