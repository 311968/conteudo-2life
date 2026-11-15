// Renderiza cada slide em PNG 1080x1350 usando o Chrome ja instalado na maquina.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const layouts = require('./layouts');

const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// slides: array | ctx: { serie, handle, fotoArquivo } | destino: pasta
async function renderizar(slides, ctx, destino, layoutId = 'layout1') {
  const layout = layouts[layoutId];
  if (!layout || !layout.disponivel) throw new Error(`Layout ${layoutId} indisponivel.`);

  fs.mkdirSync(destino, { recursive: true });

  // A foto entra como data URI para o Chrome nao depender de servidor.
  const fotoUrl = ctx.fotoArquivo ? await comoDataUri(ctx.fotoArquivo) : '';

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  const tmp = path.join(__dirname, `.slide-${Date.now()}.html`);
  const arquivos = [];
  try {
    const page = await browser.newPage();
    const L = (layout.LARGURA || 1080), A = (layout.ALTURA || 1350);
    await page.setViewport({ width: L, height: A, deviceScaleFactor: 1 });

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      // A imagem da lamina vence a foto padrao do carrossel
      const ref = s.imagem || s.foto;
      // "nenhuma" e escolha dela: a lamina sai so com a cor da paleta
      const fotoDoSlide = ref === 'nenhuma' ? '' : (ref ? await comoDataUri(ref) : fotoUrl);
      const html = layout.paginaHTML(s, {
        ...ctx, fotoUrl: fotoDoSlide, fontesCSS: 'fontes/fontes.css', numero: i + 1, total: slides.length,
      });
      // Escreve na raiz do app para o caminho relativo das fontes resolver via file://
      fs.writeFileSync(tmp, html);
      await page.goto('file://' + tmp, { waitUntil: 'load', timeout: 60000 });
      try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
      // So JPEG: e o que o Instagram aceita, e a arte com foto fica ate dez vezes mais leve
      const nome = ctx.nomeArquivo || `slide-${String(i + 1).padStart(2, '0')}.jpg`;
      await page.screenshot({ path: path.join(destino, nome), type: 'jpeg', quality: 94 });
      arquivos.push(nome);
    }
  } finally {
    await browser.close();
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return arquivos;
}

// Aceita 'foto-01.png' (banco de fotos) ou 'geradas/img-x.png' (imagem gerada)
function caminhoDaImagem(ref) {
  if (!ref || ref === 'nenhuma') return '';
  const pasta = String(ref).startsWith('geradas/') ? 'geradas' : 'fotos';
  return path.join(__dirname, pasta, path.basename(String(ref)));
}

async function comoDataUri(arquivo) {
  const caminho = caminhoDaImagem(arquivo);
  if (!caminho || !fs.existsSync(caminho)) return '';
  const ext = path.extname(caminho).toLowerCase() === '.png' ? 'png' : 'jpeg';
  return `data:image/${ext};base64,` + fs.readFileSync(caminho).toString('base64');
}

module.exports = { renderizar };
