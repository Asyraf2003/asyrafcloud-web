import {audioTrack} from './content.js';

export function initAudio(notify) {
  const dock=document.getElementById('audio-dock'),play=document.getElementById('audio-play'),settings=document.getElementById('audio-settings'),panel=document.getElementById('audio-panel'),volume=document.getElementById('audio-volume'),trackName=document.getElementById('track-name'),trackType=document.getElementById('track-type'),fileInput=document.getElementById('audio-file');
  let context,master,padBus,timer,nextChord=0,chordIndex=0,wanted=false,playing=false,media=null,objectURL=null,pauseToken=0,vol=.22,busy=false;
  try{const saved=Number(localStorage.getItem('asyraf-audio-volume'));if(localStorage.getItem('asyraf-audio-volume')!==null&&Number.isFinite(saved))vol=Math.max(0,Math.min(1,saved));}catch{}
  volume.value=String(Math.round(vol*100));
  const chords=[[130.8128,164.8138,195.9977,246.9417],[110,130.8128,164.8138,195.9977],[130.8128,174.6141,220,261.6256],[123.4708,146.8324,184.9972,220]];
  function update(){dock.dataset.audioState=playing?'playing':'paused';play.setAttribute('aria-pressed',String(playing));play.setAttribute('aria-label',playing?'Pause background sound':'Play background sound');document.getElementById('audio-state-label').textContent=playing?'SOUND ON':'SOUND OFF';dock.classList.toggle('playing',playing);document.getElementById('audio-status').textContent=playing?'Playing':'Paused';}
  function createContext(){
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw new Error('Audio is unavailable in this browser.');
    context=new AudioContext();master=context.createGain();master.gain.value=0;
    const compressor=context.createDynamicsCompressor();compressor.threshold.value=-20;compressor.ratio.value=3;master.connect(compressor);compressor.connect(context.destination);
    padBus=context.createBiquadFilter();padBus.type='lowpass';padBus.frequency.value=1150;padBus.Q.value=.25;
    const dry=context.createGain();dry.gain.value=.7;padBus.connect(dry);dry.connect(master);
    const reverb=context.createConvolver(),length=Math.floor(context.sampleRate*2.8),impulse=context.createBuffer(2,length,context.sampleRate);
    for(let channel=0;channel<2;channel++){const a=impulse.getChannelData(channel);for(let i=0;i<length;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/length,3)*.3;}
    reverb.buffer=impulse;const wet=context.createGain();wet.gain.value=.33;padBus.connect(reverb);reverb.connect(wet);wet.connect(master);
    const delay=context.createDelay(1),feedback=context.createGain();delay.delayTime.value=.47;feedback.gain.value=.13;padBus.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);
    nextChord=context.currentTime+.05;
  }
  function schedule(){
    if(!context||!padBus)return;
    while(nextChord<context.currentTime+1.2){
      const chord=chords[chordIndex++%chords.length],start=Math.max(nextChord,context.currentTime+.02);
      chord.forEach((frequency,i)=>{
        for(const detune of [-4,4]){
          const osc=context.createOscillator(),gain=context.createGain();osc.type=i===0?'sine':'triangle';osc.frequency.value=frequency;osc.detune.value=detune;
          gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(i===0?.075:.035,start+3);gain.gain.setValueAtTime(i===0?.075:.035,start+7);gain.gain.linearRampToValueAtTime(0,start+12);
          osc.connect(gain);gain.connect(padBus);osc.start(start);osc.stop(start+12.1);osc.onended=()=>{osc.disconnect();gain.disconnect();};
        }
      });nextChord=start+8;
    }
  }
  async function start(){
    if(busy)return;busy=true;wanted=true;const token=++pauseToken;
    try{
      if(media){media.volume=vol;await media.play();}
      else{if(!context)createContext();await context.resume();master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(vol,context.currentTime,.3);schedule();if(!timer)timer=setInterval(schedule,1000);}
      if(token!==pauseToken||!wanted){media?.pause();if(context)context.suspend().catch(()=>{});return;}playing=true;update();
    }catch(error){wanted=false;playing=false;update();notify(error.message||'Press play to enable sound.');}
    finally{busy=false;}
  }
  async function pause({preserveIntent=false}={}){
    if(!preserveIntent)wanted=false;const token=++pauseToken;if(timer){clearInterval(timer);timer=null;}
    if(media)media.pause();
    if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.045);setTimeout(()=>{if(token===pauseToken)context.suspend().catch(()=>{});},160);}
    playing=false;update();
  }
  play.addEventListener('click',()=>{if(playing||wanted)pause();else start();});
  settings.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;settings.setAttribute('aria-expanded',String(open));if(open)document.getElementById('audio-panel-title').focus({preventScroll:true});});
  document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target)){panel.hidden=true;settings.setAttribute('aria-expanded','false');}});
  dock.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;settings.setAttribute('aria-expanded','false');settings.focus();}});
  volume.addEventListener('input',()=>{vol=Number(volume.value)/100;document.getElementById('volume-value').textContent=volume.value+'%';if(media)media.volume=vol;if(context&&playing)master.gain.setTargetAtTime(vol,context.currentTime,.1);try{localStorage.setItem('asyraf-audio-volume',String(vol));}catch{}});
  document.getElementById('volume-value').textContent=volume.value+'%';
  function setMedia(src,title,local=false){if(media)media.pause();if(context)context.suspend().catch(()=>{});if(timer){clearInterval(timer);timer=null;}media=new Audio(src);media.loop=true;media.volume=vol;media.preload='none';media.addEventListener('error',()=>{wanted=false;playing=false;update();notify('That track could not be played. Choose another audio file.');});trackName.textContent=title;trackType.textContent=local?'YOUR LOCAL TRACK':'STUDIO TRACK';dock.dataset.audioSource=local?'local-file':'track';}
  if(audioTrack?.src)setMedia(audioTrack.src,audioTrack.title||'Studio track');else dock.dataset.audioSource='generative';
  fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;if(file.type&&!file.type.startsWith('audio/')){notify('Choose an audio file.');return;}const resume=wanted;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(file);setMedia(objectURL,file.name.replace(/\.[^.]+$/,''),true);playing=false;update();if(resume)start();fileInput.value='';});
  document.getElementById('audio-reset').addEventListener('click',()=>{const resume=wanted;if(media){media.pause();media.src='';media=null;}if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}if(audioTrack?.src)setMedia(audioTrack.src,audioTrack.title||'Studio track');else{trackName.textContent='A quiet frequency.';trackType.textContent='GENERATIVE AMBIENT / ORIGINAL STUDY';dock.dataset.audioSource='generative';}playing=false;update();if(resume)start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(wanted)pause({preserveIntent:true});}else if(wanted)start();});
  window.addEventListener('pagehide',e=>{if(!e.persisted){clearInterval(timer);media?.pause();context?.close().catch(()=>{});if(objectURL)URL.revokeObjectURL(objectURL);}});
  dock.hidden=false;update();
}
