'use strict';
/* =====================================================================
   render.js — raycasting de paredes, sprites, arma em 1ª pessoa,
   HUD, minimapa e telas (título, pausa, morte, vitória)
   ===================================================================== */

const zbuf=new Float32Array(W);
const gradTeto=cx.createLinearGradient(0,0,0,VH/2);
gradTeto.addColorStop(0,'#100c0a'); gradTeto.addColorStop(1,'#231410');
const gradChao=cx.createLinearGradient(0,VH/2,0,VH);
gradChao.addColorStop(0,'#2a1812'); gradChao.addColorStop(1,'#120c09');

function desenhaMundo(){
  cx.fillStyle=gradTeto; cx.fillRect(0,0,W,VH/2);
  cx.fillStyle=gradChao; cx.fillRect(0,VH/2,W,VH/2);
  cx.fillStyle='rgba(255,90,20,.06)'; cx.fillRect(0,VH/2-6,W,12);

  const dirX=Math.cos(jog.a), dirY=Math.sin(jog.a);
  const plX=-dirY*FOV_PLANE, plY=dirX*FOV_PLANE;

  for(let x=0;x<W;x++){
    const cam=2*x/W-1;
    const rdx=dirX+plX*cam, rdy=dirY+plY*cam;
    let mx=jog.x|0,my=jog.y|0;
    const ddx=Math.abs(1/(rdx||1e-9)), ddy=Math.abs(1/(rdy||1e-9));
    let sx,sy,sdx,sdy;
    if(rdx<0){sx=-1;sdx=(jog.x-mx)*ddx;}else{sx=1;sdx=(mx+1-jog.x)*ddx;}
    if(rdy<0){sy=-1;sdy=(jog.y-my)*ddy;}else{sy=1;sdy=(my+1-jog.y)*ddy;}
    let lado=0, cel=1, ach=false;
    for(let i=0;i<64;i++){
      if(sdx<sdy){sdx+=ddx;mx+=sx;lado=0;}else{sdy+=ddy;my+=sy;lado=1;}
      const c=celula(mx,my);
      if(c===1||c===2||c===3){cel=c;ach=true;break;}
    }
    let dist = lado===0 ? (mx-jog.x+(1-sx)/2)/(rdx||1e-9) : (my-jog.y+(1-sy)/2)/(rdy||1e-9);
    dist=Math.max(0.02,dist);
    zbuf[x]=dist;
    if(!ach)continue;

    const h=(VH/dist)|0;
    const y0=((VH-h)/2)|0;
    let wx = lado===0 ? jog.y+dist*rdy : jog.x+dist*rdx;
    wx-=Math.floor(wx);
    let tx=(wx*TEX)|0;
    if((lado===0&&rdx>0)||(lado===1&&rdy<0)) tx=TEX-tx-1;

    cx.drawImage(texturas[cel],tx,0,1,TEX, x,y0,1,h);
    const sombra=Math.min(.78, dist*.075 + (lado?0.18:0));
    if(sombra>0.02){ cx.fillStyle=`rgba(0,0,0,${sombra})`; cx.fillRect(x,y0,1,h); }
  }
  desenhaPortais(dirX,dirY,plX,plY);
  desenhaSprites(dirX,dirY,plX,plY);
}

function projeta(x,y,dirX,dirY,plX,plY){
  const rx=x-jog.x, ry=y-jog.y;
  const inv=1/(plX*dirY-dirX*plY);
  const tx=inv*(dirY*rx-dirX*ry);
  const ty=inv*(-plY*rx+plX*ry);
  if(ty<=0.1)return null;
  return {sx:(W/2)*(1+tx/ty)|0, ty};
}

function desenhaPortais(dirX,dirY,plX,plY){
  const ativo=portalAberto();
  for(const p of listaPortais){
    const s=projeta(p.x,p.y,dirX,dirY,plX,plY);
    if(!s)continue;
    const raio=(VH/s.ty*0.45)|0;
    const py=(VH/2 + VH/(2*s.ty))|0;
    const pul=0.5+0.5*Math.sin(tempoJogo*4);
    cx.globalAlpha=(ativo?0.55:0.18)+pul*0.2;
    const g=cx.createRadialGradient(s.sx,py,1,s.sx,py,Math.max(2,raio));
    g.addColorStop(0, ativo?'#c9a7ff':'#5a3f7a'); g.addColorStop(1,'rgba(80,40,140,0)');
    cx.fillStyle=g;
    cx.beginPath(); cx.ellipse(s.sx,py,raio,raio*0.35,0,0,7); cx.fill();
    cx.globalAlpha=1;
  }
}

