// Camada de IA: Claude escreve o carrossel, Gemini transcreve o audio.
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db');
const estrategia = require('./estrategia');
const reels = require('./reels');
const live = require('./live');

function chave(nome, padraoEnv) {
  const linha = db.prepare('SELECT valor FROM config WHERE chave = ?').get(nome);
  return (linha && linha.valor) || process.env[padraoEnv] || '';
}

// ---------- TRANSCRICAO (Gemini) ----------
const { execFileSync } = require('child_process');
const os = require('os');

// O Gemini so aceita alguns formatos. O navegador grava webm, que nao esta na lista.
// Entao tudo que chega vira mp3 antes de subir.
// Acha o ffmpeg onde ele estiver: no Mac dela, na VPS, ou onde o .env apontar
function acharFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  const candidatos = [
    path.join(process.env.HOME || '', 'bin', 'ffmpeg'),
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
  ];
  for (const c of candidatos) {
    try { if (c && fs.existsSync(c)) return c; } catch (e) {}
  }
  // ultimo recurso: deixa o sistema resolver pelo PATH
  return 'ffmpeg';
}
const FFMPEG = acharFfmpeg();

function paraMp3(entrada) {
  const saida = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);
  execFileSync(FFMPEG, ['-y', '-i', entrada, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '64k', saida],
    { stdio: 'pipe' });
  return saida;
}

