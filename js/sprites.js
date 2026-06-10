'use strict';
/* =====================================================================
   sprites.js — sprites de inimigos, itens e projéteis (64x64)
   ===================================================================== */

function novoSprite(fn){
  const c=document.createElement('canvas'); c.width=c.height=TEX;
  const g=c.getContext('2d'); g.imageSmoothingEnabled=false; fn(g); return c;
}

/* Carniça: demônio de corpo a corpo (frames 0/1 andar, 2 ataque) */
function spCarnica(frame){
  return novoSprite(g=>{
    const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
    if(frame===0){ px(22,48,7,14,'#5e0f14'); px(36,50,7,12,'#4a0c10'); }
    else if(frame===1){ px(22,50,7,12,'#4a0c10'); px(36,48,7,14,'#5e0f14'); }
    else { px(23,49,7,13,'#5e0f14'); px(35,49,7,13,'#5e0f14'); }
    px(18,24,28,28,'#871722'); px(22,28,20,20,'#a32230');
    px(26,34,12,12,'#c84a3a');
    if(frame===2){
      px(10,14,8,22,'#871722'); px(46,14,8,22,'#871722');
      px(7,8,6,8,'#e8e0cc'); px(51,8,6,8,'#e8e0cc');
    } else {
      px(12,28,7,18,'#761320'); px(45,28,7,18,'#761320');
      px(10,44,7,6,'#e8e0cc'); px(47,44,7,6,'#e8e0cc');
    }
    px(24,8,16,16,'#871722');
    px(20,2,4,8,'#2b2b30'); px(40,2,4,8,'#2b2b30');
    px(22,0,3,4,'#2b2b30'); px(39,0,3,4,'#2b2b30');
    px(27,13,4,4,'#ffd23f'); px(33,13,4,4,'#ffd23f');
    px(28,20,8,2,'#1a0506');
    if(frame===2){ px(27,19,10,4,'#1a0506'); px(28,19,2,2,'#e8e0cc'); px(34,19,2,2,'#e8e0cc'); }
  });
}

/* Olho Sentinela: demônio voador que atira bolas de fogo */
function spOlho(frame){
  return novoSprite(g=>{
    const cxx=32, cy=26+(frame?2:0);
    g.strokeStyle='#3d1b4f'; g.lineWidth=3;
    for(let i=-2;i<=2;i++){
      g.beginPath(); g.moveTo(cxx+i*6, cy+12);
      g.quadraticCurveTo(cxx+i*8, cy+24, cxx+i*10+(frame?2:-2), cy+34);
      g.stroke();
    }
    g.fillStyle='#52246b'; g.beginPath(); g.arc(cxx,cy,16,0,7); g.fill();
    g.fillStyle='#6d3390'; g.beginPath(); g.arc(cxx-4,cy-4,10,0,7); g.fill();
    g.fillStyle='#e8e0cc'; g.beginPath(); g.arc(cxx,cy,9,0,7); g.fill();
    g.fillStyle='#b3122e'; g.beginPath(); g.arc(cxx,cy,5,0,7); g.fill();
    g.fillStyle='#1a0506'; g.beginPath(); g.arc(cxx,cy,2,0,7); g.fill();
    g.fillStyle='#52246b'; g.fillRect(cxx-10,cy-13,20,5);
  });
}