function desenhaSprites(dirX,dirY,plX,plY){
  const lista=[];
  for(const e of inimigos){
    const img = e.hp>0 ? SPR[e.tipo][e.frame] : SPR.cadaver;
    lista.push({x:e.x,y:e.y,img,hurt:e.hp>0&&e.hurtT>0,escala:e.hp>0?e.escala:1});
  }
  for(const it of itens) if(!it.pego) lista.push({x:it.x,y:it.y,img:SPR[it.tipo],escala:1});
  for(const t of tiros) lista.push({x:t.x,y:t.y,img:t.tipo==='plasma'?SPR.bolaPlasma:SPR.bolaFogo,escala:0.6,brilho:true});
  for(const s of lista) s.d=(s.x-jog.x)**2+(s.y-jog.y)**2;
  lista.sort((a,b)=>b.d-a.d);

  for(const s of lista){
    const p=projeta(s.x,s.y,dirX,dirY,plX,plY);
    if(!p)continue;
    const hSpr=(Math.abs(VH/p.ty)*s.escala)|0;
    const wSpr=hSpr;
    const baseY=(VH/2 + VH/(2*p.ty))|0; // base ancorada no chão
    const y0=baseY-hSpr;
    const x0=(p.sx-wSpr/2)|0;
    const passo=TEX/wSpr;
    if(s.brilho)cx.globalCompositeOperation='lighter';
    if(s.hurt)cx.filter='brightness(2.6)';
    for(let i=0;i<wSpr;i++){
      const sx=x0+i;
      if(sx<0||sx>=W||p.ty>=zbuf[sx])continue;
      cx.drawImage(s.img,(i*passo)|0,0,1,TEX, sx,y0,1,hSpr);
    }
    if(s.hurt)cx.filter='none';
    if(s.brilho)cx.globalCompositeOperation='source-over';
  }
}

