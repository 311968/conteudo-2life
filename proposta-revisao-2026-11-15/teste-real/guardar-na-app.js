// Grava na app de conteudo os dois reels finais (15/11/2026), como rascunhos para a Simone aprovar.
// Pedido da Simone: "Deixa os dois Reels disponiveis na app para a minha aprovacao."
// Faz o mesmo que o botao da app ao escolher uma abertura (/api/reels/salvar): uma linha nova em carrosseis,
// formato "reels", estado "rascunho". Antes, guarda uma copia da base de dados. Nao altera mais nada.
// Uso (na pasta da ronda): node guardar-na-app.js [ficheiro do resultado, por defeito resultado.json]
const fs = require('fs');
const Database = require('better-sqlite3');
const BASE = '/var/www/conteudo.metodo2life.com/conteudo.db';
const r = require('./' + (process.argv[2] || 'resultado.json'));

(async () => {
  if (!r.significado || !r.significado.ok || !r.r3 || !r.r3.ok) throw new Error('O resultado nao tem os dois reels. Nada foi gravado.');
  const db = new Database(BASE, { fileMustExist: true });
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const copia = `/root/instaladores/conteudo-neia-2026-10-15/pre-reels-aprovacao-${stamp}.db`;
  await db.backup(copia);
  fs.chmodSync(copia, 0o600);
  console.log('copia da base de dados:', copia);

  const ja = db.prepare("SELECT id FROM carrosseis WHERE formato = 'reels' AND serie LIKE 'Para aprovação%'").all();
  if (ja.length) throw new Error('Ja existem reels "Para aprovação" (ids ' + ja.map(x => x.id).join(', ') + '). Nada foi gravado.');

  const agora = new Date().toISOString();
  const ins = db.prepare(`INSERT INTO carrosseis
    (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status, formato,
     funcao, nivel, avanco, roteiro, duracao, cta, criado_em, atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const gravar = db.transaction(() => {
    for (const [k, nome] of [['significado', 'Significado'], ['r3', 'R3']]) {
      const x = r[k];
      const ro = x.roteiro;
      const m = r.marcacoes[k];
      const capa = { tipo: 'frase', ...ro.capa, imagem_ideia: ro.imagem_ideia || '' };
      const info = ins.run(r.tema, x.ideia || r.ideia, `Para aprovação · ${nome} · 15/11`, 'post', 'clara', null,
        JSON.stringify([capa]), ro.legenda || '', ro.primeiro_comentario || '', 'rascunho', 'reels',
        m.funcao, m.nivel, m.avanco, JSON.stringify({ blocos: ro.blocos }), 60, '', agora, agora);
      console.log(`${nome}: gravado com o id ${info.lastInsertRowid}`);
    }
  });
  gravar();
  db.close();
  console.log('GRAVADO');
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
