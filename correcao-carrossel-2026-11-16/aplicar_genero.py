# 16/11/2026: revisão de género nos ângulos do post (e em todos os formatos).
# Falha encontrada no fluxo normal do post: a IA trocava o feminino pelo masculino ("seres generosa" -> "seres generoso",
# "ser mais assertiva" -> "ser mais assertivo") e deixava passar "sentes-te mais cansado" e "seres necessário".
# Nova revisão: (1) instrução para tirar a marca com substantivos ou verbos, nunca trocar de género;
# (2) as frases que as regras de género já detetam vão marcadas como obrigatórias;
# (3) cada frase reescrita volta a passar pelas regras de género; se ainda tiver marca, segunda tentativa; se falhar, fica a original e o aviso.
# Corre depois de aplicar_gramatica.py. Uso: python aplicar_genero.py <pasta da app>
import sys, os

raiz = sys.argv[1]
p = os.path.join(raiz, 'ia.js')
t = open(p, encoding='utf-8').read()

ini = t.find('// ---------- GENERO (decima primeira ronda')
fim = t.find('// ---------- CONSTRUCAO DAS FRASES')
if ini < 0 or fim < 0 or fim < ini or t.count('async function reverGenero(json, client) {') != 1:
    sys.exit('ia.js: bloco da revisão de género não encontrado')

