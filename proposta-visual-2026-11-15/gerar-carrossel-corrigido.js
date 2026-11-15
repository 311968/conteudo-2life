// Gera o carrossel de teste final, com as duas correcoes pedidas pela Simone a 15/11 (lamina 7 e legenda),
// com o motor de imagens da app e o layout Modelo 2Life.
// Corre com: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-carrossel-corrigido.js
const path = require('path');
const { renderizar } = require('./teste-app/render.js');
const c = require('../proposta-revisao-2026-11-15/teste-real/carrossel-final-corrigido.json').carrossel;
(async () => {
  const destino = path.join(__dirname, 'carrossel-final-corrigido');
  const a = await renderizar(c.slides, { serie: '', handle: '@simoneferreirapsicologia', tom: 'clara', fotoArquivo: 'foto-08.jpeg' }, destino, 'modelo2life');
  console.log(a.length, 'lâminas em', destino);
})().catch(e => { console.error('ERRO', e.message); process.exit(1); });
