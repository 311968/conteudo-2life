// Passa a revisao automatica mais recente pelos textos ja gerados na decima ronda (15/11/2026), sem gerar de novo.
// Usa as mesmas funcoes da app (ia-rever.js e o ia.js da cadeia mais recente, com uma linha a expor a revisao).
// Le a chave da app SO EM LEITURA. Escreve resultado-final.json nesta pasta. Nao altera a app.
// Uso: node rever-de-novo.js
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const ia = require('./ia-rever.js');
const { corrigirAcentos, ajustarReel } = ia.__rever;

const avisos = [];
const warn = console.warn;
console.warn = (...a) => { avisos.push(a.join(' ')); warn(...a); };

(async () => {
  const r = JSON.parse(fs.readFileSync('./resultado.json', 'utf8'));
  const client = new Anthropic({ apiKey: ia.chave('anthropic_api_key', 'ANTHROPIC_API_KEY') });
  for (const k of ['significado', 'r3']) {
    r[k].roteiro = await ajustarReel(await corrigirAcentos(r[k].roteiro, client), 60, client);
    warn(`${k}: revisto`);
  }
  r.carrossel.carrossel = await corrigirAcentos(r.carrossel.carrossel, client);
  warn('carrossel: revisto');
  r.avisos_revisao_final = avisos;
  fs.writeFileSync('./resultado-final.json', JSON.stringify(r, null, 2));
  console.log('REVISTO');
})().catch(e => { warn('ERRO:', e.message); process.exit(1); });
