const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new Database(path.join(__dirname, 'conteudo.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS config (
  chave TEXT PRIMARY KEY,
  valor TEXT
);
CREATE TABLE IF NOT EXISTS identidade (
  tipo TEXT PRIMARY KEY,
  conteudo TEXT,
  atualizado_em TEXT
);
CREATE TABLE IF NOT EXISTS banco (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  conteudo TEXT,
  arquivo TEXT,
  criado_em TEXT
);
CREATE TABLE IF NOT EXISTS fotos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arquivo TEXT NOT NULL,
  rotulo TEXT,
  criado_em TEXT
);
CREATE TABLE IF NOT EXISTS carrosseis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tema TEXT,
  ideia TEXT,
  serie TEXT,
  layout TEXT DEFAULT 'layout1',
  slides TEXT,
  legenda TEXT,
  status TEXT DEFAULT 'rascunho',
  criado_em TEXT,
  atualizado_em TEXT
);
`);

// Semente: identidade puxada de ~/meu-negocio/_fonte/ na primeira execucao
const FONTE = path.join(process.env.HOME, 'meu-negocio', '_fonte');
const seeds = [
  ['posicionamento', path.join(FONTE, 'posicionamento.md')],
  ['persona',        path.join(FONTE, 'persona.md')],
  ['voz',            path.join(FONTE, 'voz.md')],
  ['metodologia',    path.join(FONTE, 'metodologia.md')],
];
const temIdentidade = db.prepare('SELECT COUNT(*) c FROM identidade').get().c;
const temFonte = fs.existsSync(FONTE);

// Instalacao nova, sem a pasta _fonte: a Identidade nasce com as perguntas a responder
if (!temIdentidade && !temFonte) {
  const { GUIAS } = require('./guias');
  const ins = db.prepare('INSERT INTO identidade (tipo, conteudo, atualizado_em) VALUES (?,?,?)');
  for (const [tipo, guia] of Object.entries(GUIAS)) ins.run(tipo, guia, new Date().toISOString());
}

if (!temIdentidade && temFonte) {
  const ins = db.prepare('INSERT INTO identidade (tipo, conteudo, atualizado_em) VALUES (?,?,?)');
  for (const [tipo, arquivo] of seeds) {
    let texto = '';
    try { texto = fs.readFileSync(arquivo, 'utf8'); } catch (e) { texto = ''; }
    ins.run(tipo, texto, new Date().toISOString());
  }
  // Pastas inteiras: produtos e provas
  for (const pasta of ['produtos', 'provas']) {
    let junto = '';
    try {
      const dir = path.join(FONTE, pasta);
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
        junto += `\n\n## ${f}\n` + fs.readFileSync(path.join(dir, f), 'utf8');
      }
    } catch (e) {}
    ins.run(pasta, junto.trim(), new Date().toISOString());
  }
}

// Semente: fotos do banco inicial
const temFotos = db.prepare('SELECT COUNT(*) c FROM fotos').get().c;
if (!temFotos) {
  const ins = db.prepare('INSERT INTO fotos (arquivo, rotulo, criado_em) VALUES (?,?,?)');
  const dir = path.join(__dirname, 'fotos');
  try {
    for (const f of fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f)).sort()) {
      ins.run(f, f.replace(/\.[^.]+$/, ''), new Date().toISOString());
    }
  } catch (e) {}
}

// Semente: config padrao
const cfg = db.prepare('INSERT OR IGNORE INTO config (chave, valor) VALUES (?,?)');
cfg.run('handle', temFonte ? '@alessandracamilo.ia' : '@seu_instagram');
cfg.run('marca', temFonte ? 'Negocio Enxuto com IA' : '');
cfg.run('linha_visual', 'alianca-clara');

// Tom de fundo (layout 3). Coluna adicionada depois, entao entra com try.
try { db.exec("ALTER TABLE carrosseis ADD COLUMN tom TEXT DEFAULT 'petrol'"); } catch (e) {}
// A foto escolhida e o primeiro comentario viajam junto com o carrossel
try { db.exec("ALTER TABLE carrosseis ADD COLUMN foto TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE carrosseis ADD COLUMN comentario TEXT"); } catch (e) {}
// carrossel | post (e, no futuro, reels e live)
try { db.exec("ALTER TABLE carrosseis ADD COLUMN formato TEXT DEFAULT 'carrossel'"); } catch (e) {}
// Eixo de estrategia: funcao principal -> nivel de consciencia -> avanco desejado
try { db.exec("ALTER TABLE carrosseis ADD COLUMN funcao TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE carrosseis ADD COLUMN nivel INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE carrosseis ADD COLUMN avanco TEXT"); } catch (e) {}
// Reels: o roteiro em JSON, a duracao e o CTA pedido
try { db.exec("ALTER TABLE carrosseis ADD COLUMN roteiro TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE carrosseis ADD COLUMN duracao INTEGER"); } catch (e) {}
try { db.exec("ALTER TABLE carrosseis ADD COLUMN cta TEXT"); } catch (e) {}
// O dia em que ela planejou publicar. Status vira 'agendado' ate ir ao ar.
try { db.exec("ALTER TABLE carrosseis ADD COLUMN agendado_para TEXT"); } catch (e) {}

module.exports = db;
