// STORIES (16/11/2026): textos dos stories por dia, para rever, editar, copiar e marcar como publicados.
// Sem IA nesta primeira versão: os textos são escritos pela Simone ou pelo Claude e guardados aqui.
const db = require('./db');

db.exec(`CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia TEXT NOT NULL,
  semana TEXT,
  receita TEXT,
  funcao TEXT,
  pilar TEXT,
  cta TEXT,
  ecras TEXT NOT NULL DEFAULT '[]',
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'rascunho',
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
)`);

const limpar = (ecras) => ecras.map(e => ({
  papel: String((e && e.papel) || ''), texto: String((e && e.texto) || ''),
  autocolante: String((e && e.autocolante) || ''), nota: String((e && e.nota) || ''),
}));

function rotas(app, exigeLogin) {
  app.get('/api/stories', exigeLogin, (req, res) => {
    res.json(db.prepare('SELECT * FROM stories ORDER BY dia, id').all()
      .map(r => Object.assign(r, { ecras: JSON.parse(r.ecras || '[]') })));
  });
  app.put('/api/stories/:id', exigeLogin, (req, res) => {
    const { ecras, estado } = req.body || {};
    if (ecras !== undefined && !Array.isArray(ecras)) return res.status(400).json({ erro: 'Formato dos ecrãs inválido.' });
    if (estado !== undefined && !['rascunho', 'publicado'].includes(estado)) return res.status(400).json({ erro: 'Estado inválido.' });
    const r = db.prepare('UPDATE stories SET ecras = COALESCE(?, ecras), estado = COALESCE(?, estado), atualizado_em = ? WHERE id = ?')
      .run(ecras ? JSON.stringify(limpar(ecras)) : null, estado || null, new Date().toISOString(), Number(req.params.id));
    if (!r.changes) return res.status(404).json({ erro: 'Story não encontrada.' });
    res.json({ ok: true });
  });
}

// Acrescenta os stories de uma semana (sem duplicar o mesmo dia e receita)
function semear(lista) {
  const existe = db.prepare('SELECT id FROM stories WHERE dia = ? AND receita = ?');
  const ins = db.prepare(`INSERT INTO stories (dia, semana, receita, funcao, pilar, cta, ecras, notas, estado, criado_em, atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  let n = 0;
  for (const s of lista) {
    if (existe.get(s.dia, s.receita)) continue;
    const agora = new Date().toISOString();
    ins.run(s.dia, s.semana || null, s.receita, s.funcao || null, s.pilar || null, s.cta || null,
      JSON.stringify(limpar(s.ecras || [])), s.notas || null, 'rascunho', agora, agora);
    n++;
  }
  return n;
}

module.exports = { rotas, semear };
