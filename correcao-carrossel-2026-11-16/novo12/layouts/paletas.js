// PALETAS — a pele dos layouts. Todas dentro da Linha Aliança.
// O layout diz ONDE as coisas ficam. A paleta diz DE QUE COR elas são.
// Tokens semânticos: o layout nunca cita uma cor, só o papel que ela cumpre.

const PALETAS = {
  clara: {
    nome: 'Clara',
    amostra: '#F2EDE3',
    escura: false,
    tokens: {
      fundo: '#F2EDE3', fundo2: '#E9E2D4', halo: '#FBF8F2', cartao: '#FBF8F2', papel: '#FBF8F2',
      tinta: '#122027', titulo: '#1A3E46', secundaria: '#245258',
      bloco: '#1A3E46', sobreBloco: '#FBF8F2',
      acento: '#CFBE96', ouro: '#B8935A', apoio: '#AC816B',
      borda: '#EAE2D2',
    },
  },
  areia: {
    nome: 'Areia',
    amostra: '#E9E2D4',
    escura: false,
    tokens: {
      fundo: '#E9E2D4', fundo2: '#DFD6C4', halo: '#F6F1E7', cartao: '#F6F1E7', papel: '#F6F1E7',
      tinta: '#1C1A18', titulo: '#245258', secundaria: '#AC816B',
      bloco: '#AC816B', sobreBloco: '#FBF8F2',
      acento: '#CFBE96', ouro: '#B8935A', apoio: '#245258',
      borda: '#DCD0B8',
    },
  },
  kraft: {
    nome: 'Kraft',
    amostra: '#DFD2B4',
    escura: false,
    tokens: {
      fundo: '#DFD2B4', fundo2: '#CFBE96', halo: '#EDE4CE', cartao: '#F3EDDD', papel: '#F3EDDD',
      tinta: '#122027', titulo: '#1A3E46', secundaria: '#245258',
      bloco: '#1A3E46', sobreBloco: '#F3EDDD',
      acento: '#B8935A', ouro: '#8F6F3C', apoio: '#AC816B',
      borda: '#C9B78E',
    },
  },
  petrol: {
    nome: 'Petróleo',
    amostra: '#1A3E46',
    escura: true,
    tokens: {
      fundo: '#1A3E46', fundo2: '#153840', halo: '#2B656D', cartao: '#245258', papel: '#1A3E46',
      tinta: '#EFEDE7', titulo: '#FBF8F2', secundaria: '#CFBE96',
      bloco: '#CFBE96', sobreBloco: '#122027',
      acento: '#C9A96E', ouro: '#C9A96E', apoio: '#CFBE96',
      borda: '#2B656D',
    },
  },
  escura: {
    nome: 'Escura',
    amostra: '#122027',
    escura: true,
    tokens: {
      fundo: '#122027', fundo2: '#0C171C', halo: '#2B656D', cartao: '#17323A', papel: '#122027',
      tinta: '#EFEDE7', titulo: '#FBF8F2', secundaria: '#CFBE96',
      bloco: '#CFBE96', sobreBloco: '#122027',
      acento: '#C9A96E', ouro: '#C9A96E', apoio: '#CFBE96',
      borda: '#245258',
    },
  },
};

const PADRAO = 'clara';

// As cores nascem como a Linha Aliança, mas cada uma pode trocar pelas suas.
// O que a pessoa salvar fica no banco e passa a valer no lugar do padrão.
let db = null;
try { db = require('../db'); } catch (e) {}

function guardadas() {
  if (!db) return null;
  try {
    const l = db.prepare("SELECT valor FROM config WHERE chave = 'paletas'").get();
    if (!l || !l.valor) return null;
    const p = JSON.parse(l.valor);
    return (p && typeof p === 'object') ? p : null;
  } catch (e) { return null; }
}

