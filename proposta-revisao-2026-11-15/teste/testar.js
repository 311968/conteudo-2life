// Teste local da revisao de linguagem (15/11/2026). Corre com: node testar.js
// A app em teste/app tem as quatro propostas aplicadas. A IA falsa devolve os textos reais do teste de 15/11.
const fs = require('fs');
const path = require('path');
const ia = require('./app/ia.js');
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? '  OK   ' : '  FALHA'} ${m}`); if (!c) falhas += 1; };
const saida = path.join(__dirname, 'saida');
const pedidos = (re) => fs.readdirSync(saida).filter(x => re.test(x));
const tudo = (o) => JSON.stringify(o);
const TEMA = 'O significado que atribuímos ao que nos acontece';
const IDEIA = 'Não é o que nos acontece que decide como nos sentimos.';

(async () => {
  fs.readdirSync(saida).forEach(f => fs.unlinkSync(path.join(saida, f)));

  console.log('\n1. Aberturas do reel "significado" (tinham "algo errado")');
  process.env.CENARIO = 'aberturas';
  const a = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: {} });
  ok(!/algo/.test(tudo(a)), 'já não têm "algo"');
  ok(a.ganchos[0].frase === 'Ela não respondeu à mensagem e tu já decidiste que fizeste um erro.', 'a frase revista entrou no sítio certo (abertura 1)');
  ok(a.ganchos[1].frase.startsWith('Não é o que te acontece'), 'as frases sem problema ficaram iguais');
  ok(a.recomendada === 0 && a.ganchos[0].recomendado === true, 'a recomendação não se perdeu');
  const p1 = fs.readFileSync(path.join(saida, pedidos(/aberturas-devolver_frases/)[0]), 'utf8');
  ok(/fizeste algo errado/.test(p1) && !/Não é o que te acontece/.test(p1), 'só as frases com problemas foram enviadas para revisão');

  console.log('\n2. Roteiro "significado" (tinha "talvez" duas vezes)');
  process.env.CENARIO = 'roteiro';
  const r = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a.ganchos[0], cta: '', marcacao: {} });
  ok(!/talvez/i.test(tudo(r)), 'já não tem "talvez"');
  ok(r.blocos.length === 5 && r.blocos[0].tempo === '0-3s' && r.blocos[4].rotulo === 'CTA', 'estrutura dos blocos intacta');

  console.log('\n3. Roteiro R3 (tinha "és obrigada" e "quase todas as semanas")');
  process.env.CENARIO = 'r3';
  const r3 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: { tipo: 'sessao', frase: 'x' }, cta: '', marcacao: {} });
  ok(!/obrigada/.test(tudo(r3)) && /já não tens de ler/.test(r3.blocos[3].fala), 'forma só no feminino reescrita');
  ok(r3.capa.intro === 'Em sessão, ouço esta frase', 'frequência inventada retirada da capa');
  ok(r3.capa.titulo === 'Isto significa que não sou importante', 'o resto da capa ficou igual');

  console.log('\n4. Sem problemas, sem pedido extra');
  const antes = pedidos(/devolver_frases/).length;
  process.env.CENARIO = 'limpo';
  const real = require('../../proposta-reels-2026-11-15/teste-real/resultado.json');
  real.aberturas.ganchos[0].frase = 'Ela não respondeu à mensagem e tu já decidiste que erraste.';
  real.aberturas.razao = 'A cena do silêncio é reconhecível.';
  real.aberturas.ganchos[0].tela = 'Já decidiste que erraste';
  await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: {} });
  ok(pedidos(/devolver_frases/).length === antes, 'nenhum pedido de revisão quando o texto está limpo');

  console.log('\n5. Deteção (sem IA)');
  const deteta = (t) => { const s = fs.readFileSync(path.join(__dirname, '..', 'proposta', 'revisao.js'), 'utf8'); return t; };
  const casos = [
    ['Repete esta pausa todos os dias.', false], ['Em sessão, ouço isto todas as semanas.', true],
    ['80% das pessoas sentem isto.', true], ['Estás a fazer o que podes.', false], ['És uma pessoa atenta.', false],
    ['Ficas sozinha com isso.', true], ['Às vezes custa.', true], ['Há dias em que custa.', false],
  ];
  const src = fs.readFileSync(path.join(__dirname, 'app', 'ia.js'), 'utf8');
  const bloco = src.slice(src.indexOf('// String.raw guarda'), src.indexOf('async function reverLinguagem'));
  const { problemasDe } = new Function(`${bloco}; return { problemasDe };`)();
  for (const [t, esperado] of casos) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log(`\n${falhas ? `${falhas} FALHA(S)` : 'Tudo certo'}.`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
