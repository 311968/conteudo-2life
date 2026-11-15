// LAYOUT EDITORIAL 2LIFE (proposta de 15/11/2026, ainda nao esta na app)
// Decisoes visuais da Simone, registadas no BRAND.md a 15/11/2026:
// - fundo Marfim #F5F1EA (predominante) ou Bege Quente #D8C6B2 (alternativa);
// - titulos em Carvao #2E2B29 com a palavra ou frase a realcar em Bordo #6B1F32 (**assim**);
//   um titulo curto pode ficar todo em Bordo quando e a ideia central (slide.tituloBordo = true);
// - Cormorant Garamond nos titulos, Montserrat no texto de apoio, Allura na assinatura;
// - raiz subtil junto a margem;
// - fotografia: editorial sem foto, ou foto na primeira lamina; foto de fecho opcional, sempre na ultima;
// - logotipo oficial completo (2, LIFE, Permissao · Confianca · Expansao), na primeira ou na ultima lamina.
// Slide 1080x1350.

const BRAND = {
  marfim: '#F5F1EA', bege: '#D8C6B2', bordo: '#6B1F32', carvao: '#2E2B29', cinzento: '#7A746E', dourado: '#C9A86A',
};

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const rico = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function css(fundo) {
  const bg = fundo === 'bege' ? BRAND.bege : BRAND.marfim;
  return `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1350px; overflow:hidden; background:${bg}; }
  .slide { position:relative; width:1080px; height:1350px; overflow:hidden; background:${bg};
    display:flex; flex-direction:column; padding:84px 96px 72px; font-family:'Montserrat',sans-serif; color:${BRAND.cinzento}; }
  .raiz { position:absolute; right:0; top:120px; width:430px; height:1070px; z-index:1; pointer-events:none;
    background-repeat:no-repeat; background-size:1080px 1440px; background-position:-650px -180px;
    mix-blend-mode:multiply; opacity:1; filter:contrast(1.18) brightness(1.03) saturate(.55);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 78%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 40%);
    -webkit-mask-composite: source-in;
            mask-image: linear-gradient(180deg, transparent 0%, #000 18%, #000 78%, transparent 100%), linear-gradient(90deg, transparent 0%, #000 40%);
            mask-composite: intersect; }
  .foto { position:absolute; left:0; right:0; top:0; height:860px; z-index:0; background-size:cover; background-position:center 18%;
    mix-blend-mode:multiply;
    -webkit-mask-image: linear-gradient(180deg, #000 62%, transparent 100%);
            mask-image: linear-gradient(180deg, #000 62%, transparent 100%); }
  .topo, .miolo, .rodape { position:relative; z-index:2; }
  .serie { font-weight:600; font-size:22px; letter-spacing:.22em; text-transform:uppercase; color:${BRAND.cinzento}; }
  .miolo { flex:1 1 auto; display:flex; flex-direction:column; justify-content:center; gap:36px; max-width:820px; }
  .miolo.baixo { justify-content:flex-end; padding-bottom:24px; }
  .miolo.centro { align-items:center; text-align:center; max-width:none; justify-content:space-evenly; gap:28px; }
  .miolo.centro h1 { max-width:820px; }
  h1 { font-family:'Cormorant Garamond',serif; font-weight:600; font-size:84px; line-height:1.08; color:${BRAND.carvao};
    letter-spacing:-0.005em; text-wrap:balance; }
  h1.medio { font-size:72px; } h1.pequeno { font-size:62px; }
  h1 b { color:${BRAND.bordo}; font-weight:700; }
  h1.todo-bordo { color:${BRAND.bordo}; }
  p.apoio { font-size:34px; line-height:1.5; color:${BRAND.cinzento}; max-width:760px; }
  .assinatura { display:flex; flex-direction:column; align-items:center; gap:10px; }
  .assinatura .marca { font-weight:600; font-size:22px; letter-spacing:.32em; color:${BRAND.cinzento}; }
  .assinatura .marca span { color:${BRAND.bordo}; }
  .assinatura .frase { font-weight:500; font-size:20px; letter-spacing:.2em; text-transform:uppercase; color:${BRAND.cinzento}; }
  .logo { display:block; width:100%; }
  /* Area livre proposta: a altura do L de LIFE (19,45% da largura do logotipo) em toda a volta */
  .livre { position:relative; display:block; box-sizing:content-box; }
  .livre.fecho { margin:0 auto; }
  .livre.guia { outline:3px dashed ${BRAND.dourado}; }
  .livre.guia::after { content:attr(data-guia); position:absolute; left:10px; top:8px; text-align:left;
    font:600 18px 'Montserrat',sans-serif; letter-spacing:.06em; color:${BRAND.bordo}; }
  .livre.guia .logo { outline:2px solid rgba(107,31,50,.35); }
  /* Fecho sobre fotografia: veu escuro, texto claro, logotipo na versao clara */
  .slide.sobre-foto { color:${BRAND.marfim}; }
  .foto-cheia { position:absolute; inset:0; z-index:0; background-size:cover; background-position:center 30%; }
  .veu { position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg, rgba(46,43,41,.62) 0%, rgba(46,43,41,.78) 45%, rgba(46,43,41,.93) 100%); }
  /* Veu claro: a fotografia fica de fundo, esbatida em Marfim por baixo do texto e do logotipo oficial */
  .veu-claro { position:absolute; inset:0; z-index:1;
    background:linear-gradient(180deg, rgba(245,241,234,.10) 0%, rgba(245,241,234,.55) 38%, rgba(245,241,234,.90) 62%, rgba(245,241,234,.96) 100%); }
  .slide.sobre-foto h1 { color:${BRAND.marfim}; }
  .slide.sobre-foto h1 b { color:${BRAND.dourado}; }
  .slide.sobre-foto .assinatura .marca, .slide.sobre-foto .assinatura .frase { color:${BRAND.marfim}; }
  .slide.sobre-foto .assinatura .marca span { color:${BRAND.dourado}; }
  .rodape { display:flex; justify-content:space-between; align-items:flex-end; font-weight:500; font-size:22px; letter-spacing:.14em; color:${BRAND.cinzento}; }
  `;
}

