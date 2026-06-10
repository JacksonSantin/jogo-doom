'use strict';
/* =====================================================================
   entrada.js — teclado, mouse (pointer lock) e controles de toque
   ===================================================================== */

const teclas={};

addEventListener('keydown',e=>{
  teclas[e.code]=true;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='Space') atirandoTecla=true;
  if(e.code==='KeyP'){ alternarPausa(); }
  if(e.code==='KeyQ' && estado==='jogo') ciclarArma();
  if(e.code.startsWith('Digit') && estado==='jogo'){
    const n=parseInt(e.code.slice(5))-1;
    if(n>=0&&n<4) selecionarArma(ORDEM_ARMAS[n]);
  }
  if(e.code==='KeyR' && estado!=='jogo' && estado!=='titulo'){ reiniciarTudo(); estado='jogo'; }
  if(e.code==='Enter' && estado==='titulo'){ audio(); estado='jogo'; }
});
addEventListener('keyup',e=>{ teclas[e.code]=false; if(e.code==='Space')atirandoTecla=false; });

cv.addEventListener('mousedown',e=>{
  audio();
  if(estado==='titulo'){ estado='jogo'; if(!IS_TOUCH)cv.requestPointerLock&&cv.requestPointerLock(); return; }
  if(estado==='pausa'){ alternarPausa(); return; }
  if(estado==='inter') return;
  if(estado!=='jogo'){ reiniciarTudo(); estado='jogo'; return; }
  if(!IS_TOUCH && document.pointerLockElement!==cv){ cv.requestPointerLock&&cv.requestPointerLock(); }
  atirandoMouse=true;
});
addEventListener('mouseup',()=>atirandoMouse=false);
addEventListener('mousemove',e=>{
  if(document.pointerLockElement===cv && estado==='jogo') jog.a += e.movementX*0.0026;
});

/* botões de toque (coordenadas internas do canvas) */
const BT_FOGO ={x:W-58, y:VH-46, w:50, h:40, rotulo:'FOGO'};
const BT_ARMA ={x:W-58, y:VH-94, w:50, h:30, rotulo:'ARMA'};
const BT_PAUSA={x:W-26, y:6,     w:20, h:16, rotulo:'II'};
let tqMov=null, tqOlhar=null, tqFogo=null;
const movVet={x:0,y:0};

function posCanvas(t){
  const r=cv.getBoundingClientRect();
  return { x:(t.clientX-r.left)/r.width*W, y:(t.clientY-r.top)/r.height*H };
}
function dentro(p,b){ return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h; }

cv.addEventListener('touchstart',e=>{
  e.preventDefault(); audio();
  if(estado==='titulo'){ estado='jogo'; return; }
  if(estado==='pausa'){ alternarPausa(); return; }
  if(estado==='inter') return;
  if(estado!=='jogo'){ reiniciarTudo(); estado='jogo'; return; }
  for(const t of e.changedTouches){
    const p=posCanvas(t);
    if(dentro(p,BT_PAUSA)){ alternarPausa(); continue; }
    if(dentro(p,BT_ARMA)){ ciclarArma(); continue; }
    if(dentro(p,BT_FOGO)){ tqFogo=t.identifier; atirandoToque=true; continue; }
    if(p.x < W/2 && !tqMov) tqMov={id:t.identifier,ox:p.x,oy:p.y};
    else if(!tqOlhar) tqOlhar={id:t.identifier,lx:p.x};
  }
},{passive:false});
cv.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    const p=posCanvas(t);
    if(tqMov&&t.identifier===tqMov.id){
      movVet.x=Math.max(-1,Math.min(1,(p.x-tqMov.ox)/28));
      movVet.y=Math.max(-1,Math.min(1,(p.y-tqMov.oy)/28));
    }
    if(tqOlhar&&t.identifier===tqOlhar.id){
      jog.a += (p.x-tqOlhar.lx)*0.012; tqOlhar.lx=p.x;
    }
  }
},{passive:false});
function fimToque(e){
  for(const t of e.changedTouches){
    if(tqMov&&t.identifier===tqMov.id){ tqMov=null; movVet.x=0; movVet.y=0; }
    if(tqOlhar&&t.identifier===tqOlhar.id) tqOlhar=null;
    if(tqFogo===t.identifier){ tqFogo=null; atirandoToque=false; }
  }
}
cv.addEventListener('touchend',fimToque); cv.addEventListener('touchcancel',fimToque);

function alternarPausa(){
  if(estado==='jogo'){ estado='pausa'; sons.pausa(); }
  else if(estado==='pausa'){ estado='jogo'; sons.pausa(); }
}
