// Capa do post 1 na composicao dos modelos publicados, com as letras do kit do Canva (15/11/2026).
// Compara os tamanhos do Canva com tamanhos propostos para leitura no feed.
// Corre com: NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-capa-fontes.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const NEG = 'C:/Users/fsimo/meu-negocio';
const uri = (p, t) => `data:image/${t};base64,` + fs.readFileSync(p).toString('base64');
const foto = uri(`${NEG}/identidade-visual/fotos/foto-08.jpeg`, 'jpeg');
const selo = uri(`${NEG}/metodo-2life/materiais-de-sessao/sessao-7-estacao-2/fonte/logo-escuro.png`, 'png');

// Tamanhos em px numa lamina de 1080 x 1350 (os do Canva estao nas mesmas unidades)
const VARIANTES = {
  'a-tamanhos-canva':   { titulo: 64, subtitulo: 42, cabecalho: 20, numero: 32, rodape: 12, selo: 140 },
  'b-tamanhos-propostos': { titulo: 96, subtitulo: 46, cabecalho: 24, numero: 36, rodape: 22, selo: 140 },
};

function html(v) {
  return `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Montserrat:wght@500;600&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1350px; overflow:hidden; background:#F5F1EA; }
.slide { position:relative; width:1080px; height:1350px; background:#F5F1EA; overflow:hidden; }
.foto { position:absolute; top:0; right:0; width:500px; height:1350px; background:url('${foto}') center 30%/cover;
  -webkit-mask-image:linear-gradient(90deg, transparent 0%, #000 28%); mask-image:linear-gradient(90deg, transparent 0%, #000 28%); }
.texto { position:absolute; left:84px; top:96px; bottom:84px; width:600px; display:flex; flex-direction:column; }
.cab { font:600 ${v.cabecalho}px 'Montserrat',sans-serif; letter-spacing:.14em; color:#6B1F32; }
.linha { margin-top:16px; width:330px; height:2px; background:#6B1F32; position:relative; }
.linha::after { content:''; position:absolute; right:-6px; top:-5px; width:12px; height:12px; border-radius:50%; background:#6B1F32; }
.num { margin-top:40px; font:500 ${v.numero}px 'EB Garamond',serif; color:#C9A86A; }
.miolo { flex:1; display:flex; flex-direction:column; justify-content:center; gap:34px; }
h1 { font:600 ${v.titulo}px/1.06 'EB Garamond',serif; color:#2E2B29; letter-spacing:-.01em; }
h1 span { display:block; color:#6B1F32; }
.traco { width:84px; height:3px; background:#C9A86A; }
.sub { font:400 ${v.subtitulo}px/1.3 'EB Garamond',serif; color:#2E2B29; max-width:520px; }
.base { display:flex; justify-content:space-between; align-items:flex-end; }
.selo { width:${v.selo}px; }
.desliza { font:600 ${v.rodape}px 'Montserrat',sans-serif; letter-spacing:.12em; color:#6B1F32; }
</style></head><body><div class="slide">
<div class="foto"></div>
<div class="texto">
  <div class="cab">FILOSOFIA 2LIFE</div><div class="linha"></div><div class="num">01</div>
  <div class="miolo">
    <h1>A confiança não se encontra.<span>Constrói-se.</span></h1>
    <div class="traco"></div>
    <div class="sub">Não precisas de te sentir confiante para começar.</div>
  </div>
  <div class="base"><img class="selo" src="${selo}" alt="Método 2Life"><div class="desliza">DESLIZA PARA CONTINUAR</div></div>
</div>
</div></body></html>`;
}

(async () => {
  const saida = path.join(__dirname, 'capa-fontes');
  fs.mkdirSync(saida, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  for (const [nome, v] of Object.entries(VARIANTES)) {
    await page.setContent(html(v), { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const fontes = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
    const titulo = await page.evaluate(() => { const r = document.querySelector('h1').getBoundingClientRect(); return Math.round(r.height); });
    await page.screenshot({ path: path.join(saida, nome + '.jpg'), type: 'jpeg', quality: 90 });
    console.log(nome, '| altura do título', titulo, 'px |', [...new Set(fontes)].join(', '));
  }
  await browser.close();
})().catch(e => { console.error('ERRO', e); process.exit(1); });
