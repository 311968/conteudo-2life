// POST ESTATICO — uma frase que para o scroll. O raciocinio vai na legenda.
// Tres estilos: frase (so cor), foto (rosto inteiro), lateral (rosto na coluna).
const paletas = require('./paletas');
const fs = require('fs');
const path = require('path');
const modelo2life = require('./modelo2life');

// Logotipo (regra de 16/11/2026, BRAND.md v1.3): sem (por defeito), selo ou grande
const marca = (nome) => {
  try { return 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'marca', nome)).toString('base64'); }
  catch (e) { return ''; }
};
const LOGO = { escuro: marca('logo-escuro.png'), claro: marca('logo-claro.png') };
const escolhaLogo = (v) => { const x = String(v == null ? '' : v).trim().toLowerCase();
  return x === 'completo' ? 'grande' : (['selo', 'grande'].includes(x) ? x : 'sem'); };
const paletaEscura = (tom) => { const p = paletas.lista().find(x => x.id === tom); return !!(p && p.escura); };
function selo(s, ctx, claro) {
  if (escolhaLogo(s.logotipo) !== 'selo') return '';
  // No canto livre de cada estilo: em baixo na frase; em cima na foto (o texto fica em baixo); na lateral, em baixo à direita, por cima do @
  const lugar = s.tipo === 'lateral' ? 'right:58px;bottom:118px' : (s.tipo === 'foto' && ctx.fotoUrl ? 'left:72px;top:56px' : 'left:72px;bottom:56px');
  return `<img src="${claro ? LOGO.claro : LOGO.escuro}" alt="Método 2Life" style="position:absolute;${lugar};width:140px;z-index:4">`;
}

const NOME = 'Post';
const DESCRICAO = 'Uma frase que para o scroll. O conteúdo inteiro vai na legenda.';
const TIPOS = ['frase', 'foto', 'lateral'];

