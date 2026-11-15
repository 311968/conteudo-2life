// Atualiza os dois rascunhos "Para aprovação" (ids 3 e 4) com as revisoes pedidas pela Simone a 15/11/2026.
// Faz o mesmo que guardar o reel no editor da app (/api/reels/salvar com id): muda roteiro e legenda.
// Antes, guarda uma copia da base de dados. Confirma que as linhas sao as certas. Nao altera mais nada.
// Uso: node atualizar-rascunhos.js [ficheiro com as versoes, por defeito reels-aprovacao-v2.json]
const fs = require('fs');
const Database = require('better-sqlite3');
const BASE = '/var/www/conteudo.metodo2life.com/conteudo.db';
const v = require('./' + (process.argv[2] || 'reels-aprovacao-v2.json'));

(async () => {
  const db = new Database(BASE, { fileMustExist: true });
  const alvo = { 3: ['significado', 'Para aprovação · Significado · 15/11'], 4: ['r3', 'Para aprovação · R3 · 15/11'] };
  for (const [id, [, serie]] of Object.entries(alvo)) {
    const c = db.prepare('SELECT id, serie, status, formato FROM carrosseis WHERE id = ?').get(Number(id));
    if (!c || c.serie !== serie || c.status !== 'rascunho' || c.formato !== 'reels') throw new Error(`O id ${id} nao e o rascunho esperado. Nada foi alterado.`);
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const copia = `/root/instaladores/conteudo-neia-2026-10-15/pre-reels-aprovacao-${stamp}.db`;
  await db.backup(copia);
  fs.chmodSync(copia, 0o600);
  console.log('copia da base de dados:', copia);
  const agora = new Date().toISOString();
  const up = db.prepare('UPDATE carrosseis SET roteiro = ?, legenda = ?, comentario = ?, atualizado_em = ? WHERE id = ?');
  db.transaction(() => {
    for (const [id, [k]] of Object.entries(alvo)) {
      const ro = v[k];
      up.run(JSON.stringify({ blocos: ro.blocos }), ro.legenda, ro.primeiro_comentario || '', agora, Number(id));
      console.log(`id ${id} (${k}): atualizado, cerca de ${ro.duracao_estimada} s`);
    }
  })();
  db.close();
  console.log('ATUALIZADO');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
