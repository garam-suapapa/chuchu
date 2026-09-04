// Stage and photo share this exact layer order. Legacy outfits keep their
// precomposed worn sprite until they receive an approved layered master.
export function accessoryFrame(character,accessory,offset={x:0,y:0}) {
  const frames={
    hachuping:{
      'heart-bow':{x:82,y:42,width:150,height:100},
      'star-crown':{x:225,y:5,width:150,height:100},
      'flower-pin':{x:414,y:66,width:108,height:72},
      bag:{x:285,y:315,width:215,height:310}
    },
    soraping:{
      'heart-bow':{x:172,y:45,width:150,height:100},
      'star-crown':{x:225,y:0,width:150,height:100},
      'flower-pin':{x:175,y:63,width:110,height:73},
      bag:{x:295,y:325,width:205,height:296}
    },
    challangping:{
      'heart-bow':{x:135,y:45,width:155,height:103},
      'star-crown':{x:225,y:5,width:150,height:100},
      'flower-pin':{x:142,y:72,width:110,height:73},
      bag:{x:285,y:325,width:210,height:303}
    },
    bangulping:{
      'heart-bow':{x:222,y:35,width:156,height:104},
      'star-crown':{x:225,y:0,width:150,height:100},
      'flower-pin':{x:410,y:66,width:110,height:73},
      bag:{x:285,y:330,width:210,height:303}
    }
  };
  const characterFrames=frames[character.id];
  if(!characterFrames)throw new Error(`Unknown character accessory frame: ${character.id}`);
  const frame=characterFrames[accessory.id]||(accessory.slot==='bag'?characterFrames.bag:null);
  if(!frame)throw new Error(`Unknown accessory frame: ${character.id}/${accessory.id}`);
  return {...frame,x:frame.x+(Number.isFinite(offset.x)?offset.x:0),y:frame.y+(Number.isFinite(offset.y)?offset.y:0)};
}

export function drawDoll(ctx,{character,outfit,accessories=[],accessoryPositions={},images}) {
  // The undressed source retains the original clasped hands. Each worn asset
  // already contains its own coherent clothing, arms and hands.
  for(const accessory of accessories.filter(item=>item.slot==='bag'&&item.backSprite)){
    const frame=accessoryFrame(character,accessory,accessoryPositions[accessory.id]);
    ctx.drawImage(images.get(accessory.backSprite),frame.x,frame.y,frame.width,frame.height);
  }
  const dollSprites=outfit?.renderLayers?.length?outfit.renderLayers.map(layer=>layer.src):[outfit?outfit.wornSprite:character.base];
  for(const sprite of dollSprites)ctx.drawImage(images.get(sprite),0,0,600,700);
  for(const accessory of accessories){
    const frame=accessoryFrame(character,accessory,accessoryPositions[accessory.id]);
    ctx.drawImage(images.get(accessory.frontSprite||accessory.sprite),frame.x,frame.y,frame.width,frame.height);
  }
}
