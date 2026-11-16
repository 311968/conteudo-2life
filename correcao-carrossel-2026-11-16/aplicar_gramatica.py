# 16/11/2026: revisão de construção das frases.
# A revisão de linguagem só tinha regras de palavras; uma frase mal construída como
# "O piloto automático dizer sim por ti teve sempre uma função." passava (post estático, 3.º ângulo).
# Nova passagem com a IA, como a do género: lê as frases numeradas e devolve só as mal construídas,
# reescritas com o mínimo de mudança, em português de Portugal, a tratar por "tu", sem tocar nas frases protegidas.
# Entra na cadeia de revisão de todos os formatos (carrossel, post, reels, live). Corre depois de aplicar_post_paletas_genero.py.
# Uso: python aplicar_gramatica.py <pasta da app>
import sys, os

raiz = sys.argv[1]
p = os.path.join(raiz, 'ia.js')
t = open(p, encoding='utf-8').read()

FUNCAO = r'''// ---------- CONSTRUCAO DAS FRASES (16/11/2026, post estatico) ----------
// As regras de palavras nao apanham frases mal construidas ("O piloto automatico dizer sim por ti teve sempre uma funcao.").
// A IA le as frases da peca e devolve so as que estao mal construidas, ja corrigidas com o minimo de mudanca.
async function reverGramatica(json, client) {
  if (!json || typeof json !== 'object') return json;
  const textos = textosDoJson(json);
  const partes = textos.map(t => {
    let s = t;
    PROTEGIDAS.forEach((p, k) => { s = s.split(p).join(`\u0000${k}\u0000`); });
    return s.split(/((?<=[.!?…])[ \t]+|\n+)/).map(seg => seg.replace(/\u0000(\d)\u0000/g, (_, k) => PROTEGIDAS[Number(k)]));
  });
  const lista = [];
  partes.forEach((ps, i) => ps.forEach((seg, j) => {
    // So frases completas com pelo menos quatro palavras. Ficam de fora os titulos curtos e os pedacos que continuam
    // noutro campo (a linha antes do post acaba em virgula; a frase seguinte comeca em minuscula).
    const s = seg.trim();
    const completa = /[.!?…]["»”']?$/.test(s) && !/^[«"“]?\p{Ll}/u.test(s);
    if (j % 2 === 0 && completa && (s.match(/\p{L}+/gu) || []).length >= 4) lista.push({ i, j, frase: seg });
  }));
  if (!lista.length) return json;
  let r;
  try {
    r = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 3000,
      system: 'És revisora de português de Portugal da marca 2Life. Recebes as frases de uma peça, numeradas. Encontra só as frases com erros claros de construção; na dúvida, não mexas: sujeito sem verbo conjugado (por exemplo "O piloto automático dizer sim por ti teve sempre uma função."), verbos ou palavras em falta ou a mais, concordância errada, regência errada, frases cortadas a meio que não se percebem. Não contam como erro: escolhas de estilo, frases que soam bem mas podiam ser de outra forma, frases curtas de efeito, frases nominais intencionais ("Um lugar. Uma relação."), perguntas, enumerações nem a continuação de uma frase anterior. Para cada frase mal construída, reescreve-a corrigindo só a construção: mantém o sentido, as palavras e o tom, trata a pessoa por "tu", sem "algo", "talvez", "às vezes" nem travessões, e sem acrescentar ideias. Exemplo: "O piloto automático dizer sim por ti teve sempre uma função." passa a "O piloto automático, ao dizer sim por ti, teve sempre uma função." Não mexas nas frases protegidas: ' + PROTEGIDAS.map(f => `"${f}"`).join(' ') + ' Se não houver nenhuma frase mal construída, devolve a lista vazia.',
      tools: [{
        name: 'devolver_construcao',
        description: 'Devolve só as frases mal construídas, com o número e a frase corrigida.',
        input_schema: { type: 'object', properties: { trocas: { type: 'array', items: { type: 'object',
          properties: { n: { type: 'integer' }, nova: { type: 'string' } }, required: ['n', 'nova'] } } }, required: ['trocas'] },
      }],
      tool_choice: { type: 'tool', name: 'devolver_construcao' },
      messages: [{ role: 'user', content: JSON.stringify(lista.map((x, n) => ({ n, frase: x.frase }))) }],
    });
  } catch (e) {
    console.warn('[revisao] pedido da construção falhou, fica o texto original:', e.message);
    return json;
  }
  const uso = r.content.find(b => b.type === 'tool_use');
  const trocas = uso && uso.input && Array.isArray(uso.input.trocas) ? uso.input.trocas : [];
  let feitas = 0;
  for (const t of trocas) {
    const x = lista[t.n];
    if (!x || typeof t.nova !== 'string' || !t.nova.trim()) continue;
    if (protegidasEm(x.frase).some(p => !t.nova.includes(p))) continue;
    console.log(`[revisao] construção: "${x.frase.trim()}" -> "${t.nova.trim()}"`);
    partes[x.i][x.j] = t.nova.trim();
    feitas++;
  }
  console.log(`[revisao] construção: ${lista.length} frases lidas, ${feitas} corrigidas`);
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

def uma(antigo, novo):
    global t
    n = t.count(antigo)
    if n != 1:
        sys.exit(f'ia.js: esperava 1 ocorrência, encontrei {n}: {antigo[:70]!r}')
    t = t.replace(antigo, novo)

uma("async function corrigirAcentos(json, client) {\n",
    FUNCAO + "async function corrigirAcentos(json, client) {\n")
uma("  const revisto = await reverGenero(await reverPeca(await reverLinguagem(await corrigirSoAcentos(json, client), client), client), client);",
    "  const revisto = await reverGramatica(await reverGenero(await reverPeca(await reverLinguagem(await corrigirSoAcentos(json, client), client), client), client), client);")
uma("module.exports = { transcrever,", "module.exports = { reverGramatica, transcrever,")
open(p, 'w', encoding='utf-8', newline='').write(t)
print('ok ia.js')
