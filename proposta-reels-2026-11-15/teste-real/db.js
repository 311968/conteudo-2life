// Teste com IA real (15/11/2026): abre a base de dados de producao SO EM LEITURA.
// Le a chave da Anthropic e os 7 blocos de identidade. Nao escreve nada.
const Database = require('better-sqlite3');
module.exports = new Database('/var/www/conteudo.metodo2life.com/conteudo.db', { readonly: true, fileMustExist: true });
