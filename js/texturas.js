'use strict';
/* =====================================================================
   texturas.js — texturas de parede geradas em canvas (64x64)
   ===================================================================== */

function novaTex(fn){
  const c = document.createElement('canvas'); c.width = c.height = TEX;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  fn(g); return c;
}
function ruido(g, cor, n, a){
  g.fillStyle = cor;
  for(let i=0;i<n;i++){ g.globalAlpha = Math.random()*a; g.fillRect((Math.random()*TEX)|0,(Math.random()*TEX)|0,1,1); }
  g.globalAlpha = 1;
}

const texturas = {
  1: novaTex(g=>{ // concreto da base
    g.fillStyle='#4a4640'; g.fillRect(0,0,TEX,TEX);
    g.fillStyle='#3a3733';
    for(let y=0;y<TEX;y+=16){ g.fillRect(0,y,TEX,2); }
    for(let y=0;y<TEX;y+=16){ for(let x=((y/16)%2)*16; x<TEX; x+=32){ g.fillRect(x,y,2,16);} }
    ruido(g,'#2c2a27',420,.5); ruido(g,'#5c574f',260,.4);
    g.fillStyle='rgba(120,30,20,.25)'; g.fillRect(0,TEX-9,TEX,9);
  }),
  2: novaTex(g=>{ // painel técnico
    g.fillStyle='#33424a'; g.fillRect(0,0,TEX,TEX);
    g.fillStyle='#26333a'; g.fillRect(4,4,TEX-8,TEX-8);
    g.strokeStyle='#1a2429'; g.lineWidth=2;
    g.strokeRect(4,4,TEX-8,TEX-8); g.strokeRect(10,10,TEX-20,20);
    g.fillStyle='#0e1417'; g.fillRect(10,36,TEX-20,18);
    for(let i=0;i<5;i++){ g.fillStyle = i%2? '#ff7a18':'#27e0a0'; g.fillRect(14+i*9,40,4,4); }
    g.fillStyle='#5d99a8'; g.fillRect(12,14,28,3); g.fillRect(12,20,18,3);
    ruido(g,'#0c1012',200,.35);
  }),
  3: novaTex(g=>{ // rocha infernal
    g.fillStyle='#3a120e'; g.fillRect(0,0,TEX,TEX);
    ruido(g,'#220a07',700,.7);
    g.strokeStyle='#ff5a14'; g.lineWidth=1.5; g.globalAlpha=.85;
    for(let i=0;i<4;i++){
      g.beginPath(); let x=8+i*15, y=0; g.moveTo(x,y);
      while(y<TEX){ x+=(Math.random()*10-5); y+=6+Math.random()*8; g.lineTo(x,y); }
      g.stroke();
    }
    g.globalAlpha=1; ruido(g,'#7a2014',240,.5);
  })
};
