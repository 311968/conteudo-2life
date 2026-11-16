require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const ia = require('./ia');
const { renderizar } = require('./render');
const imagens = require('./imagens');
const estrategia = require('./estrategia');
// Sem ideia central escrita, a IA parte do tema (15/11/2026)
const IDEIA_SO_TEMA = 'A ideia central não foi escrita: parte do tema (e do material marcado, se houver) e escolhe o ângulo mais forte, segundo a Matriz de Comunicação e as fontes do Método 2Life.';
const reels = require('./reels');
const live = require('./live');
const instagram = require('./instagram');
const paletas = require('./layouts/paletas');
const layouts = require('./layouts');

const app = express();
// Atras do nginx a conexao chega como http: sem isto o app acha que nao esta em https
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3990;
const APP_USER = process.env.APP_USER || 'admin';
const APP_PASS = process.env.APP_PASS;

if (!APP_PASS) { console.error('Falta APP_PASS no .env'); process.exit(1); }

app.use(express.json({ limit: '20mb' }));
// Sem segredo no .env, cada reinicio sorteia um novo: as sessoes caem, mas
// ninguem consegue forjar um cookie adivinhando um segredo padrao.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('Aviso: sem SESSION_SECRET no .env. Voce vai precisar entrar de novo a cada reinicio.');
}

app.use(session({
  store: new SQLiteStore({ db: 'sessoes.db', dir: __dirname }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    sameSite: 'lax',
    httpOnly: true,   // o cookie nao fica visivel para script nenhum da pagina
    secure: 'auto',   // atras de https, o cookie so viaja por https
  },
}));

const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 60 * 1024 * 1024 },
});

function exigeLogin(req, res, next) {
  if (req.session && req.session.logado) return next();
  return res.status(401).json({ erro: 'Precisa entrar.' });
}

// ---------- publico ----------
app.use('/fontes', express.static(path.join(__dirname, 'fontes')));
// A Meta busca as imagens aqui, sem login, com um passe temporario que expira em 30 minutos
app.get('/p/:passe/:arquivo', (req, res) => {
  const p = instagram.validarPasse(req.params.passe);
  if (!p) return res.status(404).send('Passe expirado.');
  if (!/^slide-\d+\.jpg$/.test(req.params.arquivo)) return res.status(400).send('Arquivo inválido.');
  const caminho = path.join(__dirname, 'saidas', String(p.carrossel_id), req.params.arquivo);
  if (!fs.existsSync(caminho)) return res.status(404).send('Imagem não encontrada.');
  res.type('jpeg').sendFile(caminho);
});

app.get('/login', (req, res) => {
  // Se já está logada, a tela de login não faz sentido: manda para o app
  if (req.session && req.session.logado) return res.redirect('/');
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Trava contra tentativa em massa: oito erros e a porta fecha por quinze minutos
const tentativas = new Map();
const LIMITE = 8;
const CASTIGO = 15 * 60 * 1000;

function bloqueada(ip) {
  const t = tentativas.get(ip);
  if (!t) return 0;
  if (Date.now() - t.desde > CASTIGO) { tentativas.delete(ip); return 0; }
  return t.erros >= LIMITE ? Math.ceil((CASTIGO - (Date.now() - t.desde)) / 60000) : 0;
}

function errou(ip) {
  const t = tentativas.get(ip) || { erros: 0, desde: Date.now() };
  if (Date.now() - t.desde > CASTIGO) { t.erros = 0; t.desde = Date.now(); }
  t.erros += 1;
  tentativas.set(ip, t);
}

// Compara sem entregar pistas pelo tempo de resposta
function igual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

app.post('/api/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'desconhecido';
  const faltam = bloqueada(ip);
  if (faltam) {
    return res.status(429).json({
      erro: `Muitas tentativas. Tente de novo em ${faltam} ${faltam === 1 ? 'minuto' : 'minutos'}.`,
    });
  }

  const { usuario, senha } = req.body || {};
  if (igual(usuario, APP_USER) && igual(senha, APP_PASS)) {
    tentativas.delete(ip);
    req.session.logado = true;
    return res.json({ ok: true });
  }

  errou(ip);
  res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
});
app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });
app.get('/api/me', (req, res) => res.json({ logado: !!(req.session && req.session.logado) }));

// ---------- protegido ----------
app.use('/fotos', exigeLogin, express.static(path.join(__dirname, 'fotos')));
app.use('/geradas', exigeLogin, express.static(path.join(__dirname, 'geradas')));
app.use('/saidas', exigeLogin, express.static(path.join(__dirname, 'saidas')));

// CONFIG
app.get('/api/config', exigeLogin, (req, res) => {
  const linhas = db.prepare('SELECT chave, valor FROM config').all();
  const mapa = {};
  for (const l of linhas) {
    // chaves de API nunca voltam inteiras para o navegador
    mapa[l.chave] = /api_key|token|secret/.test(l.chave)
      ? (l.valor ? '••••••••' + String(l.valor).slice(-4) : '')
      : l.valor;
  }
  // mostra tambem o que veio do .env, mascarado
  for (const [k, env] of [['gemini_api_key','GEMINI_API_KEY'],['anthropic_api_key','ANTHROPIC_API_KEY']]) {
    if (!mapa[k] && process.env[env]) mapa[k] = '••••••••' + process.env[env].slice(-4) + ' (do .env)';
  }
  res.json(mapa);
});
app.put('/api/config', exigeLogin, (req, res) => {
  const ins = db.prepare('INSERT INTO config (chave, valor) VALUES (?,?) ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor');
  for (const [k, v] of Object.entries(req.body || {})) {
    if (typeof v !== 'string') continue;
    if (v.startsWith('••••')) continue; // nao sobrescreve mascarado
    ins.run(k, v);
  }
  res.json({ ok: true });
});