/* Brutamonte: tanque de carne, lento e brutal */
function spBruta(frame){
  return novoSprite(g=>{
    const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
    if(frame===0){ px(16,50,11,13,'#3d2417'); px(37,52,11,11,'#2f1b10'); }
    else if(frame===1){ px(16,52,11,11,'#2f1b10'); px(37,50,11,13,'#3d2417'); }
    else { px(17,51,11,12,'#3d2417'); px(36,51,11,12,'#3d2417'); }
    px(10,18,44,34,'#5a3722'); px(14,22,36,26,'#6e4429');
    px(22,28,20,16,'#8a5a35');
    px(12,18,8,6,'#cfc6ae'); px(44,18,8,6,'#cfc6ae'); px(28,16,8,5,'#cfc6ae');
    if(frame===2){ px(2,12,10,26,'#5a3722'); px(52,12,10,26,'#5a3722'); px(1,6,12,8,'#cfc6ae'); px(51,6,12,8,'#cfc6ae'); }
    else { px(4,24,9,24,'#4a2c1b'); px(51,24,9,24,'#4a2c1b'); px(3,46,11,8,'#cfc6ae'); px(50,46,11,8,'#cfc6ae'); }
    px(24,6,16,14,'#5a3722');
    px(27,10,4,4,'#ff7a18'); px(34,10,4,4,'#ff7a18');
    px(28,16,9,2,'#1a0506');
    px(26,17,3,4,'#e8e0cc'); px(36,17,3,4,'#e8e0cc');
  });
}

/* O Devorador: chefão da fase final */
function spChefao(frame){
  return novoSprite(g=>{
    const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
    if(frame===0){ px(14,52,12,12,'#43090d'); px(38,54,12,10,'#350609'); }
    else if(frame===1){ px(14,54,12,10,'#350609'); px(38,52,12,12,'#43090d'); }
    else { px(15,53,12,11,'#43090d'); px(37,53,12,11,'#43090d'); }
    px(6,16,52,38,'#5c0b12'); px(10,20,44,30,'#7a101a');
    px(22,32,20,16,'#94202a');
    px(25,38,14,6,'#1a0506');
    px(26,38,2,3,'#e8e0cc'); px(30,38,2,3,'#e8e0cc'); px(34,38,2,3,'#e8e0cc');
    if(frame===2){ px(0,8,10,30,'#5c0b12'); px(54,8,10,30,'#5c0b12'); px(0,2,9,8,'#e8e0cc'); px(55,2,9,8,'#e8e0cc'); }
    else { px(0,22,9,26,'#4d0a10'); px(55,22,9,26,'#4d0a10'); px(0,46,9,8,'#e8e0cc'); px(55,46,9,8,'#e8e0cc'); }
    px(22,2,20,18,'#5c0b12');
    px(16,0,4,10,'#1f1f24'); px(44,0,4,10,'#1f1f24');
    px(22,0,3,6,'#1f1f24'); px(39,0,3,6,'#1f1f24'); px(30,0,4,4,'#1f1f24');
    px(25,8,5,5,'#ffd23f'); px(34,8,5,5,'#ffd23f');
    px(26,9,2,2,'#b3122e'); px(35,9,2,2,'#b3122e');
    px(24,15,16,4,'#1a0506');
    if(frame===2){ px(23,14,18,7,'#1a0506'); for(let i=0;i<5;i++)px(24+i*4,14,2,3,'#e8e0cc'); }
  });
}