/* ----- arma em primeira pessoa ----- */
function desenhaArma(){
  const rec = jog.fogo>0 ? Math.min(10,jog.fogo*36) : 0;
  const bx = W/2 + Math.sin(jog.balanco)*4;
  const by = VH - 34 + Math.abs(Math.cos(jog.balanco))*3 + rec;
  const arma=jog.armaAtual;

  if(jog.fogo>0.22){
    const cor = arma==='plasma' ? ['#dffaff','#39c8ff'] : ['#fff6c8','#ff9a24'];
    const g=cx.createRadialGradient(bx,by-18,2,bx,by-18,24);
    g.addColorStop(0,cor[0]); g.addColorStop(.5,cor[1]); g.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=g; cx.beginPath(); cx.arc(bx,by-18,24,0,7); cx.fill();
  }

  if(arma==='pistola'){
    cx.fillStyle='#2b2b30'; cx.fillRect(bx-5,by-14,10,22);
    cx.fillStyle='#44464d'; cx.fillRect(bx-4,by-14,3,22);
    cx.fillStyle='#101114'; cx.fillRect(bx-4,by-14,8,3);
    cx.fillStyle='#5a3a22'; cx.fillRect(bx-7,by+8,14,12);
  }
  else if(arma==='escopeta'){
    cx.fillStyle='#23252a'; cx.fillRect(bx-12,by-16,10,30); cx.fillRect(bx+2,by-16,10,30);
    cx.fillStyle='#3b3f47'; cx.fillRect(bx-10,by-16,3,30); cx.fillRect(bx+4,by-16,3,30);
    cx.fillStyle='#101114'; cx.fillRect(bx-9,by-16,4,3); cx.fillRect(bx+5,by-16,4,3);
    cx.fillStyle='#5a3a22'; cx.fillRect(bx-15,by+10,30,12);
    cx.fillStyle='#432b18'; cx.fillRect(bx-15,by+18,30,4);
    cx.fillStyle='#2b2b30'; cx.fillRect(bx-13,by+6,26,5);
  }
  else if(arma==='fuzil'){
    const rotB=(jog.spin%3)|0;
    cx.fillStyle='#1a1b1e'; cx.fillRect(bx-16,by-12,32,26);
    for(let i=0;i<3;i++){
      cx.fillStyle = i===rotB ? '#5d6470' : '#34373d';
      cx.fillRect(bx-12+i*9,by-18,7,26);
      cx.fillStyle='#101114'; cx.fillRect(bx-11+i*9,by-18,5,3);
    }
    cx.fillStyle='#2b2b30'; cx.fillRect(bx-18,by+12,36,8);
  }
  else if(arma==='plasma'){
    cx.fillStyle='#1d3a52'; cx.fillRect(bx-13,by-14,26,30);
    cx.fillStyle='#0f2233'; cx.fillRect(bx-13,by-14,26,5);
    const pul=0.6+0.4*Math.sin(tempoJogo*8);
    cx.fillStyle=`rgba(57,200,255,${pul})`;
    cx.fillRect(bx-8,by-8,16,5); cx.fillRect(bx-8,by,16,5);
    cx.fillStyle='#101114'; cx.fillRect(bx-6,by-14,12,4);
  }

  // mira
  cx.strokeStyle='rgba(232,224,204,.9)'; cx.lineWidth=1;
  cx.beginPath();
  cx.moveTo(W/2-5,VH/2); cx.lineTo(W/2-2,VH/2);
  cx.moveTo(W/2+2,VH/2); cx.lineTo(W/2+5,VH/2);
  cx.moveTo(W/2,VH/2-5); cx.lineTo(W/2,VH/2-2);
  cx.moveTo(W/2,VH/2+2); cx.lineTo(W/2,VH/2+5);
  cx.stroke();
}

/* ----- HUD ----- */
function texto(t,x,y,cor,tam,negrito){
  cx.font=`${negrito===false?'':'bold '}${tam||12}px "Courier New",monospace`;
  cx.fillStyle=cor; cx.textBaseline='top'; cx.fillText(t,x,y);
}
function desenhaHUD(){
  cx.fillStyle='#191714'; cx.fillRect(0,VH,W,HUDH);
  cx.fillStyle='#0c0b09'; cx.fillRect(0,VH,W,2);
  cx.fillStyle='#2b2825'; cx.fillRect(0,VH+2,W,1);

  const corHP = jog.hp>60?'#27e0a0':jog.hp>30?'#ffd23f':'#ff3b30';
  texto('VIDA',6,VH+5,'#6e675a',7);
  texto(String(jog.hp).padStart(3,' ')+'%',6,VH+13,corHP,13);

  texto('ARMAD.',58,VH+5,'#6e675a',7);
  texto(String(jog.arm).padStart(3,' ')+'%',58,VH+13,jog.arm>0?'#39c8ff':'#4a4640',13);

  const A=ARMAS[jog.armaAtual];
  texto('MUNIÇÃO',112,VH+5,'#6e675a',7);
  texto(String(jog.mun[A.mun]).padStart(3,'0'),112,VH+13,'#ffd23f',13);

  texto('ABATES',164,VH+5,'#6e675a',7);
  texto(`${abates}/${totalAbates}`,164,VH+13, portalAberto()?'#c9a7ff':'#e8e0cc',13);

  texto(`N${nivelAtual+1}`,216,VH+5,'#6e675a',7);
  texto(A.nome,216,VH+13,'#e8e0cc',9);

  // barras de vida e armadura
  cx.fillStyle='#0c0b09'; cx.fillRect(6,VH+29,100,7);
  cx.fillStyle=corHP; cx.fillRect(7,VH+30,(49*jog.hp/100)|0,5);
  cx.fillStyle='#39c8ff'; cx.fillRect(57,VH+30,(48*jog.arm/100)|0,5);

  // slots de arma
  for(let i=0;i<4;i++){
    const id=ORDEM_ARMAS[i];
    const x=116+i*36, y=VH+27, w=32, h=11;
    const tem=jog.armas[id], atual=jog.armaAtual===id;
    cx.fillStyle=atual?'#3a2a12':'#0c0b09'; cx.fillRect(x,y,w,h);
    cx.strokeStyle=atual?'#ffd23f':(tem?'#6e675a':'#2b2825');
    cx.strokeRect(x+.5,y+.5,w-1,h-1);
    texto(`${i+1} ${['PIS','ESC','FUZ','PLA'][i]}`,x+3,y+2,tem?(atual?'#ffd23f':'#e8e0cc'):'#3a3733',7);
  }

  // botões de toque
  if(IS_TOUCH && (estado==='jogo'||estado==='pausa')){
    for(const b of [BT_FOGO,BT_ARMA]){
      cx.fillStyle = b===BT_FOGO?'rgba(179,18,46,.55)':'rgba(60,60,70,.55)';
      cx.fillRect(b.x,b.y,b.w,b.h);
      cx.strokeStyle='rgba(232,224,204,.7)'; cx.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);
      texto(b.rotulo,b.x+9,b.y+b.h/2-5,'#e8e0cc',10);
    }
    cx.fillStyle='rgba(60,60,70,.55)'; cx.fillRect(BT_PAUSA.x,BT_PAUSA.y,BT_PAUSA.w,BT_PAUSA.h);
    cx.strokeStyle='rgba(232,224,204,.7)'; cx.strokeRect(BT_PAUSA.x+.5,BT_PAUSA.y+.5,BT_PAUSA.w-1,BT_PAUSA.h-1);
    texto('II',BT_PAUSA.x+6,BT_PAUSA.y+4,'#e8e0cc',9);
  }
}