// IDENTIDADE
app.get('/api/identidade', exigeLogin, (req, res) => {
  res.json(db.prepare('SELECT tipo, conteudo, atualizado_em FROM identidade ORDER BY tipo').all());
});
app.put('/api/identidade/:tipo', exigeLogin, (req, res) => {
  db.prepare(`INSERT INTO identidade (tipo, conteudo, atualizado_em) VALUES (?,?,?)
    ON CONFLICT(tipo) DO UPDATE SET conteudo=excluded.conteudo, atualizado_em=excluded.atualizado_em`)
    .run(req.params.tipo, req.body.conteudo || '', new Date().toISOString());
  res.json({ ok: true });
});
// Recarrega da fonte oficial em ~/meu-negocio/_fonte/
app.post('/api/identidade/recarregar', exigeLogin, (req, res) => {
  const FONTE = path.join(process.env.HOME, 'meu-negocio', '_fonte');
  const mapa = { posicionamento: 'posicionamento.md', persona: 'persona.md', voz: 'voz.md', metodologia: 'metodologia.md' };
  const up = db.prepare(`INSERT INTO identidade (tipo, conteudo, atualizado_em) VALUES (?,?,?)
    ON CONFLICT(tipo) DO UPDATE SET conteudo=excluded.conteudo, atualizado_em=excluded.atualizado_em`);
  const feitos = [];
  for (const [tipo, arq] of Object.entries(mapa)) {
    try { up.run(tipo, fs.readFileSync(path.join(FONTE, arq), 'utf8'), new Date().toISOString()); feitos.push(tipo); }
    catch (e) {}
  }
  // Pastas inteiras
  for (const pasta of ['produtos', 'provas']) {
    let junto = '';
    try {
      const dir = path.join(FONTE, pasta);
      for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md')) {
        junto += `\n\n## ${f}\n` + fs.readFileSync(path.join(dir, f), 'utf8');
      }
      if (junto.trim()) { up.run(pasta, junto.trim(), new Date().toISOString()); feitos.push(pasta); }
    } catch (e) {}
  }
  res.json({ ok: true, recarregados: feitos });
});

// BANCO CENTRAL
app.get('/api/banco', exigeLogin, (req, res) => {
  res.json(db.prepare('SELECT id, titulo, tipo, arquivo, criado_em, length(conteudo) tamanho FROM banco ORDER BY id DESC').all());
});
app.get('/api/banco/:id', exigeLogin, (req, res) => {
  const item = db.prepare('SELECT * FROM banco WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Nao encontrado.' });
  res.json(item);
});
app.post('/api/banco', exigeLogin, (req, res) => {
  const { titulo, conteudo } = req.body || {};
  if (!titulo || !conteudo) return res.status(400).json({ erro: 'Titulo e conteudo sao obrigatorios.' });
  const r = db.prepare('INSERT INTO banco (titulo, tipo, conteudo, criado_em) VALUES (?,?,?,?)')
    .run(titulo, 'texto', conteudo, new Date().toISOString());
  res.json({ ok: true, id: r.lastInsertRowid });
});
app.put('/api/banco/:id', exigeLogin, (req, res) => {
  db.prepare('UPDATE banco SET titulo = COALESCE(?, titulo), conteudo = COALESCE(?, conteudo) WHERE id = ?')
    .run(req.body.titulo ?? null, req.body.conteudo ?? null, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/banco/:id', exigeLogin, (req, res) => {
  db.prepare('DELETE FROM banco WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Upload: PDF vira texto, audio vira transcricao
app.post('/api/banco/upload', exigeLogin, upload.single('arquivo'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ erro: 'Nenhum arquivo recebido.' });
  const titulo = req.body.titulo || f.originalname;
  try {
    let conteudo = '', tipo = 'texto';
    if (/pdf/i.test(f.mimetype) || /\.pdf$/i.test(f.originalname)) {
      const pdf = require('pdf-parse');
      conteudo = (await pdf(fs.readFileSync(f.path))).text.trim();
      tipo = 'pdf';
    } else if (/^audio\//i.test(f.mimetype) || /\.(m4a|mp3|wav|ogg|aac|mp4|webm)$/i.test(f.originalname)) {
      conteudo = await ia.transcrever(f.path, f.mimetype);
      tipo = 'audio';
    } else if (/^text\//i.test(f.mimetype) || /\.(txt|md)$/i.test(f.originalname)) {
      conteudo = fs.readFileSync(f.path, 'utf8');
    } else {
      return res.status(400).json({ erro: 'Formato nao suportado. Use PDF, audio, txt ou md.' });
    }
    if (!conteudo.trim()) return res.status(400).json({ erro: 'Nao consegui extrair texto do arquivo.' });
    const r = db.prepare('INSERT INTO banco (titulo, tipo, conteudo, arquivo, criado_em) VALUES (?,?,?,?,?)')
      .run(titulo, tipo, conteudo, f.originalname, new Date().toISOString());
    res.json({ ok: true, id: r.lastInsertRowid, tipo, previa: conteudo.slice(0, 400) });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  } finally {
    fs.unlink(f.path, () => {});
  }
});

// Transcricao avulsa (a ideia central narrada na hora)
app.post('/api/transcrever', exigeLogin, upload.single('audio'), async (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ erro: 'Nenhum audio recebido.' });
  try {
    const texto = await ia.transcrever(f.path, f.mimetype);
    res.json({ ok: true, texto });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  } finally {
    fs.unlink(f.path, () => {});
  }
});

