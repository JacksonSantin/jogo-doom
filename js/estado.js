'use strict';
/* =====================================================================
   estado.js — estado global do jogo, jogador e carregamento de fases
   ===================================================================== */

let mapa, MH, jog, inimigos, itens, tiros, abates, totalAbates;
let msg, msgT, estado, flashDano, flashItem, tempoJogo;
let nivelAtual, interT, chefaoMorto, chefaoRef, listaPortais;
let atirandoMouse=false, atirandoTecla=false, atirandoToque=false;

function novoJogador(){
  return {
    x:1.5, y:1.5, a:0, hp:100, arm:0, vivo:true,
    fogo:0, cool:0, balanco:0, hurt:0, spin:0,
    armas:{pistola:true, escopeta:false, fuzil:false, plasma:false},
    mun:{balas:60, cartuchos:0, celulas:0},
    armaAtual:'pistola'
  };
}

function carregarNivel(n){
  nivelAtual=n;
  const N=NIVEIS[n];
  mapa=[]; inimigos=[]; itens=[]; tiros=[]; listaPortais=[];
  abates=0; chefaoMorto=false; chefaoRef=null;
  msg=''; msgT=0; flashDano=0; flashItem=0;
  MH=N.mapa.length;
  for(let y=0;y<MH;y++){
    const linha=[];
    const r=N.mapa[y].padEnd(MW,'#');
    for(let x=0;x<MW;x++){
      const ch=r[x];
      let cel=0;
      if(ch==='#')cel=1; else if(ch==='T')cel=2; else if(ch==='H')cel=3; else if(ch==='E')cel=8;
      if(cel===8) listaPortais.push({x:x+.5,y:y+.5});
      if(ch==='P'){ jog.x=x+.5; jog.y=y+.5; jog.a=0; }
      if(ch==='i') inimigos.push({tipo:'carnica',x:x+.5,y:y+.5,hp:90, vel:1.7, raio:.35, escala:1,    cool:0, frame:0,animT:0,alerta:false,hurtT:0,atkT:0,fase:0});
      if(ch==='o') inimigos.push({tipo:'olho',   x:x+.5,y:y+.5,hp:55, vel:1.1, raio:.35, escala:1,    cool:1+Math.random(), frame:0,animT:0,alerta:false,hurtT:0,atkT:0,fase:Math.random()*6});
      if(ch==='b') inimigos.push({tipo:'bruta',  x:x+.5,y:y+.5,hp:180,vel:1.0, raio:.42, escala:1.25, cool:0, frame:0,animT:0,alerta:false,hurtT:0,atkT:0,fase:0});
      if(ch==='B'){ chefaoRef={tipo:'chefao',x:x+.5,y:y+.5,hp:800,hpMax:800,vel:0.9,raio:.7,escala:1.9,cool:1.5,frame:0,animT:0,alerta:false,hurtT:0,atkT:0,fase:0,rugiu:false};
                    inimigos.push(chefaoRef); }
      if(ch==='+') itens.push({tipo:'vida',x:x+.5,y:y+.5});
      if(ch==='a') itens.push({tipo:'balas',x:x+.5,y:y+.5});
      if(ch==='s') itens.push({tipo:'cartuchos',x:x+.5,y:y+.5});
      if(ch==='c') itens.push({tipo:'celulas',x:x+.5,y:y+.5});
      if(ch==='r') itens.push({tipo:'armadura',x:x+.5,y:y+.5});
      if(ch==='2') itens.push({tipo:'arma_escopeta',x:x+.5,y:y+.5});
      if(ch==='3') itens.push({tipo:'arma_fuzil',x:x+.5,y:y+.5});
      if(ch==='4') itens.push({tipo:'arma_plasma',x:x+.5,y:y+.5});
      linha.push(cel);
    }
    mapa.push(linha);
  }
  totalAbates=inimigos.length;
}

function reiniciarTudo(){
  jog=novoJogador();
  tempoJogo=0;
  carregarNivel(0);
}

function celula(x,y){
  if(x<0||y<0||x>=MW||y>=MH) return 1;
  return mapa[y][x];
}
function solido(x,y){ const c=celula(x|0,y|0); return c===1||c===2||c===3; }

function portalAberto(){
  return NIVEIS[nivelAtual].chefao ? chefaoMorto : abates>=totalAbates;
}
function aviso(t){ msg=t; msgT=2.4; }
