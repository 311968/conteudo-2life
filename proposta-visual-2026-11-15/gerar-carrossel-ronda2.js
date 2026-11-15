// Gera o carrossel escrito pela IA real no teste da segunda ronda (15/11/2026) com o motor de imagens da app
// e o layout Modelo 2Life. Textos exatamente como vieram (proposta-revisao-2026-11-15/teste-real/resultado.json).
// Corre com: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-carrossel-ronda2.js
const path = require('path');
const { renderizar } = require('./teste-app/render.js');
const r = require('../proposta-revisao-2026-11-15/teste-real/resultado.json');

(async () => {
  const slides = r.carrossel.carrossel.slides;
  const destino = path.join(__dirname, 'carrossel-ronda2');
  const a = await renderizar(slides, { serie: '', handle: '@simoneferreirapsicologia', tom: 'clara', fotoArquivo: 'foto-08.jpeg' }, destino, 'modelo2life');
  console.log(a.length, 'lâminas em', destino);
})().catch(e => { console.error('ERRO', e.message); process.exit(1); });
