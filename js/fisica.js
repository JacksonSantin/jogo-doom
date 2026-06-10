'use strict';
/* =====================================================================
   fisica.js — colisão, raycast de distância (DDA) e linha de visão
   ===================================================================== */

/* Move uma entidade com colisão circular contra a grade (eixos separados) */
function tentaMover(ent,nx,ny,r){
  if(!solido(nx-r,ent.y-r)&&!solido(nx+r,ent.y-r)&&!solido(nx-r,ent.y+r)&&!solido(nx+r,ent.y+r)) ent.x=nx;
  if(!solido(ent.x-r,ny-r)&&!solido(ent.x+r,ny-r)&&!solido(ent.x-r,ny+r)&&!solido(ent.x+r,ny+r)) ent.y=ny;
}

/* Distância até a primeira parede na direção ang (algoritmo DDA) */
function distParede(px,py,ang){
  const dx=Math.cos(ang), dy=Math.sin(ang);
  let mx=px|0,my=py|0;
  const ddx=Math.abs(1/(dx||1e-9)), ddy=Math.abs(1/(dy||1e-9));
  let sx,sy,sdx,sdy;
  if(dx<0){sx=-1;sdx=(px-mx)*ddx;}else{sx=1;sdx=(mx+1-px)*ddx;}
  if(dy<0){sy=-1;sdy=(py-my)*ddy;}else{sy=1;sdy=(my+1-py)*ddy;}
  for(let i=0;i<64;i++){
    let lado;
    if(sdx<sdy){sdx+=ddx;mx+=sx;lado=0;}else{sdy+=ddy;my+=sy;lado=1;}
    if(solido(mx+.5,my+.5)){
      return lado===0 ? (mx-px+(1-sx)/2)/(dx||1e-9) : (my-py+(1-sy)/2)/(dy||1e-9);
    }
  }
  return 64;
}

/* Há linha de visão desobstruída entre A e B? */
function temVisao(ax,ay,bx,by){
  const d=Math.hypot(bx-ax,by-ay);
  return distParede(ax,ay,Math.atan2(by-ay,bx-ax)) > d-0.1;
}
