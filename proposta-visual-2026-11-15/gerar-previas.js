// Gera as pre-visualizacoes das decisoes visuais (15/11/2026). Corre com:
// NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-previas.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const L = require('./layouts/editorial');

const NEG = 'C:/Users/fsimo/meu-negocio';
const uri = (p, tipo) => `data:image/${tipo};base64,` + fs.readFileSync(p).toString('base64');
const fotoUrl = uri(`${NEG}/identidade-visual/fotos/foto-03.jpeg`, 'jpeg');
const raizUrl = uri(`${NEG}/identidade-visual/fotos/layout-feed-filosofia.jpeg`, 'jpeg');
// Mesma arte do logo-2life-transparente.png oficial, recortada sem margens (transparente, texto escuro)
const logoUrl = uri(`${NEG}/metodo-2life/materiais-de-sessao/sessao-7-estacao-2/fonte/logo-escuro.png`, 'png');
const foto2Url = uri(`${NEG}/identidade-visual/fotos/foto-05.jpeg`, 'jpeg');
const logoClaroUrl = uri(`${NEG}/metodo-2life/materiais-de-sessao/sessao-7-estacao-2/fonte/logo-2life-claro.png`, 'png');
const base = { serie: 'Semana Limites', handle: '@simoneferreirapsicologia', raizUrl, logoUrl, fontesCSS: 'fontes/fontes.css' };

// Textos da Semana Limites (carrossel aprovado a 10/11/2026) e mensagem nuclear 7 da Matriz §9
const previas = [
  { nome: '1-capa-com-fotografia', ctx: { ...base, fundo: 'marfim', fotoUrl, logo: 'ultima' },
    s: { tipo: 'capa', foto: true, titulo: 'Não te falta **assertividade**. Falta-te sentir que podes desiludir alguém e continuar a ter **lugar**.' } },
  { nome: '2-capa-editorial', ctx: { ...base, fundo: 'marfim', logo: 'ultima' },
    s: { tipo: 'capa', titulo: 'Não te falta **assertividade**. Falta-te sentir que podes desiludir alguém e continuar a ter **lugar**.' } },
  { nome: '3-fecho-com-logotipo', ctx: { ...base, fundo: 'marfim', logo: 'ultima' },
    s: { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' } },
  { nome: '4-capa-editorial-bege-titulo-bordo', ctx: { ...base, fundo: 'bege', serie: 'Mensagem nuclear', logo: 'ultima' },
    s: { tipo: 'capa', tituloBordo: true, titulo: 'A dúvida não é uma ordem para recuar.' } },
  { nome: '5-capa-com-logotipo-na-primeira', ctx: { ...base, fundo: 'marfim', logo: 'primeira' },
    s: { tipo: 'capa', titulo: 'Não te falta **assertividade**. Falta-te sentir que podes desiludir alguém e continuar a ter **lugar**.' } },
  // Propostas de margem (area livre) e de fundo, 15/11/2026
  { nome: '6-guia-fecho-500-area-livre', ctx: { ...base, fundo: 'marfim', logo: 'ultima', guia: true, logoLargura: 500 },
    s: { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' } },
  { nome: '7-guia-capa-420-area-livre', ctx: { ...base, fundo: 'marfim', logo: 'primeira', guia: true, logoLargura: 420 },
    s: { tipo: 'capa', titulo: 'A dúvida não é uma ordem para **recuar**.' } },
  { nome: '8-fundo-bege-fecho-500', ctx: { ...base, fundo: 'bege', logo: 'ultima', logoLargura: 500 },
    s: { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' } },
  { nome: '9-fundo-fotografia-fecho-logo-claro', ctx: { ...base, fundo: 'marfim', logo: 'ultima', logoLargura: 500, fotoUrl: foto2Url, logoClaroUrl },
    s: { tipo: 'fecho', foto: true, titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' } },
  { nome: '10-alternativa-fecho-560', ctx: { ...base, fundo: 'marfim', logo: 'ultima', logoLargura: 560 },
    s: { tipo: 'fecho', titulo: 'Mas não pode **decidir** a tua vida.' } },
];

(async () => {
  const saida = path.join(__dirname, 'previas');
  fs.mkdirSync(saida, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  const tmp = path.join(__dirname, '.previa.html');
  for (const p of previas) {
    fs.writeFileSync(tmp, L.paginaHTML(p.s, p.ctx));
    await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const fontes = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
    await page.screenshot({ path: path.join(saida, p.nome + '.jpg'), type: 'jpeg', quality: 90 });
    console.log(p.nome, '| fontes carregadas:', [...new Set(fontes)].join(', '));
  }
  await browser.close();
  fs.unlinkSync(tmp);
})().catch(e => { console.error('ERRO', e); process.exit(1); });