async function transcrever(caminhoArquivo, mime) {
  const key = chave('gemini_api_key', 'GEMINI_API_KEY');
  if (!key) throw new Error('Falta a chave do Gemini em Configuracoes.');

  let arquivo = caminhoArquivo, temporario = null;
  try {
    temporario = paraMp3(caminhoArquivo);
    arquivo = temporario;
  } catch (e) {
    throw new Error('Não consegui converter o áudio (ffmpeg em "' + FFMPEG + '"): ' + String(e.message).slice(0, 160));
  }

  try {
    const b64 = fs.readFileSync(arquivo).toString('base64');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`;
    const corpo = {
      contents: [{
        parts: [
          { text: 'Transcreva este audio em portugues de Portugal (europeu), na integra, sem resumir e sem comentar. Devolva apenas o texto falado, com pontuacao e acentuacao corretas. Nunca use travessao.' },
          { inline_data: { mime_type: 'audio/mp3', data: b64 } },
        ],
      }],
    };
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    if (!r.ok) throw new Error('Gemini respondeu ' + r.status + ': ' + (await r.text()).slice(0, 300));
    const j = await r.json();
    const texto = j?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!texto.trim()) throw new Error('O Gemini nao devolveu texto. Tente um audio mais curto.');
    return texto.trim();
  } finally {
    if (temporario) { try { fs.unlinkSync(temporario); } catch (e) {} }
  }
}


// ---------- REVISAO DE ACENTO ----------
// O modelo espelha o texto que recebe: se o pedido vem sem acento, ele responde sem acento.
// Este passo so roda quando o resultado realmente vem sem acentuacao.
const SUSPEITAS = /\b(nao|voce|voces|negocio|negocios|atencao|reputacao|decisao|metodo|tambem|ja|so|esta|estao|sao|mes|apos|porem|alem|proprio|propria|ninguem|alguem|dificil|possivel|necessario|estrategia|licao|licoes|opiniao|producao|operacao|gestao|relatorio|agencia|experiencia|consciencia|audiencia|conteudo|video|videos|ultimo|ultima|unico|unica|historia|obvio|logica|pratica|publico|saida|saidas|ate|apoio|criterio|servico|servicos|preco|comeca|comecar|cabeca|coracao|licao)\b/i;

function textosDoJson(json) {
  const lista = [];
  const andar = (o) => {
    if (Array.isArray(o)) return o.forEach(andar);
    if (o && typeof o === 'object') return Object.values(o).forEach(andar);
    if (typeof o === 'string' && o.trim()) lista.push(o);
  };
  andar(json);
  return lista;
}

function faltaAcento(json) {
  const textos = textosDoJson(json);
  const suspeitos = textos.filter(t => SUSPEITAS.test(t)).length;
  return suspeitos >= 2;
}

async function corrigirSoAcentos(json, client) {
  if (!faltaAcento(json)) return json;

  const textos = textosDoJson(json);
  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 6000,
    system: 'Voce e revisor de portugues de Portugal (europeu). Sua unica tarefa e devolver os mesmos textos com a acentuacao e a ortografia corretas. Nao reescreva, nao resuma, nao mude palavra nenhuma, nao mude a pontuacao, nao troque a ordem. Apenas acentue o que precisa de acento, cedilha ou til. Devolva exatamente a mesma quantidade de textos, na mesma ordem.',
    tools: [{
      name: 'devolver_textos',
      description: 'Devolve os textos revisados, na mesma ordem.',
      input_schema: {
        type: 'object',
        properties: { textos: { type: 'array', items: { type: 'string' } } },
        required: ['textos'],
      },
    }],
    tool_choice: { type: 'tool', name: 'devolver_textos' },
    messages: [{ role: 'user', content: JSON.stringify(textos) }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  const revisados = uso && uso.input && uso.input.textos;
  if (!Array.isArray(revisados) || revisados.length !== textos.length) return json;

  // Troca posicao a posicao, na mesma ordem em que foram lidos
  let n = 0;
  const repor = (o) => {
    if (Array.isArray(o)) return o.map(repor);
    if (o && typeof o === 'object') {
      const novo = {};
      for (const k of Object.keys(o)) novo[k] = repor(o[k]);
      return novo;
    }
    if (typeof o === 'string' && o.trim()) return revisados[n++];
    return o;
  };
  return repor(json);
}

// ---------- REVISAO DE LINGUAGEM 2Life (proposta de 15/11/2026) ----------
// Corre no fim de cada geracao, depois dos acentos. Primeiro procura, sem IA, as frases com problemas
// (regras da Hierarquia §5 e da Matriz de Comunicacao). So se encontrar alguma, pede a IA que reescreva
// APENAS essas frases. Sem problemas, nao ha pedido extra nem custo.
// Limites de palavra que reconhecem letras acentuadas (o \b do JavaScript nao as reconhece).
// String.raw guarda as barras invertidas tal como estão escritas.
const I = String.raw`(?<![\p{L}\d])`;
const F = String.raw`(?![\p{L}\d])`;
const pal = (corpo) => new RegExp(I + '(?:' + corpo + ')' + F, 'iu');
const PRATICA = 'ouço|oiço|vejo|recebo|acompanho|atendo|escuto';
const FREQ = 'todas as semanas|todos os dias|todas as sessões|quase sempre|tantas vezes|muitas vezes|vezes sem conta';
const REGRAS_LINGUAGEM = [
  { re: pal('talvez'), regra: 'tem "talvez": afirma com clareza ou retira a hesitação' },
  { re: pal('às vezes'), regra: 'tem "às vezes": substitui por uma formulação concreta (por exemplo "há dias em que", "quando")' },
  { re: pal('algo'), regra: 'tem "algo": nomeia a coisa concreta de que se fala' },
  { re: /[—–]/u, regra: 'tem travessão: usa vírgula, dois pontos ou ponto final' },
  { re: pal('vocês?'), regra: 'tem "você": trata a pessoa por "tu"' },
  // Formas com genero dirigidas a pessoa, no feminino ou no masculino (quarta ronda: tambem "seres", "estares")
  { re: pal(String.raw`(?:és|estás|ficas|ficaste|foste|estavas|eras|seres|estares|ficares|sentes-te|sentiste-te|sentires-te|te sentes|te sentiste)(?:\s+(?:tão|muito|mais|sempre|logo|já|outra vez))?\s+(?!(?:uma|minha|tua|sua|nossa|toda|outra|pessoa|um|meu|teu|seu|nosso|todo|outro)` + F + String.raw`)\p{L}*(?:ada|ida|osa|inha|esa|usta|ado|ido|oso|inho|usto)`),
    regra: 'fala com a pessoa só num género: o público inclui homens e mulheres; reescreve sem marca de género (por exemplo "não tens de", "sem companhia", "de te desiludirem")' },
  // Numeros e frequencias sobre a pratica da Simone (nao apanha "repete isto todos os dias")
  { re: new RegExp(String.raw`\d+\s?%|` + I + '(?:' + PRATICA + ')' + F + '[^.!?]{0,40}' + I + '(?:' + FREQ + ')' + F + '|'
      + I + '(?:' + FREQ + ')' + F + '[^.!?]{0,40}' + I + '(?:' + PRATICA + ')' + F + '|'
      + I + '(?:a maioria|muitas|imensas) (?:das pessoas|pessoas|clientes|alunas?|alunos) (?:que|com quem) (?:acompanho|atendo|recebo)' + F + '|'
      + I + String.raw`\d+ (?:pessoas|clientes|alunas?|alunos|casos|sessões)` + F, 'iu'),
    regra: 'afirma um número ou uma frequência que não foi dado: retira esse dado e mantém a ideia sem quantificar' },
  // Experiencia em sessao afirmada (a R3 usa so o molde "Quando alguem me diz", que nao e apanhado)
  { re: new RegExp(I + '(?:' + PRATICA + '|ouvi|vi)' + F + '[^.!?]{0,40}' + I + '(?:em sessão|nas sessões|no consultório|nas minhas sessões)' + F + '|'
      + I + '(?:em sessão|nas sessões|no consultório|nas minhas sessões)' + F + '[^.!?]{0,40}' + I + '(?:' + PRATICA + '|ouvi|vi)' + F, 'iu'),
    regra: 'afirma o que a Simone ouve ou vê em sessão, um dado que não foi dado: retira essa afirmação e mantém a ideia' },
  // Grafia e construcoes do Brasil (quarta ronda, 15/11/2026)
  { re: pal(String.raw`decepç\p{L}*|decepcion\p{L}*|contatos?|registros?|equipes?|celulares?|planej\p{L}*|ônibus|cardápios?|xícaras?|banheiros?|geladeiras?|esportes?|café da manhã|tela do celular`),
    regra: 'tem uma grafia ou palavra do Brasil: escreve como em Portugal (por exemplo dececionar, deceção, contacto, registo, equipa, telemóvel, planear)' },
  { re: pal(String.raw`(?:estou|estás|está|estamos|estão|estava|estavas|fico|ficas|fica|ando|andas|anda|continuo|continuas|continua)\s+\p{L}+ndo`),
    regra: 'usa o gerúndio do Brasil ("estás fazendo"): escreve como em Portugal ("estás a fazer")' },
  // Hifen em falta ou pronome antes do verbo a maneira do Brasil ("chama se", "a pessoa se sente")
  { re: new RegExp(I + String.raw`(?!(?:que|não|já|também|como|onde|quando|porque|se|nunca|sempre|ainda|mais|só|quem|ninguém|alguém|tudo|isto|isso|nada|cada|bem|mal|logo|e|ou|mas|nem|de|em|por|para|com|sem|qualquer|todo|toda|muito|pouco|tanto|assim|lhe|me|te|nos|eu|tu|ele|ela)` + F + String.raw`)\p{L}+[aeo]m?\s(?:se|me|te)\s+[*"“'(]*\p{L}{2,}`, 'iu'),
    regra: 'tem o pronome antes do verbo à maneira do Brasil ou falta o hífen ("chama se", "a pessoa se sente"): escreve como em Portugal ("chama-se", "a pessoa sente-se")' },
];

// Frases protegidas (Hierarquia §7): a revisao nunca as pode alterar
const PROTEGIDAS = [
  'Toda a dificuldade em expandir revela um afastamento da essência.',
  'A confiança constrói-se na raiz.',
  'O 2Life transforma aquilo que já sabes sobre ti na confiança para te posicionares, agires e expandires a partir de quem és.',
  'O automático reage. A essência escolhe. A ação cria evidência. A repetição transforma a identidade.',
];
const protegidasEm = (t) => PROTEGIDAS.filter(f => t.includes(f));

function problemasDe(texto) {
  return REGRAS_LINGUAGEM.filter(r => r.re.test(texto)).map(r => r.regra);
}

async function reverLinguagem(json, client) {
  const textos = textosDoJson(json);
  const marcados = [];
  textos.forEach((t, i) => { const p = problemasDe(t); if (p.length) marcados.push({ i, texto: t, problemas: p }); });
  if (!marcados.length) return json;

  let r;
  try {
    r = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 6000,
      system: 'És revisora de linguagem da marca 2Life, em português de Portugal. Recebes frases de um conteúdo já escrito, cada uma com os problemas encontrados. Reescreve cada frase só o necessário para resolver esses problemas: mantém o sentido, o tom, o tamanho aproximado, a pessoa gramatical ("tu") e tudo o que não tem problema. Não acrescentes ideias, números, exemplos nem casos. Não uses travessões. Se a frase contiver uma destas frases protegidas, mantém-na literalmente, sem mudar uma palavra: ' + PROTEGIDAS.map(f => `"${f}"`).join(' ') + ' Devolve exatamente o mesmo número de frases, pela mesma ordem.',
      tools: [{
        name: 'devolver_frases',
        description: 'Devolve as frases revistas, pela mesma ordem.',
        input_schema: {
          type: 'object',
          properties: { frases: { type: 'array', items: { type: 'string' } } },
          required: ['frases'],
        },
      }],
      tool_choice: { type: 'tool', name: 'devolver_frases' },
      messages: [{ role: 'user', content: JSON.stringify(marcados.map(m => ({ frase: m.texto, problemas: m.problemas }))) }],
    });
  } catch (e) {
    console.warn('[revisao] pedido falhou, fica o texto original:', e.message);
    return json;
  }

  const uso = r.content.find(b => b.type === 'tool_use');
  const frases = uso && uso.input && uso.input.frases;
  if (!Array.isArray(frases) || frases.length !== marcados.length) return json;

  const novos = textos.slice();
  marcados.forEach((m, k) => {
    const f = frases[k];
    if (typeof f !== 'string' || !f.trim()) return;
    // Se a revisao mexeu numa frase protegida, fica o texto original
    if (protegidasEm(m.texto).some(p => !f.includes(p))) { console.warn('[revisao] frase protegida alterada; fica o original'); return; }
    novos[m.i] = f;
  });
  const resta = novos.filter(t => problemasDe(t).length).length;
  if (resta) console.warn(`[revisao] ${resta} frase(s) continuam com problemas depois da revisão`);

  // Troca posicao a posicao, na mesma ordem em que foram lidos (igual aos acentos)
  let n = 0;
  const repor = (o) => {
    if (Array.isArray(o)) return o.map(repor);
    if (o && typeof o === 'object') {
      const novo = {};
      for (const k of Object.keys(o)) novo[k] = repor(o[k]);
      return novo;
    }
    if (typeof o === 'string' && o.trim()) return novos[n++];
    return o;
  };
  return repor(json);
}

