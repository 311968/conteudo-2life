
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
  { re: pal(String.raw`(?:és|estás|ficas|ficaste|foste|estavas|eras|sentes-te|sentiste-te|te sentes|te sentiste)(?:\s+(?:tão|muito|mais|sempre|logo|já))?\s+(?!(?:uma|minha|tua|sua|nossa|toda|outra|pessoa)` + F + String.raw`)\p{L}*(?:ada|ida|osa|inha|esa|usta)`),
    regra: 'fala com a pessoa só no feminino: o público inclui homens; reescreve sem marca de género (por exemplo "não tens de", "sem companhia")' },
  // Numeros e frequencias sobre a pratica da Simone (nao apanha "repete isto todos os dias")
  { re: new RegExp(String.raw`\d+\s?%|` + I + '(?:' + PRATICA + ')' + F + '[^.!?]{0,40}' + I + '(?:' + FREQ + ')' + F + '|'
      + I + '(?:' + FREQ + ')' + F + '[^.!?]{0,40}' + I + '(?:' + PRATICA + ')' + F + '|'
      + I + '(?:a maioria|muitas|imensas) (?:das pessoas|pessoas|clientes|alunas?|alunos) (?:que|com quem) (?:acompanho|atendo|recebo)' + F + '|'
      + I + String.raw`\d+ (?:pessoas|clientes|alunas?|alunos|casos|sessões)` + F, 'iu'),
    regra: 'afirma um número ou uma frequência que não foi dado: retira esse dado e mantém a ideia sem quantificar' },
];

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
      system: 'És revisora de linguagem da marca 2Life, em português de Portugal. Recebes frases de um conteúdo já escrito, cada uma com os problemas encontrados. Reescreve cada frase só o necessário para resolver esses problemas: mantém o sentido, o tom, o tamanho aproximado, a pessoa gramatical ("tu") e tudo o que não tem problema. Não acrescentes ideias, números, exemplos nem casos. Não uses travessões. Devolve exatamente o mesmo número de frases, pela mesma ordem.',
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
  marcados.forEach((m, k) => { if (typeof frases[k] === 'string' && frases[k].trim()) novos[m.i] = frases[k]; });
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

async function corrigirAcentos(json, client) {
  return await reverLinguagem(await corrigirSoAcentos(json, client), client);
}

