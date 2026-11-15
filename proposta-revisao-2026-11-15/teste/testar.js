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
  ok(r.blocos.length === 5 && r.blocos[0].rotulo === 'ABERTURA' && r.blocos[4].rotulo === 'CTA', 'estrutura dos blocos intacta');

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
    ['É a frase que ouço em sessão, dita com certeza.', true], ['Quando alguém me diz "não consigo dizer não", não olho só para o não.', false],
    ['Já não és obrigada a ler assim.', true], ['Toda a dificuldade em expandir revela um afastamento da essência.', false],
  ];
  const src = fs.readFileSync(path.join(__dirname, 'app', 'ia.js'), 'utf8');
  const bloco = src.slice(src.indexOf('// String.raw guarda'), src.indexOf('async function reverLinguagem'));
  const { problemasDe } = new Function(`${bloco}; return { problemasDe };`)();
  for (const [t, esperado] of casos) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log('\n6. Frases protegidas');
  // A IA falsa, neste cenario, estraga a frase-mestre ao rever: a revisao tem de manter o original.
  process.env.CENARIO = 'protegida';
  // Mesma frase com "talvez" e a frase protegida: vai para revisao, a IA falsa estraga a protegida, fica o original
  real.roteiro.legenda = 'Talvez seja este o ponto: A confiança constrói-se na raiz.';
  real.roteiro.capa.intro = 'Talvez seja só isto';
  real.roteiro.primeiro_comentario = 'Talvez te reconheças. A confiança constrói-se na raiz.';
  const rp = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a.ganchos[0], cta: '', marcacao: {} });
  ok(rp.legenda === 'Talvez seja este o ponto: A confiança constrói-se na raiz.', 'frase com frase protegida estragada pela revisão: fica a original');
  ok(rp.capa.intro === 'seja só isto', 'na mesma revisão, as outras frases foram corrigidas');
  ok(rp.primeiro_comentario === 'te reconheças. A confiança constrói-se na raiz.', 'revisão frase a frase: só a frase com problema muda; a protegida nem vai para revisão');

  console.log('\n7. Falhas da terceira ronda (textos reais da IA)');
  const r3real = require('../teste-real/resultado-ronda3.json');
  const pal = (t) => (String(t || '').match(/[\p{L}\d]+(?:[-’'][\p{L}]+)*/gu) || []).length;
  process.env.CENARIO = 'ronda3-r3';
  const g3 = r3real.r3.aberturas.ganchos[r3real.r3.aberturas.recomendada];
  const v3 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: g3, cta: '', marcacao: {} });
  const total3 = v3.blocos.reduce((s, b) => s + pal(b.fala), 0);
  ok(total3 <= 150 && v3.duracao_estimada <= 60, `R3 encurtada para ${total3} palavras, cerca de ${v3.duracao_estimada} s (antes 167, cerca de 67 s)`);
  ok(v3.blocos.length === 5 && v3.blocos.map(b => b.rotulo).join(',') === 'ABERTURA,SITUAÇÃO,MECANISMO,NOVA POSSIBILIDADE,CTA', 'os cinco passos mantêm-se');
  ok(v3.blocos[0].fala === r3real.r3.roteiro.blocos[0].fala && v3.blocos[4].fala === r3real.r3.roteiro.blocos[4].fala, 'a abertura escolhida e o CTA de Conversa ficam iguais');
  ok(v3.blocos[0].tempo === '0-8s' && /s$/.test(v3.blocos[4].tempo), `tempos recalculados pela métrica (abertura ${v3.blocos[0].tempo}, CTA ${v3.blocos[4].tempo})`);
  ok(!/decepcion/.test(JSON.stringify(v3)), '"decepcionar" passou a grafia de Portugal');
  ok(v3.legenda.split('\n')[0] !== r3real.r3.roteiro.legenda.split('\n')[0], 'a primeira linha da legenda, que repetia a situação do vídeo, foi reescrita');
  ok(/Conversa 2Life\.?$/.test(v3.legenda.trim()), 'a legenda continua a terminar com o CTA de Conversa');

  process.env.CENARIO = 'ronda3-carrossel';
  const c3 = await ia.gerarCarrossel({ tema: TEMA, ideia: IDEIA, serie: '', referencias: [], layout: 'modelo2life', marcacao: {} });
  ok(c3.legenda.split('\n')[0] === 'Há quem passe anos a provar o seu valor sem perceber de onde vem essa exigência.', 'carrossel: a primeira linha da legenda, que repetia a lâmina 2, foi reescrita');
  ok(c3.primeiro_comentario === 'Que frase dizes a ti quando alguém não responde?', 'carrossel: o primeiro comentário deixou de ser um segundo CTA');
  ok(/Leva esta pergunta contigo hoje\.$/.test(c3.legenda.trim()), 'carrossel: um só CTA editorial, na última linha da legenda');

  console.log('\n8. Deteção nova (sem IA)');
  const casos2 = [['Aprendeste que decepcionar alguém custava caro.', true], ['Estás fazendo o que podes.', true],
    ['Estás a fazer o que podes.', false], ['Guarda este carrossel para depois.', false]];
  for (const [t, esperado] of casos2) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log('\n9. Falhas da quarta ronda (textos reais da IA)');
  const r4 = require('../teste-real/resultado-ronda4.json');
  const CTA_C = /guarda|partilha|envia|marca|segue|comenta/i;
  process.env.CENARIO = 'ronda4-r3';
  const g4 = r4.r3.aberturas.ganchos[r4.r3.aberturas.recomendada];
  const v4 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: g4, cta: '', marcacao: {} });
  ok(v4.blocos[0].fala === g4.frase, 'R3: a abertura escolhida entra literal no primeiro bloco, com as aspas');
  ok(!/seres desiludido|estás sozinho/.test(JSON.stringify(v4.blocos)), 'R3: "seres desiludido" e "estás sozinho" reescritos sem género');
  ok(!v4.legenda.includes('Quando alguém me diz, ninguém se ofereceu'), 'R3: o parágrafo da legenda que repetia a abertura foi reescrito');
  ok(/Conversa 2Life\.?$/.test(v4.legenda.trim()) && v4.duracao_estimada <= 60, `R3: CTA de Conversa no fim da legenda; cerca de ${v4.duracao_estimada} s`);
  process.env.CENARIO = 'ronda4-sig';
  const s4 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: r4.significado.aberturas.ganchos[0], cta: '', marcacao: {} });
  ok(!s4.legenda.includes('Nenhum facto novo apareceu. Só um significado antigo'), 'Significado: o parágrafo da legenda que repetia a fala foi reescrito');
  ok(s4.blocos[3].fala.includes('O automático reage. A essência escolhe. A ação cria evidência. A repetição transforma a identidade.'), 'Significado: o mecanismo continua integral');
  ok(s4.legenda.trim().endsWith('Guarda este vídeo para voltares a esta pergunta da próxima vez que isto acontecer.') && s4.blocos[4].fala === r4.significado.roteiro.blocos[4].fala, 'Significado: o mesmo CTA de Aprofundamento no vídeo e na legenda');
  process.env.CENARIO = 'ronda4-carrossel';
  const c4 = await ia.gerarCarrossel({ tema: TEMA, ideia: IDEIA, serie: '', referencias: [], layout: 'modelo2life', marcacao: {} });
  ok(!c4.legenda.includes('Não é fraqueza interpretar assim. É um mecanismo'), 'carrossel: o parágrafo da legenda que repetia a lâmina 6 foi reescrito');
  ok(!/chama se/.test(JSON.stringify(c4.slides)) && !/apanhada/.test(c4.legenda), 'carrossel: "chama se" e "seres apanhada" corrigidos');
  ok(c4.legenda.trim().endsWith('Só repara.') && !CTA_C.test(c4.primeiro_comentario), 'carrossel: um só CTA (Observação), comentário sem CTA');

  console.log('\n10. Deteção nova (sem IA)');
  const casos3 = [['Esse passo chama se significado.', true], ['A pessoa se sente sozinha.', true], ['Ninguém se ofereceu para ajudar.', false],
    ['Esse passo chama-se significado.', false], ['Proteger-te de seres desiludido outra vez.', true], ['Para te proteger do que doía.', false]];
  for (const [t, esperado] of casos3) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log('\n11. Falhas da quinta ronda (textos reais da IA)');
  const r5 = require('../teste-real/resultado-ronda5.json');
  process.env.CENARIO = 'ronda5-r3';
  const g5 = r5.r3.aberturas.ganchos[r5.r3.aberturas.recomendada];
  const v5 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: g5, cta: '', marcacao: {} });
  const mec = 'O automático reage. A essência escolhe. A ação cria evidência. A repetição transforma a identidade.';
  ok(v5.duracao_estimada <= 60, `R3: cerca de ${v5.duracao_estimada} s (antes cerca de 64 s), mesmo com o mecanismo protegido no bloco`);
  ok(v5.blocos[2].fala.includes(mec), 'R3: o mecanismo continua literal depois de encurtar');
  ok(v5.blocos[0].fala === g5.frase && v5.blocos[4].fala === r5.r3.roteiro.blocos[4].fala, 'R3: abertura e CTA de Conversa iguais');
  const casos4 = [['Só para teres a certeza de que não ficaste mal vista.', true], ['Ajudou-te a não ser apanhado de surpresa.', true],
    ['Não é o que te acontece que te machuca.', true], ['Era uma forma de te protegeres antes de seres magoado.', true],
    ['Qual é a frase que mais rápido te aparece?', false], ['O padrão foi aprendido cedo.', false]];
  for (const [t, esperado] of casos4) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log('\n12. Sétima ronda: a IA não encurta (último recurso sem IA)');
  const r7 = require('../teste-real/resultado-ronda7.json');
  process.env.CENARIO = 'ronda7-r3-teimosa';
  const g7 = r7.r3.aberturas.ganchos[r7.r3.aberturas.recomendada];
  const v7 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: g7, cta: '', marcacao: {} });
  ok(v7.duracao_estimada <= 60 && Array.isArray(v7.cortes) && v7.cortes.length >= 1, `R3: cerca de ${v7.duracao_estimada} s, com ${(v7.cortes || []).length} frase(s) tirada(s) e registada(s)`);
  ok(v7.blocos[0].fala === g7.frase && v7.blocos[4].fala === r7.r3.roteiro.blocos[4].fala && v7.blocos.length === 5, 'R3: abertura, CTA e os cinco blocos intactos');
  ok(problemasDe('Foi aprendida como forma de te proteggeres.').length > 0 && !problemasDe('Essa leitura protegeu-te.').length, 'gralha "proteggeres" apanhada; palavra certa passa');

  console.log('\n13. Oitava ronda (deteção, sem IA)');
  const casos5 = [['Protegeu-te de ser apanhado de surpresa.', true], ['Perder o lugar. Deixar de ser escolhida.', true],
    ['Protegeu-te de ser magoado outra vez.', true]];
  console.log('\n14. Nona ronda (deteção, sem IA)');
  casos5.push(['Há uma frase que decides sozinho.', true], ['Ficou a pensar: tenho de fazer tudo sozinho.', true],
    ['Vou ser deixada de lado outra vez.', true], ['Para nunca mais ser apanhado desprevenido.', true],
    ['Na sessão, ouço esta frase.', true], ['Foste tu, fizeste alguma coisa, és demasiado.', false],
    ['Um comentário directo numa fracção de segundo.', true], ['É protecção.', true], ['A ação cria evidência.', false],
    ['Interpretar tudo como ameaça manteve-te segura.', true], ['Para não te apanharem desprevenida.', true],
    ['Isto dá-te significado.', false], ['Numa secção do relatório.', false],
    ['Enquanto fores útil, estás seguro/a.', true], ['A raiz é a confiança.', true], ['A confiança constrói-se na raiz.', false], ['Ainda consigo sozinha.', true]);
  for (const [t, esperado] of casos5) ok((problemasDe(t).length > 0) === esperado, `${esperado ? 'apanha' : 'deixa passar'}: "${t}"`);

  console.log('\n15. Género lido pela IA (teste pela interface)');
  process.env.CENARIO = 'genero';
  real.roteiro.legenda = 'Adias o pedido. Hoje só te deixa mais sozinho.\n\nA confiança constrói-se na raiz.';
  const rg = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a.ganchos[0], cta: '', marcacao: {} });
  ok(/Hoje só te deixa mais sem apoio\./.test(rg.legenda) && /Adias o pedido\./.test(rg.legenda) && /A confiança constrói-se na raiz\./.test(rg.legenda),
    'a frase com género é trocada; as outras e a frase protegida ficam iguais');

  console.log(`\n${falhas ? `${falhas} FALHA(S)` : 'Tudo certo'}.`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('ERRO:', e); process.exit(1); });
