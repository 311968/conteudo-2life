// THUMB DO YOUTUBE — 1280x720. Outra linguagem: poucas palavras, enormes.
// Na grade do YouTube ela aparece do tamanho de um selo: se tem frase, ninguem le.
const paletas = require('./paletas');

const NOME = 'Capa do YouTube';
const LARGURA = 1280;
const ALTURA = 720;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function css(tom) {
  return `
  ${paletas.raiz(tom)}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:${LARGURA}px; height:${ALTURA}px; overflow:hidden; }
  .capa{
    position:relative; width:${LARGURA}px; height:${ALTURA}px; display:flex;
    font-family:'Inter',sans-serif; background:var(--bloco); color:var(--sobre-bloco);
  }
  /* com foto, o texto ocupa a esquerda e ela a direita */
  .texto{
    position:relative; z-index:3; flex:1 1 auto; display:flex; flex-direction:column;
    justify-content:center; gap:22px; padding:64px 56px;
  }
  .capa.com-foto .texto{ flex:0 0 58%; }
  .lado-foto{
    position:relative; flex:1 1 auto; background-size:cover; background-position:center 18%;
  }
  .lado-foto::after{
    content:''; position:absolute; inset:0 auto 0 0; width:120px;
    background:linear-gradient(90deg, var(--bloco) 0%, transparent 100%);
  }

  .chapeu{
    font-family:'Oswald',sans-serif; font-weight:600; font-size:24px; letter-spacing:.18em;
    text-transform:uppercase; opacity:.78;
  }
  h1{
    font-family:'Playfair Display',serif; font-weight:900; text-transform:uppercase;
    letter-spacing:-.018em; line-height:.98; font-size:94px;
  }
  h1.medio{ font-size:78px; }
  h1.pequeno{ font-size:64px; }
  .apoio{
    font-family:'Caveat',cursive; font-weight:700; font-size:44px; line-height:1.15;
    color:var(--acento);
  }
  .fita{
    align-self:flex-start; background:var(--acento); color:var(--bloco);
    font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase;
    letter-spacing:.08em; font-size:26px; padding:10px 24px; border-radius:6px;
  }
  `;
}

function tamanho(t) {
  const n = String(t || '').length;
  if (n > 46) return 'pequeno';
  if (n > 28) return 'medio';
  return '';
}

function slideHTML(s, ctx) {
  const url = ctx.fotoUrl || '';
  return `<div class="capa ${url ? 'com-foto' : ''}">
    <div class="texto">
      ${s.chapeu ? `<div class="chapeu">${esc(s.chapeu)}</div>` : ''}
      ${s.titulo ? `<h1 class="${tamanho(s.titulo)}">${esc(s.titulo)}</h1>` : ''}
      ${s.apoio ? `<div class="apoio">${esc(s.apoio)}</div>` : ''}
      ${s.selo ? `<div class="fita">${esc(s.selo)}</div>` : ''}
    </div>
    ${url ? `<div class="lado-foto" style="background-image:url('${url}')"></div>` : ''}
  </div>`;
}

function paginaHTML(slide, ctx) {
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)}</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

module.exports = { NOME, LARGURA, ALTURA, paginaHTML, slideHTML, css };