function todas() {
  const minhas = guardadas();
  if (!minhas) return PALETAS;
  const juntas = {};
  for (const [id, p] of Object.entries(PALETAS)) {
    const m = minhas[id];
    juntas[id] = m ? { ...p, ...m, tokens: { ...p.tokens, ...(m.tokens || {}) } } : p;
  }
  return juntas;
}

function salvar(novas) {
  if (!db) throw new Error('Banco indisponível.');
  const limpo = {};
  for (const [id, p] of Object.entries(novas || {})) {
    if (!PALETAS[id]) continue;
    limpo[id] = {
      nome: String(p.nome || PALETAS[id].nome).slice(0, 24),
      amostra: cor(p.amostra) || PALETAS[id].amostra,
      escura: !!p.escura,
      tokens: {},
    };
    for (const chave of Object.keys(PALETAS[id].tokens)) {
      limpo[id].tokens[chave] = cor((p.tokens || {})[chave]) || PALETAS[id].tokens[chave];
    }
  }
  db.prepare(`INSERT INTO config (chave, valor) VALUES ('paletas', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`).run(JSON.stringify(limpo));
}

function restaurar() {
  if (db) db.prepare("DELETE FROM config WHERE chave = 'paletas'").run();
}

// So aceita cor em hexadecimal, para ninguem quebrar o layout sem querer
function cor(v) {
  const t = String(v || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(t) ? t : null;
}

function paleta(id) {
  const t = todas();
  return t[id] || t[PADRAO];
}

// Bloco :root com os tokens da paleta escolhida
function raiz(id) {
  const t = paleta(id).tokens;
  return `:root{
    --fundo:${t.fundo}; --fundo2:${t.fundo2}; --halo:${t.halo}; --cartao:${t.cartao};
    --tinta:${t.tinta}; --titulo:${t.titulo}; --secundaria:${t.secundaria};
    --papel:${t.papel}; --bloco:${t.bloco}; --sobre-bloco:${t.sobreBloco};
    --acento:${t.acento}; --ouro:${t.ouro}; --apoio:${t.apoio}; --borda:${t.borda};
  }`;
}

function lista() {
  return Object.entries(todas()).map(([id, p]) => ({
    id, nome: p.nome, amostra: p.amostra, escura: !!p.escura,
  }));
}

// O que a tela de Identidade Visual mostra para editar
function paraEditar() {
  const atuais = todas();
  return Object.entries(atuais).map(([id, p]) => ({
    id, nome: p.nome, amostra: p.amostra, escura: !!p.escura,
    tokens: p.tokens,
    padrao: PALETAS[id].tokens,
    personalizada: JSON.stringify(p.tokens) !== JSON.stringify(PALETAS[id].tokens),
  }));
}

// ─── Montar as cinco paletas a partir das cores da marca ───
// A pessoa informa quatro cores e o app distribui pelos papeis de cada paleta.

function clarear(hex, quanto) { return mexer(hex, quanto); }
function escurecer(hex, quanto) { return mexer(hex, -quanto); }

function mexer(hex, quanto) {
  const n = parseInt(String(hex).slice(1), 16);
  const canais = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const novo = quanto > 0 ? v + (255 - v) * quanto : v * (1 + quanto);
    return Math.max(0, Math.min(255, Math.round(novo)));
  });
  return '#' + canais.map(v => v.toString(16).padStart(2, '0')).join('');
}

// Preto ou branco por cima, o que enxergar melhor
function contraste(fundo, claro, escuro) {
  const n = parseInt(String(fundo).slice(1), 16);
  const luz = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luz > 0.55 ? escuro : claro;
}

