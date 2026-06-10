'use strict';
/* =====================================================================
   logica.js — atualização por quadro: jogador, itens, portal, IA, projéteis
   ===================================================================== */

function atualiza(dt){
  tempoJogo+=dt;
  if(msgT>0)msgT-=dt;
  if(flashDano>0)flashDano-=dt; if(flashItem>0)flashItem-=dt;
  if(jog.fogo>0)jog.fogo-=dt; if(jog.hurt>0)jog.hurt-=dt;
  if(jog.cool>0)jog.cool-=dt;
  if(!jog.vivo)return;

  // disparo contínuo (segurar botão/tecla)
  if((atirandoMouse||atirandoTecla||atirandoToque) && jog.cool<=0) disparar();

  // movimento do jogador
  const rot=2.6*dt;
  if(teclas['ArrowLeft'])jog.a-=rot;
  if(teclas['ArrowRight'])jog.a+=rot;
  let mf=0,ms=0;
  if(teclas['KeyW']||teclas['ArrowUp'])mf+=1;
  if(teclas['KeyS']||teclas['ArrowDown'])mf-=1;
  if(teclas['KeyA'])ms-=1;
  if(teclas['KeyD'])ms+=1;
  mf+=-movVet.y; ms+=movVet.x;
  const m=Math.hypot(mf,ms);
  if(m>0.01){
    mf/=Math.max(1,m); ms/=Math.max(1,m);
    const vel=3.2*dt;
    const dx=Math.cos(jog.a)*mf+Math.cos(jog.a+Math.PI/2)*ms;
    const dy=Math.sin(jog.a)*mf+Math.sin(jog.a+Math.PI/2)*ms;
    tentaMover(jog,jog.x+dx*vel,jog.y+dy*vel,0.22);
    jog.balanco+=dt*9;
  }

  atualizaItens();
  if(atualizaPortal()) return;
  atualizaInimigos(dt);
  atualizaProjeteis(dt);
}

function atualizaItens(){
  for(const it of itens){
    if(it.pego)continue;
    if(Math.hypot(it.x-jog.x,it.y-jog.y)<0.5){
      let pegou=true;
      switch(it.tipo){
        case 'vida':      if(jog.hp>=100){pegou=false;break;} jog.hp=Math.min(100,jog.hp+25); aviso('+25 DE VIDA'); break;
        case 'armadura':  if(jog.arm>=100){pegou=false;break;} jog.arm=Math.min(100,jog.arm+50); aviso('+50 DE ARMADURA'); break;
        case 'balas':     if(jog.mun.balas>=MAX_MUN.balas){pegou=false;break;} jog.mun.balas=Math.min(MAX_MUN.balas,jog.mun.balas+15); aviso('+15 BALAS'); break;
        case 'cartuchos': if(jog.mun.cartuchos>=MAX_MUN.cartuchos){pegou=false;break;} jog.mun.cartuchos=Math.min(MAX_MUN.cartuchos,jog.mun.cartuchos+6); aviso('+6 CARTUCHOS'); break;
        case 'celulas':   if(jog.mun.celulas>=MAX_MUN.celulas){pegou=false;break;} jog.mun.celulas=Math.min(MAX_MUN.celulas,jog.mun.celulas+20); aviso('+20 CÉLULAS'); break;
        case 'arma_escopeta':
          jog.armas.escopeta=true; jog.mun.cartuchos=Math.min(MAX_MUN.cartuchos,jog.mun.cartuchos+8);
          selecionarArma('escopeta'); aviso('VOCÊ PEGOU A ESCOPETA!'); sons.armaNova(); break;
        case 'arma_fuzil':
          jog.armas.fuzil=true; jog.mun.balas=Math.min(MAX_MUN.balas,jog.mun.balas+40);
          selecionarArma('fuzil'); aviso('VOCÊ PEGOU O FUZIL ROTATIVO!'); sons.armaNova(); break;
        case 'arma_plasma':
          jog.armas.plasma=true; jog.mun.celulas=Math.min(MAX_MUN.celulas,jog.mun.celulas+40);
          selecionarArma('plasma'); aviso('VOCÊ PEGOU O CANHÃO DE PLASMA!'); sons.armaNova(); break;
      }
      if(pegou){ it.pego=true; flashItem=0.25; if(!it.tipo.startsWith('arma'))sons.item(); }
    }
  }
}

/* retorna true se mudou de fase/estado (interrompe o quadro) */
function atualizaPortal(){
  if(celula(jog.x|0,jog.y|0)!==8) return false;
  if(portalAberto()){
    if(nivelAtual<NIVEIS.length-1){
      carregarNivel(nivelAtual+1);
      estado='inter'; interT=2.0; sons.vitoria();
    } else { estado='vitoriafinal'; sons.vitoria(); }
    return true;
  }
  if(msgT<=0) aviso(NIVEIS[nivelAtual].chefao?'O PORTAL ESTÁ SELADO — DERROTE O DEVORADOR':'O PORTAL ESTÁ SELADO — ELIMINE TODAS AS CRIATURAS');
  return false;
}