function classeTitulo(t) {
  const n = String(t || '').replace(/\*\*/g, '').length;
  if (n > 95) return 'pequeno';
  if (n > 60) return 'medio';
  return '';
}

// slide: { tipo: 'capa'|'texto'|'fecho', titulo, apoio, tituloBordo, foto }
// ctx: { fundo: 'marfim'|'bege', serie, handle, fotoUrl, raizUrl, logoUrl, logo: 'primeira'|'ultima'|'nenhum', ultima: bool }
// Logotipo com a area livre proposta. ctx.logoLargura: largura em px numa lamina de 1080 px.
function logoHTML(ctx, posicao, url) {
  const W = ctx.logoLargura || (posicao === 'fecho' ? 500 : 420);
  const livre = Math.round(W * 0.1945); // altura do L de LIFE
  const guia = ctx.guia ? ` guia" data-guia="área livre: ${livre} px = altura do L" ` : '"';
  return `<span class="livre ${posicao}${guia} style="width:${W}px; padding:${ctx.guia ? livre : 0}px; margin:${ctx.guia ? 0 : livre}px ${posicao === 'fecho' ? 'auto' : '0'};"><img class="logo" src="${url}" alt="Método 2Life"></span>`;
}

function slideHTML(s, ctx) {
  // Fotografia a toda a lamina: no fecho com foto, ou numa capa marcada fotoCheia.
  // ctx.veu: 'escuro' (texto claro e logotipo claro) ou 'claro' (texto escuro e logotipo oficial escuro).
  const fechoFoto = !!ctx.fotoUrl && (s.fotoCheia || (s.tipo === 'fecho' && s.foto));
  const veuClaro = fechoFoto && ctx.veu === 'claro';
  const comFoto = !!(s.foto && ctx.fotoUrl) && !fechoFoto;
  const logoAqui = ctx.logoUrl && ((s.tipo === 'capa' && ctx.logo === 'primeira') || (s.tipo === 'fecho' && ctx.logo === 'ultima'));
  const urlLogo = fechoFoto && !veuClaro ? (ctx.logoClaroUrl || ctx.logoUrl) : ctx.logoUrl;
  const h1 = s.titulo ? `<h1 class="${classeTitulo(s.titulo)}${s.tituloBordo ? ' todo-bordo' : ''}">${rico(s.titulo)}</h1>` : '';
  let miolo;
  if (s.tipo === 'fecho') {
    miolo = `<div class="miolo centro">${h1}${s.apoio ? `<p class="apoio">${rico(s.apoio)}</p>` : ''}
      ${logoAqui ? logoHTML(ctx, 'fecho', urlLogo) : ''}
      <div class="assinatura">${ctx.assinaturaCurta ? '' : '<div class="marca">FILOSOFIA | <span>2LIFE</span></div>'}<div class="frase">A confiança constrói-se na raiz.</div></div></div>`;
  } else {
    miolo = `<div class="miolo${comFoto || fechoFoto ? ' baixo' : ''}">${logoAqui ? logoHTML(ctx, 'capa', urlLogo) : ''}${h1}${s.apoio ? `<p class="apoio">${rico(s.apoio)}</p>` : ''}</div>`;
  }
  return `<div class="slide${fechoFoto && !veuClaro ? ' sobre-foto' : ''}">
    ${fechoFoto ? `<div class="foto-cheia" style="background-image:url('${ctx.fotoUrl}')"></div><div class="${veuClaro ? 'veu-claro' : 'veu'}"></div>` : ''}
    ${comFoto ? `<div class="foto" style="background-image:url('${ctx.fotoUrl}')"></div>` : ''}
    ${!comFoto && !fechoFoto && ctx.raizUrl ? `<div class="raiz" style="background-image:url('${ctx.raizUrl}')"></div>` : ''}
    <div class="topo"><div class="serie">${comFoto || s.tipo === 'fecho' ? '' : esc(ctx.serie || '')}</div></div>
    ${miolo}
    <div class="rodape"><span>${s.tipo === 'fecho' ? '' : esc(ctx.handle || '')}</span><span>${s.tipo === 'fecho' ? '' : '→'}</span></div>
  </div>`;
}

function paginaHTML(slide, ctx) {
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${ctx.fontesCSS || 'fontes/fontes.css'}">
  <style>${css(ctx.fundo)}</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

module.exports = { NOME: 'Editorial 2Life', BRAND, css, slideHTML, paginaHTML };
