
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
  { re: pal(String.raw`(?:és|estás|ficas|ficaste|foste|estavas|eras|seres|estares|ficares|a não ser|sentes-te|sentiste-te|sentires-te|sentir-te|te sentes|te sentiste|pareces|pareceste|pareceres|parecer)(?:\s+(?:tão|muito|mais|sempre|logo|já|outra vez|mal|bem))?\s+(?!(?:uma|minha|tua|sua|nossa|toda|outra|pessoa|um|meu|teu|seu|nosso|todo|outro|demasiado|demasiada)` + F + String.raw`)\p{L}*(?:ada|ida|osa|inha|esa|usta|ado|ido|oso|inho|usto|vista|visto|ária|ário|dora|dor|raca|raco)`),
    regra: 'fala com a pessoa ("tu") só num género, no feminino ou no masculino: o público inclui homens e mulheres; reescreve sem marca de género. Exemplos: "antes de seres apanhada de surpresa" → "antes de te apanharem de surpresa"; "antes de seres magoado" → "antes de te magoarem"; "estás sozinho" → "só podes contar contigo"; "ficaste mal vista" → "deixaste má impressão"' },
  // Numeros e frequencias sobre a pratica da Simone (nao apanha "repete isto todos os dias")
  { re: new RegExp(String.raw`\d+\s?%|` + I + '(?:' + PRATICA + ')' + F + '[^.!?]{0,40}' + I + '(?:' + FREQ + ')' + F + '|'
      + I + '(?:' + FREQ + ')' + F + '[^.!?]{0,40}' + I + '(?:' + PRATICA + ')' + F + '|'
      + I + '(?:a maioria|muitas|imensas) (?:das pessoas|pessoas|clientes|alunas?|alunos) (?:que|com quem) (?:acompanho|atendo|recebo)' + F + '|'
      + I + String.raw`\d+ (?:pessoas|clientes|alunas?|alunos|casos|sessões)` + F, 'iu'),
    regra: 'afirma um número ou uma frequência que não foi dado: retira esse dado e mantém a ideia sem quantificar' },
  // Experiencia em sessao afirmada (a R3 usa so o molde "Quando alguem me diz", que nao e apanhado)
  { re: new RegExp(I + '(?:' + PRATICA + '|ouvi|vi)' + F + '[^.!?]{0,40}' + I + '(?:em sessão|na sessão|nas sessões|no consultório|nas minhas sessões)' + F + '|'
      + I + '(?:em sessão|na sessão|nas sessões|no consultório|nas minhas sessões)' + F + '[^.!?]{0,40}' + I + '(?:' + PRATICA + '|ouvi|vi)' + F, 'iu'),
    regra: 'afirma o que a Simone ouve ou vê em sessão, um dado que não foi dado: retira essa afirmação e mantém a ideia' },
  // Grafia e construcoes do Brasil (quarta ronda, 15/11/2026)
  { re: pal(String.raw`decepç\p{L}*|decepcion\p{L}*|machuc\p{L}*|contatos?|registros?|equipes?|celulares?|planej\p{L}*|ônibus|cardápios?|xícaras?|banheiros?|geladeiras?|esportes?|café da manhã|tela do celular`),
    regra: 'tem uma grafia ou palavra do Brasil: escreve como em Portugal (por exemplo dececionar, deceção, magoar, contacto, registo, equipa, telemóvel, planear)' },
  { re: pal(String.raw`(?:estou|estás|está|estamos|estão|estava|estavas|fico|ficas|fica|ando|andas|anda|continuo|continuas|continua)\s+\p{L}+ndo`),
    regra: 'usa o gerúndio do Brasil ("estás fazendo"): escreve como em Portugal ("estás a fazer")' },
  // Genero no infinitivo: "protegeu-te de ser apanhado", "deixar de ser escolhida" (oitava ronda)
  { re: pal(String.raw`(?:ser|ficar|estar)\s+(?:\p{L}+\s+)?(?!demasiad)\p{L}*(?:ada|ida|osa|inha|ado|ido|oso|inho|ária|ário|dora|dor)`),
    regra: 'fala da pessoa só num género, no infinitivo ("de ser apanhado", "deixar de ser escolhida", "vou ser despedida"): reescreve sem marca de género, também dentro de aspas quando é a voz interior de quem vê, por exemplo "de te apanharem de surpresa", "deixarem de te escolher", "de te magoarem", "vão despedir-me"' },
  // "sozinho/sozinha" depois de um verbo dirigido a pessoa ("decides sozinho"); citacoes como "tenho de fazer tudo sozinho" passam
  { re: pal(String.raw`\p{L}+(?:es|as|ste|aste|este|iste)\s+(?:\p{L}+\s+){0,3}sozinh[oa]s?`),
    regra: 'fala com a pessoa só num género ("decides sozinho", "ficas sozinha"): reescreve sem género, por exemplo "decides por tua conta", "ficas sem ninguém"' },
  // Grafia anterior ao Acordo Ortografico ("directo", "fracção", "protecção") (decima ronda)
  { re: pal(String.raw`(?!secç)\p{L}*(?:acç|ecç|icç|ocç|ucç|irect|ectiv|xact|óptim|fect[oa]|jecto|ctual|tecç|recto|recta)\p{L}*`),
    regra: 'tem grafia anterior ao Acordo Ortográfico: escreve na grafia atual de Portugal (por exemplo direto, fração, proteção, ação, ativo, exato, ótimo, afeto, projeto, atual)' },
  // Genero depois do pronome "te" ("manteve-te segura", "te apanharem desprevenida") (decima ronda)
  { re: new RegExp(String.raw`(?:-te|` + I + String.raw`te)\s+(?:\p{L}+\s+)?(?!(?:significado|sentido|resultado|passado|lado|cuidado|estado|medida|saída|partida|dúvida|vida|ferida|comida|pecado|ritmo)` + F + String.raw`)\p{L}*(?:ada|ida|osa|inha|ura|ado|ido|oso|inho|uro)` + F, 'iu'),
    regra: 'fala com a pessoa só num género depois de "te" ("manteve-te segura", "te apanharem desprevenida"): reescreve sem género, por exemplo "manteve-te em segurança", "te apanharem de surpresa"' },
  // "a ti mesmo", "contigo mesma" (decima primeira ronda: teste pela interface)
  { re: pal(String.raw`(?:a ti|de ti|contigo|para ti)\s+mesm[oa]s?`),
    regra: 'fala com a pessoa só num género ("a ti mesmo", "contigo mesma"): escreve sem "mesmo" nem "mesma", só "a ti" ou "contigo"' },
  // Barras de genero ("seguro/a") e paráfrase da frase-mestre (teste pela interface, terceira volta)
  { re: new RegExp(String.raw`\p{L}+[oa]s?\/[oa]s?` + F, 'iu'),
    regra: 'usa barras de género ("seguro/a", "necessário/a"): reescreve a frase sem género e sem barras, por exemplo "estás em segurança", "deixar de fazer falta"' },
  { re: new RegExp(String.raw`^(?![\s\S]*A confiança constrói-se na raiz\.)(?=[\s\S]*` + I + String.raw`raiz` + F + String.raw`)(?=[\s\S]*` + I + String.raw`confiança` + F + String.raw`)[\s\S]*$`, 'iu'),
    regra: 'parece parafrasear a frase-mestre: se é a assinatura, usa-a literal ("A confiança constrói-se na raiz."); se não, reescreve sem juntar "confiança" e "raiz" numa frase-assinatura' },
  { re: pal(String.raw`sozinh[oa]s?`),
    regra: 'fala com a pessoa só num género ("aguentar sozinho"): reescreve sem género, por exemplo "aguentar sem ajuda", "resolver por tua conta"' },
  // Gralha com letra repetida que nao existe em portugues ("proteggeres")
  { re: new RegExp(I + String.raw`\p{L}*(?:bb|dd|ff|gg|hh|jj|kk|pp|qq|tt|vv|ww|xx|yy|zz)\p{L}*` + F, 'iu'),
    regra: 'tem uma gralha (letra repetida que não existe em português, por exemplo "proteggeres"): corrige a palavra' },
  // Hifen em falta ou pronome antes do verbo a maneira do Brasil ("chama se", "a pessoa se sente")
  // (nao apanha o pronome depois de "que", "não", "nunca"... ate tres palavras antes: "a frase que mais rapido te aparece")
  { re: new RegExp(String.raw`(?<!` + I + String.raw`(?:que|não|nunca|já|também|quando|onde|como|porque|quem)` + F + String.raw`[^.!?]{0,25})` + I + String.raw`(?!(?:que|não|já|também|como|onde|quando|porque|se|nunca|sempre|ainda|mais|só|quem|ninguém|alguém|tudo|isto|isso|nada|cada|bem|mal|logo|e|ou|mas|nem|de|em|por|para|com|sem|qualquer|todo|toda|muito|pouco|tanto|assim|lhe|me|te|nos|eu|tu|ele|ela)` + F + String.raw`)\p{L}+[aeo]m?\s(?:se|me|te)\s+[*"“'(]*\p{L}{2,}`, 'iu'),
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
  // Cada texto e partido em frases (as frases protegidas ficam inteiras): so a frase com problema vai para revisao.
  // Assim uma legenda longa nao e devolvida quase igual com o problema la dentro (quinta ronda).
  const partes = textos.map(t => {
    let s = t;
    PROTEGIDAS.forEach((p, k) => { s = s.split(p).join(`\u0000${k}\u0000`); });
    return s.split(/((?<=[.!?…])[ \t]+|\n+)/).map(seg => seg.replace(/\u0000(\d)\u0000/g, (_, k) => PROTEGIDAS[Number(k)]));
  });
  const marcados = [];
  partes.forEach((ps, i) => ps.forEach((seg, j) => {
    if (j % 2 === 1 || !seg.trim()) return;
    const p = problemasDe(seg);
    if (p.length) marcados.push({ i, j, texto: seg, problemas: p });
  }));
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

  marcados.forEach((m, k) => {
    const f = frases[k];
    if (typeof f !== 'string' || !f.trim()) return;
    // Se a revisao mexeu numa frase protegida, fica o texto original
    if (protegidasEm(m.texto).some(p => !f.includes(p))) { console.warn('[revisao] frase protegida alterada; fica o original'); return; }
    partes[m.i][m.j] = f.trim();
  });
  const novos = partes.map(ps => ps.join(''));
  const ainda = marcados.filter(m => problemasDe(partes[m.i][m.j]).length);
  if (ainda.length) console.warn('[revisao] por corrigir: ' + ainda.map(m => `"${partes[m.i][m.j].slice(0, 80)}"`).join('; '));

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
// Limites dos titulos no layout Modelo 2Life (instrucoes do layout): capa 50, interior 70, fecho 45 caracteres
const TITULO_MAX = { capa: 50, interior: 70, fecho: 45 };

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
  // Titulos do carrossel acima do limite do layout (decima primeira ronda: capa com cerca de 100 caracteres)
  if (Array.isArray(json.slides)) {
    json.slides.forEach((sl, i) => {
      const lim = TITULO_MAX[sl && sl.tipo];
      const t = sl && typeof sl.titulo === 'string' ? sl.titulo : '';
      if (lim && t.replace(/\*\*/g, '').length > lim + 10) {
        pedidos.push({ campo: 'titulo', i, texto: t,
          problema: `é o título de uma lâmina "${sl.tipo}" com ${t.replace(/\*\*/g, '').length} caracteres; o layout só tem espaço para ${lim}. Reescreve-o com ${lim} caracteres ou menos, frases curtas, mantendo a ideia e a frase de viragem entre **asteriscos duplos**.` });
      }
    });
  }
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
    } else if (p.campo === 'titulo') {
      if (t.replace(/\*\*/g, '').length > TITULO_MAX[novo.slides[p.i].tipo] + 10) { console.warn('[revisao] um título continua acima do limite do layout'); return; }
      novo.slides = novo.slides.map((sl, k) => (k === p.i ? { ...sl, titulo: t } : sl));
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
  // As frases protegidas saem do texto antes de encurtar (ficam num marcador) e voltam depois, literais.
  const marcar = (t) => { let s = String(t || ''); const usadas = []; PROTEGIDAS.forEach((p, k) => { if (s.includes(p)) { s = s.split(p).join(`[[P${k}]]`); usadas.push(k); } }); return { s, usadas }; };
  const repor = (s, usadas) => { let t = s; for (const k of usadas) { if (t.includes(`[[P${k}]]`)) t = t.split(`[[P${k}]]`).join(PROTEGIDAS[k]); else t = `${t.trim()} ${PROTEGIDAS[k]}`; } return t.replace(/\[\[P\d\]\]/g, '').replace(/\s{2,}/g, ' ').trim(); };
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const b = atual.blocos;
    const total = b.reduce((s, x) => s + palavras(x.fala), 0);
    if (total <= limite) break;
    const fixas = palavras(b[0].fala) + palavras(b[b.length - 1].fala);
    const meio = b.slice(1, -1).map(x => ({ ...x, ...marcar(x.fala) }));
    const protegidas = meio.reduce((s, x) => s + x.usadas.reduce((a, k) => a + palavras(PROTEGIDAS[k]), 0), 0);
    const livres = meio.map(x => palavras(x.s.replace(/\[\[P\d\]\]/g, '')));
    const somaLivres = livres.reduce((a, c) => a + c, 0);
    // Cada nova tentativa aperta mais: 92%, 85%, 78% do limite
    const alvo = Math.floor(limite * (0.92 - tentativa * 0.07)) - fixas - protegidas;
    if (alvo <= meio.length * 6) { console.warn('[revisao] a abertura, o CTA e as frases protegidas já ocupam quase todo o tempo'); break; }
    const metas = livres.map(w => Math.max(6, Math.floor(w * alvo / somaLivres)));
    let r;
    try {
      r = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 2500,
        system: 'Encurtas a fala de blocos de um reel da marca 2Life, em português de Portugal, a tratar a pessoa por "tu", para o vídeo caber no tempo. Cada bloco tem um máximo de palavras, que tens de cumprir. Mantém a função de cada bloco (o rótulo) e o sentido; corta repetições, exemplos a mais e explicações; não acrescentes nada. Escreve sempre frases completas e naturais, para serem ditas em voz alta, nunca telegráficas: se não couber, tira uma ideia inteira em vez de comprimir várias. Os marcadores como [[P0]] são frases protegidas: deixa-os exatamente onde estão e não os contes no máximo. Sem "algo", "talvez", "às vezes" nem travessões. Devolve as falas pela mesma ordem.',
        tools: [{
          name: 'devolver_falas',
          description: 'Devolve as falas encurtadas, pela mesma ordem.',
          input_schema: { type: 'object', properties: { falas: { type: 'array', items: { type: 'string' } } }, required: ['falas'] },
        }],
        tool_choice: { type: 'tool', name: 'devolver_falas' },
        messages: [{ role: 'user', content: JSON.stringify({
          aviso: `O vídeo tem ${total} palavras e só cabem ${limite}. Conta as palavras de cada fala: cada uma tem de ficar igual ou abaixo do seu máximo.`,
          blocos: meio.map((x, i) => ({ rotulo: x.rotulo, fala: x.s, palavras_agora: livres[i], max_palavras: metas[i] })) }) }],
      });
    } catch (e) {
      console.warn('[revisao] pedido da duração falhou, fica o texto original:', e.message);
      break;
    }
    const uso = r.content.find(x => x.type === 'tool_use');
    const falas = uso && uso.input && uso.input.falas;
    if (!Array.isArray(falas) || falas.length !== meio.length) { console.warn('[revisao] a resposta da duração não tem o número certo de blocos'); break; }
    const blocos = b.map((x, i) => {
      if (i === 0 || i === b.length - 1) return x;
      const f = typeof falas[i - 1] === 'string' ? falas[i - 1].trim() : '';
      if (!f) return x;
      return { ...x, fala: repor(f, meio[i - 1].usadas) };
    });
    atual = { ...atual, blocos };
  }
  // Ultimo recurso, sem IA: tira uma frase do meio (nem a primeira nem a ultima) do bloco do meio mais longo,
  // ate caber. Nunca toca na abertura, no CTA nem nas frases protegidas. Fica registado em "cortes" para a Simone ver.
  const cortes = [];
  for (let guarda = 0; guarda < 6; guarda++) {
    const b = atual.blocos;
    if (b.reduce((s, x) => s + palavras(x.fala), 0) <= limite) break;
    const cands = b.map((x, i) => ({ i, w: palavras(x.fala) })).filter(c => c.i > 0 && c.i < b.length - 1).sort((a, z) => z.w - a.w);
    let feito = false;
    for (const c of cands) {
      const { s, usadas } = marcar(b[c.i].fala);
      const frases = s.split(/(?<=[.!?…])\s+/);
      const meioF = frases.map((f, k) => ({ f, k })).filter(o => o.k > 0 && o.k < frases.length - 1 && !/\[\[P\d\]\]/.test(o.f));
      if (!meioF.length) continue;
      const tira = meioF.sort((a, z) => palavras(z.f) - palavras(a.f))[0];
      cortes.push(tira.f);
      const nova = repor(frases.filter((_, k) => k !== tira.k).join(' '), usadas);
      atual = { ...atual, blocos: b.map((x, i) => (i === c.i ? { ...x, fala: nova } : x)) };
      feito = true;
      break;
    }
    if (!feito) break;
  }
  if (cortes.length) { console.warn('[revisao] frases tiradas para caber no tempo: ' + cortes.map(f => `"${f}"`).join('; ')); atual = { ...atual, cortes }; }
  atual = marcarTempos(atual);
  if (atual.duracao_estimada > Number(duracao || 30)) console.warn(`[revisao] o reel continua com cerca de ${atual.duracao_estimada} s`);
  return await reverLinguagem(atual, client);
}

