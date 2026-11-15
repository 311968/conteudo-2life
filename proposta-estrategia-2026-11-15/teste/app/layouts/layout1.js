// LAYOUT 1 — "Faixa e Caixa" (referencia: carrossel modelo 1)
// Adaptado para a identidade Alianca Clara.
// Slide 1080x1350. Tipos: capa | caixas | texto | cheia | fechamento

const NOME = 'Faixa e Caixa';
const DESCRICAO = 'Persuasivo. Abre com a tese que para o scroll, mostra o problema real e o custo de continuar assim, entrega a virada e fecha com convite. De 7 a 9 lâminas.';

const TIPOS = ['capa', 'caixas', 'texto', 'cheia', 'fechamento'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Realce: **palavra** vira negrito petroleo/creme
function rico(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

const paletas = require('./paletas');

function css(tom) {
  return `
  ${paletas.raiz(tom)}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1350px; overflow:hidden; }
  .slide{
    position:relative; width:1080px; height:1350px;
    display:flex; flex-direction:column; align-items:center;
    padding:64px 72px; font-family:'Montserrat',sans-serif;
  }
  /* fundo da paleta, sempre em gradiente radial */
  .slide.claro{
    background: radial-gradient(120% 90% at 50% 38%, var(--halo) 0%, var(--fundo) 52%, var(--fundo2) 100%);
    color: var(--tinta);
  }
  /* laminas com foto: o veu manda, texto sempre claro */
  .slide.escuro{
    background: radial-gradient(110% 80% at 50% 30%, #2B656D 0%, #17343B 45%, #2E2B29 100%);
    color: #FBF8F2;
  }
  /* lamina de virada: usa a cor de destaque da paleta */
  .slide.cheio{ background: var(--bloco); color: var(--sobre-bloco); }
  .grao{
    position:absolute; inset:0; pointer-events:none; opacity:.30; mix-blend-mode:multiply;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.55'/></svg>");
  }
  .slide.escuro .grao, .slide.cheio .grao{ mix-blend-mode:soft-light; opacity:.20; }
  .foto{ position:absolute; inset:0; background-size:cover; background-position:center 22%; }
  .veu{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(46,43,41,.55) 0%, rgba(46,43,41,.35) 38%, rgba(46,43,41,.88) 100%); }

  .serie{
    position:relative; z-index:3; font-family:'Montserrat',sans-serif; font-weight:600;
    font-size:28px; letter-spacing:.20em; text-transform:uppercase; color:var(--secundaria);
    text-align:center; flex:0 0 auto;
  }
  .slide.escuro .serie{ color:#CFBE96; }
  .slide.cheio .serie{ color:var(--sobre-bloco); opacity:.72; }

  .miolo{ position:relative; z-index:3; flex:1 1 auto; width:100%;
    display:flex; flex-direction:column; justify-content:center; gap:30px; }
  .miolo.baixo{ justify-content:flex-end; padding-bottom:18px; }

  .rodape{
    position:relative; z-index:3; flex:0 0 auto; font-family:'Montserrat',sans-serif; font-weight:500;
    font-size:26px; letter-spacing:.16em; color:var(--secundaria); text-align:center;
  }
  .slide.escuro .rodape{ color:#CFBE96; }
  .slide.cheio .rodape{ color:var(--sobre-bloco); opacity:.72; }

  h1{
    font-family:'Cormorant Garamond',serif; font-weight:900; text-transform:uppercase;
    letter-spacing:-0.012em; line-height:1.02; font-size:88px; text-align:center;
  }
  h1.medio{ font-size:74px; }
  h1.pequeno{ font-size:62px; }
  .slide.claro h1{ color:var(--titulo); }
  .slide.escuro h1{ color:#FBF8F2; }
  .slide.cheio h1{ color:var(--sobre-bloco); }

  .caixa{
    background:var(--bloco); color:var(--sobre-bloco); border-radius:22px;
    padding:40px 44px; font-size:46px; line-height:1.28; text-align:center; font-weight:400;
  }
  .caixa b{ font-weight:700; }
  .caixa.curta{ font-size:50px; padding:34px 42px; }
  .pilha{ display:flex; flex-direction:column; gap:26px; }

  p.corpo{ font-size:45px; line-height:1.38; text-align:center; font-weight:400; }
  p.corpo b{ font-weight:700; }

  .mao{ font-family:'Allura',cursive; font-weight:700; font-size:62px; line-height:1.22;
    text-align:center; color:var(--apoio); }
  .slide.escuro .mao{ color:#CFBE96; }
  .slide.cheio .mao{ color:var(--sobre-bloco); opacity:.85; }

  .fita{ display:inline-block; background:var(--acento); color:#2E2B29;
    font-family:'Montserrat',sans-serif; font-weight:600; text-transform:uppercase;
    letter-spacing:.06em; font-size:41px; padding:19px 40px; align-self:center;
    clip-path: polygon(1% 6%, 99% 0%, 100% 92%, 0% 100%); }
  /* em fundo chapado, a fita inverte para nao sumir */
  .slide.cheio .fita{ background:var(--sobre-bloco); color:var(--bloco); }
  `;
}

// Ajuste de tamanho do titulo conforme comprimento
function classeTitulo(t) {
  const n = String(t || '').length;
  if (n > 90) return 'pequeno';
  if (n > 55) return 'medio';
  return '';
}

function miolo(s, fotoUrl) {
  // Com foto o texto desce, para o rosto respirar em cima.
  // Sem foto ele fica centrado, senao a lamina abre um buraco no meio.
  const assenta = fotoUrl ? 'miolo baixo' : 'miolo';
  switch (s.tipo) {
    case 'capa':
      return `<div class="${assenta}">
        ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
        ${s.manuscrita ? `<div class="mao">${rico(s.manuscrita)}</div>` : ''}
      </div>`;

    case 'caixas':
      return `<div class="miolo"><div class="pilha">
        ${(s.itens || []).map(i => `<div class="caixa">${
          i.rotulo ? `<b>${esc(i.rotulo)}:</b> ` : ''}${rico(i.texto || '')}</div>`).join('')}
      </div></div>`;

    case 'texto':
      return `<div class="miolo">
        ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
        ${s.destaque ? `<div class="caixa curta">${rico(s.destaque)}</div>` : ''}
        ${s.corpo ? `<p class="corpo">${rico(s.corpo)}</p>` : ''}
        ${s.manuscrita ? `<div class="mao">${rico(s.manuscrita)}</div>` : ''}
      </div>`;

    case 'cheia':
      return `<div class="miolo">
        ${s.intro ? `<p class="corpo">${rico(s.intro)}</p>` : ''}
        ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
        ${s.manuscrita ? `<div class="mao">${rico(s.manuscrita)}</div>` : ''}
      </div>`;

    case 'fechamento':
      return `<div class="${assenta}">
        ${s.corpo ? `<p class="corpo">${rico(s.corpo)}</p>` : ''}
        ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
        ${s.cta ? `<div class="fita">${esc(s.cta)}</div>` : ''}
        ${s.manuscrita ? `<div class="mao">${rico(s.manuscrita)}</div>` : ''}
      </div>`;

    default:
      return `<div class="miolo"><p class="corpo">${rico(s.corpo || '')}</p></div>`;
  }
}

// ctx: { serie, handle, fotoUrl }
function slideHTML(s, ctx) {
  const deFoto = (s.tipo === 'capa' || s.tipo === 'fechamento');
  const comFoto = deFoto && ctx.fotoUrl;
  // Capa ou fechamento sem foto: cor chapada da paleta, com o texto que contrasta
  const classe = (s.tipo === 'cheia' || (deFoto && !comFoto)) ? 'cheio' : (comFoto ? 'escuro' : 'claro');
  return `<div class="slide ${classe}">
    ${comFoto ? `<div class="foto" style="background-image:url('${ctx.fotoUrl}')"></div><div class="veu"></div>` : ''}
    <div class="grao"></div>
    <div class="serie">${esc(ctx.serie || '')}</div>
    ${miolo(s, ctx.fotoUrl)}
    <div class="rodape">${esc(ctx.handle || '')}</div>
  </div>`;
}

function paginaHTML(slide, ctx) {
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)} .slide b{ color:var(--acento); } .slide.escuro b, .slide.foto b{ color:var(--ouro); }</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}