// FOTOS
app.get('/api/fotos', exigeLogin, (req, res) => {
  res.json(db.prepare('SELECT id, arquivo, rotulo FROM fotos ORDER BY id').all());
});
app.post('/api/fotos', exigeLogin, upload.single('foto'), (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ erro: 'Nenhuma foto recebida.' });
  const ext = (path.extname(f.originalname) || '.jpg').toLowerCase();
  if (!/\.(png|jpe?g)$/.test(ext)) { fs.unlink(f.path, () => {}); return res.status(400).json({ erro: 'Use PNG ou JPG.' }); }
  const nome = `foto-${Date.now()}${ext}`;
  fs.renameSync(f.path, path.join(__dirname, 'fotos', nome));
  const r = db.prepare('INSERT INTO fotos (arquivo, rotulo, criado_em) VALUES (?,?,?)')
    .run(nome, req.body.rotulo || f.originalname, new Date().toISOString());
  res.json({ ok: true, id: r.lastInsertRowid, arquivo: nome });
});
app.delete('/api/fotos/:id', exigeLogin, (req, res) => {
  const f = db.prepare('SELECT arquivo FROM fotos WHERE id = ?').get(req.params.id);
  if (f) { try { fs.unlinkSync(path.join(__dirname, 'fotos', f.arquivo)); } catch (e) {} }
  db.prepare('DELETE FROM fotos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// LAYOUTS
app.get('/api/estrategia', exigeLogin, (req, res) => res.json(estrategia.lista()));

// Os tres estilos de arte do post estatico
// COMECE AQUI: o que ja esta pronto e o que falta, lido do proprio app
app.get('/api/comece', exigeLogin, (req, res) => {
  const valor = (chave) => {
    const l = db.prepare('SELECT valor FROM config WHERE chave = ?').get(chave);
    return (l && l.valor) || '';
  };
  const ident = db.prepare('SELECT tipo, conteudo FROM identidade').all();
  const { GUIAS } = require('./guias');
  // Um bloco conta como preenchido quando deixou de ser o texto-guia
  const preenchidos = ident.filter(i => {
    const texto = (i.conteudo || '').trim();
    if (!texto) return false;
    const guia = (GUIAS[i.tipo] || '').trim();
    return texto !== guia && texto.length > 120;
  }).map(i => i.tipo);

  res.json({
    chave_anthropic: !!(valor('anthropic_api_key') || process.env.ANTHROPIC_API_KEY),
    chave_gemini: !!(valor('gemini_api_key') || process.env.GEMINI_API_KEY),
    handle: valor('handle') && valor('handle') !== '@seu_instagram' ? valor('handle') : '',
    identidade_total: ident.length,
    identidade_prontos: preenchidos,
    fotos: db.prepare('SELECT COUNT(*) c FROM fotos').get().c,
    cores_proprias: !!valor('paletas'),
    instagram: !!((valor('meta_token') || process.env.META_TOKEN) && (valor('ig_user_id') || process.env.IG_USER_ID)),
    conteudos: db.prepare('SELECT COUNT(*) c FROM carrosseis').get().c,
    publicados: db.prepare('SELECT COUNT(*) c FROM publicacoes').get().c,
  });
});

// IDENTIDADE VISUAL: as cores de cada paleta
app.get('/api/paletas', exigeLogin, (req, res) => res.json(paletas.paraEditar()));

app.put('/api/paletas', exigeLogin, (req, res) => {
  try { paletas.salvar(req.body); res.json({ ok: true, paletas: paletas.paraEditar() }); }
  catch (e) { res.status(500).json({ erro: e.message }); }
});

// Ela cola o que o Claude Code deu e o app entende
app.post('/api/paletas/colar', exigeLogin, async (req, res) => {
  const texto = (req.body || {}).texto;
  try {
    // Primeiro tenta ler os códigos direto do texto
    const lido = paletas.interpretar(texto);
    if (lido.paletas) paletas.salvar(lido.paletas);
    else paletas.salvar(paletas.montar(lido.marca));
    return res.json({ ok: true, marca: lido.marca || null, paletas: paletas.paraEditar() });
  } catch (e) {
    // Não achou código nenhum: então ela escreveu em português, e a IA traduz
    try {
      const { cores, explicacao } = await ia.coresDaDescricao(texto);
      paletas.salvar(paletas.montar(cores));
      return res.json({ ok: true, marca: cores, explicacao, paletas: paletas.paraEditar() });
    } catch (e2) {
      return res.status(400).json({ erro: e2.message });
    }
  }
});

// Monta as cinco paletas a partir das cores da marca dela
app.post('/api/paletas/montar', exigeLogin, (req, res) => {
  try {
    const novas = paletas.montar(req.body || {});
    paletas.salvar(novas);
    res.json({ ok: true, paletas: paletas.paraEditar() });
  } catch (e) { res.status(400).json({ erro: e.message }); }
});

app.delete('/api/paletas', exigeLogin, (req, res) => {
  paletas.restaurar();
  res.json({ ok: true, paletas: paletas.paraEditar() });
});

app.get('/api/estilos-post', exigeLogin, (req, res) => {
  res.json({ estilos: layouts.post.ESTILOS, tons: paletas.lista() });
});

app.get('/api/layouts', exigeLogin, (req, res) => {
  // Layouts de uso interno (capa do post, capa do YouTube) não entram na escolha do carrossel
  res.json(Object.entries(layouts).filter(([, l]) => !l.soformato).map(([id, l]) => ({
    id, nome: l.NOME, descricao: l.DESCRICAO, tipos: l.TIPOS, disponivel: !!l.disponivel,
    tons: paletas.lista().map(p => ({ id: p.id, nome: p.nome, fundo: p.amostra, escura: p.escura })),
  })));
});

// PRODUZIR
app.post('/api/gerar', exigeLogin, async (req, res) => {
  const { tema, ideia, serie, banco_ids, layout, tom, foto, funcao, nivel, avanco } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  try {
    let referencias = [];
    if (Array.isArray(banco_ids) && banco_ids.length) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids)
;
    }
    const r = await ia.gerarCarrossel({
      tema,
      ideia: ideia || IDEIA_SO_TEMA,
      serie, referencias, layout,
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    const agora = new Date().toISOString();
    const ins = db.prepare(`INSERT INTO carrosseis
      (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status,
       funcao, nivel, avanco, criado_em, atualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(tema, ideia, r.serie || serie || '', layout || 'layout1', tom || 'clara', foto || null,
           JSON.stringify(r.slides || []), r.legenda || '', r.primeiro_comentario || '',
           'rascunho', funcao || null, Number(nivel) || null, avanco || null, agora, agora);
    res.json({ ok: true, id: ins.lastInsertRowid, ...r });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// INSTAGRAM
app.get('/api/instagram/previa/:id', exigeLogin, async (req, res) => {
  try {
    const p = instagram.previa(Number(req.params.id));
    p.publicacao_direta = instagram.ligado();
    let quota = null;
    try { quota = await instagram.quotaRestante(); } catch (e) {}
    res.json({ ok: true, ...p, quota });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/instagram/publicar/:id', exigeLogin, async (req, res) => {
  try {
    // Respeita o que o nginx informa, e nunca deixa cair em http por engano
    const protocolo = req.get('x-forwarded-proto') || req.protocol;
    const base = `${protocolo}://${req.get('host')}`;
    if (!base.startsWith('https://')) {
      return res.status(400).json({
        erro: 'O Instagram só busca imagens em https. Publique pelo endereço do servidor, não pelo localhost.',
      });
    }
    const r = await instagram.publicar({ carrosselId: Number(req.params.id), base });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// AGENDA: o conteudo aprovado entra no calendario e e publicado de la
app.post('/api/agenda/:id', exigeLogin, (req, res) => {
  const { dia } = req.body || {};
  if (!dia) return res.status(400).json({ erro: 'Preciso do dia.' });
  const c = db.prepare('SELECT id, status FROM carrosseis WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ erro: 'Conteúdo não encontrado.' });
  db.prepare('UPDATE carrosseis SET agendado_para = ?, status = ?, atualizado_em = ? WHERE id = ?')
    .run(dia, c.status === 'publicado' ? 'publicado' : 'agendado', new Date().toISOString(), c.id);
  res.json({ ok: true });
});

app.delete('/api/agenda/:id', exigeLogin, (req, res) => {
  db.prepare("UPDATE carrosseis SET agendado_para = NULL, status = 'exportado', atualizado_em = ? WHERE id = ?")
    .run(new Date().toISOString(), req.params.id);
  res.json({ ok: true });
});

// O que esta na agenda, esperando o dia
app.get('/api/agenda', exigeLogin, (req, res) => {
  res.json(db.prepare(`SELECT id, tema, formato, agendado_para, status, legenda
    FROM carrosseis WHERE agendado_para IS NOT NULL AND status != 'publicado'
    ORDER BY agendado_para`).all());
});

// EXTRAS: capa de video avulsa, para qualquer video, tenha nascido aqui ou nao
app.post('/api/extras/capas', exigeLogin, async (req, res) => {
  const { tema, conteudo, duracao } = req.body || {};
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema do vídeo.' });
  if (!conteudo) return res.status(400).json({ erro: 'Me conte o que o vídeo fala: é disso que sai a capa.' });
  try {
    const r = await ia.gerarCapasYoutube({ tema, conteudo, duracao });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/extras/capa/render', exigeLogin, async (req, res) => {
  const { capa, foto, tom, indice } = req.body || {};
  if (!capa || !capa.titulo) return res.status(400).json({ erro: 'Faltou a capa.' });
  const destino = path.join(__dirname, 'saidas', 'capas');
  const nome = `capa-${Date.now()}-${Number(indice) || 0}.jpg`;
  try {
    await renderizar([{ ...capa, foto: foto || null }],
      { tom: tom || 'petrol', nomeArquivo: nome }, destino, 'thumb');
    res.json({ ok: true, arquivo: `/saidas/capas/${nome}` });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// YOUTUBE: a capa 1280x720 e a descricao com capitulos
function minutosParaRelogio(tempo) {
  // "15-40min" vira "15:00"
  const m = String(tempo || '').match(/^(\d+)/);
  const min = m ? Number(m[1]) : 0;
  return `${min}:00`;
}

function descricaoYoutube(c, r) {
  const linhas = [];
  if (r.youtube && r.youtube.descricao) linhas.push(r.youtube.descricao.trim(), '');
  else if (r.descricao) linhas.push(r.descricao.trim(), '');

  const blocos = r.blocos || [];
  if (blocos.length) {
    linhas.push('CAPÍTULOS');
    for (const b of blocos) {
      linhas.push(`${minutosParaRelogio(b.tempo)} ${b.rotulo || ''}`.trim());
    }
    linhas.push('');
  }
  if (r.youtube && (r.youtube.tags || []).length) {
    linhas.push((r.youtube.tags || []).map(t => '#' + String(t).replace(/[^a-zA-ZÀ-ú0-9]/g, '')).join(' '));
  }
  return linhas.join('\n');
}

app.get('/api/youtube/:id', exigeLogin, (req, res) => {
  const c = db.prepare('SELECT * FROM carrosseis WHERE id = ?').get(req.params.id);
  if (!c || c.formato !== 'live') return res.status(404).json({ erro: 'Isto não é uma live.' });
  let r = {};
  try { r = JSON.parse(c.roteiro || '{}'); } catch (e) {}
  res.json({
    ok: true,
    titulo: c.tema || '',
    thumb: r.thumb || { chapeu: '', titulo: c.tema || '', apoio: '', selo: c.duracao ? `live de ${c.duracao} min` : '' },
    descricao: descricaoYoutube(c, r),
    tags: (r.youtube && r.youtube.tags) || [],
  });
});

app.post('/api/youtube/:id/capa', exigeLogin, async (req, res) => {
  const id = Number(req.params.id);
  const c = db.prepare('SELECT * FROM carrosseis WHERE id = ?').get(id);
  if (!c) return res.status(404).json({ erro: 'Conteúdo não encontrado.' });
  const { thumb, foto } = req.body || {};
  const destino = path.join(__dirname, 'saidas', String(id));
  try {
    await renderizar([{ ...thumb, foto: foto || c.foto || null }],
      { tom: c.tom, nomeArquivo: 'capa-youtube.jpg' }, destino, 'thumb');

    // guarda a capa junto do roteiro, para voltar igual quando reabrir
    let r = {};
    try { r = JSON.parse(c.roteiro || '{}'); } catch (e) {}
    r.thumb = thumb;
    db.prepare('UPDATE carrosseis SET roteiro = ?, atualizado_em = ? WHERE id = ?')
      .run(JSON.stringify(r), new Date().toISOString(), id);

    res.json({ ok: true, arquivo: `/saidas/${id}/capa-youtube.jpg` });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// CALENDARIO
app.get('/api/publicacoes', exigeLogin, (req, res) => {
  res.json(db.prepare(`SELECT p.*, c.formato AS formato_atual
    FROM publicacoes p LEFT JOIN carrosseis c ON c.id = p.carrossel_id
    ORDER BY p.publicado_em DESC`).all());
});

// O que ela postou por fora tambem entra no calendario
app.post('/api/publicacoes', exigeLogin, (req, res) => {
  const { titulo, formato, publicado_em, permalink, nota, carrossel_id } = req.body || {};
  if (!titulo || !publicado_em) return res.status(400).json({ erro: 'Preciso do título e da data.' });
  const r = db.prepare(`INSERT INTO publicacoes
    (carrossel_id, formato, titulo, publicado_em, permalink, manual, nota)
    VALUES (?,?,?,?,?,1,?)`)
    .run(carrossel_id || null, formato || 'carrossel', titulo, publicado_em, permalink || '', nota || '');
  res.json({ ok: true, id: r.lastInsertRowid });
});

app.delete('/api/publicacoes/:id', exigeLogin, (req, res) => {
  db.prepare('DELETE FROM publicacoes WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// LIVE / YT
app.get('/api/live/opcoes', exigeLogin, (req, res) => res.json({ duracoes: live.lista() }));

app.post('/api/live/propostas', exigeLogin, async (req, res) => {
  const { tema, ideia, banco_ids, duracao, funcao, nivel, avanco } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  try {
    let referencias = [];
    if (temMaterial) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarTitulosLive({
      tema, ideia: ideia || IDEIA_SO_TEMA, referencias,
      duracao: Number(duracao) || 30,
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/live/roteiro', exigeLogin, async (req, res) => {
  const { tema, ideia, banco_ids, duracao, proposta, funcao, nivel, avanco } = req.body || {};
  if (!proposta || !proposta.titulo) return res.status(400).json({ erro: 'Faltou a proposta escolhida.' });
  try {
    let referencias = [];
    if (Array.isArray(banco_ids) && banco_ids.length) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarRoteiroLive({
      tema, ideia: ideia || IDEIA_SO_TEMA, referencias, proposta, duracao: Number(duracao) || 30,
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/live/salvar', exigeLogin, (req, res) => {
  const { tema, ideia, capa, roteiro, legenda, comentario, tom, foto,
          funcao, nivel, avanco, duracao, titulo, id } = req.body || {};
  if (!capa || !roteiro) return res.status(400).json({ erro: 'Faltou a capa ou o roteiro.' });
  const agora = new Date().toISOString();

  if (id) {
    db.prepare(`UPDATE carrosseis SET slides = ?, roteiro = ?, legenda = ?, comentario = ?, tema = COALESCE(?, tema),
      tom = COALESCE(?, tom), foto = COALESCE(?, foto), atualizado_em = ? WHERE id = ?`)
      .run(JSON.stringify([capa]), JSON.stringify(roteiro), legenda || '', comentario || '',
           titulo || null, tom || null, foto || null, agora, id);
    return res.json({ ok: true, id });
  }

  const ins = db.prepare(`INSERT INTO carrosseis
    (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status, formato,
     funcao, nivel, avanco, roteiro, duracao, criado_em, atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(titulo || tema || '', ideia || '', '', 'post', tom || 'clara', foto || null,
         JSON.stringify([capa]), legenda || '', comentario || '', 'rascunho', 'live',
         funcao || null, Number(nivel) || null, avanco || null,
         JSON.stringify(roteiro), Number(duracao) || null, agora, agora);
  res.json({ ok: true, id: ins.lastInsertRowid });
});

// REELS
app.get('/api/reels/opcoes', exigeLogin, (req, res) => res.json(reels.lista()));

app.post('/api/reels/ganchos', exigeLogin, async (req, res) => {
  const { tema, ideia, banco_ids, duracao, funcao, nivel, avanco, receita } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  try {
    let referencias = [];
    if (temMaterial) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarGanchosReels({
      receita: receita === 'r3' ? 'r3' : '',
      tema, ideia: ideia || IDEIA_SO_TEMA, referencias,
      duracao: Number(duracao) || 30,
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/reels/roteiro', exigeLogin, async (req, res) => {
  const { tema, ideia, banco_ids, duracao, gancho, cta, funcao, nivel, avanco } = req.body || {};
  if (!gancho || !gancho.frase) return res.status(400).json({ erro: 'Faltou o gancho escolhido.' });
  try {
    let referencias = [];
    if (Array.isArray(banco_ids) && banco_ids.length) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarRoteiroReels({
      tema, ideia: ideia || IDEIA_SO_TEMA, referencias, duracao: Number(duracao) || 30, gancho, cta,
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    res.json({ ok: true, ...r });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.post('/api/reels/salvar', exigeLogin, (req, res) => {
  const { tema, ideia, serie, capa, roteiro, legenda, comentario, tom, foto,
          funcao, nivel, avanco, duracao, cta, id } = req.body || {};
  if (!capa || !roteiro) return res.status(400).json({ erro: 'Faltou a capa ou o roteiro.' });
  const agora = new Date().toISOString();

  // Trocar de gancho reaproveita o mesmo reels
  if (id) {
    db.prepare(`UPDATE carrosseis SET slides = ?, roteiro = ?, legenda = ?, comentario = ?,
      tom = COALESCE(?, tom), foto = COALESCE(?, foto), cta = COALESCE(?, cta), atualizado_em = ?
      WHERE id = ?`)
      .run(JSON.stringify([capa]), JSON.stringify(roteiro), legenda || '', comentario || '',
           tom || null, foto || null, cta || null, agora, id);
    return res.json({ ok: true, id });
  }

  const ins = db.prepare(`INSERT INTO carrosseis
    (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status, formato,
     funcao, nivel, avanco, roteiro, duracao, cta, criado_em, atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(tema || '', ideia || '', serie || '', 'post', tom || 'clara', foto || null,
         JSON.stringify([capa]), legenda || '', comentario || '', 'rascunho', 'reels',
         funcao || null, Number(nivel) || null, avanco || null,
         JSON.stringify(roteiro), Number(duracao) || null, cta || null, agora, agora);
  res.json({ ok: true, id: ins.lastInsertRowid });
});

// POST ESTATICO: gera tres angulos, ela escolhe um
app.post('/api/post/gerar', exigeLogin, async (req, res) => {
  const { tema, ideia, banco_ids, layout, funcao, nivel, avanco } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  try {
    let referencias = [];
    if (temMaterial) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarPost({
      tema,
      ideia: ideia || IDEIA_SO_TEMA,
      referencias, layout: layout || 'layout1',
      marcacao: { funcao, nivel: Number(nivel) || null, avanco },
    });
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Guarda o angulo escolhido como um item de uma lamina so
app.post('/api/post/salvar', exigeLogin, (req, res) => {
  const { tema, ideia, lamina, legenda, comentario, layout, tom, foto, serie, funcao, nivel, avanco } = req.body || {};
  if (!lamina) return res.status(400).json({ erro: 'Faltou a lâmina.' });
  const agora = new Date().toISOString();
  const ins = db.prepare(`INSERT INTO carrosseis
    (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status, formato,
     funcao, nivel, avanco, criado_em, atualizado_em)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(tema || '', ideia || '', serie || '', 'post', tom || 'clara', foto || null,
         JSON.stringify([lamina]), legenda || '', comentario || '', 'rascunho', 'post',
         funcao || null, Number(nivel) || null, avanco || null, agora, agora);
  res.json({ ok: true, id: ins.lastInsertRowid });
});

// CARROSSEIS
app.get('/api/carrosseis', exigeLogin, (req, res) => {
  res.json(db.prepare('SELECT id, tema, serie, layout, status, formato, funcao, nivel, criado_em FROM carrosseis ORDER BY id DESC').all());
});
app.get('/api/carrosseis/:id', exigeLogin, (req, res) => {
  const c = db.prepare('SELECT * FROM carrosseis WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ erro: 'Nao encontrado.' });
  c.slides = JSON.parse(c.slides || '[]');
  if (c.roteiro) { try { c.roteiro = JSON.parse(c.roteiro); } catch (e) { c.roteiro = null; } }
  res.json(c);
});
app.put('/api/carrosseis/:id', exigeLogin, (req, res) => {
  const { slides, legenda, serie, tema, tom, foto, comentario, roteiro } = req.body || {};
  db.prepare(`UPDATE carrosseis SET slides = COALESCE(?, slides), legenda = COALESCE(?, legenda),
    serie = COALESCE(?, serie), tema = COALESCE(?, tema), tom = COALESCE(?, tom),
    foto = COALESCE(?, foto), comentario = COALESCE(?, comentario),
    roteiro = COALESCE(?, roteiro), atualizado_em = ? WHERE id = ?`)
    .run(slides ? JSON.stringify(slides) : null, legenda ?? null, serie ?? null, tema ?? null, tom ?? null,
         foto ?? null, comentario ?? null, roteiro ? JSON.stringify(roteiro) : null,
         new Date().toISOString(), req.params.id);
  res.json({ ok: true });
});
app.delete('/api/carrosseis/:id', exigeLogin, (req, res) => {
  db.prepare('DELETE FROM carrosseis WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// PREVIA no navegador (um slide, HTML puro)
app.post('/api/previa', exigeLogin, (req, res) => {
  const { slide, serie, handle, foto, layout, tom } = req.body || {};
  const l = layouts[layout || 'layout1'];
  if (!l || !l.disponivel) return res.status(400).send('Layout indisponivel.');
  const fotoUrl = (foto && foto !== 'nenhuma')
    ? (String(foto).startsWith('geradas/') ? '/geradas/' : '/fotos/') + path.basename(String(foto))
    : '';
  res.type('html').send(l.paginaHTML(slide || {}, { serie, handle, fotoUrl, tom }));
});

// EXPORTAR PNG
app.post('/api/carrosseis/:id/render', exigeLogin, async (req, res) => {
  const c = db.prepare('SELECT * FROM carrosseis WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ erro: 'Nao encontrado.' });
  const handle = (db.prepare('SELECT valor FROM config WHERE chave = ?').get('handle') || {}).valor || '';
  const destino = path.join(__dirname, 'saidas', String(c.id));
  try {
    fs.rmSync(destino, { recursive: true, force: true });
    const arquivos = await renderizar(JSON.parse(c.slides || '[]'),
      { serie: c.serie, handle, tom: c.tom, fotoArquivo: req.body.foto || c.foto || null }, destino, c.layout);
    db.prepare('UPDATE carrosseis SET status = ?, atualizado_em = ? WHERE id = ?')
      .run('exportado', new Date().toISOString(), c.id);
    res.json({ ok: true, arquivos: arquivos.map(a => `/saidas/${c.id}/${a}`), pasta: destino });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});




// REESCREVER UMA LAMINA EM OUTRO FORMATO
app.post('/api/reescrever-lamina', exigeLogin, async (req, res) => {
  const { lamina, tipo_novo, layout, anterior, proxima, posicao, total } = req.body || {};
  if (!lamina || !tipo_novo) return res.status(400).json({ erro: 'Faltou a lâmina ou o tipo novo.' });
  try {
    const nova = await ia.reescreverLamina({
      lamina, tipoNovo: tipo_novo, layout: layout || 'layout1',
      anterior: anterior || null, proxima: proxima || null,
      posicao: posicao || 1, total: total || 1,
    });
    res.json({ ok: true, lamina: nova });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// IMAGENS GERADAS
// Gera a imagem de uma lamina a partir da direcao de imagem
app.post('/api/imagem', exigeLogin, async (req, res) => {
  const { descricao, tipo, layout, contexto } = req.body || {};
  try {
    const arquivo = await imagens.gerar({ descricao, tipo, layout, contexto });
    res.json({ ok: true, imagem: arquivo, url: '/' + arquivo });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Gera de uma vez todas as laminas do meio que ainda nao tem imagem
app.post('/api/carrosseis/:id/imagens', exigeLogin, async (req, res) => {
  const c = db.prepare('SELECT * FROM carrosseis WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ erro: 'Nao encontrado.' });
  const slides = JSON.parse(c.slides || '[]');
  const refazer = !!(req.body && req.body.refazer);

  const alvos = slides.map((s, i) => ({ s, i }))
    .filter(({ s }) => imagens.geraImagem(c.layout, s.tipo))
    .filter(({ s }) => refazer || !s.imagem);

  const resultados = await Promise.all(alvos.map(async ({ s, i }) => {
    try {
      const arquivo = await imagens.gerar({
        descricao: s.imagem_ideia, tipo: s.tipo, layout: c.layout,
        contexto: [s.titulo, s.corpo].filter(Boolean).join('. '),
      });
      return { i, imagem: arquivo };
    } catch (e) {
      return { i, erro: e.message };
    }
  }));

  for (const r of resultados) if (r.imagem) slides[r.i].imagem = r.imagem;
  db.prepare('UPDATE carrosseis SET slides = ?, atualizado_em = ? WHERE id = ?')
    .run(JSON.stringify(slides), new Date().toISOString(), c.id);

  res.json({
    ok: true, slides,
    geradas: resultados.filter(r => r.imagem).length,
    erros: resultados.filter(r => r.erro).map(r => `slide ${r.i + 1}: ${r.erro}`),
  });
});

// Baixa o carrossel inteiro em um zip, com a legenda junto
app.get('/api/carrosseis/:id/zip', exigeLogin, (req, res) => {
  const { execFileSync } = require('child_process');
  const id = Number(req.params.id);
  const pasta = path.join(__dirname, 'saidas', String(id));
  if (!fs.existsSync(pasta)) return res.status(404).json({ erro: 'Exporte as imagens primeiro.' });

  const c = db.prepare('SELECT tema, legenda, roteiro, formato, duracao FROM carrosseis WHERE id = ?').get(id);

  // O nome do arquivo diz o que ele é: live-25-o-teto-que-trava.zip
  const apelido = (t) => String(t || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 45).replace(/-+$/, '');
  const tipo = (c && c.formato) || 'carrossel';
  const miolo = apelido(c && c.tema);
  const nomeZip = [tipo, id, miolo].filter(Boolean).join('-') + '.zip';
  const zip = path.join(__dirname, 'saidas', nomeZip);
  const legenda = path.join(pasta, 'legenda.txt');

  try {
    try { fs.unlinkSync(zip); } catch (e) {}
    // A legenda viaja junto, pronta para copiar e colar
    fs.writeFileSync(legenda, ((c && c.legenda) || '').trim() + '\n', 'utf8');

    // Live: o roteiro em topicos, para ela conduzir olhando de canto de olho
    if (c && c.formato === 'live' && c.roteiro) {
      try {
        const r = JSON.parse(c.roteiro);
        fs.writeFileSync(path.join(pasta, 'youtube.txt'),
          `TÍTULO\n${c.tema || ''}\n\nDESCRIÇÃO\n${descricaoYoutube(c, r)}\n`, 'utf8');
        const texto = [
          `ROTEIRO DA LIVE${c.duracao ? ' (' + c.duracao + ' minutos)' : ''}`,
          c.tema ? c.tema : '', '',
          (r.nomes_sugeridos || []).length ? 'NOMES SUGERIDOS' : '',
          ...(r.nomes_sugeridos || []).map((n, i) => `  ${i + 1}. ${n.nome}${n.gancho ? '\n     ' + n.gancho : ''}`),
          (r.nomes_sugeridos || []).length ? '' : '',
          r.fio ? 'O QUE VAI ACONTECER\n' + r.fio + '\n' : '',
          (r.pontos_principais || []).length ? 'O QUE A LIVE ENTREGA' : '',
          ...(r.pontos_principais || []).map(t => `  • ${t}`),
          (r.pontos_principais || []).length ? '' : '',
          ...(r.blocos || []).map(b => [
            `[${b.tempo}] ${b.rotulo || ''}`.trim(),
            b.abre ? `ABRE: ${b.abre}` : '',
            ...(b.topicos || []).map(t => `  • ${t}`),
            b.virada ? `VIRADA: ${b.virada}` : '',
            b.interacao ? `CHAT: ${b.interacao}` : '',
            b.retencao ? `RETENÇÃO: ${b.retencao}` : '',
            '',
          ].filter(Boolean).join('\n')),
          (r.perguntas_previstas || []).length ? 'PERGUNTAS PREVISTAS' : '',
          ...(r.perguntas_previstas || []).map(p => `  ? ${p.pergunta}\n    ${p.resposta || ''}`),
        ].filter(Boolean).join('\n');
        fs.writeFileSync(path.join(pasta, 'roteiro.txt'), texto, 'utf8');
      } catch (e) {}
    }

    // Reels: o roteiro vai junto, pronto para ler na hora de gravar
    if (c && c.formato === 'reels' && c.roteiro) {
      try {
        const r = JSON.parse(c.roteiro);
        const texto = [
          `ROTEIRO DO REELS${c.duracao ? ' (' + c.duracao + ' segundos)' : ''}`,
          c.tema ? `Tema: ${c.tema}` : '', '',
          ...(r.blocos || []).map(b => [
            `[${b.tempo}] ${b.rotulo || ''}`.trim(),
            `FALA: ${b.fala || ''}`,
            b.tela ? `TELA: ${b.tela}` : '',
            b.camera ? `CÂMERA: ${b.camera}` : '',
            '',
          ].filter(Boolean).join('\n')),
        ].filter(Boolean).join('\n');
        fs.writeFileSync(path.join(pasta, 'roteiro.txt'), texto, 'utf8');
      } catch (e) {}
    }

    // Garante o JPEG tambem para o que foi exportado antes, quando ainda saia PNG
    const imagens = instagram.imagensDe(id);
    const arquivos = [
      ...imagens.map(f => path.join(pasta, f)),
      ...['legenda.txt', 'roteiro.txt', 'youtube.txt', 'capa-youtube.jpg']
        .map(f => path.join(pasta, f)).filter(f => fs.existsSync(f)),
    ];

    execFileSync('zip', ['-j', '-q', zip, ...arquivos]);
    res.download(zip, nomeZip);
  } catch (e) {
    res.status(500).json({ erro: 'Nao consegui montar o zip: ' + e.message });
  }
});

// Abre a pasta dos PNG no Finder (so faz sentido rodando local)
app.post('/api/carrosseis/:id/abrir-pasta', exigeLogin, (req, res) => {
  const { execFile } = require('child_process');
  const pasta = path.join(__dirname, 'saidas', String(Number(req.params.id)));
  if (!fs.existsSync(pasta)) return res.status(404).json({ erro: 'Exporte as imagens primeiro.' });
  if (process.platform !== 'darwin') return res.status(400).json({ erro: 'So funciona no Mac.' });
  execFile('open', [pasta], () => {});
  res.json({ ok: true });
});

// App (protegido)
app.get('/', (req, res) => {
  if (!(req.session && req.session.logado)) return res.redirect('/login');
  // Sem isto o navegador guarda o HTML antigo e a tela nunca atualiza
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});
// Sem cache no app: senão o navegador fica com uma versão velha depois de cada deploy
app.use(exigeLogin, express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: 0,
  setHeaders: (res, arquivo) => {
    if (/\.(js|css|html)$/.test(arquivo)) res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  },
}));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`CONTEUDO NEGOCIO ENXUTO rodando em http://localhost:${PORT}`);
});
