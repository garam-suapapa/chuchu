const VOICE_RATES={hachuping:1.25,soraping:1.15,challangping:1.35,bangulping:1.25};

export function voiceRateFor(characterId){return VOICE_RATES[characterId]||1.25;}

function stopTracks(stream){for(const track of stream?.getTracks?.()||[])track.stop();}

function writeAscii(view,offset,text){
  for(let index=0;index<text.length;index++)view.setUint8(offset+index,text.charCodeAt(index));
}

export function wavBlobFromChunks(chunks,sampleCount,sampleRate,peak){
  const buffer=new ArrayBuffer(44+sampleCount*2),view=new DataView(buffer);
  writeAscii(view,0,'RIFF');view.setUint32(4,36+sampleCount*2,true);writeAscii(view,8,'WAVE');
  writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  writeAscii(view,36,'data');view.setUint32(40,sampleCount*2,true);
  const gain=peak>0?Math.min(6,.88/peak):1;
  let offset=44;
  for(const chunk of chunks)for(let index=0;index<chunk.length;index++){
    const sample=Math.max(-1,Math.min(1,chunk[index]*gain));
    view.setInt16(offset,sample<0?sample*0x8000:sample*0x7fff,true);offset+=2;
  }
  return new Blob([buffer],{type:'audio/wav'});
}