function montar({ escura, clara, acento, apoio }) {
  const ok = (v) => cor(v);
  const E = ok(escura), C = ok(clara), A = ok(acento), P = ok(apoio) || A;
  if (!E || !C || !A) throw new Error('Preciso de pelo menos três cores: a escura, a clara e o acento.');

  const claroSobre = clarear(C, 0.55);
  const escuroSobre = escurecer(E, 0.35);

  const base = (fundo, tinta, bloco) => ({
    fundo,
    fundo2: contraste(fundo, clarear(fundo, .10), escurecer(fundo, .08)),
    halo: contraste(fundo, clarear(fundo, .22), clarear(fundo, .10)),
    cartao: contraste(fundo, clarear(fundo, .30), clarear(fundo, .06)),
    papel: fundo,
    tinta,
    titulo: contraste(fundo, clarear(tinta, .30), tinta),
    secundaria: contraste(fundo, A, escurecer(tinta, -0.25)),
    bloco,
    sobreBloco: contraste(bloco, claroSobre, escuroSobre),
    acento: A,
    ouro: A,
    apoio: P,
    borda: contraste(fundo, clarear(fundo, .18), escurecer(fundo, .12)),
  });

  return {
    clara:   { nome: 'Clara',   amostra: C, escura: false, tokens: base(C, escuroSobre, E) },
    areia:   { nome: 'Areia',   amostra: escurecer(C, .07), escura: false,
               tokens: { ...base(escurecer(C, .07), escuroSobre, P), acento: A, ouro: escurecer(A, .15) } },
    kraft:   { nome: 'Kraft',   amostra: clarear(A, .42), escura: false,
               tokens: base(clarear(A, .42), escuroSobre, E) },
    petrol:  { nome: 'Petróleo', amostra: E, escura: true,
               tokens: { ...base(E, claroSobre, A), sobreBloco: contraste(A, claroSobre, escuroSobre) } },
    escura:  { nome: 'Escura',  amostra: escurecer(E, .35), escura: true,
               tokens: { ...base(escurecer(E, .35), claroSobre, A), sobreBloco: contraste(A, claroSobre, escuroSobre) } },
  };
}

// Entende o que a pessoa colar: um JSON, uma lista de cores, ou texto solto com hex dentro
function interpretar(texto) {
  const bruto = String(texto || '').trim();
  if (!bruto) throw new Error('Cole as cores da sua identidade visual.');

  // 1. Um JSON com as cinco paletas inteiras
  try {
    const j = JSON.parse(bruto);
    if (j && typeof j === 'object') {
      if (Object.keys(PALETAS).some(id => j[id] && j[id].tokens)) return { paletas: j };
      const nomes = { escura: j.escura || j.primaria || j.principal, clara: j.clara || j.fundo,
                      acento: j.acento || j.destaque, apoio: j.apoio || j.secundaria };
      if (nomes.escura && nomes.clara && nomes.acento) return { marca: nomes };
    }
  } catch (e) { /* nao era JSON, segue */ }

  // 2. Rotulos escritos junto das cores
  const achar = (rotulos) => {
    for (const r of rotulos) {
      const m = bruto.match(new RegExp(r + '[^#]{0,40}(#[0-9a-fA-F]{6})', 'i'));
      if (m) return m[1];
    }
    return null;
  };
  const marca = {
    escura: achar(['escura', 'principal', 'primária', 'primaria']),
    clara: achar(['clara', 'fundo', 'papel']),
    acento: achar(['acento', 'destaque', 'realce']),
    apoio: achar(['apoio', 'secundária', 'secundaria']),
  };
  if (marca.escura && marca.clara && marca.acento) return { marca };

  // 3. So as cores soltas, na ordem em que aparecem
  const cores = (bruto.match(/#[0-9a-fA-F]{6}/g) || []);
  if (cores.length >= 3) {
    return { marca: { escura: cores[0], clara: cores[1], acento: cores[2], apoio: cores[3] || cores[2] } };
  }

  throw new Error('Não encontrei pelo menos três cores em hexadecimal aí dentro.');
}

module.exports = { PALETAS, PADRAO, paleta, raiz, lista, todas, salvar, restaurar, paraEditar, montar, interpretar };