// ---------- GENERO (decima primeira ronda, teste pela interface) ----------
// As listas de palavras deixam escapar formas novas ("deixa mais sozinho", "continuar parado", "a ti próprio").
// A IA le o texto da peca e devolve so as frases ditas a pessoa ("tu") com marca de genero, ja reescritas.
async function reverGenero(json, client) {
  if (!json || typeof json !== 'object' || (!json.legenda && !Array.isArray(json.blocos) && !Array.isArray(json.slides))) return json;
  const textos = textosDoJson(json);
  const partes = textos.map(t => {
    let s = t;
    PROTEGIDAS.forEach((p, k) => { s = s.split(p).join(`\u0000${k}\u0000`); });
    return s.split(/((?<=[.!?…])[ \t]+|\n+)/).map(seg => seg.replace(/\u0000(\d)\u0000/g, (_, k) => PROTEGIDAS[Number(k)]));
  });
  const lista = [];
  partes.forEach((ps, i) => ps.forEach((seg, j) => { if (j % 2 === 0 && seg.trim() && /\p{L}{3}/u.test(seg)) lista.push({ i, j, frase: seg }); }));
  if (!lista.length) return json;
  let r;
  try {
    r = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      system: 'És revisora da marca 2Life, em português de Portugal. O público inclui homens e mulheres. Recebes as frases de uma peça, numeradas. Encontra só as frases dirigidas à pessoa que lê ("tu"), incluindo a voz interior dela e o texto no ecrã, que tenham adjetivos, particípios ou pronomes com marca de um só género, no masculino ou no feminino (por exemplo "ficas sozinho", "continuar parado", "a ti própria", "ainda consigo sozinha", "se não fores precisa", "estás seguro/a"). Para cada uma, reescreve a frase sem marca de género, mudando o mínimo e mantendo o sentido: "ainda consigo sem ajuda", "continuar em pausa", "a ti", "se deixares de fazer falta", "estás em segurança". Nunca troques um género pelo outro e nunca uses barras ("o/a"). Não mexas em frases que falam de outra pessoa ("ele", "a tua mãe"), em citações atribuídas a alguém nem nas frases protegidas: ' + PROTEGIDAS.map(f => `"${f}"`).join(' ') + ' Se não houver nenhuma, devolve a lista vazia.',
      tools: [{
        name: 'devolver_genero',
        description: 'Devolve só as frases a trocar, com o número e a frase nova.',
        input_schema: { type: 'object', properties: { trocas: { type: 'array', items: { type: 'object',
          properties: { n: { type: 'integer' }, nova: { type: 'string' } }, required: ['n', 'nova'] } } }, required: ['trocas'] },
      }],
      tool_choice: { type: 'tool', name: 'devolver_genero' },
      messages: [{ role: 'user', content: JSON.stringify(lista.map((x, n) => ({ n, frase: x.frase }))) }],
    });
  } catch (e) {
    console.warn('[revisao] pedido do género falhou, fica o texto original:', e.message);
    return json;
  }
  const uso = r.content.find(b => b.type === 'tool_use');
  const trocas = uso && uso.input && Array.isArray(uso.input.trocas) ? uso.input.trocas : [];
  let feitas = 0;
  for (const t of trocas) {
    const x = lista[t.n];
    if (!x || typeof t.nova !== 'string' || !t.nova.trim()) continue;
    if (protegidasEm(x.frase).some(p => !t.nova.includes(p))) continue;
    partes[x.i][x.j] = t.nova.trim();
    feitas++;
  }
  if (!feitas) return json;
  const novos = partes.map(ps => ps.join(''));
  let n = 0;
  const repor = (o) => {
    if (Array.isArray(o)) return o.map(repor);
    if (o && typeof o === 'object') { const novo = {}; for (const k of Object.keys(o)) novo[k] = repor(o[k]); return novo; }
    if (typeof o === 'string' && o.trim()) return novos[n++];
    return o;
  };
  return repor(json);
}

async function corrigirAcentos(json, client) {
  const revisto = await reverGenero(await reverPeca(await reverLinguagem(await corrigirSoAcentos(json, client), client), client), client);
  // O texto reescrito pela revisao da peca volta a passar pela linguagem (oitava ronda: entrou um "algo").
  // Sem problemas, nao ha pedido extra.
  return await reverLinguagem(revisto, client);
}