function desenhaBarraChefao(){
  if(!chefaoRef || chefaoRef.hp<=0 || !chefaoRef.alerta) return;
  const w=140, x=(W-w)/2, y=8;
  texto('O DEVORADOR',W/2-34,y-1,'#b3122e',8);
  cx.fillStyle='#0c0b09'; cx.fillRect(x,y+9,w,6);
  cx.fillStyle='#b3122e'; cx.fillRect(x+1,y+10,((w-2)*chefaoRef.hp/chefaoRef.hpMax)|0,4);
}

function desenhaMinimapa(){
  const esc=2.2, ox=6, oy=24;
  cx.globalAlpha=.7;
  cx.fillStyle='#000'; cx.fillRect(ox-2,oy-2,MW*esc+4,MH*esc+4);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const c=mapa[y][x];
    if(c===1||c===2)cx.fillStyle='#4a4640';
    else if(c===3)cx.fillStyle='#6e1018';
    else if(c===8)cx.fillStyle='#7d3df0';
    else continue;
    cx.fillRect(ox+x*esc,oy+y*esc,esc,esc);
  }
  for(const e of inimigos) if(e.hp>0&&e.alerta){
    cx.fillStyle = e.tipo==='chefao'?'#ffd23f':'#ff3b30';
    cx.fillRect(ox+e.x*esc-1,oy+e.y*esc-1,e.tipo==='chefao'?3:2,e.tipo==='chefao'?3:2);
  }
  cx.fillStyle='#27e0a0'; cx.fillRect(ox+jog.x*esc-1.5,oy+jog.y*esc-1.5,3,3);
  cx.strokeStyle='#27e0a0'; cx.beginPath();
  cx.moveTo(ox+jog.x*esc,oy+jog.y*esc);
  cx.lineTo(ox+(jog.x+Math.cos(jog.a)*2)*esc, oy+(jog.y+Math.sin(jog.a)*2)*esc);
  cx.stroke();
  cx.globalAlpha=1;
}

/* ----- telas ----- */
function telaCentral(titulo,corTitulo,linhas){
  cx.fillStyle='rgba(5,4,3,.78)'; cx.fillRect(0,0,W,H);
  cx.textAlign='center'; cx.textBaseline='middle';
  cx.font='bold 28px "Courier New",monospace';
  cx.fillStyle='rgba(0,0,0,.9)'; cx.fillText(titulo,W/2+2,H/2-32+2);
  cx.fillStyle=corTitulo; cx.fillText(titulo,W/2,H/2-32);
  cx.font='10px "Courier New",monospace'; cx.fillStyle='#e8e0cc';
  linhas.forEach((l,i)=>cx.fillText(l,W/2,H/2-2+i*14));
  cx.textAlign='left'; cx.textBaseline='top';
}

