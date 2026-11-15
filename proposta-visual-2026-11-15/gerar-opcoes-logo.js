// Gera as opcoes do logotipo do layout Modelo 2Life (segunda ronda, 15/11/2026) com o motor de imagens da app.
// Corre com: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-opcoes-logo.js
const path = require('path');
const { renderizar } = require('./teste-app/render.js');

const casos = [
  // [nome, lamina, foto do carrossel]
  ['capa-completo-editorial', { tipo: 'capa', titulo: 'Não te falta **assertividade.**', logotipo: 'completo', foto: 'nenhuma' }, ''],
  ['capa-completo-com-foto', { tipo: 'capa', titulo: 'Não te falta **assertividade.**', logotipo: 'completo' }, 'foto-08.jpeg'],
  ['capa-sem-logo', { tipo: 'capa', titulo: 'Não te falta **assertividade.**', subtitulo: 'Falta-te sentir que podes desiludir alguém e continuar a ter lugar.', logotipo: 'sem', foto: 'nenhuma' }, ''],
  ['fecho-sem-logo', { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.', logotipo: 'sem' }, ''],
  ['fecho-foto-zona-calma', { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.', foto_fecho: 'sim' }, 'foto-12.jpeg'],
  ['fecho-bege', { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' }, '', 'areia'],
];

(async () => {
  const destino = path.join(__dirname, 'opcoes-logo');
  for (const [nome, lamina, foto, tom] of casos) {
    const [f] = await renderizar([lamina], { serie: '', handle: '@simoneferreirapsicologia', tom: tom || 'clara', fotoArquivo: foto }, path.join(destino, nome), 'modelo2life');
    console.log(nome, '->', f);
  }
})().catch(e => { console.error('ERRO', e.message); process.exit(1); });
