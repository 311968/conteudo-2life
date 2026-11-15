// Teste local da proposta dos reels (15/11/2026). Corre com: node testar.js
// Usa a app proposta (teste/app), uma base de dados falsa e uma IA falsa. Nada sai do computador.
const fs = require('fs');
const path = require('path');
const ia = require('./app/ia.js');
const reels = require('./app/reels.js');

const TEMA = 'O significado que atribuímos ao que nos acontece';
const IDEIA = 'Não é o que nos acontece que decide como nos sentimos. É o significado automático que damos ao acontecimento, aprendido como proteção. Quando o reconhecemos, podemos escolher outra leitura.';
let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  OK   ' : '  FALHA'} ${msg}`); if (!cond) falhas += 1; };
const ultimo = (re) => {
  const f = fs.readdirSync(path.join(__dirname, 'saida')).filter(x => re.test(x)).sort().pop();
  return fs.readFileSync(path.join(__dirname, 'saida', f), 'utf8');
};
const PROIBIDAS = [/\bvocê\b/i, /\bàs vezes\b/i, /\btalvez\b/i, /\balgo\b/i, /[—–]/, /\bconsulta\b/i, /\bpaciente\b/i];
const limpo = (txt) => PROIBIDAS.every(re => !re.test(txt));

(async () => {
  fs.readdirSync(path.join(__dirname, 'saida')).forEach(f => fs.unlinkSync(path.join(__dirname, 'saida', f)));

  console.log('\n1. Três aberturas (receita automática), 60 segundos');
  process.env.CENARIO = 'aberturas';
  const a = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: { funcao: 'conexao', nivel: 2 } });
  const sysA = ultimo(/aberturas-entregar_ganchos/);
  ok(/Primeiro, a pessoa vê-se/.test(sysA), 'o pedido inclui o princípio "Primeiro, a pessoa vê-se"');
  ok(/Problema concreto/.test(sysA) && /Afirmação contraintuitiva/.test(sysA) && /Curiosidade/.test(sysA), 'o pedido pede os três tipos de abertura');
  ok(/trazem-na logo a seguir/.test(sysA) && /antes do CTA/.test(sysA), 'o pedido exige a situação a seguir e a resposta antes do CTA');
  ok(!/Nomeação de dor|Pergunta cirúrgica|faturamento/.test(sysA), 'os ganchos antigos do pacote já não entram no pedido');
  ok(a.ganchos.map(g => g.tipo).join(',') === 'problema,contraintuitiva,curiosidade', 'a resposta traz um de cada tipo, por ordem');
  ok(a.ganchos.filter(g => g.recomendado).length === 1 && a.recomendada === 2, 'exatamente uma abertura vem marcada como recomendada');

  console.log('\n2. Roteiro a partir da abertura escolhida (curiosidade)');
  process.env.CENARIO = 'roteiro-curiosidade';
  const r = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a.ganchos[2], cta: '', marcacao: {} });
  const sysR = ultimo(/roteiro-curiosidade-entregar_roteiro/);
  ok(/O segundo bloco traz logo a situação reconhecível/.test(sysR), 'o pedido manda trazer a situação no segundo bloco');
  ok(/entrega a resposta/.test(sysR) && /Resposta que o vídeo entrega/.test(sysR), 'o pedido leva a resposta que o vídeo tem de entregar');
  ok(r.blocos[0].fala === a.ganchos[2].frase, 'o primeiro bloco usa a abertura escolhida');
  ok(r.blocos.findIndex(b => /isto quer dizer que eu/.test(b.fala)) < r.blocos.length - 1, 'a resposta aparece antes do bloco do CTA (resposta de exemplo)');

  console.log('\n3. Abertura própria da R3');
  process.env.CENARIO = 'r3';
  const a3 = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: { funcao: 'venda', nivel: 3 }, receita: 'r3' });
  const sys3 = ultimo(/r3-entregar_ganchos/);
  ok(/Receita R3/.test(sys3) && /Quando alguém me diz/.test(sys3), 'o pedido usa a abertura da R3 ("Quando alguém me diz…")');
  ok(!/Afirmação contraintuitiva \("contraintuitiva"\)/.test(sys3), 'na R3 não pede os três tipos gerais');
  ok(a3.ganchos.every(g => g.tipo === 'sessao') && a3.ganchos.filter(g => g.recomendado).length === 1, 'três variações R3, uma recomendada');
  process.env.CENARIO = 'r3-roteiro';
  const r3 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a3.ganchos[a3.recomendada], cta: '', marcacao: {} });
  const sysR3 = ultimo(/r3-roteiro-entregar_roteiro/);
  ok(/Segue a Receita R3/.test(sysR3) && /nunca "consulta"/.test(sysR3), 'o roteiro segue os 5 passos da R3 e a regra "sessão"');
  ok(r3.blocos.length === 5, 'roteiro R3 com 5 blocos (resposta de exemplo)');

  console.log('\n4. Linguagem');
  const fonte = fs.readFileSync(path.join(__dirname, 'app', 'reels.js'), 'utf8');
  const textoReels = [reels.bloco(30), reels.bloco(60), reels.bloco(90), reels.tarefaAberturas(''), reels.tarefaAberturas('r3'),
    reels.regrasRoteiro({ tipo: 'curiosidade' }), reels.regrasRoteiro({ tipo: 'sessao' })].join('\n')
    // As instrucoes citam entre aspas as palavras a evitar ("algo", "consulta"...): essas citacoes nao contam.
    .replace(/"[^"\n]*"/g, m => (/algo|talvez|às vezes|consulta|cansada|obrigada/i.test(m) ? '' : m))
    .replace(/^- "?Algo"?, "?talvez"? e "?às vezes"?.*$/gm, '');
  ok(limpo(textoReels), 'textos do novo reels.js sem "você", "às vezes", "talvez", "algo", travessões, "consulta" ou "paciente" (fora das citações das regras)');
  ok(!/[—–]/.test(fonte), 'reels.js sem travessões');
  ok(limpo(JSON.stringify(require('./respostas-de-exemplo.js'))), 'respostas de exemplo sem palavras excluídas');

  fs.writeFileSync(path.join(__dirname, 'saida', 'resultado.json'), JSON.stringify({ aberturas: a, roteiro: r, aberturasR3: a3, roteiroR3: r3 }, null, 2));
  console.log(`\n${falhas ? falhas + ' falha(s).' : 'Tudo certo.'} Pedidos e respostas em teste/saida/.`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
