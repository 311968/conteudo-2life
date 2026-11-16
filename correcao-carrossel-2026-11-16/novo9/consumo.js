// CONSUMO DE IA (16/11/2026)
// Regista, em cada chamada a Anthropic, so dados de consumo: geracao, formato, etapa, modelo, tokens e custo estimado.
// Nunca guarda chaves, prompts nem textos dos conteudos.
// O valor e uma ESTIMATA a partir da tabela de precos abaixo; o valor faturado e o da consola da Anthropic.
const { AsyncLocalStorage } = require('async_hooks');
const crypto = require('crypto');
const db = require('./db');

db.exec(`CREATE TABLE IF NOT EXISTS consumo_ia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  geracao TEXT NOT NULL,
  carrossel_id INTEGER,
  formato TEXT,
  etapa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  tokens_entrada INTEGER NOT NULL DEFAULT 0,
  tokens_saida INTEGER NOT NULL DEFAULT 0,
  tokens_cache_escrita INTEGER NOT NULL DEFAULT 0,
  tokens_cache_leitura INTEGER NOT NULL DEFAULT 0,
  custo_usd REAL NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL
)`);
db.exec('CREATE INDEX IF NOT EXISTS consumo_ia_carrossel ON consumo_ia (carrossel_id)');
db.exec('CREATE INDEX IF NOT EXISTS consumo_ia_geracao ON consumo_ia (geracao)');

// Precos da Anthropic em dolares por milhao de tokens (tabela de 03/11/2026).
// Cache: escrita a 1,25x e leitura a 0,1x da entrada (a app hoje nao usa cache; fica registado se vier a usar).
const PRECOS = {
  'claude-sonnet-5': { entrada: 2, saida: 10 },
  'claude-sonnet-5-5': { entrada: 2, saida: 10 },
  'claude-opus-5-5': { entrada: 4, saida: 20 },
  'claude-haiku-5-5': { entrada: 0.1, saida: 0.5 },
};

// Etapa pela ferramenta que cada chamada usa (ia.js)
const ETAPAS = {
  entregar_carrossel: 'Escrever o carrossel',
  entregar_lamina: 'Reescrever lâmina',
  entregar_posts: 'Escrever o post',
  entregar_ganchos: 'Aberturas do reel',
  entregar_roteiro: 'Guião do reel',
  entregar_propostas: 'Propostas da live',
  entregar_roteiro_live: 'Guião da live',
  entregar_capas: 'Capas de vídeo',
  entregar_cores: 'Cores',
  devolver_textos: 'Revisão: acentos',
  devolver_frases: 'Revisão: linguagem',
  devolver_textos_peca: 'Revisão: legenda e CTA',
  devolver_falas: 'Revisão: duração do reel',
  devolver_genero: 'Revisão: género',
  devolver_construcao: 'Revisão: construção das frases',
};

const contexto = new AsyncLocalStorage();

function custo(modelo, u) {
  const p = PRECOS[modelo];
  if (!p) return 0;
  return ((u.input_tokens || 0) * p.entrada
    + (u.output_tokens || 0) * p.saida
    + (u.cache_creation_input_tokens || 0) * p.entrada * 1.25
    + (u.cache_read_input_tokens || 0) * p.entrada * 0.1) / 1e6;
}

const inserir = db.prepare(`INSERT INTO consumo_ia
  (geracao, carrossel_id, formato, etapa, modelo, tokens_entrada, tokens_saida, tokens_cache_escrita, tokens_cache_leitura, custo_usd, criado_em)
  VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

function registar(params, resposta) {
  const u = (resposta && resposta.usage) || {};
  const modelo = (resposta && resposta.model) || (params && params.model) || '?';
  const ferramenta = (params && params.tool_choice && params.tool_choice.name)
    || (params && Array.isArray(params.tools) && params.tools[0] && params.tools[0].name) || '';
  const c = contexto.getStore() || {};
  inserir.run(c.geracao || crypto.randomUUID(), c.carrosselId || null, c.formato || null,
    ETAPAS[ferramenta] || ferramenta || 'Outra', modelo,
    u.input_tokens || 0, u.output_tokens || 0, u.cache_creation_input_tokens || 0, u.cache_read_input_tokens || 0,
    custo(modelo, u), new Date().toISOString());
}

// Envolve o cliente da Anthropic: depois de cada resposta, regista o consumo. Um erro no registo nunca trava a geracao.
function envolver(client) {
  const original = client.messages.create.bind(client.messages);
  client.messages.create = async (params, opcoes) => {
    const r = await original(params, opcoes);
    try { registar(params, r); } catch (e) { console.warn('[consumo] não registado:', e.message); }
    return r;
  };
  return client;
}

// Cada pedido de geracao corre dentro de uma "geracao": todas as chamadas ficam agrupadas
function middleware(rotas) {
  return (req, res, next) => {
    if (req.method !== 'POST' || !rotas.includes(req.path)) return next();
    const id = Number((req.body || {}).carrossel_id) || null;
    const formato = { '/api/gerar': 'carrossel', '/api/post/gerar': 'post', '/api/reels/ganchos': 'reels',
      '/api/reels/roteiro': 'reels', '/api/live/propostas': 'live', '/api/live/roteiro': 'live',
      '/api/reescrever-lamina': 'carrossel' }[req.path] || null;
    contexto.run({ geracao: crypto.randomUUID(), carrosselId: id, formato }, next);
  };
}

// Liga as chamadas desta geracao ao carrossel guardado
function ligar(carrosselId) {
  const c = contexto.getStore();
  if (!c || !carrosselId) return;
  c.carrosselId = carrosselId;
  db.prepare('UPDATE consumo_ia SET carrossel_id = ? WHERE geracao = ?').run(carrosselId, c.geracao);
}

// Totais por carrossel (lista de Conteudos) e detalhe por geracao
function totais() {
  const m = {};
  for (const r of db.prepare(`SELECT carrossel_id, COUNT(DISTINCT geracao) geracoes, SUM(custo_usd) custo
    FROM consumo_ia WHERE carrossel_id IS NOT NULL GROUP BY carrossel_id`).all()) m[r.carrossel_id] = r;
  return m;
}
function detalhe(carrosselId) {
  const linhas = db.prepare(`SELECT geracao, etapa, modelo, tokens_entrada, tokens_saida, custo_usd, criado_em
    FROM consumo_ia WHERE carrossel_id = ? ORDER BY id`).all(carrosselId);
  const g = new Map();
  for (const l of linhas) {
    if (!g.has(l.geracao)) g.set(l.geracao, { inicio: l.criado_em, etapas: [], tokens_entrada: 0, tokens_saida: 0, custo_usd: 0 });
    const x = g.get(l.geracao);
    x.etapas.push({ etapa: l.etapa, modelo: l.modelo, tokens_entrada: l.tokens_entrada, tokens_saida: l.tokens_saida, custo_usd: l.custo_usd });
    x.tokens_entrada += l.tokens_entrada; x.tokens_saida += l.tokens_saida; x.custo_usd += l.custo_usd;
  }
  return [...g.values()];
}

module.exports = { envolver, middleware, ligar, totais, detalhe, registar, contexto, custo, PRECOS, ETAPAS };
