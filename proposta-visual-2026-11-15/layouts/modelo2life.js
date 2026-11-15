// LAYOUT "MODELO 2LIFE" (proposta de 15/11/2026, ainda nao esta na app)
// Composicao dos carrosseis publicados da Simone (identidade-visual/modelos-posts/) com as regras do BRAND.md v1.2:
// - EB Garamond nos titulos e subtitulos, Montserrat no corpo, cabecalho e rodape, Allura na citacao (kit do Canva);
// - tamanhos para leitura no feed (titulo da capa 96 px, interior 80, subtitulo 46, corpo 32, cabecalho 24, rodape 22);
// - Marfim predominante, Bege alternativa; titulos em Carvao com a frase de viragem em Bordo;
// - raiz como unico grafismo, junto a margem; selo pequeno do logotipo; logotipo completo no fecho;
// - fotografias de fundo escuro com a versao clara do logotipo.
// Lamina 1080 x 1350.

const C = { marfim: '#F5F1EA', bege: '#D8C6B2', bordo: '#6B1F32', carvao: '#2E2B29', cinzento: '#7A746E', dourado: '#C9A86A' };
const TAM_PROPOSTO = { capa: 96, interior: 80, fecho: 80, sub: 46, corpo: 32, cab: 24, num: 36, rodape: 22 };
const TAM_CANVA = { capa: 64, interior: 64, fecho: 64, sub: 42, corpo: 28, cab: 20, num: 32, rodape: 12 };

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rico = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function css(t, fundo) {
  const bg = fundo === 'bege' ? C.bege : C.marfim;
  return `
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1350px; overflow:hidden; background:${bg}; }
.slide { position:relative; width:1080px; height:1350px; overflow:hidden; background:${bg}; color:${C.carvao}; font-family:'Montserrat',sans-serif; }
.raiz { position:absolute; right:0; top:150px; width:400px; height:1050px; pointer-events:none;
  background-repeat:no-repeat; background-size:1080px 1440px; background-position:-680px -180px;
  mix-blend-mode:multiply; filter:contrast(1.18) brightness(1.03) saturate(.55);
  -webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 18%,#000 78%,transparent 100%),linear-gradient(90deg,transparent 0%,#000 45%);
  -webkit-mask-composite:source-in;
  mask-image:linear-gradient(180deg,transparent 0%,#000 18%,#000 78%,transparent 100%),linear-gradient(90deg,transparent 0%,#000 45%);
  mask-composite:intersect; }
.foto-dir { position:absolute; top:0; right:0; width:440px; height:1350px; background-size:cover; background-position:center 30%;
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 28%); mask-image:linear-gradient(90deg,transparent 0%,#000 28%); }
.foto-dir.recorte { -webkit-mask-image:none; mask-image:none; }
.foto-cheia { position:absolute; inset:0; background-size:cover; background-position:center 25%; }
.veu { position:absolute; inset:0; background:linear-gradient(180deg,rgba(46,43,41,.55) 0%,rgba(46,43,41,.70) 45%,rgba(46,43,41,.92) 100%); }
.conteudo { position:absolute; left:84px; right:84px; top:96px; bottom:72px; display:flex; flex-direction:column; }
.conteudo.coluna { right:auto; width:540px; }
.cab { font-weight:600; font-size:${t.cab}px; letter-spacing:.14em; color:${C.bordo}; }
.linha { margin-top:16px; height:2px; background:${C.bordo}; position:relative; }
.linha::after { content:''; position:absolute; right:-6px; top:-5px; width:12px; height:12px; border-radius:50%; background:${C.bordo}; }
.linha.curta { width:330px; }
.num { margin-top:28px; font:500 ${t.num}px 'EB Garamond',serif; color:${C.dourado}; }
.num.dir { text-align:right; }
.miolo { flex:1; display:flex; flex-direction:column; justify-content:center; gap:34px; }
.miolo.centro { align-items:center; text-align:center; }
.miolo.fecho { gap:20px; }
h1 { font-family:'EB Garamond',serif; font-weight:600; line-height:1.06; letter-spacing:-.01em; color:${C.carvao}; text-wrap:balance; }
h1.capa { font-size:${t.capa}px; } h1.interior { font-size:${t.interior}px; } h1.fecho { font-size:${t.fecho}px; }
h1 b { color:${C.bordo}; font-weight:600; }
h1.todo-bordo { color:${C.bordo}; }
.traco { width:84px; height:3px; background:${C.dourado}; }
.sub { font:400 ${t.sub}px/1.3 'EB Garamond',serif; color:${C.carvao}; }
.corpo { font-size:${t.corpo}px; line-height:1.5; color:${C.carvao}; max-width:820px; }
.corpo b { font-weight:600; color:${C.bordo}; }
.sintese { font-weight:600; font-size:${t.rodape}px; letter-spacing:.12em; color:${C.cinzento}; }
.base { display:flex; justify-content:space-between; align-items:flex-end; font-weight:600; font-size:${t.rodape}px; letter-spacing:.12em; color:${C.cinzento}; }
.base .desliza { color:${C.bordo}; }
.selo { width:140px; display:block; }
.livre { display:block; box-sizing:content-box; margin-left:auto; margin-right:auto; position:relative; }
.livre img { width:100%; display:block; }
.livre.guia { outline:3px dashed ${C.dourado}; }
.livre.guia::after { content:attr(data-guia); position:absolute; left:10px; top:8px; font:600 18px 'Montserrat',sans-serif; color:${C.bordo}; }
.assinatura { display:flex; flex-direction:column; align-items:center; gap:10px; }
.assinatura .marca { font-weight:600; font-size:${t.cab}px; letter-spacing:.3em; color:${C.cinzento}; }
.assinatura .marca span { color:${C.bordo}; }
.assinatura .frase { font-weight:600; font-size:${t.rodape}px; letter-spacing:.14em; color:${C.cinzento}; }
.escuro .cab, .escuro .assinatura .marca, .escuro .assinatura .frase, .escuro .base { color:${C.marfim}; }
.escuro h1 { color:${C.marfim}; } .escuro h1 b, .escuro .assinatura .marca span { color:${C.dourado}; }
.escuro .linha, .escuro .linha::after { background:${C.dourado}; }
`;
}