const INSTRUCOES = `# ESTRUTURA DO CARROSSEL (layout 1, persuasivo)

De 7 a 9 lâminas, nesta lógica narrativa:

1. capa: a tese que para o scroll
2 a 3: o problema real, o custo de continuar como está
4 a 6: a virada, o mecanismo, o como
7 a 8: a prova de lógica e a consequência
última: fechamento com convite

# TIPOS DE LÂMINA DISPONÍVEIS

- "capa": { tipo, titulo, manuscrita } → fundo com foto dela. Título até 60 caracteres. A manuscrita é uma frase curta, de voz humana.
- "caixas": { tipo, itens: [ { rotulo, texto } ] } → 3 ou 4 itens. Rótulo de uma palavra, texto de até 90 caracteres.
- "texto": { tipo, titulo, destaque, corpo, manuscrita } → o destaque é uma frase curta dentro da caixa petróleo. Corpo até 220 caracteres. Use **negrito** em no máximo 3 palavras.
- "cheia": { tipo, intro, titulo, manuscrita } → lâmina de virada, fundo petróleo chapado. No máximo uma por carrossel.
- "fechamento": { tipo, corpo, titulo, cta, manuscrita } → última lâmina, fundo com foto dela. O cta é uma fita curta em caixa alta, como "COMENTA ESTRUTURA".

Campos opcionais podem ser omitidos. Nem toda lâmina precisa de manuscrita.

Em TODA lâmina preencha "imagem_ideia": uma frase curta descrevendo a imagem que cabe ali. Nas lâminas sem foto, descreva a imagem que você usaria se fosse ilustrar aquele ponto.`;

module.exports = { NOME, DESCRICAO, TIPOS, INSTRUCOES, paginaHTML, slideHTML, css };
