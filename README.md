# INFERNO-93 v2

FPS retrô original em JavaScript puro, no estilo dos jogos de tiro de 1993, com motor de raycasting próprio. Todos os gráficos, mapas e sons são gerados proceduralmente — o projeto não tem nenhum asset externo nem dependências.

## Como rodar

Basta abrir o `index.html` em qualquer navegador moderno (duplo clique funciona).

Se preferir servir localmente:

```bash
# com Python instalado
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## Controles

| Ação | Desktop | Celular |
|---|---|---|
| Mover | WASD / setas | arrastar na metade esquerda |
| Girar | ← → ou mouse (clique trava o cursor) | arrastar na metade direita |
| Atirar (segurar) | clique ou Espaço | botão FOGO |
| Trocar arma | 1-4 ou Q | botão ARMA |
| Pausar | P | botão II |
| Reiniciar (após morrer/vencer) | R ou clique | toque |

## Estrutura do projeto

```
inferno-93/
├── index.html        ponto de entrada; carrega os scripts em ordem
├── README.md
├── css/
│   └── style.css     página, moldura e efeito de scanlines CRT
└── js/
    ├── config.js     constantes, canvas e definição das 4 armas
    ├── niveis.js     os 3 mapas em ASCII + legenda dos símbolos
    ├── texturas.js   texturas de parede procedurais (64x64)
    ├── sprites.js    sprites de inimigos, itens e projéteis
    ├── audio.js      motor de som procedural (WebAudio)
    ├── estado.js     estado global, jogador e carregamento de fase
    ├── fisica.js     colisão, raycast de distância (DDA), linha de visão
    ├── armas.js      troca de arma, disparo (hitscan/projétil), dano
    ├── logica.js     atualização por quadro: itens, portal, IA, projéteis
    ├── render.js     raycasting de paredes, sprites, arma, HUD, telas
    ├── entrada.js    teclado, mouse (pointer lock) e toque
    └── main.js       inicialização e loop principal
```

**Atenção:** os scripts não usam módulos ES — eles compartilham o escopo
global e a **ordem de carregamento no `index.html` importa**. Cada arquivo
só usa o que foi declarado nos anteriores.

## Conteúdo do jogo

- **3 fases:** A Base → As Cavernas → O Antro do Devorador.
  O equipamento persiste entre fases. O portal de saída só abre depois de
  eliminar todas as criaturas (fases 1-2) ou derrotar o chefão (fase 3).
- **4 armas:** Pistola (inicial), Escopeta (dano cai com a distância),
  Fuzil Rotativo (automático) e Canhão de Plasma (projétil).
- **Inimigos:** Carniça (90 PV, corpo a corpo), Olho Sentinela (55 PV,
  atira bolas de fogo), Brutamonte (180 PV, tanque) e O Devorador
  (chefão, 800 PV, rajada tripla).
- **Armadura:** absorve 1/3 do dano recebido até se esgotar (máx. 100).

## Como estender

**Nova fase:** adicione um objeto em `NIVEIS` (`js/niveis.js`) com `nome`,
`chefao` e `mapa` — linhas de exatamente 24 caracteres usando a legenda do
topo do arquivo.

**Nova arma:** registre em `ARMAS` e `ORDEM_ARMAS` (`js/config.js`),
desenhe o modelo em 1ª pessoa em `desenhaArma()` (`js/render.js`), o som em
`sons` (`js/audio.js`) e, se for item coletável, o sprite em
`js/sprites.js` + um símbolo novo em `carregarNivel()` (`js/estado.js`) e
`atualizaItens()` (`js/logica.js`).

**Novo inimigo:** crie o sprite em `js/sprites.js`, registre o símbolo em
`carregarNivel()` (`js/estado.js`) e o comportamento em
`atualizaInimigos()` (`js/logica.js`).
