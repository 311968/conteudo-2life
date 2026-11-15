// Base de dados FALSA, so para o teste local. Le os 7 blocos de identidade gravados na app a 10/11/2026.
const fs = require('fs');
const path = require('path');
const pasta = path.join(__dirname, '..', '..', '..', 'identidade-2026-11-10');
const nomes = { '1-posicionamento.md': 'posicionamento', '2-persona.md': 'persona', '3-voz.md': 'voz',
  '4-metodologia.md': 'metodologia', '5-produtos.md': 'produtos', '6-regras.md': 'regras', '7-provas.md': 'provas' };
const identidade = Object.entries(nomes).map(([f, tipo]) => ({ tipo, conteudo: fs.readFileSync(path.join(pasta, f), 'utf8') }));
module.exports = {
  prepare(sql) {
    return {
      all: () => (/FROM identidade/.test(sql) ? identidade : []),
      get: () => ({ valor: 'chave-falsa-de-teste' }),
    };
  },
};
