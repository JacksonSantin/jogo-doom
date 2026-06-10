'use strict';
/* =====================================================================
   main.js — inicialização e loop principal do jogo
   ===================================================================== */

let tAnt=performance.now();

function loop(t){
  const dt=Math.min(0.05,(t-tAnt)/1000); tAnt=t;
  if(estado==='titulo'||estado==='pausa') tempoJogo+=dt;
  if(estado==='inter'){ interT-=dt; tempoJogo+=dt; if(interT<=0)estado='jogo'; }
  if(estado==='jogo')atualiza(dt);
  desenha();
  requestAnimationFrame(loop);
}

jog=novoJogador();
reiniciarTudo();
estado='titulo';
requestAnimationFrame(loop);
