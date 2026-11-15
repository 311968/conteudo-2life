// LAYOUT "MODELO 2LIFE" (proposta de 15/11/2026, ainda nao esta em producao)
// Composicao dos carrosseis publicados da Simone, com as regras do BRAND.md v1.2:
// EB Garamond nos titulos (kit do Canva), Montserrat no corpo, cabecalho e rodape;
// tamanhos para o feed (capa 96, interior e fecho 80, subtitulo 46, corpo 32, cabecalho 24, rodape 22);
// Marfim privilegiado (Bege na paleta Areia ou Kraft); titulos em Carvao com a frase de viragem em Bordo (**assim**);
// corpo em Carvao; raiz como unico grafismo; logotipo completo a 500 px, com area livre igual a altura do L
// de LIFE, no fecho (por defeito) ou na capa editorial; selo pequeno na capa como opcao; fotos de fundo escuro
// com a versao clara do logotipo. Foto: capa editorial ou com foto; foto no fecho so quando a Simone escolhe.
// Segunda ronda (15/11/2026): escolha do logotipo na capa e no fecho; regra das legendas (Livro §16).
// Lamina 1080 x 1350. Tipos: capa | interior | fecho

const fs = require('fs');
const path = require('path');

const NOME = 'Modelo 2Life';
const DESCRICAO = 'O formato dos carrosséis da marca: capa com a tua foto à direita ou editorial, lâminas interiores com título, traço dourado e texto, fecho com o logótipo completo. De 7 a 9 lâminas.';
const TIPOS = ['capa', 'interior', 'fecho'];

const C = { marfim: '#F5F1EA', bege: '#D8C6B2', bordo: '#6B1F32', carvao: '#2E2B29', cinzento: '#7A746E', dourado: '#C9A86A' };
const T = { capa: 96, interior: 80, fecho: 80, sub: 46, corpo: 32, cab: 24, num: 36, rodape: 22, selo: 140, logo: 500 };

// Ficheiros da marca, lidos uma vez (layouts/marca/)
const uri = (nome, tipo) => {
  try { return `data:image/${tipo};base64,` + fs.readFileSync(path.join(__dirname, 'marca', nome)).toString('base64'); }
  catch (e) { return ''; }
};
const MARCA = { logoEscuro: uri('logo-escuro.png', 'png'), logoClaro: uri('logo-claro.png', 'png'), raiz: uri('raiz.jpeg', 'jpeg') };

// Le uma escolha do editor ("Completo", " sem ") e devolve uma das opcoes, ou a opcao por defeito
const escolha = (v, opcoes, defeito) => {
  const x = String(v == null ? '' : v).trim().toLowerCase();
  return opcoes.includes(x) ? x : defeito;
};

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rico = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

