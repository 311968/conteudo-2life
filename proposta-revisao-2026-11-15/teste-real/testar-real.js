// Teste com a IA real, numa copia fora da app. Terceira ronda a 15/11/2026; quarta ronda com a revisao da peca
// (legenda, comentario, duracao) e o mecanismo integral no Significado.
// Tem as quatro propostas aplicadas (reels, layout Modelo 2Life, estrategia, revisao de linguagem) e os
// blocos de identidade corrigidos em local. Le a chave da app SO EM LEITURA. Nao escreve na app.
// Uso: node testar-real.js > resultado.json
const ia = require('./ia.js');
const estrategia = require('./estrategia.js');

const avancoDe = (nome) => estrategia.AVANCOS.find(a => a.startsWith(nome + ':'));
const TEMA = 'O significado que atribuímos ao que nos acontece';
const IDEIA = 'Não é o que nos acontece que decide como nos sentimos. É o significado automático que damos ao acontecimento, aprendido como proteção. Quando o reconhecemos, podemos escolher outra leitura.';

// Marcacoes desta ronda (proposta de estrategia mais recente)
const M_SIGNIFICADO = { funcao: 'tecnico', nivel: 2, avanco: avancoDe('Aprofundamento') };
const M_R3 = { funcao: 'autoridade', nivel: 3, avanco: avancoDe('Conversa') };
const M_CARROSSEL = { funcao: 'atracao', nivel: 1, avanco: avancoDe('Observação') };

// Avisos da revisao automatica ficam no resultado
const avisos = [];
const warn = console.warn;
console.warn = (...a) => { avisos.push(a.join(' ')); warn(...a); };

// Se a IA devolver um formato inesperado ("Tente de novo"), repete uma vez, como a Simone faria na app.
async function passo(nome, fn) {
  const t0 = Date.now();
  try {
    let v;
    try { v = await fn(); }
    catch (e) { if (!/Tente de novo/.test(e.message)) throw e; warn(`${nome}: ${e.message} A repetir uma vez.`); v = await fn(); }
    return { ok: true, segundos: Math.round((Date.now() - t0) / 1000), ...v };
  }
  catch (e) { return { ok: false, erro: e.message }; }
  finally { warn(`${nome}: ${Math.round((Date.now() - t0) / 1000)} s`); }
}

(async () => {
  const r = { tema: TEMA, ideia: IDEIA, marcacoes: { significado: M_SIGNIFICADO, r3: M_R3, carrossel: M_CARROSSEL } };
  r.significado = await passo('significado', async () => {
    // Pedido da Simone (quarta ronda): o mecanismo entra na formulacao integral. Na app, escreve-se no campo "ideia".
    const IDEIA_S = IDEIA + ' Na nova possibilidade, usa o mecanismo do método na formulação integral.';
    const aberturas = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA_S, referencias: [], duracao: 60, marcacao: M_SIGNIFICADO });
    const roteiro = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA_S, referencias: [], duracao: 60,
      gancho: aberturas.ganchos[aberturas.recomendada], cta: '', marcacao: M_SIGNIFICADO });
    return { ideia: IDEIA_S, aberturas, roteiro };
  });
  r.r3 = await passo('r3', async () => {
    const aberturas = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: M_R3, receita: 'r3' });
    const roteiro = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60,
      gancho: aberturas.ganchos[aberturas.recomendada], cta: '', marcacao: M_R3 });
    return { aberturas, roteiro };
  });
  r.carrossel = await passo('carrossel', async () => ({
    carrossel: await ia.gerarCarrossel({ tema: TEMA, ideia: IDEIA, serie: '', referencias: [], layout: 'modelo2life', marcacao: M_CARROSSEL }),
  }));
  r.avisos = avisos;
  console.log(JSON.stringify(r, null, 2));
  if (![r.significado, r.r3, r.carrossel].every(x => x.ok)) process.exit(1);
})().catch(e => { warn('ERRO:', e.message); process.exit(1); });