// ---------- REVISAO DA PECA (quarta ronda, 15/11/2026) ----------
// Legenda (Livro §16): a primeira linha acrescenta uma ideia e nao repete a peca.
// Um so CTA editorial: o primeiro comentario nunca e outro CTA.
const VAZIAS = new Set(('a o as os um uma uns umas e é de da do das dos em no na nos nas que se não já mais por para com sem ao à aos às '
  + 'te ti tu teu tua teus tuas me mim eu ele ela isto isso aquilo este esta esse essa foi ser ter tem estás estou está como quando '
  + 'porque mas ou nem lhe lhes sua seu sobre entre ainda muito alguma algum alguém coisa coisas tudo nada cada depois antes '
  + 'outra outro sempre também quem onde então assim aqui agora').split(' '));
const radicais = (t) => new Set((String(t || '').toLowerCase().match(/\p{L}+/gu) || [])
  .filter(w => w.length >= 4 && !VAZIAS.has(w)).map(w => w.slice(0, 5)));
// Parte das palavras principais da linha que ja aparece numa lamina ou num bloco (0 a 1)
function repete(linha, outros) {
  const a = radicais(linha);
  if (a.size < 3) return 0;
  let max = 0;
  for (const o of outros) {
    const b = radicais(o);
    let c = 0;
    for (const x of a) if (b.has(x)) c++;
    max = Math.max(max, c / a.size);
  }
  return max;
}
const REPETE_DEMAIS = 0.34;      // primeira linha da legenda contra cada bloco ou lamina
const REPETE_PARAGRAFO = 0.7;    // outros paragrafos contra a peca inteira (palavras do tema repetem-se naturalmente)

// A abertura escolhida entra literal no primeiro bloco do roteiro (Livro §6; regra "usa exatamente a fala")
function fixarAbertura(bruto, gancho) {
  if (!bruto || !Array.isArray(bruto.blocos) || !bruto.blocos.length || !gancho || !gancho.frase) return bruto;
  const b0 = { ...bruto.blocos[0], fala: gancho.frase };
  if (gancho.tela && !bruto.blocos[0].tela) b0.tela = gancho.tela;
  return { ...bruto, blocos: [b0, ...bruto.blocos.slice(1)] };
}
const CTA_COMENTARIO = pal('guarda|guardar|guardes|partilha|partilhar|envia|enviar|manda|mandar|marca|marcar|segue|seguir|clica|link|comenta|comentar|subscreve|inscreve|reserva|candidata');
const textoDaPeca = (json) => Array.isArray(json.blocos) ? json.blocos.map(b => b.fala || '')
  : Array.isArray(json.slides) ? json.slides.map(s => [s.titulo, s.subtitulo, s.corpo].filter(Boolean).join(' ').replace(/\*\*/g, '')) : [];

async function reverPeca(json, client) {
  if (!json || typeof json !== 'object' || typeof json.legenda !== 'string') return json;
  const peca = textoDaPeca(json);
  const pars = json.legenda.split('\n');
  const iPrim = pars.findIndex(p => p.trim());
  const pedidos = [];
  if (iPrim >= 0 && peca.length && repete(pars[iPrim], peca) >= REPETE_DEMAIS) {
    pedidos.push({ campo: 'primeira_linha', texto: pars[iPrim],
      problema: 'repete ou parafraseia a peça. Reescreve-a para acrescentar uma ideia que a peça não diz (outra situação reconhecível ligada ao mesmo mecanismo, ou o significado por trás dela), até 125 caracteres, sem repetir as palavras principais da peça.' });
  }
  // Paragrafos do meio que repetem frases da peca (quarta ronda). A ultima linha e o CTA e fica igual.
  const iUlt = pars.map(p => p.trim()).lastIndexOf(pars.filter(p => p.trim()).slice(-1)[0] || '');
  const tudoDaPeca = [peca.join(' ')];
  pars.forEach((p, i) => {
    if (!p.trim() || i === iPrim || i === iUlt || radicais(p).size < 4) return;
    if (repete(p, tudoDaPeca) >= REPETE_PARAGRAFO) {
      pedidos.push({ campo: 'paragrafo', i, texto: p,
        problema: 'repete uma frase da peça. Reescreve-o para aprofundar a mesma ideia com outras palavras ou para acrescentar o que a peça não diz, com o mesmo tamanho aproximado.' });
    }
  });
  if (typeof json.primeiro_comentario === 'string' && CTA_COMENTARIO.test(json.primeiro_comentario)) {
    pedidos.push({ campo: 'primeiro_comentario', texto: json.primeiro_comentario,
      problema: 'é outro CTA. Reescreve-o como uma pergunta curta que convida a pessoa a olhar para a própria experiência, sem pedir nenhuma ação.' });
  }
  if (!pedidos.length) return json;

  let r;
  try {
    r = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: 'És revisora editorial da marca 2Life, em português de Portugal, a tratar a pessoa por "tu". Recebes uma peça (vídeo ou carrossel), a sua legenda e um ou mais textos a reescrever, cada um com o problema. Reescreve só esses textos. Sem "algo", "talvez" ou "às vezes", sem travessões, sem números nem experiência em sessão que não estejam na peça, sem hashtags. Devolve os textos pela mesma ordem.',
      tools: [{
        name: 'devolver_textos_peca',
        description: 'Devolve os textos reescritos, pela mesma ordem.',
        input_schema: { type: 'object', properties: { textos: { type: 'array', items: { type: 'string' } } }, required: ['textos'] },
      }],
      tool_choice: { type: 'tool', name: 'devolver_textos_peca' },
      messages: [{ role: 'user', content: JSON.stringify({ peca: peca.join('\n'), legenda: json.legenda,
        reescrever: pedidos.map(p => ({ texto: p.texto, problema: p.problema })) }) }],
    });
  } catch (e) {
    console.warn('[revisao] pedido da peça falhou, fica o texto original:', e.message);
    return json;
  }
  const uso = r.content.find(b => b.type === 'tool_use');
  const textos = uso && uso.input && uso.input.textos;
  if (!Array.isArray(textos) || textos.length !== pedidos.length) return json;

  const novo = { ...json };
  pedidos.forEach((p, k) => {
    const t = typeof textos[k] === 'string' ? textos[k].trim() : '';
    if (!t) return;
    if (p.campo === 'primeira_linha') {
      if (repete(t, peca) >= REPETE_DEMAIS) console.warn('[revisao] a primeira linha da legenda continua perto da peça');
      pars[iPrim] = t;
      novo.legenda = pars.join('\n');
    } else if (p.campo === 'paragrafo') {
      if (repete(t, tudoDaPeca) >= REPETE_PARAGRAFO) console.warn('[revisao] um parágrafo da legenda continua a repetir a peça');
      pars[p.i] = t;
      novo.legenda = pars.join('\n');
    } else if (p.campo === 'primeiro_comentario') {
      if (CTA_COMENTARIO.test(t)) { console.warn('[revisao] o primeiro comentário continua a pedir uma ação'); return; }
      novo.primeiro_comentario = t;
    }
  });
  return novo;
}