function desenha(){
  if(estado==='titulo'){
    cx.fillStyle='#0a0908'; cx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=4){
      const h2=12+Math.sin(x*.21+tempoJogo*5)*6+Math.sin(x*.07+tempoJogo*2.3)*8;
      cx.fillStyle=`rgba(255,${60+(x*37%90)|0},10,.5)`;
      cx.fillRect(x,H-h2,4,h2);
    }
    cx.textAlign='center';
    cx.font='bold 40px "Courier New",monospace';
    cx.fillStyle='#3d0610'; cx.fillText('INFERNO-93',W/2+3,70+3);
    cx.fillStyle='#b3122e'; cx.fillText('INFERNO-93',W/2,70);
    cx.font='10px "Courier New",monospace';
    cx.fillStyle='#6e675a'; cx.fillText('— VERSÃO 2 —',W/2,88);
    cx.fillStyle='#a89d86';
    cx.fillText('TRÊS FASES. QUATRO ARMAS. UM DEVORADOR.',W/2,106);
    cx.fillStyle='#e8e0cc';
    cx.fillText('WASD MOVER · 1-4/Q TROCAR ARMA · P PAUSAR',W/2,128);
    cx.fillText('SEGURE O TIRO: CLIQUE OU ESPAÇO',W/2,142);
    cx.fillStyle='#ffd23f';
    cx.fillText(IS_TOUCH?'— TOQUE PARA COMEÇAR —':'— CLIQUE PARA COMEÇAR —',W/2,166+Math.sin(tempoJogo*4)*2);
    cx.textAlign='left';
    return;
  }
  if(estado==='inter'){
    cx.fillStyle='#0a0908'; cx.fillRect(0,0,W,H);
    cx.textAlign='center'; cx.textBaseline='middle';
    cx.font='bold 16px "Courier New",monospace';
    cx.fillStyle='#b3122e'; cx.fillText(NIVEIS[nivelAtual].nome,W/2,H/2-10);
    cx.font='10px "Courier New",monospace'; cx.fillStyle='#a89d86';
    cx.fillText(NIVEIS[nivelAtual].chefao?'algo enorme respira no escuro...':'mais fundo na escuridão...',W/2,H/2+12);
    cx.textAlign='left'; cx.textBaseline='top';
    return;
  }

  desenhaMundo();
  if(jog.vivo)desenhaArma();
  desenhaMinimapa();
  desenhaBarraChefao();

  if(msgT>0){
    cx.textAlign='center'; cx.font='bold 10px "Courier New",monospace';
    cx.fillStyle='rgba(0,0,0,.8)'; cx.fillText(msg,W/2+1,30+1);
    cx.fillStyle='#ffd23f'; cx.fillText(msg,W/2,30);
    cx.textAlign='left';
  }
  if(flashDano>0){ cx.fillStyle=`rgba(200,20,20,${Math.min(.5,flashDano)})`; cx.fillRect(0,0,W,VH); }
  if(flashItem>0){ cx.fillStyle=`rgba(255,220,80,${Math.min(.25,flashItem)})`; cx.fillRect(0,0,W,VH); }

  desenhaHUD();

  if(estado==='pausa')
    telaCentral('PAUSADO','#ffd23f',[ IS_TOUCH?'toque para continuar':'pressione P ou clique para continuar' ]);
  if(estado==='morto')
    telaCentral('VOCÊ MORREU','#b3122e',['as criaturas tomaram a estação', IS_TOUCH?'toque para tentar de novo':'pressione R ou clique para tentar de novo']);
  if(estado==='vitoriafinal')
    telaCentral('VOCÊ VENCEU O INFERNO','#27e0a0',['o Devorador caiu e o portal se fechou para sempre', IS_TOUCH?'toque para jogar de novo':'pressione R ou clique para jogar de novo']);
}
