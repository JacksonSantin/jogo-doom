'use strict';
/* =====================================================================
   config.js — constantes globais, canvas e definição das armas
   ===================================================================== */

const W = 320, VH = 168, HUDH = 40, H = VH + HUDH;
const cv = document.getElementById('tela');
cv.height = H;
const cx = cv.getContext('2d');
cx.imageSmoothingEnabled = false;

const TEX = 64;
const FOV_PLANE = 0.66;
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* Armas: taxa = segundos entre disparos; pelotas = projéteis por tiro;
   disp = dispersão angular; proj = dispara projétil físico (plasma);
   falloff = dano cai com a distância (escopeta). */
const ARMAS = {
  pistola: {nome:'PISTOLA',       mun:'balas',     taxa:0.42, pelotas:1, dano:[13,19], disp:0.012, proj:false, falloff:false},
  escopeta:{nome:'ESCOPETA',      mun:'cartuchos', taxa:0.95, pelotas:5, dano:[10,16], disp:0.06,  proj:false, falloff:true},
  fuzil:   {nome:'FUZIL ROTATIVO',mun:'balas',     taxa:0.10, pelotas:1, dano:[8,13],  disp:0.035, proj:false, falloff:false},
  plasma:  {nome:'CANHÃO PLASMA', mun:'celulas',   taxa:0.28, pelotas:1, dano:[34,46], disp:0.008, proj:true,  falloff:false}
};
const ORDEM_ARMAS = ['pistola','escopeta','fuzil','plasma'];
const MAX_MUN = {balas:200, cartuchos:50, celulas:120};