// ---------- DURACAO DOS REELS (quarta ronda, 15/11/2026) ----------
// Metrica da app: 2,5 palavras por segundo, a ritmo calmo. Se a fala passar o limite, encurta os blocos do meio
// (a abertura escolhida e o CTA ficam iguais). No fim, os tempos dos blocos passam a ser os estimados.
const PALAVRAS_SEGUNDO = 2.5;
const palavras = (t) => (String(t || '').match(/[\p{L}\d]+(?:[-’'][\p{L}]+)*/gu) || []).length;

function marcarTempos(json) {
  let t = 0;
  const blocos = json.blocos.map(b => {
    const a = t;
    t += palavras(b.fala) / PALAVRAS_SEGUNDO;
    return { ...b, tempo: `${Math.round(a)}-${Math.round(t)}s` };
  });
  return { ...json, blocos, duracao_estimada: Math.round(t) };
}

async function ajustarReel(json, duracao, client) {
  if (!json || !Array.isArray(json.blocos) || json.blocos.length < 3) return json;
  const limite = Math.floor((Number(duracao) || 30) * PALAVRAS_SEGUNDO);
  let atual = json;
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const b = atual.blocos;
    const total = b.reduce((s, x) => s + palavras(x.fala), 0);
    if (total <= limite) break;
    const fixas = palavras(b[0].fala) + palavras(b[b.length - 1].fala);
    const meio = b.slice(1, -1);
    const somaMeio = total - fixas;
    const alvo = Math.floor(limite * 0.95) - fixas;
    if (alvo <= meio.length * 6) { console.warn('[revisao] a abertura e o CTA já ocupam quase todo o tempo'); break; }
    const metas = meio.map(x => Math.max(6, Math.floor(palavras(x.fala) * alvo / somaMeio)));
    let r;
    try {
      r = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 2500,
        system: 'Encurtas a fala de blocos de um reel da marca 2Life, em português de Portugal, a tratar a pessoa por "tu", para o vídeo caber no tempo. Cada bloco tem um máximo de palavras. Mantém a função de cada bloco (o rótulo) e o sentido; corta repetições e explicações a mais; não acrescentes nada. Frases protegidas ficam literais: ' + PROTEGIDAS.map(f => `"${f}"`).join(' ') + ' Sem "algo", "talvez", "às vezes" nem travessões. Devolve as falas pela mesma ordem.',
        tools: [{
          name: 'devolver_falas',
          description: 'Devolve as falas encurtadas, pela mesma ordem.',
          input_schema: { type: 'object', properties: { falas: { type: 'array', items: { type: 'string' } } }, required: ['falas'] },
        }],
        tool_choice: { type: 'tool', name: 'devolver_falas' },
        messages: [{ role: 'user', content: JSON.stringify(meio.map((x, i) => ({ rotulo: x.rotulo, fala: x.fala, max_palavras: metas[i] }))) }],
      });
    } catch (e) {
      console.warn('[revisao] pedido da duração falhou, fica o texto original:', e.message);
      break;
    }
    const uso = r.content.find(x => x.type === 'tool_use');
    const falas = uso && uso.input && uso.input.falas;
    if (!Array.isArray(falas) || falas.length !== meio.length) break;
    const blocos = b.map((x, i) => {
      if (i === 0 || i === b.length - 1) return x;
      const f = typeof falas[i - 1] === 'string' ? falas[i - 1].trim() : '';
      if (!f || protegidasEm(x.fala).some(p => !f.includes(p))) return x;
      return { ...x, fala: f };
    });
    atual = { ...atual, blocos };
  }
  atual = marcarTempos(atual);
  if (atual.duracao_estimada > Number(duracao || 30)) console.warn(`[revisao] o reel continua com cerca de ${atual.duracao_estimada} s`);
  return await reverLinguagem(atual, client);
}

async function corrigirAcentos(json, client) {
  return await reverPeca(await reverLinguagem(await corrigirSoAcentos(json, client), client), client);
}

// ---------- GERACAO DO CARROSSEL (Claude) ----------
function contexto() {
  const linhas = db.prepare('SELECT tipo, conteudo FROM identidade').all();
  const mapa = {};
  for (const l of linhas) mapa[l.tipo] = (l.conteudo || '').slice(0, 14000);
  return mapa;
}

function instrucoes(layoutId, marcacao) {
  layoutId = layoutId || 'layout1';
  const alvo = marcacao ? estrategia.bloco(marcacao) : '';
  const c = contexto();
  return `Voce escreve carrossel de Instagram para a autora descrita abaixo.

Escreva SEMPRE no tom dela. Estas sao as fontes oficiais.

## POSICIONAMENTO
${c.posicionamento || ''}

## PERSONA (para quem ela fala)
${c.persona || ''}

## TOM DE VOZ
${c.voz || ''}

## METODO
${c.metodologia || ''}

## PRODUTOS
${(c.produtos || '').slice(0, 6000)}

## PROVAS (os únicos casos reais que existem)
${c.provas || 'Nenhuma prova cadastrada.'}

Estes são os únicos casos reais que existem. Só podes contar um deles se estiver escrito aqui, sempre anonimizado. Se o conteúdo pedir um exemplo que não existe nesta lista, escreve sem exemplo. Inventar um caso, um número, uma frequência ou o que se passa em sessão é o erro mais grave possível.

${alvo}

${c.regras ? `# REGRAS DA MARCA (escritas por ela)\n${c.regras}\n` : ''}
# REGRAS INEGOCIÁVEIS

- Escreva em **português de Portugal (europeu), com acentuação completa e correta**. Trate a pessoa por "tu", nunca por "você": estás, sentes, a tua vida. Use construções de Portugal ("estás a fazer", não "está fazendo"; "ecrã", "telemóvel", "equipa"). Toda palavra que leva acento, cedilha ou til vai acentuada: negócio, lições, estás, não, própria, mês, três, coração, decisão. Isto vale inclusive quando o pedido chegar sem acento nenhum: você corrige e escreve certo. Texto sem acento é erro grave e não pode sair daqui.
- NUNCA use travessão em nenhum texto. Use vírgula, dois pontos ou parênteses.
- Nunca invente case, número ou depoimento. Só existe o que está nas provas.
- Frase curta. Uma ideia por lâmina. Adulto, direto, de igual para igual.

${(require('./layouts')[layoutId] || {}).INSTRUCOES || ''}

# SAIDA
Entregue pela ferramenta entregar_carrossel.

Regra obrigatoria: TODO slide leva o campo "imagem_ideia", sem excecao. Uma frase curta, concreta e visual, descrevendo a imagem que deve aparecer naquela lamina. Pense como quem dá direcao de foto: o que aparece, em que ambiente, com que clima. Nada de conceito abstrato.
Exemplo bom: "mesa de trabalho vazia no fim do dia, luz baixa, agenda aberta".
Exemplo ruim: "imagem sobre produtividade".
Se o slide nao leva foto no layout, descreva mesmo assim a imagem que ilustraria aquele ponto.

Preencha também "legenda" e "primeiro_comentario".

${estrategia.lembrete(marcacao)}

ÚLTIMA CONFERÊNCIA ANTES DE ENTREGAR: releia cada lâmina e garanta que **todas as palavras estão acentuadas corretamente** e que não há nenhum travessão, e que todo o texto está em português de Portugal, com "tu". Estes erros invalidam a entrega.`;
}

async function gerarCarrossel({ tema, ideia, serie, referencias, layout, marcacao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}`;
  if (serie) pedido += `\n\nFAIXA DA SERIE (use exatamente): ${serie}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO (use como matéria prima: aproveite o raciocínio, os exemplos e as distinções, sem copiar trechos literais e sem citar de onde veio):\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 8000)}`).join('\n\n');
  }

  // Tool use garante JSON valido. Nada de parsear texto solto.
  const FERRAMENTA = {
    name: 'entregar_carrossel',
    description: 'Entrega o carrossel pronto, slide a slide.',
    input_schema: {
      type: 'object',
      properties: {
        serie: { type: 'string', description: 'Faixa do topo, ate 34 caracteres' },
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', description: 'Um dos tipos validos do layout escolhido' },
              titulo: { type: 'string' },
              intro: { type: 'string' },
              destaque: { type: 'string' },
              corpo: { type: 'string' },
              cta: { type: 'string' },
              manuscrita: { type: 'string' },
              subtitulo: { type: 'string' },
              caixa: { type: 'string' },
              imagem_ideia: { type: 'string', description: 'Frase curta descrevendo a imagem que cabe nesta lamina' },
              itens: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { rotulo: { type: 'string' }, texto: { type: 'string' } },
                  required: ['texto'],
                },
              },
            },
            required: ['tipo', 'imagem_ideia'],
          },
        },
        legenda: { type: 'string' },
        primeiro_comentario: { type: 'string' },
      },
      required: ['serie', 'slides', 'legenda'],
    },
  };

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 6000,
    system: instrucoes(layout || 'layout1', marcacao),
    tools: [FERRAMENTA],
    tool_choice: { type: 'tool', name: 'entregar_carrossel' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu o carrossel. Tente de novo.');
  const json = uso.input;

  // Rede de seguranca: travessao nunca passa.
  const semTravessao = (s) => typeof s === 'string' ? s.replace(/\s*[—–]\s*/g, ', ') : s;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') {
      const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n;
    }
    return semTravessao(o);
  };
  const limpo = limpar(json);
  return await corrigirAcentos(limpo, client);
}


