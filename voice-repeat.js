const MIME_CANDIDATES=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'];
const VOICE_RATES={hachuping:1.25,soraping:1.15,challangping:1.35,bangulping:1.25};

export function voiceRateFor(characterId){return VOICE_RATES[characterId]||1.25;}

export function recorderOptionsFor(Recorder){
  if(typeof Recorder?.isTypeSupported!=='function')return {};
  const mimeType=MIME_CANDIDATES.find(type=>Recorder.isTypeSupported(type));
  return mimeType?{mimeType}:{};
}

function stopTracks(stream){for(const track of stream?.getTracks?.()||[])track.stop();}

export function createVoiceRepeater({
  mediaDevices,
  MediaRecorderCtor,
  audioElement,
  createObjectURL=blob=>URL.createObjectURL(blob),
  revokeObjectURL=url=>URL.revokeObjectURL(url),
  now=()=>performance.now(),
  setTimer=(fn,delay)=>setTimeout(fn,delay),
  clearTimer=id=>clearTimeout(id),
  onState=()=>{},
  onMessage=()=>{},
  onPlayTarget=()=>{}
}={}){
  let phase='idle',stream=null,recorder=null,chunks=[],startedAt=0,maxTimer=null;
  let recording=null,player=null,playTarget=null,generation=0,pressActive=false,settled=Promise.resolve();
  const supported=Boolean(mediaDevices?.getUserMedia&&MediaRecorderCtor&&audioElement?.play);

  function setState(next){phase=next;onState(next);}
  function message(text){onMessage(text);}
  function stopStream(){stopTracks(stream);stream=null;}
  function stopPlayback(){
    if(!player)return;
    const current=player;player=null;current.onended=null;current.onerror=null;
    try{current.pause();current.currentTime=0;}catch{}
    if(playTarget!==null)onPlayTarget(playTarget,false);
    playTarget=null;
  }
  function clearRecording(){
    if(recording?.url)revokeObjectURL(recording.url);
    if(audioElement.src){audioElement.removeAttribute('src');audioElement.load();}
    recording=null;
  }
  function fail(text,token,{keepRecording=false}={}){
    if(token!==generation)return;
    stopStream();recorder=null;chunks=[];stopPlayback();
    if(!keepRecording)clearRecording();
    setState(recording?'ready':'idle');message(text);
  }
  async function play(saved,token,{automatic=false}={}){
    if(!saved||token!==generation)return false;
    stopPlayback();
    try{
      const next=audioElement;next.src=saved.url;
      next.preload='auto';next.volume=.95;next.defaultPlaybackRate=saved.rate;next.playbackRate=saved.rate;
      if('preservesPitch'in next)next.preservesPitch=false;
      if('webkitPreservesPitch'in next)next.webkitPreservesPitch=false;
      if('mozPreservesPitch'in next)next.mozPreservesPitch=false;
      player=next;playTarget=saved.target.instanceId;
      next.onended=()=>{
        if(player===next){player=null;onPlayTarget(playTarget,false);playTarget=null;if(token===generation)setState('ready');}
      };
      next.onerror=()=>fail('녹음은 됐어요. 다시 듣기를 한 번 눌러 주세요.',token,{keepRecording:true});
      await next.play();
      if(token!==generation){stopPlayback();return false;}
      setState('playing');message('내 목소리를 따라 하는 중이에요!');onPlayTarget(playTarget,true);
      return true;
    }catch{
      fail(automatic?'녹음은 됐어요. 다시 듣기를 눌러 주세요.':'소리 재생이 막혔어요. 소리를 켜고 다시 눌러 주세요.',token,{keepRecording:true});
      return false;
    }
  }
  async function processRecording(token,duration,mimeType){
    if(token!==generation)return;
    if(duration<350||!chunks.some(chunk=>chunk.size>0)){fail('조금 더 길게 말해 줘!',token);return;}
    setState('processing');message('친구 목소리로 바꾸는 중…');
    try{
      const blob=new Blob(chunks,{type:mimeType||chunks[0]?.type||''});chunks=[];
      clearRecording();
      recording={blob,url:createObjectURL(blob),target:recorder.target,rate:voiceRateFor(recorder.target.characterId)};
      recorder=null;setState('ready');
      await play(recording,token,{automatic:true});
    }catch{fail('목소리를 다시 들려줄래? 잘 담지 못했어.',token);}
  }
  async function start(target){
    if(!supported){message('이 브라우저에서는 따라 말하기를 사용할 수 없어요. 이야기 버튼으로 놀아 주세요.');return false;}
    cancel({clearRecording:true,silent:true});pressActive=true;const token=++generation;
    setState('requesting');message('마이크 사용을 허용해 주세요.');
    try{
      const acquired=await mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      if(token!==generation||!pressActive){stopTracks(acquired);if(token===generation)setState('idle');return false;}
      stream=acquired;chunks=[];
      const options=recorderOptionsFor(MediaRecorderCtor);recorder=new MediaRecorderCtor(stream,options);recorder.target=target;
      recorder.ondataavailable=event=>{if(token===generation&&event.data?.size)chunks.push(event.data);};
      recorder.onerror=()=>fail('마이크를 사용할 수 없어요. 연결을 확인하거나 이야기 버튼으로 놀아 주세요.',token);
      recorder.onstop=()=>{
        clearTimer(maxTimer);maxTimer=null;stopStream();
        const duration=now()-startedAt,mimeType=recorder?.mimeType;
        settled=processRecording(token,duration,mimeType);
      };
      recorder.onstart=()=>{
        if(token!==generation||!pressActive){try{recorder.stop();}catch{}return;}
        startedAt=now();setState('recording');message('듣고 있어요… 최대 8초');maxTimer=setTimer(()=>stop(),8000);
      };
      recorder.start();return true;
    }catch(error){
      if(token!==generation)return false;
      const denied=['NotAllowedError','SecurityError'].includes(error?.name);
      fail(denied?'마이크 사용이 꺼져 있어요. 브라우저 설정에서 허용하거나 이야기 버튼으로 놀아 주세요.':'마이크를 사용할 수 없어요. 연결을 확인하거나 이야기 버튼으로 놀아 주세요.',token);
      return false;
    }
  }
  function stop(){
    pressActive=false;
    if(phase==='requesting'){generation++;setState('idle');message('이제 버튼을 누르고 말해 주세요.');return;}
    if(phase!=='recording'||!recorder)return;
    clearTimer(maxTimer);maxTimer=null;setState('processing');
    try{recorder.stop();}catch{fail('목소리를 다시 들려줄래? 잘 담지 못했어.',generation);}
  }
  function cancel({clearRecording:shouldClear=true,silent=false}={}){
    generation++;pressActive=false;clearTimer(maxTimer);maxTimer=null;
    if(recorder){recorder.ondataavailable=null;recorder.onstop=null;recorder.onerror=null;try{if(recorder.state!=='inactive')recorder.stop();}catch{}}
    recorder=null;chunks=[];stopStream();stopPlayback();if(shouldClear)clearRecording();setState(recording?'ready':'idle');
    if(!silent)message(recording?'다시 들을 수 있어요.':'버튼을 누르면 녹음이 시작돼요. 다시 누르면 멈춰요. 최대 8초!');
  }
  function replay(){
    if(!recording)return false;
    const token=generation;settled=play(recording,token);return true;
  }
  function whenSettled(){return settled;}

  return {get supported(){return supported;},get state(){return phase;},get hasRecording(){return Boolean(recording);},start,stop,cancel,replay,whenSettled};
}