export function createVoiceRepeater({
  mediaDevices,
  AudioContextCtor,
  audioElement,
  createObjectURL=blob=>URL.createObjectURL(blob),
  revokeObjectURL=url=>URL.revokeObjectURL(url),
  setTimer=(fn,delay)=>setTimeout(fn,delay),
  clearTimer=id=>clearTimeout(id),
  onState=()=>{},
  onMessage=()=>{},
  onLevel=()=>{},
  onInput=()=>{},
  onDevices=()=>{},
  onPlayTarget=()=>{}
}={}){
  let currentTarget=null,inputTimer=null,track=null,blocks=0;
  let selectedDeviceId='';
  let phase='idle',context=null,stream=null,inputNode=null,processor=null,muteGain=null,maxTimer=null;
  let pcmChunks=[],sampleCount=0,peak=0,recording=null,player=null,playTarget=null,generation=0,settled=Promise.resolve();
  const supported=Boolean(mediaDevices?.getUserMedia&&AudioContextCtor&&audioElement?.play);

  function setState(next){phase=next;onState(next);}
  function message(text){onMessage(text);}
  async function resumeInput(audio){
    if(audio.state==='running')return;
    let timer;
    try{
      await Promise.race([audio.resume(),new Promise((_,reject)=>{
        timer=setTimer(()=>reject(new Error('audio-suspended')),2500);
      })]);
      if(audio.state!=='running')throw new Error('audio-suspended');
    }finally{clearTimer(timer);}
  }
  async function updateDevices(token){
    if(!mediaDevices.enumerateDevices)return;
    try{
      const devices=await mediaDevices.enumerateDevices();
      if(token===generation)onDevices(devices.filter(device=>device.kind==='audioinput').map(device=>({
        id:device.deviceId,label:device.label||'마이크'
      })),track?.getSettings?.().deviceId||selectedDeviceId);
    }catch{/* Device labels are optional; capturing can continue. */}
  }
  function stopPlayback(){
    if(!player)return;
    const current=player;player=null;current.onended=null;current.onerror=null;
    try{current.pause();current.currentTime=0;}catch{}
    if(playTarget!==null)onPlayTarget(playTarget,false);
    playTarget=null;
  }
  function stopCapture(){
    clearTimer(inputTimer);inputTimer=null;
    if(track){track.onmute=null;track.onunmute=null;track.onended=null;track=null;}
    if(processor){processor.onaudioprocess=null;try{processor.disconnect();}catch{}processor=null;}
    if(inputNode){try{inputNode.disconnect();}catch{}inputNode=null;}
    if(muteGain){try{muteGain.disconnect();}catch{}muteGain=null;}
    stopTracks(stream);stream=null;onLevel(0);
  }
  function clearRecording(){
    if(recording?.url)revokeObjectURL(recording.url);
    if(audioElement.src){audioElement.removeAttribute('src');audioElement.load();}
    recording=null;
  }
  function fail(text,token,{keepRecording=false}={}){
    if(token!==generation)return;
    clearTimer(maxTimer);maxTimer=null;
    stopCapture();stopPlayback();pcmChunks=[];sampleCount=0;peak=0;
    if(!keepRecording)clearRecording();
    setState(recording?'ready':'idle');message(text);onInput(text);
  }
  async function play(saved,token,{automatic=false}={}){
    if(!saved||token!==generation)return false;
    stopPlayback();
    try{
      const next=audioElement;next.src=saved.url;
      next.preload='auto';next.muted=false;next.volume=1;next.defaultPlaybackRate=saved.rate;next.playbackRate=saved.rate;
      if('preservesPitch'in next)next.preservesPitch=false;
      if('webkitPreservesPitch'in next)next.webkitPreservesPitch=false;
      if('mozPreservesPitch'in next)next.mozPreservesPitch=false;
      player=next;playTarget=saved.target.instanceId;
      next.onended=()=>{
        if(player===next){player=null;onPlayTarget(playTarget,false);playTarget=null;if(token===generation)setState('ready');}
      };
      next.onerror=()=>fail('녹음은 됐어요. 아래 재생 버튼을 눌러 주세요.',token,{keepRecording:true});
      await next.play();
      if(token!==generation){stopPlayback();return false;}
      setState('playing');message('내 목소리를 따라 하는 중이에요!');onPlayTarget(playTarget,true);
      return true;
    }catch{
      fail(automatic?'녹음됐어요. 아래 ▶ 버튼을 눌러 들어 보세요.':'소리 재생이 막혔어요. 기기 볼륨을 확인해 주세요.',token,{keepRecording:true});
      return false;
    }
  }
  async function finishRecording(token,target){
    if(token!==generation)return;
    clearTimer(maxTimer);maxTimer=null;stopCapture();
    const tooShort=sampleCount<context.sampleRate*.35,tooQuiet=peak<.00005;
    if(blocks===0){fail('브라우저가 마이크 입력을 전달하지 않았어요. 외부 브라우저에서 열거나 다른 마이크를 선택해 주세요.',token);return;}
    if(tooShort||tooQuiet){
      pcmChunks=[];sampleCount=0;peak=0;
      fail(tooQuiet?'마이크 소리가 감지되지 않았어요. 볼륨 바를 확인하며 다시 말해 주세요.':'조금 더 길게 말해 줘!',token);
      return;
    }
    setState('processing');message('친구 목소리로 바꾸는 중…');
    try{
      const blob=wavBlobFromChunks(pcmChunks,sampleCount,context.sampleRate,peak);
      pcmChunks=[];sampleCount=0;peak=0;clearRecording();
      recording={blob,url:createObjectURL(blob),target,rate:voiceRateFor(target.characterId)};
      setState('ready');
      await play(recording,token,{automatic:true});
    }catch{fail('목소리를 다시 들려줄래? 잘 담지 못했어.',token);}
  }
  async function start(target){
    if(!supported){message('이 브라우저에서는 따라 말하기를 사용할 수 없어요. 이야기 버튼으로 놀아 주세요.');return false;}
    cancel({clearRecording:true,silent:true});currentTarget={...target};const token=++generation;
    setState('requesting');message('마이크 사용을 허용해 주세요.');onInput('마이크 연결 중…');
    try{
      context||=new AudioContextCtor();
      const audio=context;
      // Unlock during the click, then resume again after microphone permission.
      void audio.resume().catch(()=>{});
      const acquired=await mediaDevices.getUserMedia({
        audio:selectedDeviceId?{deviceId:{exact:selectedDeviceId}}:true,video:false
      });
      if(token!==generation){stopTracks(acquired);return false;}
      stream=acquired;track=stream.getAudioTracks()[0];
      if(!track||track.readyState==='ended')throw new Error('input-ended');
      void updateDevices(token);
      onInput((track.label||'마이크')+' · 입력 준비 중');
      await resumeInput(audio);
      if(token!==generation)return false;
      pcmChunks=[];sampleCount=0;peak=0;blocks=0;
      track.onended=()=>fail('마이크 연결이 끊겼어요. 다시 연결하거나 다른 마이크를 선택해 주세요.',token);
      track.onmute=()=>{if(token===generation)onInput((track?.label||'마이크')+' · 브라우저에서 입력이 일시 중단됐어요');};
      track.onunmute=()=>{if(token===generation)onInput((track?.label||'마이크')+' · 소리를 기다리고 있어요');};
      inputNode=audio.createMediaStreamSource(stream);
      processor=audio.createScriptProcessor(2048,1,1);
      muteGain=audio.createGain();muteGain.gain.value=0;
      processor.onaudioprocess=event=>{
        if(token!==generation||phase!=='recording')return;
        const input=event.inputBuffer.getChannelData(0),copy=new Float32Array(input);
        let squareSum=0,blockPeak=0;
        for(let index=0;index<copy.length;index++){const value=copy[index];squareSum+=value*value;blockPeak=Math.max(blockPeak,Math.abs(value));}
        pcmChunks.push(copy);sampleCount+=copy.length;peak=Math.max(peak,blockPeak);blocks++;
        if(blocks===1||blocks%8===0)onInput((track?.label||'마이크')+(blockPeak>.00005?' · 소리 감지됨':' · 입력은 연결됐지만 소리가 없어요'));
        onLevel(Math.min(1,Math.pow(Math.sqrt(squareSum/copy.length),.6)*3));
      };
      inputNode.connect(processor);processor.connect(muteGain);muteGain.connect(audio.destination);
      setState('recording');message('듣고 있어요… 볼륨 바를 확인해 주세요. 최대 8초');
      inputTimer=setTimer(()=>{
        if(token!==generation||phase!=='recording')return;
        if(blocks===0){
          fail('브라우저가 마이크 입력을 전달하지 않았어요. 외부 브라우저에서 열거나 다른 마이크를 선택해 주세요.',token);
        }else if(peak<.00005){
          onInput((track?.label||'마이크')+' · 소리가 없어요. 마이크 선택과 음소거를 확인해 주세요.');
        }
      },2500);
      maxTimer=setTimer(()=>{if(token===generation&&phase==='recording'){setState('processing');settled=finishRecording(token,target);}},8000);
      return true;
    }catch(error){
      if(token!==generation)return false;
      if(error?.message==='audio-suspended'){fail('마이크 입력이 일시 정지됐어요. 녹음 시작을 다시 눌러 주세요.',token);return false;}
      const denied=['NotAllowedError','SecurityError'].includes(error?.name);
      fail(denied?'마이크 사용이 꺼져 있어요. 브라우저 설정에서 허용해 주세요.':'마이크를 사용할 수 없어요. 연결을 확인해 주세요.',token);
      return false;
    }
  }
  function stop(){
    if(phase==='requesting'){cancel({silent:true});message('이제 버튼을 누르고 말해 주세요.');onInput('마이크 연결을 취소했어요.');return;}
    if(phase!=='recording')return;
    const token=generation,target={...currentTarget};
    setState('processing');settled=finishRecording(token,target);
  }
  function cancel({clearRecording:shouldClear=true,silent=false}={}){
    generation++;clearTimer(maxTimer);maxTimer=null;stopCapture();stopPlayback();pcmChunks=[];sampleCount=0;peak=0;currentTarget=null;
    if(shouldClear)clearRecording();setState(recording?'ready':'idle');
    if(!silent)message(recording?'다시 들을 수 있어요.':'버튼을 누르면 녹음이 시작돼요. 다시 누르면 멈춰요. 최대 8초!');
  }
  function replay(){
    if(!recording)return false;
    const token=generation;settled=play(recording,token);return true;
  }
  function whenSettled(){return settled;}
  function selectDevice(id){cancel();selectedDeviceId=id;onInput('선택한 마이크로 녹음할 준비가 됐어요.');}

  return {get supported(){return supported;},get state(){return phase;},get hasRecording(){return Boolean(recording);},start,stop,cancel,replay,whenSettled,selectDevice};
}