// ---------- REESCREVER UMA LAMINA EM OUTRO FORMATO ----------
// Trocar o tipo da lamina nao pode esvaziar a lamina: a mesma ideia precisa
// chegar no formato novo, e o encadeamento com a lamina anterior e a seguinte
// precisa continuar de pe.
const CAMPOS_LAMINA = {
  type: 'object',
  properties: {
    tipo: { type: 'string' },
    titulo: { type: 'string' },
    intro: { type: 'string' },
    destaque: { type: 'string' },
    corpo: { type: 'string' },
    cta: { type: 'string' },
    manuscrita: { type: 'string' },
    subtitulo: { type: 'string' },
    caixa: { type: 'string' },
    antes: { type: 'string' },
    emoji: { type: 'string' },
    depois: { type: 'string' },
    imagem_ideia: { type: 'string' },
    itens: {
      type: 'array',
      items: {
        type: 'object',
        properties: { rotulo: { type: 'string' }, texto: { type: 'string' } },
        required: ['texto'],
      },
    },
  },
  required: ['tipo'],
};

function resumoDaLamina(s) {
  if (!s) return null;
  const partes = [s.titulo, s.destaque, s.intro, s.corpo, s.subtitulo, s.caixa, s.cta,
    (s.itens || []).map(i => `${i.rotulo ? i.rotulo + ': ' : ''}${i.texto}`).join(' / ')];
  return `[${s.tipo}] ` + partes.filter(Boolean).join(' | ').slice(0, 400);
}

async function reescreverLamina({ lamina, tipoNovo, layout, anterior, proxima, posicao, total }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const layouts = require('./layouts');
  const l = layouts[layout] || layouts.layout1;
  const c = contexto();

  const sistema = `Voce reescreve UMA lamina de carrossel da autora descrita abaixo.

O texto ja existe e ja esta no tom dela. Sua tarefa nao e criar conteudo novo: e vestir a MESMA ideia no formato pedido.

## TOM DE VOZ DELA
${(c.voz || '').slice(0, 9000)}

${l.INSTRUCOES}

# REGRAS INEGOCIAVEIS
- Escreva em portugues de Portugal (europeu) com acentuacao completa e correta.
- NUNCA use travessao. Use virgula, dois pontos ou parenteses.
- Ela trata a pessoa por "tu", nunca por "voce". Proibido guru, hack, segredo, formula magica.
- Nunca invente case, numero ou depoimento que nao esteja no texto original.

# O QUE VOCE PRECISA PRESERVAR
1. A ideia. Se a lamina dizia que contratar sem processo nao resolve, a nova tambem diz.
2. O encadeamento. A lamina anterior entrega um gancho e a seguinte parte de algo: a sua versao precisa continuar servindo as duas.
3. O peso. Uma lamina de virada continua sendo virada, uma lamina que explica continua explicando.

# O QUE VOCE PODE MUDAR
Tudo o que o formato novo exigir: quebrar um paragrafo em itens curtos, condensar em uma frase, abrir em dois paragrafos, cortar o que nao couber. Respeite os limites de caracteres do tipo de destino.

Devolva a lamina pela ferramenta entregar_lamina, com o campo "tipo" igual a "${tipoNovo}" e apenas os campos que esse tipo usa.`;

  const pedido = [
    `Reescreva a lamina ${posicao} de ${total} no tipo "${tipoNovo}".`,
    '',
    `LAMINA ATUAL (tipo "${lamina.tipo}"):`,
    JSON.stringify(lamina, null, 1),
    '',
    anterior ? `LAMINA ANTERIOR: ${resumoDaLamina(anterior)}` : 'Esta e a primeira lamina do carrossel.',
    proxima ? `PROXIMA LAMINA: ${resumoDaLamina(proxima)}` : 'Esta e a ultima lamina do carrossel.',
  ].join('\n');

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1500,
    system: sistema,
    tools: [{
      name: 'entregar_lamina',
      description: 'Entrega a lamina reescrita no formato pedido.',
      input_schema: CAMPOS_LAMINA,
    }],
    tool_choice: { type: 'tool', name: 'entregar_lamina' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu a lamina. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') {
      const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n;
    }
    return semTravessao(o);
  };
  const nova = limpar(uso.input);
  nova.tipo = tipoNovo;
  return await corrigirAcentos(nova, client);
}


