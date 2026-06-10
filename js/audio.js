'use strict';
/* =====================================================================
   audio.js — sons procedurais via WebAudio (sem arquivos)
   ===================================================================== */

let AC=null;
function audio(){
  if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  if(AC&&AC.state==='suspended')AC.resume();
  return AC;
}
function beep(f0,f1,dur,tipo,vol){
  const a=audio(); if(!a)return;
  const o=a.createOscillator(), g=a.createGain();
  o.type=tipo; o.frequency.setValueAtTime(f0,a.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),a.currentTime+dur);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+dur);
}
function ruidoSom(dur,freq,vol){
  const a=audio(); if(!a)return;
  const n=a.createBufferSource(), buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.2);
  n.buffer=buf;
  const f=a.createBiquadFilter(); f.type='lowpass'; f.frequency.value=freq;
  const g=a.createGain(); g.gain.value=vol;
  n.connect(f); f.connect(g); g.connect(a.destination); n.start();
}

const sons={
  pistola(){ ruidoSom(.12,1800,.3); beep(420,90,.1,'square',.15); },
  escopeta(){ ruidoSom(.25,900,.5); beep(120,40,.2,'square',.25); },
  fuzil(){ ruidoSom(.07,2200,.22); },
  plasma(){ beep(920,260,.16,'sawtooth',.16); beep(1400,500,.1,'sine',.08); },
  vazio(){ beep(220,220,.05,'square',.08); },
  troca(){ beep(300,500,.07,'square',.1); },
  acerto(){ beep(300,90,.12,'square',.16); },
  morte(){ beep(220,40,.45,'sawtooth',.2); },
  dor(){ beep(160,70,.25,'sawtooth',.25); },
  item(){ beep(520,880,.1,'square',.14); setTimeout(()=>beep(660,1100,.12,'square',.14),90); },
  armaNova(){ [330,440,660].forEach((f,i)=>setTimeout(()=>beep(f,f,.14,'square',.16),i*90)); },
  bola(){ beep(700,200,.3,'sine',.1); },
  rugido(){ beep(95,38,.9,'sawtooth',.3); setTimeout(()=>beep(140,55,.7,'sawtooth',.22),160); },
  chefaoMorre(){ ruidoSom(.7,500,.4); [180,140,100,60].forEach((f,i)=>setTimeout(()=>beep(f,f*.6,.4,'sawtooth',.25),i*200)); },
  vitoria(){ [392,523,659,784].forEach((f,i)=>setTimeout(()=>beep(f,f,.22,'square',.16),i*140)); },
  gameOver(){ [300,250,200,120].forEach((f,i)=>setTimeout(()=>beep(f,f*.7,.3,'sawtooth',.2),i*180)); },
  pausa(){ beep(440,440,.08,'square',.1); }
};
