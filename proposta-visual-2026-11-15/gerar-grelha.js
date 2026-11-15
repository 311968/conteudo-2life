// Grelha de comparacao do logotipo (15/11/2026): capa 420 px, fecho 500 px e fecho 560 px,
// em Marfim, Bege, sobre fotografia (veu claro) e com a guia da area livre.
// Corre com: NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-grelha.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const L = require('./layouts/editorial');

const NEG = 'C:/Users/fsimo/meu-negocio';
const uri = (p, tipo) => `data:image/${tipo};base64,` + fs.readFileSync(p).toString('base64');
const raizUrl = uri(`${NEG}/identidade-visual/fotos/layout-feed-filosofia.jpeg`, 'jpeg');
const logoUrl = uri(`${NEG}/metodo-2life/materiais-de-sessao/sessao-7-estacao-2/fonte/logo-escuro.png`, 'png');
const fotoUrl = uri(`${NEG}/identidade-visual/fotos/foto-06.jpeg`, 'jpeg');
const base = { serie: 'Mensagem nuclear', handle: '@simoneferreirapsicologia', raizUrl, logoUrl, fontesCSS: 'fontes/fontes.css' };

// Mesmos textos em todas as linhas. Matriz §9, mensagens nucleares 7 e 1.
const CAPA = 'A dúvida não é uma ordem para **recuar**.';
const FECHO = 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.';
const FECHO_CURTO = 'Mas não pode **decidir** a tua vida.';

const colunas = [
  { id: 'capa-420', ctx: { logo: 'primeira', logoLargura: 420 }, s: { tipo: 'capa', titulo: CAPA } },
  { id: 'fecho-500', ctx: { logo: 'ultima', logoLargura: 500 }, s: { tipo: 'fecho', titulo: FECHO } },
  { id: 'fecho-560', ctx: { logo: 'ultima', logoLargura: 560, assinaturaCurta: true }, s: { tipo: 'fecho', titulo: FECHO_CURTO } },
];
const linhas = [
  { id: 'marfim', ctx: { fundo: 'marfim' }, s: {} },
  { id: 'bege', ctx: { fundo: 'bege' }, s: {} },
  { id: 'foto', ctx: { fundo: 'marfim', fotoUrl, veu: 'claro' }, s: { fotoCheia: true } },
  { id: 'guia', ctx: { fundo: 'marfim', guia: true }, s: {} },
];

(async () => {
  const saida = path.join(__dirname, 'grelha');
  fs.mkdirSync(saida, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--font-render-hinting=none'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
  const tmp = path.join(__dirname, '.grelha.html');
  for (const l of linhas) {
    for (const c of colunas) {
      fs.writeFileSync(tmp, L.paginaHTML({ ...c.s, ...l.s }, { ...base, ...l.ctx, ...c.ctx }));
      await page.goto('file:///' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // Verifica se algum elemento sai da lamina (corte)
      const corte = await page.evaluate(() => {
        const sl = document.querySelector('.slide').getBoundingClientRect();
        return [...document.querySelectorAll('.slide h1, .slide .livre, .slide .assinatura, .slide .rodape')]
          .filter(e => e.getBoundingClientRect().bottom > sl.bottom - 40).map(e => e.className || e.tagName);
      });
      const nome = `${l.id}-${c.id}`;
      await page.screenshot({ path: path.join(saida, nome + '.jpg'), type: 'jpeg', quality: 88 });
      console.log(nome, corte.length ? 'PERTO DO LIMITE: ' + corte.join(', ') : 'cabe');
    }
  }
  await browser.close();
  fs.unlinkSync(tmp);
})().catch(e => { console.error('ERRO', e); process.exit(1); });