// ---------- POST ESTATICO ----------
// Um post e UMA lamina. Ele nao tem arco: precisa se sustentar sozinho na tela.
// Por isso a IA devolve tres angulos diferentes do mesmo tema, e ela escolhe.
async function gerarPost({ tema, ideia, referencias, layout, marcacao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const layouts = require('./layouts');
  const l = layouts.post;

  const sistema = `${instrucoes('layout1', marcacao).split('# ESTRUTURA')[0]}

${l.INSTRUCOES}

# SUA ENTREGA
Tres opcoes do mesmo tema, com angulos DIFERENTES entre si. Nao tres versoes da mesma frase: tres portas de entrada distintas. Por exemplo, uma que nomeia o erro, uma que mostra a consequencia, uma que faz a pergunta que ninguem faz.

Cada opcao leva:
- "angulo": duas ou tres palavras dizendo qual e a porta (ex: "o erro nomeado", "a consequencia", "a pergunta")
- "intro": a linha curta antes da frase, opcional
- "titulo": A FRASE. Ate 90 caracteres. E o post inteiro.
- "manuscrita": a linha de mao depois da frase, opcional
- "legenda": de 8 a 14 linhas, onde mora o raciocinio completo, terminando com um convite claro
- "primeiro_comentario": uma frase curta
- "imagem_ideia": a foto que combina com essa frase

Regra de acentuacao e de travessao valem aqui igual. Releia antes de entregar.`;

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO (materia prima, nao copie literal e nao cite de onde veio):\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 8000)}`).join('\n\n');
  }

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4000,
    system: sistema,
    tools: [{
      name: 'entregar_posts',
      description: 'Entrega tres opcoes de post estatico.',
      input_schema: {
        type: 'object',
        properties: {
          opcoes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                angulo: { type: 'string' },
                intro: { type: 'string' },
                titulo: { type: 'string' },
                manuscrita: { type: 'string' },
                legenda: { type: 'string' },
                primeiro_comentario: { type: 'string' },
                imagem_ideia: { type: 'string' },
              },
              required: ['angulo', 'titulo', 'legenda'],
            },
          },
        },
        required: ['opcoes'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_posts' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu os posts. Tente de novo.');

  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.opcoes === 'string') {
    try {
      const dentro = JSON.parse(bruto.opcoes);
      bruto = Array.isArray(dentro) ? { opcoes: dentro } : dentro;
    } catch (e) {}
  }
  if (!Array.isArray(bruto.opcoes)) throw new Error('A IA devolveu os posts num formato inesperado. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') {
      const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n;
    }
    return semTravessao(o);
  };
  const limpo = await corrigirAcentos(limpar(bruto), client);

  // Cada opcao vira uma lamina do layout post, no estilo pedido
  const estilo = ['frase', 'foto', 'lateral'].includes(layout) ? layout : 'frase';
  limpo.opcoes = limpo.opcoes.map(o => ({
    angulo: o.angulo,
    legenda: o.legenda,
    primeiro_comentario: o.primeiro_comentario,
    lamina: {
      tipo: estilo,
      intro: o.intro || '',
      titulo: o.titulo || '',
      manuscrita: o.manuscrita || '',
      imagem_ideia: o.imagem_ideia || '',
    },
  }));
  return limpo;
}


// ---------- REELS: os tres ganchos ----------
async function gerarGanchosReels({ tema, ideia, referencias, duracao, marcacao, receita }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const sistema = `${instrucoes('layout1', marcacao).split('# ESTRUTURA')[0]}

${reels.bloco(duracao)}

# A TUA TAREFA AGORA
${reels.tarefaAberturas(receita)}`;

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO:\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 6000)}`).join('\n\n');
  }

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    system: sistema,
    tools: [{
      name: 'entregar_ganchos',
      description: 'Entrega tres aberturas e indica a recomendada.',
      input_schema: {
        type: 'object',
        properties: {
          ganchos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tipo: { type: 'string' }, frase: { type: 'string' },
                tela: { type: 'string' }, porque: { type: 'string' },
                situacao: { type: 'string' }, resposta: { type: 'string' },
              },
              required: ['tipo', 'frase'],
            },
          },
          recomendada: { type: 'integer' },
          razao: { type: 'string' },
        },
        required: ['ganchos', 'recomendada'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_ganchos' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu os ganchos. Tente de novo.');
  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.ganchos === 'string') {
    try { const d = JSON.parse(bruto.ganchos); bruto = Array.isArray(d) ? { ganchos: d } : d; } catch (e) {}
  }
  if (!Array.isArray(bruto.ganchos)) throw new Error('Formato inesperado nos ganchos. Tente de novo.');
  let rec = Number(bruto.recomendada);
  if (!(rec >= 0 && rec < bruto.ganchos.length)) rec = 0;
  bruto.ganchos = bruto.ganchos.map((g, i) => ({ ...g, recomendado: i === rec }));
  bruto.recomendada = rec;

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') { const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n; }
    return semTravessao(o);
  };
  return await corrigirAcentos(limpar(bruto), client);
}

// ---------- REELS: o roteiro completo, em cima do gancho escolhido ----------
async function gerarRoteiroReels({ tema, ideia, referencias, duracao, gancho, cta, marcacao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const sistema = `${instrucoes('layout1', marcacao).split('# ESTRUTURA')[0]}

${reels.bloco(duracao)}

# A TUA TAREFA AGORA
A abertura já está escolhida. Escreve o roteiro COMPLETO a partir dela, em português de Portugal, a tratar a pessoa por "tu", respeitando a estrutura da duração acima.

Entrega:
- "blocos": a lista de blocos do roteiro, por ordem. Cada bloco leva "tempo" (ex: "0-3s"), "rotulo" (ex: "ABERTURA", "SITUAÇÃO", "MECANISMO", "CTA"), "fala" (o que a Simone diz, palavra por palavra), "tela" (o texto no ecrã, curto) e "camera" (a direção de câmara).
- "legenda": a legenda segundo o Livro de Receitas §16: de 6 a 10 linhas; a primeira linha funciona sozinha no feed (cerca de 125 caracteres) e abre com uma situação reconhecível ou com a frase de viragem; parágrafos de uma a três linhas; aprofunda a ideia sem repetir a fala; termina com um só CTA, o mesmo do vídeo; sem hashtags.
- "primeiro_comentario": uma frase curta.
- "capa": a arte de capa do Reels, com "intro" (linha curta antes, opcional), "titulo" (a frase da capa, ate 90 caracteres) e "manuscrita" (linha de mao, opcional).
- "imagem_ideia": a foto que combina com esta capa.

${reels.regrasRoteiro(gancho)}
${cta ? `O CTA pedido é: ${cta}.` : 'Escolhe um só CTA, proporcional ao movimento que o vídeo criou.'}`;

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}\n\nABERTURA ESCOLHIDA (${gancho.tipo}):\n"${gancho.frase}"\nTexto no ecrã: ${gancho.tela || '(define)'}${gancho.situacao ? `\nSituação que vem a seguir: ${gancho.situacao}` : ''}${gancho.resposta ? `\nResposta que o vídeo entrega: ${gancho.resposta}` : ''}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO:\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 6000)}`).join('\n\n');
  }

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 3000,
    system: sistema,
    tools: [{
      name: 'entregar_roteiro',
      description: 'Entrega o roteiro completo do Reels.',
      input_schema: {
        type: 'object',
        properties: {
          blocos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tempo: { type: 'string' }, rotulo: { type: 'string' },
                fala: { type: 'string' }, tela: { type: 'string' }, camera: { type: 'string' },
              },
              required: ['tempo', 'fala'],
            },
          },
          legenda: { type: 'string' },
          primeiro_comentario: { type: 'string' },
          capa: {
            type: 'object',
            properties: {
              intro: { type: 'string' }, titulo: { type: 'string' }, manuscrita: { type: 'string' },
            },
            required: ['titulo'],
          },
          imagem_ideia: { type: 'string' },
        },
        required: ['blocos', 'legenda', 'capa'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_roteiro' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu o roteiro. Tente de novo.');
  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.blocos === 'string') { try { bruto.blocos = JSON.parse(bruto.blocos); } catch (e) {} }
  if (!Array.isArray(bruto.blocos)) throw new Error('Formato inesperado no roteiro. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') { const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n; }
    return semTravessao(o);
  };
  return await ajustarReel(await corrigirAcentos(limpar(fixarAbertura(bruto, gancho)), client), duracao, client);
}


// ---------- LIVE: tres angulos de titulo ----------
async function gerarTitulosLive({ tema, ideia, referencias, marcacao, duracao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const sistema = `${instrucoes('layout1', marcacao).split('# ESTRUTURA')[0]}

