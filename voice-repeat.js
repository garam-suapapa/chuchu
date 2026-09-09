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
  AudioContextCtor,
  now=()=>performance.now(),
  setTimer=(fn,delay)=>setTimeout(fn,delay),
  clearTimer=id=>clearTimeout(id),
  onState=()=>{},
  onMessage=()=>{},
  onPlayTarget=()=>{}
}={}){
  let phase='idle',context=null,stream=null,recorder=null,chunks=[],startedAt=0,maxTimer=null;
  let recording=null,source=null,playTarget=null,generation=0,pressActive=false,settled=Promise.resolve();
  const supported=Boolean(mediaDevices?.getUserMedia&&MediaRecorderCtor&&AudioContextCtor);

  function setState(next){phase=next;onState(next);}
  function message(text){onMessage(text);}
  async function ensureContext(){
    context||=new AudioContextCtor();
    if(context.state==='suspended')await context.resume();
    return context;
  }
  function stopStream(){stopTracks(stream);stream=null;}
  function stopPlayback(){
    if(!source)return;
    const current=source;source=null;current.onended=null;
    try{current.stop();}catch{}
    if(playTarget!==null)onPlayTarget(playTarget,false);
    playTarget=null;
  }
  function fail(text,token){
    if(token!==generation)return;
    stopStream();recorder=null;chunks=[];recording=null;stopPlayback();setState('idle');message(text);
  }
  async function play(saved,token){
    if(!saved||token!==generation)return;
    stopPlayback();
    try{
      const audio=await ensureContext();
      if(token!==generation)return;
      const next=audio.createBufferSource(),gain=audio.createGain();
      next.buffer=saved.buffer;next.playbackRate.value=saved.rate;gain.gain.value=.9;
      next.connect(gain);gain.connect(audio.destination);source=next;playTarget=saved.target.instanceId;
      setState('playing');message('내가 따라 해 볼게!');onPlayTarget(playTarget,true);
      await new Promise((resolve,reject)=>{
        next.onended=()=>{
          if(source===next){source=null;onPlayTarget(playTarget,false);playTarget=null;if(token===generation)setState('ready');}
          resolve();
        };
        try{next.start();}catch(error){next.onended=null;if(source===next)source=null;reject(error);}
      });
    }catch{fail('버튼을 누르면 친구가 따라 말해요.',token);}
  }
  async function processRecording(token,duration,mimeType){
    if(token!==generation)return;
    if(duration<350||!chunks.some(chunk=>chunk.size>0)){fail('조금 더 길게 말해 줘!',token);return;}
    setState('processing');message('친구 목소리로 바꾸는 중…');
    try{
      const blob=new Blob(chunks,{type:mimeType||chunks[0]?.type||''});chunks=[];
      const bytes=await blob.arrayBuffer();
      const audio=await ensureContext();
      let decodeTimer;
      const decoded=await Promise.race([
        audio.decodeAudioData(bytes.slice(0)),
        new Promise((_,reject)=>{decodeTimer=setTimer(()=>reject(new Error('decode-timeout')),10000);})
      ]).finally(()=>clearTimer(decodeTimer));
      if(token!==generation)return;
      recording={buffer:decoded,target:recorder.target,rate:voiceRateFor(recorder.target.characterId)};
      recorder=null;await play(recording,token);
    }catch{fail('목소리를 다시 들려줄래? 잘 담지 못했어.',token);}
  }
  async function start(target){
    if(!supported){message('이 브라우저에서는 따라 말하기를 사용할 수 없어요. 이야기 버튼으로 놀아 주세요.');return false;}
    cancel({clearRecording:true,silent:true});pressActive=true;const token=++generation;
    setState('requesting');message('마이크 사용을 허용해 주세요.');
    try{
      await ensureContext();
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
  function cancel({clearRecording=true,silent=false}={}){
    generation++;pressActive=false;clearTimer(maxTimer);maxTimer=null;
    if(recorder){recorder.ondataavailable=null;recorder.onstop=null;recorder.onerror=null;try{if(recorder.state!=='inactive')recorder.stop();}catch{}}
    recorder=null;chunks=[];stopStream();stopPlayback();if(clearRecording)recording=null;setState(recording?'ready':'idle');
    if(!silent)message(recording?'다시 들을 수 있어요.':'버튼을 누르면 녹음이 시작돼요. 다시 누르면 멈춰요. 최대 8초!');
  }
  function replay(){
    if(!recording)return false;
    const token=generation;settled=play(recording,token);return true;
  }
  function whenSettled(){return settled;}

  return {get supported(){return supported;},get state(){return phase;},get hasRecording(){return Boolean(recording);},start,stop,cancel,replay,whenSettled};
}