function atualizaInimigos(dt){
  for(const e of inimigos){
    if(e.hp<=0)continue;
    if(e.hurtT>0)e.hurtT-=dt;
    const dx=jog.x-e.x, dy=jog.y-e.y, d=Math.hypot(dx,dy);
    const alcanceVisao = e.tipo==='chefao'?12:6;
    if(!e.alerta && d<alcanceVisao && temVisao(e.x,e.y,jog.x,jog.y)) e.alerta=true;
    if(!e.alerta)continue;
    if(e.tipo==='chefao'&&!e.rugiu){ e.rugiu=true; sons.rugido(); aviso('O DEVORADOR DESPERTOU'); }
    e.animT+=dt;
    e.cool-=dt;

    if(e.tipo==='carnica'||e.tipo==='bruta'){
      e.frame=(e.animT*(e.tipo==='bruta'?4:6)|0)%2;
      if(e.atkT>0){ e.atkT-=dt; e.frame=2; }
      const alcance=e.tipo==='bruta'?1.3:1.0;
      if(d>alcance && temVisao(e.x,e.y,jog.x,jog.y)){
        const v=e.vel*dt;
        tentaMover(e,e.x+dx/d*v,e.y+dy/d*v,e.raio-0.05);
      }
      if(d<alcance+0.2 && e.cool<=0){
        e.cool=e.tipo==='bruta'?1.5:1.0; e.atkT=0.3;
        machucaJog(e.tipo==='bruta'?14+((Math.random()*10)|0):7+((Math.random()*8)|0));
      }
    }
    else if(e.tipo==='olho'){
      e.frame=(e.animT*3|0)%2;
      e.fase+=dt;
      // flutua mantendo distância e derivando para os lados
      let alvoD = d<3 ? -1 : (d>6 ? 1 : 0);
      const lat=Math.sin(e.fase*1.7)*0.7, v=e.vel*dt;
      tentaMover(e, e.x+(dx/d*alvoD-dy/d*lat)*v, e.y+(dy/d*alvoD+dx/d*lat)*v, e.raio-0.05);
      if(e.cool<=0 && d<9 && temVisao(e.x,e.y,jog.x,jog.y)){
        e.cool=1.8+Math.random()*0.8;
        const a=Math.atan2(dy,dx);
        tiros.push({x:e.x,y:e.y,dx:Math.cos(a)*4.5,dy:Math.sin(a)*4.5,vida:4,dono:'ini',dano:10+Math.random()*6,tipo:'fogo'});
        sons.bola();
      }
    }
    else if(e.tipo==='chefao'){
      e.frame=(e.animT*4|0)%2;
      if(e.atkT>0){ e.atkT-=dt; e.frame=2; }
      if(d>1.6 && temVisao(e.x,e.y,jog.x,jog.y)){
        const v=e.vel*dt;
        tentaMover(e,e.x+dx/d*v,e.y+dy/d*v,e.raio-0.1);
      }
      if(d<1.8 && e.cool<=0){
        e.cool=1.4; e.atkT=0.35;
        machucaJog(20+((Math.random()*12)|0));
      }
      else if(e.cool<=0 && d<12 && temVisao(e.x,e.y,jog.x,jog.y)){
        e.cool=2.2; e.atkT=0.35;
        const a=Math.atan2(dy,dx);
        for(const off of [-0.24,0,0.24]){
          tiros.push({x:e.x,y:e.y,dx:Math.cos(a+off)*5,dy:Math.sin(a+off)*5,vida:4.5,dono:'ini',dano:13+Math.random()*6,tipo:'fogo'});
        }
        sons.bola();
      }
    }
  }
}

function atualizaProjeteis(dt){
  for(const t of tiros){
    if(t.vida<=0)continue;
    t.x+=t.dx*dt; t.y+=t.dy*dt; t.vida-=dt;
    if(solido(t.x,t.y)){ t.vida=0; continue; }
    if(t.dono==='ini'){
      if(Math.hypot(t.x-jog.x,t.y-jog.y)<0.4){ t.vida=0; machucaJog(t.dano); }
    } else {
      for(const e of inimigos){
        if(e.hp<=0)continue;
        if(Math.hypot(t.x-e.x,t.y-e.y)<e.raio+0.15){ t.vida=0; ferirInimigo(e,t.dano); break; }
      }
    }
  }
  tiros=tiros.filter(t=>t.vida>0);
}