${live.bloco(duracao)}

# SUA TAREFA AGORA
Antes do roteiro, escreva TRES propostas diferentes para esta live. Cada uma e um recorte distinto do mesmo tema, nao tres titulos da mesma ideia.

Cada proposta leva:
- "titulo": o titulo da live, ate 70 caracteres. E o que faz a pessoa reservar meia hora do dia dela.
- "promessa": uma linha dizendo o que ela vai saber fazer ao final, ate 110 caracteres.
- "para_quem": uma linha dizendo para quem essa live e, ate 90 caracteres.
- "tres_pontos": os pontos que a live vai cobrir, um por item, frases curtas. Use a quantidade que a estrutura desta duracao comporta.`;

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO:\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 6000)}`).join('\n\n');
  }

  const r = await client.messages.create({
    model: 'claude-sonnet-5', max_tokens: 2000, system: sistema,
    tools: [{
      name: 'entregar_propostas',
      description: 'Entrega tres propostas de live.',
      input_schema: {
        type: 'object',
        properties: {
          propostas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                titulo: { type: 'string' }, promessa: { type: 'string' },
                para_quem: { type: 'string' },
                tres_pontos: { type: 'array', items: { type: 'string' } },
              },
              required: ['titulo', 'promessa'],
            },
          },
        },
        required: ['propostas'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_propostas' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu as propostas. Tente de novo.');
  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.propostas === 'string') {
    try { const d = JSON.parse(bruto.propostas); bruto = Array.isArray(d) ? { propostas: d } : d; } catch (e) {}
  }
  if (!Array.isArray(bruto.propostas)) throw new Error('Formato inesperado. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') { const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n; }
    return semTravessao(o);
  };
  return await corrigirAcentos(limpar(bruto), client);
}

// ---------- LIVE: o roteiro em topicos ----------
async function gerarRoteiroLive({ tema, ideia, referencias, proposta, marcacao, duracao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const sistema = `${instrucoes('layout1', marcacao).split('# ESTRUTURA')[0]}

${live.bloco(duracao)}

# SUA TAREFA AGORA
A proposta ja esta escolhida. Escreva o roteiro completo, bloco a bloco, seguindo exatamente a estrutura de tempo acima.

Cada bloco leva:
- "tempo": a faixa, exatamente como na estrutura (ex: "6-13min")
- "rotulo": o nome do bloco (ex: "BLOCO 1")
- "abre": a frase de abertura do bloco, escrita por inteiro, para sair redonda
- "topicos": de 3 a 6 topicos curtos, no maximo 90 caracteres cada. E o mapa que ela olha de canto de olho.
- "virada": a frase que fecha o bloco, escrita por inteiro
- "interacao": a pergunta ou comando para o chat naquele momento
- "retencao": a frase que segura quem pensa em sair ou recoloca quem chegou agora

Entregue tambem:
- "nomes_sugeridos": TRES nomes diferentes para anunciar ESTA live, cada um com "nome" (ate 70 caracteres) e "gancho" (a linha que vai junto na divulgacao, ate 110 caracteres). Sao tres formas de anunciar a MESMA live, com ganchos fortes de verdade, nao tres lives diferentes.
- "fio": em 2 a 4 linhas, o que vai acontecer do comeco ao fim, como se voce estivesse contando para ela antes de entrar no ar.
- "pontos_principais": de 3 a 5 topicos curtos com o que a live entrega. E o resumo que ela bate o olho antes de comecar.
- "titulo": o titulo final da live
- "descricao": o texto de divulgacao, de 4 a 7 linhas, terminando com dia, hora e convite
- "perguntas_previstas": tres perguntas que provavelmente vao aparecer no chat, com uma linha de resposta cada
- "capa": a arte de divulgacao, com "intro", "titulo" (ate 70 caracteres) e "manuscrita"
- "imagem_ideia": a foto que combina com essa capa
- "thumb": a capa do YouTube, que e OUTRA linguagem. Na grade do YouTube ela aparece do tamanho de um selo, entao:
    "chapeu" (o nome da serie ou da marca, ate 30 caracteres),
    "titulo" (NO MAXIMO 6 PALAVRAS, em caixa alta mental, a ideia mais crua possivel),
    "apoio" (uma linha curta, ate 34 caracteres, escrita como se fosse a mao),
    "selo" (o formato e a duracao, ex: "live de 20 min")
- "youtube": o que vai na descricao do video, com
    "descricao" (de 4 a 8 linhas: o que a pessoa vai aprender, escrito para quem chegou pela busca e nao te conhece),
    "tags" (de 6 a 10 termos de busca, em minusculas, que alguem digitaria no YouTube para achar este assunto)`;

  let pedido = `TEMA: ${tema}\n\nIDEIA CENTRAL:\n${ideia}\n\nPROPOSTA ESCOLHIDA:\nTitulo: ${proposta.titulo}\nPromessa: ${proposta.promessa}\nPara quem: ${proposta.para_quem || ''}\nTres pontos: ${(proposta.tres_pontos || []).join(' / ')}`;
  if (referencias && referencias.length) {
    pedido += `\n\nMATERIAL MARCADO NO BANCO:\n\n` +
      referencias.map(r => `### ${r.titulo}\n${(r.conteudo || '').slice(0, 6000)}`).join('\n\n');
  }

  const r = await client.messages.create({
    model: 'claude-sonnet-5', max_tokens: 6000, system: sistema,
    tools: [{
      name: 'entregar_roteiro_live',
      description: 'Entrega o roteiro completo da live.',
      input_schema: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          fio: { type: 'string' },
          pontos_principais: { type: 'array', items: { type: 'string' } },
          nomes_sugeridos: {
            type: 'array',
            items: {
              type: 'object',
              properties: { nome: { type: 'string' }, gancho: { type: 'string' } },
              required: ['nome'],
            },
          },
          blocos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tempo: { type: 'string' }, rotulo: { type: 'string' },
                abre: { type: 'string' },
                topicos: { type: 'array', items: { type: 'string' } },
                virada: { type: 'string' }, interacao: { type: 'string' }, retencao: { type: 'string' },
              },
              required: ['tempo', 'topicos'],
            },
          },
          perguntas_previstas: {
            type: 'array',
            items: {
              type: 'object',
              properties: { pergunta: { type: 'string' }, resposta: { type: 'string' } },
              required: ['pergunta'],
            },
          },
          capa: {
            type: 'object',
            properties: { intro: { type: 'string' }, titulo: { type: 'string' }, manuscrita: { type: 'string' } },
            required: ['titulo'],
          },
          thumb: {
            type: 'object',
            properties: {
              chapeu: { type: 'string' }, titulo: { type: 'string' },
              apoio: { type: 'string' }, selo: { type: 'string' },
            },
            required: ['titulo'],
          },
          youtube: {
            type: 'object',
            properties: {
              descricao: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['descricao'],
          },
          imagem_ideia: { type: 'string' },
        },
        required: ['blocos', 'titulo', 'descricao', 'capa'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_roteiro_live' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu o roteiro. Tente de novo.');
  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.blocos === 'string') { try { bruto.blocos = JSON.parse(bruto.blocos); } catch (e) {} }
  if (!Array.isArray(bruto.blocos)) throw new Error('Formato inesperado no roteiro. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') { const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n; }
    return semTravessao(o);
  };
  return await corrigirAcentos(limpar(bruto), client);
}