NOVO = r'''// ---------- GENERO (16/11/2026, post estatico) ----------
// A IA le as frases da peca e devolve so as ditas a pessoa ("tu") com marca de genero, ja reescritas sem genero.
// Antes trocava o feminino pelo masculino ("seres generosa" -> "seres generoso"): agora cada frase reescrita volta a
// passar pelas regras de genero, e as frases que as regras ja detetam vao marcadas como obrigatorias.
const REGRAS_GENERO = REGRAS_LINGUAGEM.filter(r => /num género|barras de género/.test(r.regra));
// Adjetivos com genero dentro de uma enumeracao ("de pareceres menos disponível, menos competente, menos amado")
REGRAS_GENERO.push({ re: new RegExp(I + String.raw`(?:és|estás|ficas|foste|eras|seres|estares|ficares|pareces|pareceres|parecer|sentes-te|sentires-te|te sentes|ser|ficar|estar)` + F
  + String.raw`[^.!?;:]{0,60}?(?:,\s+|\s+e\s+)(?:menos|mais|tão|muito|pouco)?\s*\p{L}*(?:ado|ada|ido|ida|oso|osa|ados|adas|idos|idas)` + F, 'iu') });
// Qualquer palavra acabada em -o/-a depois de "ser", "seres", "ficar", "sentir-te"... ("ser vista", "seres honesto"), com excecoes
const EXCECOES_GENERO = 'o|a|os|as|um|uma|uns|umas|tua|teu|tuas|teus|sua|seu|nossa|nosso|outra|outro|outras|outros|alguma|algum|nenhuma|nenhum|toda|todo|todas|todos|esta|este|essa|esse|aquela|aquele|pessoa|parte|forma|causa|vida|ajuda|prioridade|resposta|escolha|presença|mesma|mesmo|própria|próprio|isso|isto|disso|nada|muito|pouco|tanto|quanto|algo|sempre|ainda|apenas|só|tão|mais|menos|cada|nunca|agora|hoje|amanhã|depois|antes|certo|certa|claro|caro|cara|pouca|bastante|demasiado|demais';
REGRAS_GENERO.push({ re: new RegExp(I + String.raw`(?:ser|seres|és|eras|foste|fores|estar|estares|estás|estavas|ficar|ficares|ficas|ficaste|sentir-te|sentires-te|sentes-te|te sentes|pareces|pareceres|parecer|tornar-te|tornares-te)` + F
  + String.raw`\s+(?:(?:mais|menos|tão|muito|pouco|demasiado|sempre|logo|já)\s+)?(?!(?:` + EXCECOES_GENERO + ')' + F + String.raw`)\p{L}+[oa]s?` + F, 'iu') });
// "contra ti próprio", "por ti mesma" (qualquer preposicao antes de "ti")
REGRAS_GENERO.push({ re: pal(String.raw`ti\s+(?:mesm[oa]s?|própri[oa]s?)`) });
// Voz interior na primeira pessoa ("porque estou tão cansada?"): a IA decide se e a pessoa que le ou a Simone
REGRAS_GENERO.push({ re: new RegExp(I + String.raw`(?:estou|sou|fico|fiquei|estava|era|sinto-me|me sinto|senti-me)` + F
  + String.raw`\s+(?:(?:mais|menos|tão|muito|pouco|demasiado|sempre|já)\s+)?(?!(?:` + EXCECOES_GENERO + ')' + F + String.raw`)\p{L}+[oa]s?` + F, 'iu') });
const temGenero = (frase) => REGRAS_GENERO.some(r => r.re.test(frase));

const SISTEMA_GENERO = 'És revisora da marca 2Life, em português de Portugal. O público inclui homens e mulheres. Recebes frases de uma peça, numeradas; o campo "antes" é a frase anterior, só para contexto (reescreve apenas "frase"). Encontra as frases dirigidas à pessoa que lê ("tu"), incluindo a voz interior dela e o texto no ecrã, que tenham adjetivos, particípios ou pronomes com marca de um só género, no masculino ou no feminino. As frases com "obrigatoria": true foram detetadas por regras automáticas: reescreve-as se forem dirigidas a "tu"; se falarem de outra pessoa ("alguém vai ficar desiludido", "a tua mãe ficou cansada"), não as incluas na resposta. Reescreve cada uma sem nenhuma palavra com marca de género, mudando o mínimo e mantendo o sentido e o tom: troca o adjetivo por um substantivo, por um verbo ou por outra construção. Trocar o feminino pelo masculino, ou o masculino pelo feminino, NÃO resolve. Nunca uses barras ("o/a"). Exemplos: "O problema não é seres generosa demais." -> "O problema não é dares demais de ti."; "sentes-te mais cansado" -> "sentes mais cansaço"; "a certeza de seres necessário" -> "a certeza de fazeres falta"; "Como ser mais assertiva." -> "Como ter mais assertividade."; "ficas sozinho" -> "ficas sem ninguém"; "continuar parado" -> "continuar em pausa"; "a ti própria" -> "a ti"; "estás seguro" -> "estás em segurança"; numa enumeração, lê todas as palavras: "de pareceres menos disponível, menos competente, menos amado" -> "de pareceres menos disponível, menos competente, de te amarem menos". Infinitivos e fragmentos sem sujeito que descrevem a pessoa que lê (os medos ou desejos dela: "Ser julgada como difícil.", "Deixar de ser vista como a pessoa que ajuda.", "Só de seres honesto contigo.") contam como dirigidos a "tu" e têm de ficar sem género, por exemplo "Ser julgada como difícil." -> "Que te julguem como difícil."; "Deixar de ser vista como a pessoa que ajuda." -> "Deixarem de te ver como a pessoa que ajuda."; "Só de seres honesto contigo." -> "Só de teres honestidade contigo." A voz interior da pessoa que lê, na primeira pessoa (perguntas que ela se faz), também conta: "porque estou tão cansada de uma vida que escolhi?" -> "porque sinto tanto cansaço de uma vida que escolhi?"; "contra ti próprio" -> "contra ti". Se for a Simone a falar de si, deixa igual. Também os fragmentos que continuam a frase anterior: depois de "Não precisas de responder certo.", "Só honesto." -> "Só com honestidade." Não mexas em frases que falam de outra pessoa ("ele", "a tua mãe", "alguém", "uma pessoa"), em citações atribuídas a alguém nem nas frases protegidas: ' + PROTEGIDAS.map(f => `"${f}"`).join(' ') + ' Se não houver nenhuma frase a reescrever, devolve a lista vazia.';

async function pedirGenero(itens, client) {
  const r = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 3000,
    system: SISTEMA_GENERO,
    tools: [{
      name: 'devolver_genero',
      description: 'Devolve só as frases a trocar, com o número e a frase nova.',
      input_schema: { type: 'object', properties: { trocas: { type: 'array', items: { type: 'object',
        properties: { n: { type: 'integer' }, nova: { type: 'string' } }, required: ['n', 'nova'] } } }, required: ['trocas'] },
    }],
    tool_choice: { type: 'tool', name: 'devolver_genero' },
    messages: [{ role: 'user', content: JSON.stringify(itens) }],
  });
  const uso = r.content.find(b => b.type === 'tool_use');
  return uso && uso.input && Array.isArray(uso.input.trocas) ? uso.input.trocas : [];
}

async function reverGenero(json, client) {
  if (!json || typeof json !== 'object' || (!json.legenda && !Array.isArray(json.blocos) && !Array.isArray(json.slides) && !Array.isArray(json.opcoes))) return json;
  const textos = textosDoJson(json);
  const partes = textos.map(t => {
    let s = t;
    PROTEGIDAS.forEach((p, k) => { s = s.split(p).join(`\u0000${k}\u0000`); });
    return s.split(/((?<=[.!?…])[ \t]+|\n+)/).map(seg => seg.replace(/\u0000(\d)\u0000/g, (_, k) => PROTEGIDAS[Number(k)]));
  });
  const lista = [];
  partes.forEach((ps, i) => ps.forEach((seg, j) => { if (j % 2 === 0 && seg.trim() && /\p{L}{3}/u.test(seg)) lista.push({ i, j, frase: seg, antes: j >= 2 ? ps[j - 2].trim() : '' }); }));
  if (!lista.length) return json;
  // A frase anterior vai como contexto: "Só honesto." sozinha nao mostra que fala de quem le
  const comContexto = (x, extra) => Object.assign(x.antes ? { antes: x.antes } : {}, extra);
  // Numa frase que as regras nao marcaram, a reescrita so conta se tirar uma palavra com terminacao de genero
  // ("Só honesto." -> "Só com honestidade."); evita mexer em frases neutras ("o teu sim mais te custa a dizer").
  const excecao = new RegExp('^(?:' + EXCECOES_GENERO + ')$', 'iu');
  const palavrasDe = (s) => (String(s).toLowerCase().match(/\p{L}+(?:-\p{L}+)*/gu) || []);
  const tiraGenero = (velha, nova) => { const ficam = new Set(palavrasDe(nova));
    return palavrasDe(velha).some(w => !ficam.has(w) && /[oa]s?$/u.test(w) && w.length > 3 && !excecao.test(w)); };
  const aceita = (x, nova) => typeof nova === 'string' && nova.trim() && !temGenero(nova)
    && !protegidasEm(x.frase).some(p => !nova.includes(p))
    && (temGenero(x.frase) || tiraGenero(x.frase, nova));
  let feitas = 0;
  const falhadas = new Set();
  try {
    // 1.ª passagem: todas as frases, com as ja detetadas marcadas como obrigatorias
    const trocas = await pedirGenero(lista.map((x, n) => comContexto(x, temGenero(x.frase) ? { n, frase: x.frase, obrigatoria: true } : { n, frase: x.frase })), client);
    for (const t of trocas) {
      const x = lista[t.n];
      if (!x) continue;
      if (aceita(x, t.nova)) { partes[x.i][x.j] = t.nova.trim(); feitas++; } else falhadas.add(t.n);
    }
    // 2.ª passagem: so as que ainda tem marca de genero (as que a IA nao trocou ou trocou mal)
    const pendentes = lista.map((x, n) => ({ x, n })).filter(({ x, n }) => falhadas.has(n) || temGenero(partes[x.i][x.j]));
    if (pendentes.length) {
      const trocas2 = await pedirGenero(pendentes.map(({ x, n }) => comContexto(x, { n, frase: x.frase, obrigatoria: true,
        aviso: 'se é dirigida a "tu", ainda tem marca de género: tira-a com um substantivo, um verbo ou outra construção, sem trocar de género; se fala de outra pessoa, não a incluas' })), client);
      for (const t of trocas2) {
        const x = lista[t.n];
        if (x && aceita(x, t.nova)) { partes[x.i][x.j] = t.nova.trim(); feitas++; }
      }
      const resto = pendentes.filter(({ x }) => temGenero(partes[x.i][x.j])).map(({ x }) => partes[x.i][x.j].trim());
      if (resto.length) console.warn('[revisao] género por corrigir: ' + resto.map(f => `"${f.slice(0, 80)}"`).join('; '));
    }
  } catch (e) {
    console.warn('[revisao] pedido do género falhou, fica o texto original:', e.message);
    return json;
  }
  console.log(`[revisao] género: ${lista.length} frases lidas, ${feitas} reescritas`);
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

'''

t = t[:ini] + NOVO + t[fim:]
open(p, 'w', encoding='utf-8', newline='').write(t)
print('ok ia.js')