function logoCompleto(ctx, url) {
  const W = ctx.logoLargura || 500;
  const livre = Math.round(W * 0.1945); // area livre proposta: altura do L de LIFE
  if (ctx.guia) return `<span class="livre guia" data-guia="área livre: ${livre} px = altura do L" style="width:${W}px; padding:${livre}px;"><img src="${url}" alt="Método 2Life"></span>`;
  return `<span class="livre" style="width:${W}px; margin-top:${livre}px; margin-bottom:${livre}px;"><img src="${url}" alt="Método 2Life"></span>`;
}

// s: { tipo:'capa'|'interior'|'fecho', titulo, sub, corpo, sintese, num, foto:'clara'|'escura', recorte, tituloBordo, centrado }
// ctx: { fundo, tamanhos:'proposto'|'canva', fotoUrl, raizUrl, seloUrl, logoUrl, logoClaroUrl, logoLargura, guia, assinaturaCurta }
function slideHTML(s, ctx) {
  const t = ctx.tamanhos === 'canva' ? TAM_CANVA : TAM_PROPOSTO;
  const h1 = s.titulo ? `<h1 class="${s.tipo}${s.tituloBordo ? ' todo-bordo' : ''}">${rico(s.titulo)}</h1>` : '';
  const traco = s.sub || s.corpo ? `<div class="traco"></div>` : '';
  const num = String(s.num || 1).padStart(2, '0');
  let html = '';
  if (s.tipo === 'capa') {
    const comFoto = !!(s.foto && ctx.fotoUrl);
    html = `${comFoto ? `<div class="foto-dir${s.recorte ? ' recorte' : ''}" style="background-image:url('${ctx.fotoUrl}')"></div>` : (ctx.raizUrl ? `<div class="raiz" style="background-image:url('${ctx.raizUrl}')"></div>` : '')}
    <div class="conteudo${comFoto ? ' coluna' : ''}">
      <div class="cab">FILOSOFIA 2LIFE</div><div class="linha curta"></div><div class="num">${num}</div>
      <div class="miolo">${h1}${traco}${s.sub ? `<div class="sub">${rico(s.sub)}</div>` : ''}${s.sintese ? `<div class="sintese">${esc(s.sintese)}</div>` : ''}</div>
      <div class="base"><img class="selo" src="${ctx.seloUrl}" alt="Método 2Life"><span class="desliza">DESLIZA PARA CONTINUAR</span></div>
    </div>`;
  } else if (s.tipo === 'interior') {
    html = `${ctx.raizUrl ? `<div class="raiz" style="background-image:url('${ctx.raizUrl}')"></div>` : ''}
    <div class="conteudo">
      <div class="cab">FILOSOFIA 2LIFE</div><div class="linha"></div><div class="num dir">${num}</div>
      <div class="miolo${s.centrado ? ' centro' : ''}">${h1}${traco}${s.corpo ? `<div class="corpo">${rico(s.corpo)}</div>` : ''}${s.sintese ? `<div class="sintese">${esc(s.sintese)}</div>` : ''}</div>
      <div class="base"><span>A CONFIANÇA CONSTRÓI-SE NA RAIZ.</span><span>${num}</span></div>
    </div>`;
  } else {
    const escura = s.foto === 'escura' && ctx.fotoUrl;
    const url = escura ? (ctx.logoClaroUrl || ctx.logoUrl) : ctx.logoUrl;
    html = `${escura ? `<div class="foto-cheia" style="background-image:url('${ctx.fotoUrl}')"></div><div class="veu"></div>` : (ctx.raizUrl ? `<div class="raiz" style="background-image:url('${ctx.raizUrl}')"></div>` : '')}
    <div class="conteudo">
      <div class="miolo centro fecho">${h1}${logoCompleto(ctx, url)}
        <div class="assinatura">${ctx.assinaturaCurta ? '' : '<div class="marca">FILOSOFIA | <span>2LIFE</span></div>'}<div class="frase">A CONFIANÇA CONSTRÓI-SE NA RAIZ.</div></div>
      </div>
    </div>`;
  }
  return `<div class="slide${s.tipo === 'fecho' && s.foto === 'escura' ? ' escuro' : ''}">${html}</div>`;
}

function paginaHTML(s, ctx) {
  const t = ctx.tamanhos === 'canva' ? TAM_CANVA : TAM_PROPOSTO;
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600&family=Allura&display=swap" rel="stylesheet">
<style>${css(t, ctx.fundo)}</style></head><body>${slideHTML(s, ctx)}</body></html>`;
}

module.exports = { NOME: 'Modelo 2Life', C, TAM_PROPOSTO, TAM_CANVA, css, slideHTML, paginaHTML };