// ---------- CAPA DE YOUTUBE AVULSA ----------
// Tres abordagens para a mesma capa. Ela escolhe a que combina com o video.
async function gerarCapasYoutube({ tema, conteudo, duracao }) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta a chave da Anthropic em Configuracoes.');
  const client = new Anthropic({ apiKey: key });

  const c = contexto();
  const sistema = `Voce escreve capas de video para a autora descrita abaixo.

## TOM DE VOZ DELA
${(c.voz || '').slice(0, 7000)}

${c.regras ? `## REGRAS DA MARCA\n${c.regras}\n` : ''}

# O QUE E UMA CAPA DE YOUTUBE
Na grade do YouTube ela aparece do tamanho de um selo, no meio de dezenas de outras. Quem le frase nao clica: quem entende em meio segundo, clica.

Por isso o titulo da capa tem NO MAXIMO 6 PALAVRAS. Nao e o titulo do video: e a ideia mais crua que cabe ali dentro.

# AS TRES ABORDAGENS
Escreva uma capa para cada uma destas portas, nesta ordem:
1. "a tensao": nomeia o incomodo que a pessoa sente. Ex: "VOCE FAZ TUDO SOZINHA"
2. "a contradicao": vai contra o que todo mundo diz. Ex: "CONTRATAR NAO RESOLVE"
3. "a pergunta": obriga a pessoa a se responder. Ex: "QUEM DECIDE QUANDO VOCE SOME?"

# CADA CAPA LEVA
- "abordagem": o id (tensao, contradicao ou pergunta)
- "chapeu": o nome da serie ou da marca, ate 30 caracteres, sempre em caixa alta
- "titulo": NO MAXIMO 6 PALAVRAS
- "apoio": uma linha curta, ate 34 caracteres, que entra em letra de mao
- "selo": o formato e a duracao, ex: "live de 20 min" ou "video de 8 min"
- "porque": uma linha explicando por que essa capa funcionaria para este video

Acentuacao correta e sem travessao, sempre.`;

  const pedido = `TEMA DO VIDEO: ${tema}

O QUE O VIDEO FALA:
${conteudo}

${duracao ? `DURACAO: ${duracao}` : ''}`;

  const r = await client.messages.create({
    model: 'claude-sonnet-5', max_tokens: 1600, system: sistema,
    tools: [{
      name: 'entregar_capas',
      description: 'Entrega tres capas de video.',
      input_schema: {
        type: 'object',
        properties: {
          capas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                abordagem: { type: 'string' }, chapeu: { type: 'string' },
                titulo: { type: 'string' }, apoio: { type: 'string' },
                selo: { type: 'string' }, porque: { type: 'string' },
              },
              required: ['titulo'],
            },
          },
        },
        required: ['capas'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_capas' },
    messages: [{ role: 'user', content: pedido }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('A IA nao devolveu as capas. Tente de novo.');
  let bruto = uso.input;
  if (typeof bruto === 'string') { try { bruto = JSON.parse(bruto); } catch (e) {} }
  if (typeof bruto.capas === 'string') {
    try { const d = JSON.parse(bruto.capas); bruto = Array.isArray(d) ? { capas: d } : d; } catch (e) {}
  }
  if (!Array.isArray(bruto.capas)) throw new Error('Formato inesperado. Tente de novo.');

  const semTravessao = (t) => typeof t === 'string' ? t.replace(/\s*[\u2014\u2013]\s*/g, ', ') : t;
  const limpar = (o) => {
    if (Array.isArray(o)) return o.map(limpar);
    if (o && typeof o === 'object') { const n = {}; for (const k of Object.keys(o)) n[k] = limpar(o[k]); return n; }
    return semTravessao(o);
  };
  return await corrigirAcentos(limpar(bruto), client);
}


// ---------- CORES A PARTIR DE UMA DESCRICAO ----------
// Ela nao precisa saber hexadecimal: escreve o que quer e a IA traduz.
async function coresDaDescricao(descricao) {
  const key = chave('anthropic_api_key', 'ANTHROPIC_API_KEY');
  if (!key) throw new Error('Para eu entender cores escritas, cadastre a chave da Anthropic em Chaves e ajustes.');
  const client = new Anthropic({ apiKey: key });

  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 700,
    system: `Voce e diretor de arte. Recebe a descricao da identidade visual de alguem e devolve QUATRO cores em hexadecimal que funcionam juntas.

Os quatro papeis:
- "escura": a cor mais forte da marca. Vira fundo das artes escuras e as caixas de destaque nas claras. Precisa ser escura o suficiente para texto claro por cima.
- "clara": o fundo das artes claras. Quase sempre um tom de creme, off-white ou areia. Nunca branco puro: da aspecto de rascunho.
- "acento": o detalhe, a fita, o marcador. Uma cor que chama atencao sem competir.
- "apoio": a cor da frase escrita a mao e do segundo destaque. Costuma ser um tom intermediario e quente.

Regras:
- Se a pessoa citar cores ("terracota", "verde petroleo", "dourado"), use exatamente essas.
- Se ela descrever uma sensacao ("sobrio e elegante", "vibrante"), escolha cores que entreguem isso.
- Garanta contraste: escura precisa ficar legivel com texto claro, e clara com texto escuro.
- Nada de neon nem cores saturadas demais: as artes tem muito texto.
- Devolva so os quatro hexadecimais e uma linha explicando a escolha.`,
    tools: [{
      name: 'entregar_cores',
      description: 'Entrega as quatro cores da identidade.',
      input_schema: {
        type: 'object',
        properties: {
          escura: { type: 'string' }, clara: { type: 'string' },
          acento: { type: 'string' }, apoio: { type: 'string' },
          explicacao: { type: 'string' },
        },
        required: ['escura', 'clara', 'acento', 'apoio'],
      },
    }],
    tool_choice: { type: 'tool', name: 'entregar_cores' },
    messages: [{ role: 'user', content: String(descricao).slice(0, 2000) }],
  });

  const uso = r.content.find(b => b.type === 'tool_use');
  if (!uso) throw new Error('Nao consegui entender as cores. Tente descrever de outro jeito.');
  const v = uso.input;
  const ok = (x) => /^#[0-9a-fA-F]{6}$/.test(String(x || '').trim()) ? String(x).trim() : null;
  const cores = { escura: ok(v.escura), clara: ok(v.clara), acento: ok(v.acento), apoio: ok(v.apoio) };
  if (!cores.escura || !cores.clara || !cores.acento) {
    throw new Error('Nao consegui montar as cores a partir disso. Tente citar as cores da sua marca.');
  }
  return { cores, explicacao: v.explicacao || '' };
}

module.exports = { transcrever, gerarCarrossel, gerarCapasYoutube, coresDaDescricao, reescreverLamina, gerarPost, gerarGanchosReels, gerarRoteiroReels, gerarTitulosLive, gerarRoteiroLive, chave };
