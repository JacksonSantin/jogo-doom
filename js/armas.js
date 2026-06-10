'use strict';
/* =====================================================================
   armas.js — troca de arma, disparo (hitscan e projétil) e dano
   ===================================================================== */

function selecionarArma(id){
  if(!jog.armas[id] || jog.armaAtual===id) return;
  jog.armaAtual=id; jog.cool=Math.max(jog.cool,0.25); sons.troca();
  aviso(ARMAS[id].nome);
}
function ciclarArma(){
  const i=ORDEM_ARMAS.indexOf(jog.armaAtual);
  for(let k=1;k<=4;k++){
    const id=ORDEM_ARMAS[(i+k)%4];
    if(jog.armas[id]){ selecionarArma(id); return; }
  }
}

function disparar(){
  const A=ARMAS[jog.armaAtual];
  if(jog.mun[A.mun]<=0){
    sons.vazio(); jog.cool=0.3;
    aviso('SEM MUNIÇÃO — TROQUE DE ARMA (Q)');
    return;
  }
  jog.mun[A.mun]--;
  jog.fogo=0.3; jog.cool=A.taxa;
  sons[jog.armaAtual]();
  if(jog.armaAtual==='fuzil') jog.spin+=1;

  if(A.proj){
    // canhão de plasma: projétil físico
    const a=jog.a+(Math.random()*2-1)*A.disp;
    tiros.push({x:jog.x+Math.cos(a)*.4, y:jog.y+Math.sin(a)*.4,
                dx:Math.cos(a)*9, dy:Math.sin(a)*9, vida:2.5,
                dono:'jog', dano:A.dano[0]+Math.random()*(A.dano[1]-A.dano[0]), tipo:'plasma'});
  } else {
    // armas de tiro instantâneo (hitscan), com 1..N pelotas
    const dMax=distParede(jog.x,jog.y,jog.a);
    for(let p=0;p<A.pelotas;p++){
      const off=(Math.random()*2-1)*A.disp;
      let alvo=null, melhor=1e9;
      for(const e of inimigos){
        if(e.hp<=0)continue;
        const dx=e.x-jog.x, dy=e.y-jog.y, d=Math.hypot(dx,dy);
        let da=Math.atan2(dy,dx)-(jog.a+off);
        while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI;
        if(Math.abs(da)<Math.atan2(e.raio+0.06,d) && d<melhor && d<dMax+0.3 && temVisao(jog.x,jog.y,e.x,e.y)){
          melhor=d; alvo=e;
        }
      }
      if(alvo){
        let dano=A.dano[0]+Math.random()*(A.dano[1]-A.dano[0]);
        if(A.falloff) dano*=Math.max(.35,Math.min(1.1,1.5-melhor*.1)); // escopeta perde força com a distância
        ferirInimigo(alvo,dano);
      }
    }
  }
  // o estampido alerta criaturas próximas
  for(const e of inimigos) if(Math.hypot(e.x-jog.x,e.y-jog.y)<8) e.alerta=true;
}

function ferirInimigo(e,dano){
  if(e.hp<=0)return;
  e.hp-=dano; e.hurtT=0.15; e.alerta=true;
  if(e.hp<=0){
    abates++;
    if(e.tipo==='chefao'){
      chefaoMorto=true; sons.chefaoMorre();
      aviso('O DEVORADOR CAIU — O PORTAL DESPERTOU');
      flashItem=0.5;
    } else {
      sons.morte();
      if(portalAberto() && msgT<=0) aviso('SETOR LIMPO — O PORTAL DESPERTOU');
    }
  } else sons.acerto();
}

function machucaJog(dano){
  if(!jog.vivo)return;
  // a armadura absorve 1/3 do dano enquanto durar
  const abs=Math.min(jog.arm, Math.ceil(dano/3));
  jog.arm-=abs;
  jog.hp-=Math.max(1,Math.round(dano-abs));
  flashDano=0.4; jog.hurt=0.3; sons.dor();
  if(jog.hp<=0){ jog.hp=0; jog.vivo=false; estado='morto'; sons.gameOver(); }
}
