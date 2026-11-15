// LAYOUT 2 — "Reportagem" (referencia: carrossel modelo 2)
// Estrutura jornalistica com bandas de imagem. Identidade Alianca Clara.
// Slide 1080x1350. Tipos: capa | imagem_topo | imagem_base | meia | lista | fechamento

const NOME = 'Reportagem';
const DESCRICAO = 'Jornalístico. Conta um fato, detalha o que foi feito, mostra onde isso pega no negócio de quem lê, tira as lições e aponta o primeiro movimento. De 7 a 9 lâminas.';

const TIPOS = ['capa', 'imagem_topo', 'imagem_base', 'meia', 'lista', 'fechamento'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rico(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}
// Paragrafos separados por linha em branco
function paragrafos(s) {
  return String(s || '').split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${rico(p.trim())}</p>`).join('');
}

const paletas = require('./paletas');

function css(tom) {
  return `
  ${paletas.raiz(tom)}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1350px; overflow:hidden; }
  .slide{ position:relative; width:1080px; height:1350px; display:flex; flex-direction:column;
    font-family:'Inter',sans-serif; background:var(--papel); color:var(--tinta); }

  .banda{ flex:0 0 auto; background-size:cover; background-position:center 28%; background-color:var(--fundo2); }
  .banda.topo{ height:512px; }
  .banda.base{ height:430px; }

  .conteudo{ flex:1 1 auto; display:flex; flex-direction:column; justify-content:center;
    padding:58px 72px; min-height:0; }
  .conteudo.alto{ justify-content:flex-start; padding-top:72px; }

  h1{ font-family:'Playfair Display',serif; font-weight:900; letter-spacing:-0.015em;
    line-height:1.04; font-size:80px; color:var(--titulo); margin-bottom:36px; }
  h1.medio{ font-size:64px; }
  h1.pequeno{ font-size:54px; }

  .texto p{ font-size:47px; line-height:1.37; margin-bottom:28px; color:var(--tinta); }
  .texto p:last-child{ margin-bottom:0; }
  .texto b{ font-weight:700; color:var(--titulo); }
  .texto.menor p{ font-size:44px; }

  /* meia coluna */
  .slide.meia{ flex-direction:row; }
  .meia-foto{ flex:0 0 470px; background-size:cover; background-position:center; background-color:var(--fundo2); }
  .meia-texto{ flex:1 1 auto; display:flex; flex-direction:column; justify-content:center;
    padding:64px 58px; min-width:0; }
  .meia-texto h1{ font-size:64px; }
  .meia-texto .texto p{ font-size:42px; margin-bottom:24px; }

  /* lista com marcador */
  .cartoes{ display:flex; flex-direction:column; gap:22px; }
  .cartao{ display:flex; gap:26px; align-items:flex-start; background:var(--cartao);
    border:1px solid var(--borda); border-radius:20px; padding:30px 34px;
    box-shadow:0 10px 26px rgba(18,32,39,.06); }
  .marca-check{ flex:0 0 auto; width:52px; height:52px; border-radius:50%; background:var(--bloco);
    display:flex; align-items:center; justify-content:center; }
  .marca-check svg{ width:27px; height:27px; }
  .cartao .linha{ font-size:45px; line-height:1.34; color:var(--tinta); }
  .cartao .linha b{ font-weight:700; color:var(--titulo); }

  /* capa e fechamento: a foto manda, texto sempre claro */
  .slide.escuro{ background:#122027; color:#FBF8F2; }
  /* capa ou fechamento sem foto: cor chapada da paleta */
  .slide.cor{ background:var(--bloco); color:var(--sobre-bloco); }
  .slide.cor .capa-miolo h1, .slide.cor .cta-grande .frase{ color:var(--sobre-bloco); }
  .slide.cor .capa-sub, .slide.cor .cta-grande .antes, .slide.cor .caixa-borda{ color:var(--sobre-bloco); }
  .slide.cor .capa-sub b, .slide.cor .caixa-borda b{ color:var(--sobre-bloco); }
  .slide.cor .caixa-borda{ border-color:var(--sobre-bloco); background:transparent; }
  .slide.cor .rodape{ color:var(--sobre-bloco); opacity:.75; }
  .fundo{ position:absolute; inset:0; background-size:cover; background-position:center 25%; }
  .veu{ position:absolute; inset:0;
    background:linear-gradient(180deg, rgba(18,32,39,.42) 0%, rgba(18,32,39,.30) 40%, rgba(18,32,39,.93) 100%); }
  .capa-miolo{ position:relative; z-index:3; flex:1 1 auto; display:flex; flex-direction:column;
    justify-content:flex-end; padding:64px 72px 0; }
  .capa-miolo h1{ color:#FBF8F2; text-transform:uppercase; font-size:82px; margin-bottom:26px; }
  .capa-miolo h1.medio{ font-size:68px; }
  .capa-miolo h1.pequeno{ font-size:58px; }
  .capa-sub{ font-size:43px; line-height:1.34; color:#EFEDE7; }
  .capa-sub b{ font-weight:700; color:var(--acento); }

  .caixa-borda{ position:relative; z-index:3; margin:0 72px 34px; border:2px solid var(--acento);
    border-radius:20px; padding:32px 36px; background:rgba(18,32,39,.45);
    font-size:39px; line-height:1.36; color:#FBF8F2; text-align:center; }
  .caixa-borda b{ font-weight:700; color:var(--acento); }
  .cta-grande{ position:relative; z-index:3; text-align:center; padding:0 60px 20px; }
  .cta-grande .antes{ font-size:37px; color:#EFEDE7; margin-bottom:12px; }
  .cta-grande .frase{ font-family:'Playfair Display',serif; font-weight:900; text-transform:uppercase;
    font-size:74px; line-height:1.02; color:#FBF8F2; letter-spacing:-0.015em; }

  /* rodape */
  .rodape{ flex:0 0 auto; display:flex; align-items:center; justify-content:space-between;
    padding:0 72px 44px; font-family:'Oswald',sans-serif; font-weight:500; letter-spacing:.14em;
    text-transform:uppercase; font-size:24px; color:var(--secundaria); }
  .slide.escuro .rodape{ color:var(--acento); position:relative; z-index:3; }
  .rodape .seta{ font-size:30px; letter-spacing:0; }
  .slide.meia .rodape{ position:absolute; left:470px; right:0; bottom:0; padding:0 58px 40px; }
  `;
}

function classeTitulo(t, curto, medio) {
  const n = String(t || '').length;
  if (n > (medio || 46)) return 'pequeno';
  if (n > (curto || 26)) return 'medio';
  return '';
}

function rodape(ctx, escuro) {
  return `<div class="rodape"><span>${esc(ctx.handle || '')}</span><span class="seta">${escuro ? '' : '→'}</span></div>`;
}

function slideHTML(s, ctx) {
  const foto = s.foto ? ctx.fotoUrl : ctx.fotoUrl;
  const url = ctx.fotoUrl || '';

  switch (s.tipo) {
    case 'capa':
      return `<div class="slide ${url ? 'escuro' : 'cor'}">
        ${url ? `<div class="fundo" style="background-image:url('${url}')"></div><div class="veu"></div>` : ''}
        <div class="capa-miolo">
          <h1 class="${classeTitulo(s.titulo, 30, 56)}">${rico(s.titulo || '')}</h1>
          ${s.subtitulo ? `<div class="capa-sub">${rico(s.subtitulo)}</div>` : ''}
        </div>
        <div style="flex:0 0 46px"></div>
        ${rodape(ctx, true)}
      </div>`;

    case 'imagem_topo':
      return `<div class="slide">
        ${url ? `<div class="banda topo" style="background-image:url('${url}')"></div>` : ''}
        <div class="conteudo">
          ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
          <div class="texto menor">${paragrafos(s.corpo)}</div>
        </div>
        ${rodape(ctx)}
      </div>`;

    case 'imagem_base':
      return `<div class="slide">
        <div class="conteudo alto">
          ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
          <div class="texto menor">${paragrafos(s.corpo)}</div>
        </div>
        ${url ? `<div class="banda base" style="background-image:url('${url}')"></div>` : ''}
      </div>`;

    case 'meia':
      return `<div class="slide meia">
        ${url ? `<div class="meia-foto" style="background-image:url('${url}')"></div>` : ''}
        <div class="meia-texto">
          ${s.titulo ? `<h1>${rico(s.titulo)}</h1>` : ''}
          <div class="texto">${paragrafos(s.corpo)}</div>
        </div>
        ${rodape(ctx)}
      </div>`;

    case 'lista':
      return `<div class="slide">
        <div class="conteudo">
          ${s.titulo ? `<h1 class="${classeTitulo(s.titulo)}">${rico(s.titulo)}</h1>` : ''}
          <div class="cartoes">
            ${(s.itens || []).map(i => `
              <div class="cartao">
                <div class="marca-check"><svg viewBox="0 0 24 24" fill="none" stroke="#FBF8F2"
                  stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg></div>
                <div class="linha">${rico(i.texto || '')}</div>
              </div>`).join('')}
          </div>
        </div>
        ${rodape(ctx)}
      </div>`;

    case 'fechamento':
      return `<div class="slide ${url ? 'escuro' : 'cor'}">
        ${url ? `<div class="fundo" style="background-image:url('${url}')"></div><div class="veu"></div>` : ''}
        <div style="flex:1 1 auto"></div>
        ${s.caixa ? `<div class="caixa-borda">${rico(s.caixa)}</div>` : ''}
        <div class="cta-grande">
          ${s.corpo ? `<div class="antes">${rico(s.corpo)}</div>` : ''}
          ${s.cta ? `<div class="frase">${esc(s.cta)}</div>` : ''}
        </div>
        <div style="flex:0 0 40px"></div>
        ${rodape(ctx, true)}
      </div>`;

    default:
      return `<div class="slide"><div class="conteudo"><div class="texto">${paragrafos(s.corpo)}</div></div>${rodape(ctx)}</div>`;
  }
}

function paginaHTML(slide, ctx) {
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)}</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

const INSTRUCOES = `# ESTRUTURA DO CARROSSEL (layout 2, reportagem)

De 7 a 9 lâminas. A lógica aqui não é persuasiva, é jornalística. Você está contando um fato e mostrando o que ele significa para o negócio de quem lê:

1. capa: a manchete, o fato que muda alguma coisa
2. o anúncio ou o acontecimento, com número e data quando existirem
3 a 4: o que foi feito, em detalhe concreto
5: onde isso pega na empresa de quem está lendo
6: as lições, o que dá para tirar dali
7: o que fazer, o primeiro movimento prático
última: fechamento com convite

Número, data e fonte só entram se vierem no material marcado no banco. Nunca invente dado, nome de empresa ou estatística. Se o material não tiver número, conte sem número.

# TIPOS DE LÂMINA DISPONÍVEIS

- "capa": { tipo, titulo, subtitulo } → fundo com foto. Título em até 70 caracteres, vira caixa alta. Subtítulo de uma linha, pode ter **negrito**.
- "imagem_topo": { tipo, titulo, corpo } → faixa de imagem em cima, título e texto embaixo. Corpo de 2 a 3 parágrafos curtos separados por linha em branco, de 200 a 420 caracteres no total.
- "imagem_base": { tipo, titulo, corpo } → o inverso, texto em cima e imagem embaixo.
- "meia": { tipo, titulo, corpo } → imagem ocupando a coluna da esquerda, texto na direita. Corpo mais curto, até 320 caracteres.
- "lista": { tipo, titulo, itens: [ { texto } ] } → 3 ou 4 cartões com marcador. Cada texto até 110 caracteres.
- "fechamento": { tipo, caixa, corpo, cta } → fundo com foto. "caixa" é a frase dentro da moldura. "corpo" é a linha curta antes do CTA. "cta" é a chamada grande, em caixa alta, como "COMENTA ESTRUTURA" ou "LINK NA BIO".

Use **negrito** de verdade, do jeito que este layout pede: destaque os números, os nomes próprios e as expressões que carregam a ideia. De 3 a 6 marcações por lâmina de texto.

Alterne os tipos, não use o mesmo duas vezes seguidas.

Escreva os títulos em caixa mista, como manchete de jornal ("O que está acontecendo"), NUNCA em caixa alta. O próprio layout aplica a caixa alta onde precisa.

Em toda lâmina preencha "imagem_ideia": uma frase curta descrevendo a imagem que cabe ali.`;

module.exports = { NOME, DESCRICAO, TIPOS, INSTRUCOES, paginaHTML, slideHTML, css };
