// Teste com a IA real, numa copia fora da app. Uso: node testar-real.js > resultado.json
const ia = require('./ia.js');
const TEMA = 'O significado que atribuímos ao que nos acontece';
const IDEIA = 'Não é o que nos acontece que decide como nos sentimos. É o significado automático que damos ao acontecimento, aprendido como proteção. Quando o reconhecemos, podemos escolher outra leitura.';
(async () => {
  const t0 = Date.now();
  const a = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: { funcao: 'conexao' } });
  const r = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a.ganchos[a.recomendada], cta: '', marcacao: { funcao: 'conexao' } });
  const a3 = await ia.gerarGanchosReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, marcacao: { funcao: 'venda' }, receita: 'r3' });
  const r3 = await ia.gerarRoteiroReels({ tema: TEMA, ideia: IDEIA, referencias: [], duracao: 60, gancho: a3.ganchos[a3.recomendada], cta: '', marcacao: { funcao: 'venda' } });
  console.log(JSON.stringify({ segundos: Math.round((Date.now() - t0) / 1000), aberturas: a, roteiro: r, aberturasR3: a3, roteiroR3: r3 }, null, 2));
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