function css(tom) {
  const bg = (tom === 'areia' || tom === 'kraft') ? C.bege : C.marfim;
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
.cab { font-weight:600; font-size:${T.cab}px; letter-spacing:.14em; color:${C.bordo}; }
.linha { margin-top:16px; height:2px; background:${C.bordo}; position:relative; }
.linha::after { content:''; position:absolute; right:-6px; top:-5px; width:12px; height:12px; border-radius:50%; background:${C.bordo}; }
.linha.curta { width:330px; }
.num { margin-top:28px; font:500 ${T.num}px 'EB Garamond',serif; color:${C.dourado}; }
.num.dir { text-align:right; }
.miolo { flex:1; display:flex; flex-direction:column; justify-content:center; gap:34px; }
.miolo.centro { align-items:center; text-align:center; }
.miolo.fecho { gap:20px; }
h1 { font-family:'EB Garamond',serif; font-weight:600; line-height:1.06; letter-spacing:-.01em; color:${C.carvao}; text-wrap:balance; }
h1.capa { font-size:${T.capa}px; } h1.interior, h1.fecho { font-size:${T.interior}px; }
h1 b { color:${C.bordo}; font-weight:600; }
.traco { width:84px; height:3px; background:${C.dourado}; }
.sub { font:400 ${T.sub}px/1.3 'EB Garamond',serif; color:${C.carvao}; }
.corpo { font-size:${T.corpo}px; line-height:1.5; color:${C.carvao}; max-width:820px; }
.corpo b { font-weight:600; color:${C.bordo}; }
.sintese { font-weight:600; font-size:${T.rodape}px; letter-spacing:.12em; text-transform:uppercase; color:${C.cinzento}; }
.base { display:flex; justify-content:space-between; align-items:flex-end; font-weight:600; font-size:${T.rodape}px; letter-spacing:.12em; color:${C.cinzento}; }
.base .desliza { color:${C.bordo}; }
.base.fim { justify-content:flex-end; }
.miolo.capa-logo { gap:0; justify-content:center; }
h1.capa-logo { font-size:${T.interior}px; max-width:900px; }
.selo { width:${T.selo}px; display:block; }
.livre { display:block; width:${T.logo}px; margin:${Math.round(T.logo * 0.1945)}px auto; }
.livre img { width:100%; display:block; }
.assinatura { display:flex; flex-direction:column; align-items:center; gap:10px; }
.assinatura .marca { font-weight:600; font-size:${T.cab}px; letter-spacing:.3em; color:${C.cinzento}; }
.assinatura .marca span { color:${C.bordo}; }
.assinatura .frase { font-weight:600; font-size:${T.rodape}px; letter-spacing:.14em; color:${C.cinzento}; }
.escuro h1, .escuro .assinatura .marca, .escuro .assinatura .frase { color:${C.marfim}; }
.escuro h1 b, .escuro .assinatura .marca span { color:${C.dourado}; }
`;
}

// ctx (do render): { serie, handle, tom, fotoUrl, fontesCSS, numero, total }
function slideHTML(s, ctx) {
  const n = String(ctx.numero || 1).padStart(2, '0');
  const h1 = s.titulo ? `<h1 class="${s.tipo === 'capa' ? 'capa' : s.tipo === 'fecho' ? 'fecho' : 'interior'}">${rico(s.titulo)}</h1>` : '';
  const sintese = s.sintese ? `<div class="sintese">${esc(s.sintese)}</div>` : '';
  if (s.tipo === 'capa') {
    const foto = ctx.fotoUrl;
    // Logotipo na capa (escolha da Simone): selo (por defeito), completo ou sem.
    // O completo, a 500 px com area livre, ocupa 871 px de altura: so cabe na capa editorial, sem foto.
    const logo = escolha(s.logotipo, ['selo', 'completo', 'sem'], 'selo');
    if (logo === 'completo' && !foto) {
      return `<div class="slide"><div class="raiz" style="background-image:url('${MARCA.raiz}')"></div>
      <div class="conteudo"><div class="miolo centro capa-logo">${s.titulo ? `<h1 class="capa-logo">${rico(s.titulo)}</h1>` : ''}
        <span class="livre"><img src="${MARCA.logoEscuro}" alt="Método 2Life"></span></div>
        <div class="base fim"><span class="desliza">DESLIZA PARA CONTINUAR</span></div>
      </div></div>`;
    }
    return `<div class="slide">
      ${foto ? `<div class="foto-dir${s.recorte ? ' recorte' : ''}" style="background-image:url('${foto}')"></div>` : `<div class="raiz" style="background-image:url('${MARCA.raiz}')"></div>`}
      <div class="conteudo${foto ? ' coluna' : ''}">
        <div class="cab">FILOSOFIA 2LIFE</div><div class="linha curta"></div><div class="num">${n}</div>
        <div class="miolo">${h1}${s.subtitulo ? `<div class="traco"></div><div class="sub">${rico(s.subtitulo)}</div>` : ''}${sintese}</div>
        <div class="base${logo === 'sem' ? ' fim' : ''}">${logo === 'sem' ? '' : `<img class="selo" src="${MARCA.logoEscuro}" alt="Método 2Life">`}<span class="desliza">DESLIZA PARA CONTINUAR</span></div>
      </div></div>`;
  }
  if (s.tipo === 'fecho') {
    // Foto no fecho so quando ela pede (foto_fecho) e a imagem tem zona calma: BRAND.md v1.2
    const pediu = s.foto_fecho === true || String(s.foto_fecho || '').trim().toLowerCase() === 'sim';
    const escura = !!(pediu && ctx.fotoUrl);
    // Logotipo no fecho (escolha da Simone): completo (por defeito) ou sem, quando o completo ja esta na capa.
    const logo = escolha(s.logotipo, ['completo', 'sem'], 'completo');
    return `<div class="slide${escura ? ' escuro' : ''}">
      ${escura ? `<div class="foto-cheia" style="background-image:url('${ctx.fotoUrl}')"></div><div class="veu"></div>` : `<div class="raiz" style="background-image:url('${MARCA.raiz}')"></div>`}
      <div class="conteudo"><div class="miolo centro fecho">${h1}
        ${logo === 'completo' ? `<span class="livre"><img src="${escura ? MARCA.logoClaro : MARCA.logoEscuro}" alt="Método 2Life"></span>` : '<div class="traco"></div>'}
        <div class="assinatura"><div class="marca">FILOSOFIA | <span>2LIFE</span></div><div class="frase">A CONFIANÇA CONSTRÓI-SE NA RAIZ.</div></div>
      </div></div></div>`;
  }
  // interior
  return `<div class="slide"><div class="raiz" style="background-image:url('${MARCA.raiz}')"></div>
    <div class="conteudo">
      <div class="cab">FILOSOFIA 2LIFE</div><div class="linha"></div><div class="num dir">${n}</div>
      <div class="miolo${s.alinhar === 'esquerda' ? '' : ' centro'}">${h1}${s.corpo ? `<div class="traco"></div><div class="corpo">${rico(s.corpo)}</div>` : ''}${sintese}</div>
      <div class="base"><span>A CONFIANÇA CONSTRÓI-SE NA RAIZ.</span><span>${n}</span></div>
    </div></div>`;
}

function paginaHTML(slide, ctx) {
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)}</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

const INSTRUCOES = `# ESTRUTURA DO CARROSSEL (layout Modelo 2Life)

De 7 a 9 lâminas, pela estrutura narrativa da marca: cena concreta, tensão interna, automatismo, significado, nova possibilidade, movimento. Primeiro a pessoa vê-se; depois compreende.

1. capa: a frase que para o scroll, sobre uma situação reconhecível ou com a viragem
2 até à penúltima: lâminas interiores, uma ideia por lâmina
última: fecho com a frase-síntese e o logótipo

# TIPOS DE LÂMINA DISPONÍVEIS

- "capa": { tipo, titulo, subtitulo, sintese } → título até 50 caracteres, em frases curtas; a frase de viragem vai entre **asteriscos duplos** e sai em Bordô (ex.: "A confiança não se encontra. **Constrói-se.**"). Subtítulo opcional até 70 caracteres. Síntese opcional, em versaletes, até 40 caracteres.
- "interior": { tipo, titulo, corpo, sintese, alinhar } → título até 70 caracteres, com a parte a realçar entre **asteriscos duplos**; corpo até 200 caracteres, com no máximo 3 palavras-chave entre **asteriscos duplos**; "alinhar" é "centro" (por defeito) ou "esquerda". Síntese opcional em versaletes, até 45 caracteres.
- "fecho": { tipo, titulo } → última lâmina. Título até 45 caracteres (duas linhas), com a frase de viragem entre **asteriscos duplos**. O logótipo e a assinatura entram sozinhos; não os escrevas.

Uma ideia por lâmina. Nada de CTA dentro das lâminas: o CTA vai na legenda (Livro de Receitas §15 e §16).
Não preenchas "logotipo" nem "foto_fecho": são escolhas da Simone no editor.

# LEGENDA (Livro de Receitas §16)
A legenda aprofunda a ideia do carrossel. Em nenhum parágrafo repete o texto das lâminas.
1. Primeira linha: funciona sozinha no feed (cerca de 125 caracteres) e abre com uma situação reconhecível ou com a frase de viragem dita por outras palavras. Nunca com o título da capa.
2. Desenvolvimento: parágrafos de uma a três linhas, pela ordem cena, automatismo, significado e nova possibilidade. O padrão aparece como proteção, sem culpabilizar.
3. Pergunta ou microação: uma só, nas peças técnicas. Não se força nas peças de reconhecimento ou emocionais.
4. Última linha: um só CTA, proporcional ao movimento criado.
Extensão: 8 a 14 linhas. Sem hashtags. Sem "algo", "talvez" ou "às vezes". Não escrevas "A confiança constrói-se na raiz.": já está no fecho.
A primeira linha da legenda acrescenta uma ideia que as lâminas não dizem: não repete nem parafraseia a situação de nenhuma lâmina.

# UM SÓ CTA EDITORIAL
O carrossel tem um único CTA: a última linha da legenda. Se uma lâmina propuser uma observação ou microação, a última linha da legenda pede esse mesmo movimento, e não outro. Nenhuma lâmina pede para guardar, partilhar, comentar ou seguir.
"primeiro_comentario": uma pergunta ou uma frase para a conversa, nunca outro CTA (nada de "guarda", "partilha", "envia", "marca", "segue" ou "comenta").

Em TODA lâmina preencha "imagem_ideia": uma frase curta descrevendo a imagem que cabe ali.`;

module.exports = { NOME, DESCRICAO, TIPOS, INSTRUCOES, paginaHTML, slideHTML, css };
