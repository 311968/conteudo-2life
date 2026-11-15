// Pre-visualizacoes do layout "Modelo 2Life" para o mapa (15/11/2026).
// Corre com: NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-modelo.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const L = require('./layouts/modelo2life');

const NEG = 'C:/Users/fsimo/meu-negocio';
const uri = (p, t) => `data:image/${t};base64,` + fs.readFileSync(p).toString('base64');
const F = (n) => uri(`${NEG}/identidade-visual/fotos/${n}`, 'jpeg');
const SES = `${NEG}/metodo-2life/materiais-de-sessao/sessao-7-estacao-2/fonte`;
const base = {
  raizUrl: F('layout-feed-filosofia.jpeg'),
  seloUrl: uri(`${SES}/logo-escuro.png`, 'png'),
  logoUrl: uri(`${SES}/logo-escuro.png`, 'png'),
  logoClaroUrl: uri(`${SES}/logo-2life-claro.png`, 'png'),
  fundo: 'marfim', tamanhos: 'proposto',
};
// Textos dos carrosseis publicados (gralha "habituuou" corrigida) e da Semana Limites
const POST1 = { tipo: 'capa', foto: 'clara', titulo: 'A confiança não se encontra. **Constrói-se.**', sub: 'Não precisas de te sentir confiante para começar.' };
const FECHO = { tipo: 'fecho', titulo: 'O automático reage. **A essência escolhe.**' };

const lista = [
  ['01-capa-foto-tamanhos-canva', POST1, { fotoUrl: F('foto-08.jpeg'), tamanhos: 'canva' }],
  ['02-capa-foto-tamanhos-propostos', POST1, { fotoUrl: F('foto-08.jpeg') }],
  ['03-capa-foto-fundo-escuro', { tipo: 'capa', foto: 'escura', recorte: true, titulo: 'Compreendes o teu padrão. **Porque continuas a repeti-lo?**', sintese: 'CONSCIÊNCIA NÃO É TRANSFORMAÇÃO' }, { fotoUrl: F('foto-12.jpeg') }],
  ['04-capa-editorial', { tipo: 'capa', titulo: 'Não te falta **assertividade.**', sub: 'Falta-te sentir que podes desiludir alguém e continuar a ter lugar.' }, {}],
  ['05-interior', { tipo: 'interior', num: 4, centrado: true, titulo: '**Não construímos todos a confiança** da mesma forma.', corpo: 'O caminho depende daquilo que o teu **padrão automático** te habituou a evitar.' }, {}],
  ['06-fecho-500-marfim', FECHO, { logoLargura: 500 }],
  ['07-fecho-560-marfim', FECHO, { logoLargura: 560, assinaturaCurta: true }],
  ['08-fecho-500-bege', FECHO, { logoLargura: 500, fundo: 'bege' }],
  ['09-fecho-500-foto-escura', { ...FECHO, foto: 'escura' }, { logoLargura: 500, fotoUrl: F('foto-15.jpeg') }],
  ['10-guia-area-livre-500', FECHO, { logoLargura: 500, guia: true }],
];

(async () => {
  const saida = path.join(__dirname, 'modelo');
  fs.mkdirSync(saida, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  for (const [nome, s, ctx] of lista) {
    await page.setContent(L.paginaHTML(s, { ...base, ...ctx }), { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => {
      const sl = document.querySelector('.slide').getBoundingClientRect();
      const fora = [...document.querySelectorAll('h1, .livre, .assinatura, .base, .corpo, .sub')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.bottom > sl.bottom - 60 || r.right > sl.right; }).map(e => e.className || e.tagName);
      const fontes = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))];
      return { fora, fontes };
    });
    await page.screenshot({ path: path.join(saida, nome + '.jpg'), type: 'jpeg', quality: 88 });
    console.log(nome, '|', info.fontes.join(', '), '|', info.fora.length ? 'PERTO DO LIMITE: ' + info.fora.join(', ') : 'cabe');
  }
  await browser.close();
})().catch(e => { console.error('ERRO', e); process.exit(1); });
