// Teste local do passo 3 (15/11/2026). Corre com: node testar.js
// A app em teste/app tem as tres propostas aplicadas (reels, visual, estrategia), uma base de dados falsa
// e uma IA falsa que so guarda os pedidos em teste/saida/. Nada sai do computador.
const fs = require('fs');
const path = require('path');
const ia = require('./app/ia.js');
const estrategia = require('./app/estrategia.js');
const reels = require('./app/reels.js');

const TEMA = 'O significado que atribuímos ao que nos acontece';
const IDEIA = 'Não é o que nos acontece que decide como nos sentimos. É o significado automático que damos ao acontecimento, aprendido como proteção.';
let falhas = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  OK   ' : '  FALHA'} ${msg}`); if (!cond) falhas += 1; };
const saida = path.join(__dirname, 'saida');
const ultimo = (re) => fs.readFileSync(path.join(saida, fs.readdirSync(saida).filter(x => re.test(x)).sort().pop()), 'utf8');
const PROIBIDAS = [/\bvocê\b/i, /\bàs vezes\b/i, /\btalvez\b/i, /\balgo\b/i, /[—–]/, /\bconsulta\b/i, /\bpaciente\b/i,
  /mentoria|empresa|faturamento|negócio depender/i];
const limpo = (txt) => PROIBIDAS.every(re => !re.test(txt));
const tenta = async (fn) => { try { await fn(); } catch (e) { /* a IA falsa termina sempre com erro depois de guardar o pedido */ } };

(async () => {
  fs.readdirSync(saida).forEach(f => fs.unlinkSync(path.join(saida, f)));

  console.log('\n1. Opções que a app mostra');
  const l = estrategia.lista();
  ok(l.funcoes.map(f => f.nome).join(',') === 'Atração,Técnico,Autoridade', 'funções ATA: Atração, Técnico, Autoridade');
  ok(l.niveis.length === 5 && /não reconhece o padrão/.test(l.niveis[0].estado) && /preparada para entrar/.test(l.niveis[4].estado), 'cinco níveis da Matriz §8');
  ok(l.avancos.length === 7 && /^Observação:/.test(l.avancos[0]) && /^Entrada:/.test(l.avancos[6]), 'sete movimentos de CTA da Matriz §15, por ordem');
  ok(reels.lista().ctas.includes('Marca uma Conversa 2Life.') && !reels.lista().ctas.includes('mandar DM'), 'frases de CTA dos reels vêm do Livro §15');

  console.log('\n2. Carrossel de atração, nível 1, movimento Observação');
  process.env.CENARIO = 'carrossel-n1';
  await tenta(() => ia.gerarCarrossel({ tema: TEMA, ideia: IDEIA, layout: 'modelo2life',
    marcacao: { funcao: 'atracao', nivel: 1, avanco: estrategia.AVANCOS[0] } }));
  const c1 = ultimo(/carrossel-n1/);
  ok(/Função ATA predominante: Atração/.test(c1) && /isto acontece comigo/.test(c1), 'leva a função Atração e a pergunta de resultado');
  ok(/Nível de consciência 1:\*\* Sente desconforto, mas não reconhece o padrão/.test(c1), 'leva o nível 1 da Matriz');
  ok(/Próximo movimento \(CTA\): Observação/.test(c1) && /Leva esta pergunta contigo hoje/.test(c1), 'leva o movimento Observação com os exemplos do Livro');
  ok(/RELÊ A MARCAÇÃO: este conteúdo fala com quem está no NÍVEL 1/.test(c1), 'o lembrete final aponta o nível 1');
  ok((c1.match(/O CTA não deve pedir um movimento maior/g) || []).length >= 2, 'a regra do CTA proporcional aparece no bloco e no lembrete');
  // A frase das provas ("uma dona de loja da mentoria") vem de outra parte do ia.js: fica para um passo seguinte.
  ok(!/RELEIA A MARCAÇÃO|negócio depender dela|Conexão|Venda: esclarecer|Exemplo de abordagem neste nível/.test(c1), 'o texto antigo da estratégia já não entra no pedido');

  console.log('\n3. Carrossel de autoridade, nível 5, movimento Conversa');
  process.env.CENARIO = 'carrossel-n5';
  await tenta(() => ia.gerarCarrossel({ tema: TEMA, ideia: IDEIA, layout: 'modelo2life',
    marcacao: { funcao: 'autoridade', nivel: 5, avanco: 'Conversa: perceber se o processo faz sentido e iniciar uma relação comercial' } }));
  const c5 = ultimo(/carrossel-n5/);
  ok(/Função ATA predominante: Autoridade/.test(c5) && /Marca uma Conversa 2Life/.test(c5), 'leva Autoridade e os exemplos de Conversa');
  ok(/Nível de consciência 5/.test(c5) && /este é o processo de que preciso/.test(c5), 'leva o nível 5 e o seu objetivo');

  console.log('\n4. Reel (aberturas), técnico, nível 3, movimento Microação');
  process.env.CENARIO = 'reel-n3';
  await tenta(() => ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60,
    marcacao: { funcao: 'tecnico', nivel: 3, avanco: 'Microação: transformar o conteúdo numa pequena experiência' } }));
  const r3 = ultimo(/reel-n3/);
  ok(/Função ATA predominante: Técnico/.test(r3) && /agora compreendo/.test(r3), 'o reel também recebe a ficha (função Técnico)');
  ok(/falta transformar consciência em experiência/.test(r3) && /pedir ajuda numa situação concreta/.test(r3), 'leva o nível 3 e microações do Livro §14');

  console.log('\n5. Conteúdos antigos e campo livre');
  const antigo = estrategia.bloco({ funcao: 'conexao', nivel: 2, avanco: 'perceber que isso tem um custo' });
  ok(/Nível de consciência 2/.test(antigo) && /Próximo movimento pretendido:\*\* perceber/.test(antigo) && !/Função ATA/.test(antigo),
    'marcações antigas não partem a app: a função antiga é ignorada e o texto livre passa tal como está');
  const semFicha = estrategia.bloco({});
  ok(/A ficha de decisão não foi preenchida/.test(semFicha) && /Atração/.test(semFicha) && /Nível 5/.test(semFicha) && /O CTA não deve pedir/.test(semFicha) && estrategia.lembrete({}) === '',
    'sem marcação (só tema), a IA recebe a Matriz para escolher função, nível e um só CTA');

  console.log('\n6. Linguagem');
  const tudo = [estrategia.bloco({ funcao: 'atracao', nivel: 1, avanco: estrategia.AVANCOS[1] }),
    ...Object.keys(estrategia.FUNCOES).map(f => estrategia.bloco({ funcao: f })),
    ...[1, 2, 3, 4, 5].map(n => estrategia.lembrete({ nivel: n })), ...estrategia.AVANCOS].join('\n');
  ok(limpo(tudo), 'sem "você", "às vezes", "talvez", "algo", travessões, "consulta", "paciente" nem vocabulário do pacote');

  fs.writeFileSync(path.join(saida, 'exemplo-bloco.txt'), `${estrategia.bloco({ funcao: 'atracao', nivel: 1, avanco: estrategia.AVANCOS[0] })}\n\n${estrategia.lembrete({ funcao: 'atracao', nivel: 1 })}\n`);
  console.log(`\n${falhas ? `${falhas} FALHA(S)` : 'Tudo certo'}.`);
  process.exit(falhas ? 1 : 0);
})();
