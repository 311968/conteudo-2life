// Teste com IA real, segunda ronda (15/11/2026).
// Abre a base de dados de producao SO EM LEITURA, apenas para ler a chave da Anthropic.
// Os 7 blocos de identidade vem da pasta identidade/ desta copia (versao local, com os blocos 3 e 6 corrigidos),
// e nao da app, que ainda tem os blocos de 10/11.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const real = new Database('/var/www/conteudo.metodo2life.com/conteudo.db', { readonly: true, fileMustExist: true });
const nomes = { '1-posicionamento.md': 'posicionamento', '2-persona.md': 'persona', '3-voz.md': 'voz',
  '4-metodologia.md': 'metodologia', '5-produtos.md': 'produtos', '6-regras.md': 'regras', '7-provas.md': 'provas' };
const identidade = Object.entries(nomes).map(([f, tipo]) => ({ tipo, conteudo: fs.readFileSync(path.join(__dirname, 'identidade', f), 'utf8') }));
module.exports = {
  prepare(sql) {
    if (/FROM identidade/i.test(sql)) return { all: () => identidade, get: () => identidade[0] };
    if (!/^\s*SELECT/i.test(sql)) throw new Error('Teste so de leitura: ' + sql.slice(0, 40));
    return real.prepare(sql);
  },
};
