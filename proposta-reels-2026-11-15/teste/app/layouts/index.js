// Registro de layouts. Layout 1 pronto. Os slots 2 e 3 sao preenchidos no caminho.
const layout1 = require('./layout1');
const layout2 = require('./layout2');
const layout3 = require('./layout3');
const post = require('./post');
const thumb = require('./thumb');

const VAZIO = (id, nome) => ({
  NOME: nome,
  DESCRICAO: 'Slot livre. Mande o modelo de referencia e este layout e construido aqui.',
  TIPOS: [],
  disponivel: false,
  paginaHTML() { throw new Error(`Layout ${id} ainda nao foi construido.`); },
});

module.exports = {
  layout1: Object.assign({}, layout1, { disponivel: true }),
  layout2: Object.assign({}, layout2, { disponivel: true }),
  layout3: Object.assign({}, layout3, { disponivel: true }),
  post: Object.assign({}, post, { disponivel: true, soformato: 'post' }),
  thumb: Object.assign({}, thumb, { disponivel: true, soformato: 'thumb' }),
};