function spCadaver(){
  return novoSprite(g=>{
    g.fillStyle='#4d0a10'; g.beginPath(); g.ellipse(32,56,20,6,0,0,7); g.fill();
    g.fillStyle='#6e1018'; g.fillRect(20,50,24,6); g.fillRect(14,52,8,4); g.fillRect(42,52,8,4);
    g.fillStyle='#2b2b30'; g.fillRect(26,46,3,5); g.fillRect(36,46,3,5);
  });
}
function spBola(cor1,cor2){
  return novoSprite(g=>{
    const grad=g.createRadialGradient(32,32,2,32,32,14);
    grad.addColorStop(0,cor1); grad.addColorStop(.4,cor2); grad.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=grad; g.fillRect(0,0,TEX,TEX);
  });
}
function spVida(){
  return novoSprite(g=>{
    g.fillStyle='#d8d2c2'; g.fillRect(18,38,28,18);
    g.fillStyle='#b8b2a2'; g.fillRect(18,38,28,4);
    g.fillStyle='#1f9e4d'; g.fillRect(28,41,8,13); g.fillRect(24,45,16,5);
  });
}
function spBalas(){
  return novoSprite(g=>{
    g.fillStyle='#5a5530'; g.fillRect(18,42,28,14);
    g.fillStyle='#454121'; g.fillRect(18,42,28,3);
    g.fillStyle='#ffd23f';
    for(let i=0;i<5;i++) g.fillRect(21+i*5,47,2,7);
  });
}
function spCartuchos(){
  return novoSprite(g=>{
    g.fillStyle='#6e1d18'; g.fillRect(20,44,24,12);
    g.fillStyle='#541410'; g.fillRect(20,44,24,3);
    g.fillStyle='#ff7a18';
    for(let i=0;i<3;i++) g.fillRect(23+i*7,47,4,8);
  });
}
function spCelulas(){
  return novoSprite(g=>{
    g.fillStyle='#1d3a52'; g.fillRect(20,40,24,16);
    g.fillStyle='#142a3d'; g.fillRect(20,40,24,4);
    g.fillStyle='#39c8ff'; g.fillRect(24,46,16,6);
    g.fillStyle='#bfeeff'; g.fillRect(26,48,4,2); g.fillRect(33,48,4,2);
  });
}
function spArmadura(){
  return novoSprite(g=>{
    g.fillStyle='#1f9e4d'; g.fillRect(22,34,20,20);
    g.fillStyle='#157038'; g.fillRect(22,34,20,5); g.fillRect(22,34,4,20); g.fillRect(38,34,4,20);
    g.fillStyle='#27e0a0'; g.fillRect(29,40,6,9);
    g.fillStyle='#157038'; g.fillRect(24,30,6,5); g.fillRect(34,30,6,5);
  });
}
function brilhoItem(g,cor){
  g.globalAlpha=.25; g.fillStyle=cor;
  g.beginPath(); g.arc(32,46,16,0,7); g.fill();
  g.globalAlpha=1;
}
function spArmaEscopeta(){
  return novoSprite(g=>{
    g.save(); g.translate(32,46); g.rotate(-0.35);
    g.fillStyle='#23252a'; g.fillRect(-22,-4,32,4); g.fillRect(-22,1,32,3);
    g.fillStyle='#5a3a22'; g.fillRect(8,-4,14,9);
    g.fillStyle='#3b3f47'; g.fillRect(-22,-4,5,8);
    g.restore();
    brilhoItem(g,'#ffd23f');
  });
}
function spArmaFuzil(){
  return novoSprite(g=>{
    g.save(); g.translate(32,46); g.rotate(-0.2);
    g.fillStyle='#2b2b30'; g.fillRect(-20,-6,26,12);
    g.fillStyle='#4a4f58'; g.fillRect(-20,-5,26,2); g.fillRect(-20,-1,26,2); g.fillRect(-20,3,26,2);
    g.fillStyle='#1a1b1e'; g.fillRect(6,-7,12,14);
    g.restore();
    brilhoItem(g,'#ffd23f');
  });
}
function spArmaPlasma(){
  return novoSprite(g=>{
    g.fillStyle='#1d3a52'; g.fillRect(14,40,36,14);
    g.fillStyle='#0f2233'; g.fillRect(14,40,36,4);
    g.fillStyle='#39c8ff'; g.fillRect(18,46,6,6); g.fillRect(28,46,6,6); g.fillRect(38,46,6,6);
    brilhoItem(g,'#39c8ff');
  });
}

const SPR = {
  carnica:[spCarnica(0),spCarnica(1),spCarnica(2)],
  olho:[spOlho(0),spOlho(1)],
  bruta:[spBruta(0),spBruta(1),spBruta(2)],
  chefao:[spChefao(0),spChefao(1),spChefao(2)],
  cadaver:spCadaver(),
  bolaFogo:spBola('#fff6c8','#ff9a24'),
  bolaPlasma:spBola('#dffaff','#39c8ff'),
  vida:spVida(), balas:spBalas(), cartuchos:spCartuchos(), celulas:spCelulas(),
  armadura:spArmadura(),
  arma_escopeta:spArmaEscopeta(), arma_fuzil:spArmaFuzil(), arma_plasma:spArmaPlasma()
};