const ESTILOS = [
  { id: 'frase', nome: 'Só frase', descricao: 'Cor chapada, sem imagem. A frase sozinha, como no Manifesto.' },
  { id: 'foto', nome: 'Foto inteira', descricao: 'Sua foto ocupando a arte, com a frase embaixo.' },
  { id: 'lateral', nome: 'Foto na lateral', descricao: 'Sua foto numa coluna, a frase na outra.' },
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rico(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

function css(tom) {
  return `
  ${paletas.raiz(tom)}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1350px; overflow:hidden; }
  .slide{ position:relative; width:1080px; height:1350px; display:flex; flex-direction:column;
    font-family:'Montserrat',sans-serif; }

  /* so cor */
  .slide.cor{ background:var(--bloco); color:var(--sobre-bloco); align-items:center;
    padding:70px 78px; }
  /* foto de fundo */
  .slide.foto{ background:#2E2B29; color:#FBF8F2; align-items:center; padding:70px 72px; }
  .fundo{ position:absolute; inset:0; background-size:cover; background-position:center 20%; }
  .veu{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(46,43,41,.26) 0%, rgba(46,43,41,.16) 26%, rgba(46,43,41,.72) 52%, rgba(46,43,41,.96) 100%); }

  /* foto na lateral */
  .slide.lateral{ flex-direction:row; background:var(--bloco); color:var(--sobre-bloco); }
  .col-foto{ flex:0 0 462px; background-size:cover; background-position:center; background-color:var(--fundo2); }
  .col-texto{ flex:1 1 auto; display:flex; flex-direction:column; justify-content:center;
    padding:70px 58px; min-width:0; }

  .serie{ position:relative; z-index:3; flex:0 0 auto; font-family:'Montserrat',sans-serif; font-weight:600;
    font-size:27px; letter-spacing:.20em; text-transform:uppercase; text-align:center; opacity:.8; }
  .slide.foto .serie{ color:var(--acento); opacity:1; text-shadow:0 2px 12px rgba(46,43,41,.75); }

  .miolo{ position:relative; z-index:3; flex:1 1 auto; width:100%;
    display:flex; flex-direction:column; justify-content:center; gap:30px; }
  .slide.foto .miolo{ justify-content:flex-end; padding-bottom:16px; }

  .intro{ font-size:40px; line-height:1.34; text-align:center; font-weight:400; opacity:.92; }
  h1{ font-family:'Cormorant Garamond',serif; font-weight:900; text-transform:uppercase;
    letter-spacing:-0.014em; line-height:1.04; font-size:92px; text-align:center; }
  h1.medio{ font-size:76px; }
  h1.pequeno{ font-size:62px; }
  h1.mini{ font-size:52px; }
  .slide.foto h1{ font-size:78px; }
  .slide.foto h1.medio{ font-size:66px; }
  .slide.foto h1.pequeno{ font-size:56px; }
  .slide.foto h1.mini{ font-size:46px; }
  .slide.foto .intro{ font-size:36px; }
  .slide.foto .miolo{ gap:24px; }

  .mao{ font-family:'Allura',cursive; font-weight:700; font-size:58px; line-height:1.22;
    text-align:center; opacity:.9; }
  .slide.foto .mao{ color:var(--acento); opacity:1; font-size:50px; }

  /* na lateral o texto respira alinhado a esquerda */
  .slide.lateral .intro, .slide.lateral h1, .slide.lateral .mao{ text-align:left; }
  .slide.lateral h1{ font-size:74px; }
  .slide.lateral h1.medio{ font-size:62px; }
  .slide.lateral h1.pequeno{ font-size:52px; }
  .slide.lateral h1.mini{ font-size:44px; }
  .slide.lateral .intro{ font-size:34px; }
  .slide.lateral .mao{ font-size:48px; }
  .slide.lateral .serie{ text-align:left; margin-bottom:26px; }

  .rodape{ position:relative; z-index:3; flex:0 0 auto; font-weight:500;
    font-size:25px; letter-spacing:.16em; text-align:center; opacity:.75; }
  .slide.foto .rodape{ color:var(--acento); opacity:1; }
  .slide.lateral .rodape{ text-align:left; }
  `;
}

// A coluna da lateral e estreita, entao o texto precisa encolher antes
function tamanho(t, estreito) {
  const n = String(t || '').length;
  const [mini, peq, med] = estreito ? [72, 48, 28] : [110, 74, 42];
  if (n > mini) return 'mini';
  if (n > peq) return 'pequeno';
  if (n > med) return 'medio';
  return '';
}

function slideHTML(s, ctx) {
  const url = ctx.fotoUrl || '';
  const serie = ctx.serie ? `<div class="serie">${esc(ctx.serie)}</div>` : '<div class="serie"></div>';
  const rodape = `<div class="rodape">${esc(ctx.handle || '')}</div>`;
  const miolo = `
    ${s.intro ? `<div class="intro">${rico(s.intro)}</div>` : ''}
    ${s.titulo ? `<h1 class="${tamanho(s.titulo, s.tipo === 'lateral')}">${rico(s.titulo)}</h1>` : ''}
    ${s.manuscrita ? `<div class="mao">${rico(s.manuscrita)}</div>` : ''}`;

  if (s.tipo === 'lateral') {
    return `<div class="slide lateral">${selo(s, ctx, paletaEscura(ctx.tom))}
      <div class="col-foto" style="${url ? `background-image:url('${url}')` : ''}"></div>
      <div class="col-texto">
        ${serie}
        <div class="miolo">${miolo}</div>
        <div style="flex:0 0 26px"></div>
        ${rodape}
      </div>
    </div>`;
  }

  if (s.tipo === 'foto' && url) {
    return `<div class="slide foto">${selo(s, ctx, true)}
      <div class="fundo" style="background-image:url('${url}')"></div><div class="veu"></div>
      ${serie}
      <div class="miolo">${miolo}</div>
      <div style="flex:0 0 40px"></div>
      ${rodape}
    </div>`;
  }

  // frase, e tambem o "foto" quando ela escolhe nao usar foto
  return `<div class="slide cor">${selo(s, ctx, paletaEscura(ctx.tom))}
    ${serie}
    <div class="miolo">${miolo}</div>
    ${rodape}
  </div>`;
}

function paginaHTML(slide, ctx) {
  // Logotipo grande: a composicao do exemplo do Mapa (frase, logotipo grande sobre a foto, assinatura)
  if (escolhaLogo(slide && slide.logotipo) === 'grande') {
    const comFoto = !!ctx.fotoUrl && slide.tipo !== 'frase';
    return modelo2life.paginaHTML({ tipo: 'fecho', titulo: slide.titulo, logotipo: 'grande', foto_fecho: comFoto ? 'sim' : '' },
      Object.assign({}, ctx, { fotoUrl: comFoto ? ctx.fotoUrl : '' }));
  }
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)} .slide b{ color:var(--acento); } .slide.escuro b, .slide.foto b{ color:var(--ouro); }</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

const INSTRUCOES = `# O QUE E UM POST ESTATICO

Nao e uma lamina de carrossel. E UMA FRASE que para o scroll, e so.

A arte carrega a frase. **O raciocinio inteiro vai na legenda.** Se voce escrever um paragrafo na arte, o post morre: ninguem para para ler paragrafo no feed.

# A FRASE (o que aparece na arte)
- "titulo": a frase principal, ate 90 caracteres. E ela que segura tudo. Precisa funcionar sozinha, sem contexto, para quem nunca viu a autora.
- "intro": uma linha curta ANTES da frase, opcional, ate 55 caracteres. Serve para dar o enquadramento ("Antes de contratar mais uma pessoa,").
- "manuscrita": uma linha curta DEPOIS, opcional, ate 60 caracteres, em letra de mao. E o cochicho, o comentario humano.

Frase boa: afirma, corta, ou pergunta. Nao explica.

# A LEGENDA (onde mora o conteudo)
De 8 a 14 linhas. Aqui sim voce desenvolve: nomeia o problema, mostra a causa, da o caminho e termina com um convite claro. Paragrafos curtos, separados por linha em branco. E a legenda que faz o trabalho que num carrossel as laminas do meio fariam.`;

module.exports = { NOME, DESCRICAO, TIPOS, ESTILOS, INSTRUCOES, paginaHTML, slideHTML, css };
