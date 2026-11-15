// Teste do percurso da Simone na app em producao (15/11/2026): so tema + formato, como na interface.
// Faz os mesmos pedidos que os botoes da pagina (public/app.js): entrar, gerar, escolher a abertura recomendada,
// guardar em Conteudos, abrir, editar e guardar. Le a senha do .env da app sem a mostrar.
// Uso (no servidor): node testar-interface.js > resultado-interface.json
const fs = require('fs');
const BASE = 'https://conteudo.metodo2life.com';
const env = Object.fromEntries(fs.readFileSync('/var/www/conteudo.metodo2life.com/.env', 'utf8').split('\n')
  .filter(l => /^[A-Z_]+=/.test(l)).map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
let cookie = '';
const log = (...a) => console.error(...a);

async function api(rota, opcoes = {}) {
  const r = await fetch(BASE + rota, { ...opcoes, headers: { 'Content-Type': 'application/json', Cookie: cookie, ...(opcoes.headers || {}) } });
  const sc = r.headers.get('set-cookie');
  if (sc) cookie = sc.split(';')[0];
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch (e) { j = { texto: t.slice(0, 200) }; }
  if (!r.ok) throw new Error(`${rota}: ${r.status} ${j.erro || ''}`);
  return j;
}

(async () => {
  const out = {};
  await api('/api/login', { method: 'POST', body: JSON.stringify({ usuario: env.APP_USER || 'admin', senha: env.APP_PASS }) });
  log('login: ok');

  // ---------- REEL: formato "Reels", so o tema; duracao e receita por defeito (30 s, escolher pela abertura) ----------
  const TEMA_R = 'Pedir ajuda sem sentir que estou a falhar';
  let t0 = Date.now();
  const ab = await api('/api/reels/ganchos', { method: 'POST', body: JSON.stringify({
    tema: TEMA_R, ideia: '', banco_ids: [], duracao: 30, receita: '', funcao: null, nivel: null, avanco: '' }) });
  log(`reel: ${ab.ganchos.length} aberturas, recomendada ${ab.recomendada} (${Math.round((Date.now() - t0) / 1000)} s)`);
  const g = ab.ganchos[ab.recomendada];
  t0 = Date.now();
  const ro = await api('/api/reels/roteiro', { method: 'POST', body: JSON.stringify({
    tema: TEMA_R, ideia: '', banco_ids: [], duracao: 30, gancho: g, cta: '', funcao: null, nivel: null, avanco: '' }) });
  log(`reel: roteiro com ${ro.blocos.length} blocos (${Math.round((Date.now() - t0) / 1000)} s)`);
  const capa = { tipo: 'frase', ...ro.capa, imagem_ideia: ro.imagem_ideia || '' };
  const sr = await api('/api/reels/salvar', { method: 'POST', body: JSON.stringify({
    id: null, tema: TEMA_R, ideia: '', serie: '', capa, roteiro: { blocos: ro.blocos }, legenda: ro.legenda,
    comentario: ro.primeiro_comentario, tom: 'clara', foto: null, duracao: 30, cta: '', funcao: null, nivel: null, avanco: '' }) });
  log(`reel: guardado em Conteúdos com o id ${sr.id}`);
  out.reel = { id: sr.id, tema: TEMA_R, aberturas: ab, roteiro: ro };

  // ---------- CARROSSEL: formato "Carrossel", so o tema; layout por defeito (Modelo 2Life), sem foto ----------
  const TEMA_C = 'A culpa que aparece quando paro para descansar';
  t0 = Date.now();
  const car = await api('/api/gerar', { method: 'POST', body: JSON.stringify({
    tema: TEMA_C, ideia: '', serie: '', banco_ids: [], layout: 'modelo2life', tom: 'clara', foto: null, funcao: null, nivel: null, avanco: '' }) });
  log(`carrossel: ${car.slides.length} lâminas, guardado com o id ${car.id} (${Math.round((Date.now() - t0) / 1000)} s)`);
  out.carrossel = { id: car.id, tema: TEMA_C, gerado: car };

  // ---------- ABRIR, EDITAR E GUARDAR (como o botao Salvar) ----------
  const lista = await api('/api/carrosseis');
  for (const k of ['reel', 'carrossel']) {
    const id = out[k].id;
    if (!lista.some(x => x.id === id)) throw new Error(`${k}: o id ${id} nao aparece em Conteúdos`);
    const c = await api('/api/carrosseis/' + id);
    const slides = typeof c.slides === 'string' ? JSON.parse(c.slides) : c.slides;
    const roteiro = c.roteiro ? (typeof c.roteiro === 'string' ? JSON.parse(c.roteiro) : c.roteiro) : undefined;
    const serie = 'Teste da app · 15/11';
    await api('/api/carrosseis/' + id, { method: 'PUT', body: JSON.stringify({ slides, legenda: c.legenda, serie, comentario: c.comentario, roteiro }) });
    const d = await api('/api/carrosseis/' + id);
    const ok = d.serie === serie && d.legenda === c.legenda && d.comentario === c.comentario && (k !== 'reel' || JSON.stringify(d.roteiro) === JSON.stringify(c.roteiro)) && d.status === 'rascunho';
    log(`${k}: aberto, editado (série) e guardado: ${ok ? 'confirmado' : 'FALHOU'} (estado ${d.status})`);
    out[k].guardado = ok;
    out[k].final = d;
  }
  console.log(JSON.stringify(out, null, 2));
  log('TESTE-INTERFACE-OK');
})().catch(e => { log('ERRO:', e.message); process.exit(1); });
