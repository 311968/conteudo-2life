// CONTEUDO NEGOCIO ENXUTO — frontend
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const estado = {
  layout: 'modelo2life',
  tom: 'clara',
  formato: 'carrossel',
  funcao: null, nivel: null, niveisInfo: {},
  estilo: 'frase',
  duracao: 30, ganchos: [], ganchoEscolhido: null, roteiro: null,
  duracaoLive: 30, propostas: [], propostaEscolhida: null, perguntas: [], nomeEscolhido: null,
  tons: {},
  foto: null,
  carrosselId: null,
  slides: [],
  fotos: [],
  banco: [],
  handle: '@seu_instagram',
};

// Mostra um contador enquanto a IA trabalha: sem isso, parece que travou
function contando(el, texto) {
  const t0 = Date.now();
  const escreve = () => {
    const s = Math.round((Date.now() - t0) / 1000);
    el.textContent = `${texto} ${s}s`;
  };
  escreve();
  const timer = setInterval(escreve, 1000);
  return (final) => {
    clearInterval(timer);
    if (final !== undefined) el.textContent = final;
    return Math.round((Date.now() - t0) / 1000);
  };
}

async function api(rota, opcoes = {}) {
  const r = await fetch(rota, {
    headers: opcoes.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...opcoes,
  });
  if (r.status === 401) { location.href = '/login'; throw new Error('Sessao expirada.'); }
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch (e) { j = { texto: t }; }
  if (!r.ok) throw new Error(j.erro || 'Deu erro.');
  return j;
}

// ---------- abas ----------
$$('.abas button').forEach(b => b.addEventListener('click', () => {
  document.getElementById('lateral').classList.remove('aberta');
  document.getElementById('veu-menu').classList.remove('visivel');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $$('.abas button').forEach(x => x.classList.remove('ativa'));
  b.classList.add('ativa');
  $$('.view').forEach(v => v.classList.remove('ativa'));
  $('#v-' + b.dataset.aba).classList.add('ativa');
  if (b.dataset.aba === 'carrosseis') carregarCarrosseis();
  if (b.dataset.aba === 'comece') carregarComece();
  if (b.dataset.aba === 'extras') carregarExtras();
  if (b.dataset.aba === 'visual') carregarPaletas();
  if (b.dataset.aba === 'calendario') carregarCalendario();
  if (b.dataset.aba === 'banco') carregarBanco();
  if (b.dataset.aba === 'identidade') carregarIdentidade();
  if (b.dataset.aba === 'fotos') carregarFotos();
  if (b.dataset.aba === 'config') carregarConfig();
}));
$('#sair').addEventListener('click', async () => { await api('/api/logout', { method: 'POST' }); location.href = '/login'; });

// ---------- estratégia: função, nível e avanço ----------
async function carregarEstrategia() {
  const e = await api('/api/estrategia');
  for (const n of e.niveis) estado.niveisInfo[n.id] = n;

  $('#funcoes').innerHTML = e.funcoes.map(f =>
    `<button class="pilula" data-funcao="${f.id}" title="${f.resumo}">${f.nome}</button>`).join('');
  $('#niveis').innerHTML = e.niveis.map(n =>
    `<button class="pilula" data-nivel="${n.id}" title="${n.estado}">${n.id} · ${n.curto}</button>`).join('');
  $('#avancos').innerHTML = e.avancos.map(a => `<option value="${a}">`).join('');

  $$('#funcoes .pilula').forEach(b => b.addEventListener('click', () => {
    const ja = estado.funcao === b.dataset.funcao;
    $$('#funcoes .pilula').forEach(x => x.classList.remove('ativa'));
    estado.funcao = ja ? null : b.dataset.funcao;
    if (!ja) b.classList.add('ativa');
  }));
  $$('#niveis .pilula').forEach(b => b.addEventListener('click', () => {
    const ja = String(estado.nivel) === b.dataset.nivel;
    $$('#niveis .pilula').forEach(x => x.classList.remove('ativa'));
    estado.nivel = ja ? null : Number(b.dataset.nivel);
    if (!ja) b.classList.add('ativa');
    const n = estado.niveisInfo[estado.nivel];
    $('#dica-nivel').textContent = n ? `${n.estado} · ${n.funcao}` : '';
  }));
}

// menu recolhido no celular
const lateral = document.getElementById('lateral');
const veuMenu = document.getElementById('veu-menu');
document.getElementById('abrir-menu').addEventListener('click', () => {
  lateral.classList.toggle('aberta');
  veuMenu.classList.toggle('visivel');
});
veuMenu.addEventListener('click', () => {
  lateral.classList.remove('aberta');
  veuMenu.classList.remove('visivel');
});

// ---------- formato ----------
$$('#formatos .pilula:not([disabled])').forEach(b => b.addEventListener('click', () => {
  $$('#formatos .pilula').forEach(x => x.classList.remove('ativa'));
  b.classList.add('ativa');
  estado.formato = b.dataset.formato || 'carrossel';
  const ehPost = estado.formato === 'post';
  const ehReels = estado.formato === 'reels';
  const ehLive = estado.formato === 'live';
  const artePropria = ehPost || ehReels || ehLive;
  $('#btn-gerar').textContent = ehLive ? 'Gerar roteiro'
    : (ehReels ? 'Gerar reels' : (ehPost ? 'Gerar post' : 'Gerar carrossel'));
  $('#rot-layout').textContent = artePropria && !ehPost ? 'Estilo da capa'
    : (ehPost ? 'Estilo do post' : 'Layout');
  $('#layouts').classList.toggle('oculto', artePropria);
  $('#estilos-post').classList.toggle('oculto', !artePropria);
  $('#bloco-reels').classList.toggle('oculto', !ehReels);
  $('#bloco-live').classList.toggle('oculto', !ehLive);
  $('#titulo-editor').textContent = (ehReels || ehLive) ? '3. Revisar o roteiro e a capa'
    : (ehPost ? '3. Revisar o post' : '3. Revisar slide a slide');
  $('#rot-legenda').textContent = ehLive ? 'Texto de divulgação' : 'Legenda';
  $('#rot-fotos').textContent = (ehReels || ehLive) ? 'Sua foto na capa'
    : (ehPost ? 'Sua foto no post' : 'Foto da capa e do fechamento');
  pintarEstilos();
  $('#opcoes-reels').classList.add('oculto');
  $('#opcoes-live').classList.add('oculto');
  pintarTons();
  $('#opcoes-post').classList.add('oculto');
  $('#editor').classList.add('oculto');
}));

// ---------- modos da ideia ----------
$$('#modos .pilula').forEach(b => b.addEventListener('click', () => {
  $$('#modos .pilula').forEach(x => x.classList.remove('ativa'));
  b.classList.add('ativa');
  $('#modo-escrever').classList.toggle('oculto', b.dataset.modo !== 'escrever');
  $('#modo-audio').classList.toggle('oculto', b.dataset.modo !== 'audio');
  $('#modo-banco').classList.toggle('oculto', b.dataset.modo !== 'banco');
}));

// ---------- gravador ----------
let rec = null, pedacos = [];
$('#btn-gravar').addEventListener('click', async () => {
  const btn = $('#btn-gravar'), st = $('#status-audio');
  if (rec && rec.state === 'recording') {
    rec.stop(); return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pedacos = [];
    rec = new MediaRecorder(stream);
    rec.ondataavailable = e => e.data.size && pedacos.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      btn.textContent = 'Gravar'; btn.classList.remove('gravando');
      st.textContent = 'Transcrevendo...';
      const blob = new Blob(pedacos, { type: rec.mimeType || 'audio/webm' });
      const fd = new FormData();
      fd.append('audio', blob, 'ideia.webm');
      try {
        const r = await api('/api/transcrever', { method: 'POST', body: fd });
        $('#ideia-audio').value = r.texto;
        st.textContent = 'Pronto. Revise o texto antes de gerar.';
      } catch (e) { st.textContent = 'Erro: ' + e.message; }
    };
    rec.start();
    btn.textContent = 'Parar'; btn.classList.add('gravando');
    st.textContent = 'Gravando... fale a ideia central.';
  } catch (e) {
    st.textContent = 'Nao consegui acessar o microfone: ' + e.message;
  }
});

// ---------- layouts e fotos ----------
// Quem usa foto: o Manifesto não usa, e no post só os estilos com imagem
function atualizarBlocoFotos() {
  const semFoto = estado.formato === 'post'
    ? estado.estilo === 'frase'
    : estado.layout === 'layout3';
  $('#bloco-fotos').classList.toggle('oculto', semFoto);
}

function pintarTons() {
  const tons = estado.tons[estado.layout] || [];
  atualizarBlocoFotos();
  if (!tons.length) return;
  $('#tons').innerHTML = tons.map(t => `
    <button class="pilula tom ${t.id === estado.tom ? 'ativa' : ''}" data-tom="${t.id}">
      <span class="bolinha" style="background:${t.fundo}"></span>${t.nome}</button>`).join('');
  $$('#tons .tom').forEach(b => b.addEventListener('click', () => {
    estado.tom = b.dataset.tom;
    pintarTons();
    if (estado.slides.length) estado.slides.forEach((_, i) => previa(i));
  }));
}

async function carregarReels() {
  const e = await api('/api/reels/opcoes');
  estado.ganchosInfo = {};
  for (const g of e.ganchos) estado.ganchosInfo[g.id] = g;
  $('#duracoes').innerHTML = e.duracoes.map(d =>
    `<button class="pilula ${d.id === estado.duracao ? 'ativa' : ''}" data-duracao="${d.id}" title="${d.resumo}">${d.nome}</button>`).join('');
  $('#ctas').innerHTML = e.ctas.map(c => `<option value="${c}">`).join('');
  $('#receita-reels').innerHTML = (e.receitas || []).map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
  $$('#duracoes .pilula').forEach(b => b.addEventListener('click', () => {
    $$('#duracoes .pilula').forEach(x => x.classList.remove('ativa'));
    b.classList.add('ativa');
    estado.duracao = Number(b.dataset.duracao);
  }));
}

// O mesmo desenho serve ao post e a capa do reels, so muda como a gente chama
const TEXTO_ESTILO = {
  post: {
    frase: 'Cor chapada, sem imagem. A frase sozinha, como no Manifesto.',
    foto: 'Sua foto ocupando a arte, com a frase embaixo.',
    lateral: 'Sua foto numa coluna, a frase na outra.',
  },
  reels: {
    frase: 'Capa em cor chapada, só com a frase do gancho.',
    foto: 'Capa com a sua foto inteira e a frase embaixo.',
    lateral: 'Capa com a sua foto numa coluna e a frase na outra.',
  },
};

function pintarEstilos() {
  const textos = TEXTO_ESTILO[(estado.formato === 'reels' || estado.formato === 'live') ? 'reels' : 'post'];
  $$('#estilos-post .card').forEach(c => {
    const t = textos[c.dataset.estilo];
    if (t) c.querySelector('span').textContent = t;
  });
}

async function carregarLive() {
  const e = await api('/api/live/opcoes');
  $('#duracoes-live').innerHTML = e.duracoes.map(d =>
    `<button class="pilula ${d.id === estado.duracaoLive ? 'ativa' : ''}" data-duracao="${d.id}" title="${d.resumo}">${d.nome}</button>`).join('');
  $$('#duracoes-live .pilula').forEach(b => b.addEventListener('click', () => {
    $$('#duracoes-live .pilula').forEach(x => x.classList.remove('ativa'));
    b.classList.add('ativa');
    estado.duracaoLive = Number(b.dataset.duracao);
  }));
}

async function carregarEstilosPost() {
  const e = await api('/api/estilos-post');
  $('#estilos-post').innerHTML = e.estilos.map(x => `
    <div class="card ${x.id === estado.estilo ? 'ativa' : ''}" data-estilo="${x.id}">
      <strong>${x.nome}</strong><span>${x.descricao}</span>
    </div>`).join('');
  $$('#estilos-post .card').forEach(c => c.addEventListener('click', () => {
    $$('#estilos-post .card').forEach(x => x.classList.remove('ativa'));
    c.classList.add('ativa');
    estado.estilo = c.dataset.estilo;
    atualizarBlocoFotos();
    // troca o estilo do que já está na tela
    if (estado.slides.length && estado.formato === 'post') {
      estado.slides[0].tipo = estado.estilo;
      pintarSlides();
    }
    if (estado.opcoes && estado.opcoes.length) {
      estado.opcoes.forEach(o => { o.lamina.tipo = estado.estilo; });
      pintarOpcoes();
    }
  }));
}

async function carregarLayouts() {
  const l = await api('/api/layouts');
  for (const x of l) if (x.tons) estado.tons[x.id] = x.tons;
  $('#layouts').innerHTML = l.map(x => `
    <div class="card ${x.disponivel ? '' : 'indisponivel'} ${x.id === estado.layout ? 'ativa' : ''}"
         data-id="${x.id}" ${x.disponivel ? '' : 'title="Slot livre"'}>
      <strong>${x.nome}</strong><span>${x.descricao}</span>
    </div>`).join('');
  $$('#layouts .card').forEach(c => c.addEventListener('click', () => {
    if (c.classList.contains('indisponivel')) return;
    $$('#layouts .card').forEach(x => x.classList.remove('ativa'));
    c.classList.add('ativa');
    estado.layout = c.dataset.id;
    pintarTons();
  }));
  pintarTons();
}

function pintarFotosSel() {
  $('#fotos-sel').innerHTML = estado.fotos.map(f => `
    <div class="foto-item ${estado.foto === f.arquivo ? 'ativa' : ''}" data-arquivo="${f.arquivo}">
      <img src="/fotos/${f.arquivo}" loading="lazy">
      <div class="rotulo">${f.rotulo || ''}</div>
    </div>`).join('');
  $$('#fotos-sel .foto-item').forEach(el => el.addEventListener('click', () => {
    estado.foto = estado.foto === el.dataset.arquivo ? null : el.dataset.arquivo;
    pintarFotosSel();
    if (estado.slides.length) pintarSlides();
  }));
}

async function carregarFotos() {
  estado.fotos = await api('/api/fotos');
  if (!estado.foto && estado.fotos[0]) estado.foto = estado.fotos[0].arquivo;
  pintarFotosSel();
  $('#lista-fotos').innerHTML = estado.fotos.map(f => `
    <div class="foto-item" data-id="${f.id}">
      <img src="/fotos/${f.arquivo}" loading="lazy">
      <button class="apagar" data-id="${f.id}" title="Apagar">×</button>
      <div class="rotulo">${f.rotulo || f.arquivo}</div>
    </div>`).join('');
  $$('#lista-fotos .apagar').forEach(b => b.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm('Apagar esta foto do banco?')) return;
    await api('/api/fotos/' + b.dataset.id, { method: 'DELETE' });
    carregarFotos();
  }));
}

$('#f-enviar').addEventListener('click', async () => {
  const arq = $('#f-arquivo').files[0];
  if (!arq) return alert('Escolha uma foto.');
  const fd = new FormData(); fd.append('foto', arq); fd.append('rotulo', $('#f-rotulo').value);
  await api('/api/fotos', { method: 'POST', body: fd });
  $('#f-arquivo').value = ''; $('#f-rotulo').value = '';
  carregarFotos();
});

// ---------- banco ----------
async function carregarBanco() {
  estado.banco = await api('/api/banco');
  $('#lista-banco').innerHTML = estado.banco.length ? estado.banco.map(b => `
    <div class="item">
      <div><strong>${b.titulo}</strong>
        <div class="meta">${b.tipo} · ${b.tamanho || 0} caracteres · ${(b.criado_em || '').slice(0, 10)}</div></div>
      <button class="botao mini fantasma apagar-b" data-id="${b.id}">Apagar</button>
    </div>`).join('') : '<p class="dica">Nada aqui ainda.</p>';
  $$('.apagar-b').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Apagar do banco?')) return;
    await api('/api/banco/' + b.dataset.id, { method: 'DELETE' });
    carregarBanco();
  }));
  $('#lista-banco-sel').innerHTML = estado.banco.length ? estado.banco.map(b => `
    <label><input type="checkbox" value="${b.id}"> <span>${b.titulo} <em class="meta">(${b.tipo})</em></span></label>`).join('')
    : '<span class="dica">O banco está vazio.</span>';
}

$('#b-salvar').addEventListener('click', async () => {
  const titulo = $('#b-titulo').value.trim(), conteudo = $('#b-conteudo').value.trim();
  if (!titulo || !conteudo) return alert('Preciso de título e conteúdo.');
  await api('/api/banco', { method: 'POST', body: JSON.stringify({ titulo, conteudo }) });
  $('#b-titulo').value = ''; $('#b-conteudo').value = '';
  carregarBanco();
});

$('#b-enviar').addEventListener('click', async () => {
  const arq = $('#b-arquivo').files[0];
  if (!arq) return alert('Escolha um arquivo.');
  const st = $('#b-status'); st.textContent = 'Processando... áudio longo demora um pouco.';
  const fd = new FormData(); fd.append('arquivo', arq); fd.append('titulo', $('#b-arquivo-titulo').value);
  try {
    const r = await api('/api/banco/upload', { method: 'POST', body: fd });
    st.textContent = `Guardado como ${r.tipo}. Prévia: ${r.previa.slice(0, 160)}...`;
    $('#b-arquivo').value = ''; $('#b-arquivo-titulo').value = '';
    carregarBanco();
  } catch (e) { st.textContent = 'Erro: ' + e.message; }
});

// ---------- identidade ----------
async function carregarIdentidade() {
  const l = await api('/api/identidade');
  $('#lista-identidade').innerHTML = l.map(i => `
    <details class="identidade-bloco">
      <summary>${i.tipo}</summary>
      <textarea rows="16" data-tipo="${i.tipo}">${(i.conteudo || '').replace(/</g, '&lt;')}</textarea>
      <button class="botao mini salvar-id" data-tipo="${i.tipo}">Salvar</button>
    </details>`).join('');
  $$('.salvar-id').forEach(b => b.addEventListener('click', async () => {
    const ta = document.querySelector(`textarea[data-tipo="${b.dataset.tipo}"]`);
    await api('/api/identidade/' + b.dataset.tipo, { method: 'PUT', body: JSON.stringify({ conteudo: ta.value }) });
    b.textContent = 'Salvo'; setTimeout(() => b.textContent = 'Salvar', 1600);
  }));
}
$('#recarregar-fonte').addEventListener('click', async () => {
  if (!confirm('Isto sobrescreve o que está aqui com os arquivos de ~/meu-negocio/_fonte/. Seguir?')) return;
  const r = await api('/api/identidade/recarregar', { method: 'POST' });
  alert('Recarregado: ' + r.recarregados.join(', '));
  carregarIdentidade();
});

// ---------- config ----------
async function carregarConfig() {
  const c = await api('/api/config');
  $('#c-handle').value = c.handle || '';
  $('#c-marca').value = c.marca || '';
  $('#c-anthropic').placeholder = c.anthropic_api_key || 'sk-ant-...';
  $('#c-gemini').placeholder = c.gemini_api_key || 'AIza...';
  $('#c-openai').placeholder = c.openai_api_key || '';
  $('#c-elevenlabs').placeholder = c.elevenlabs_api_key || '';
  $('#c-meta').placeholder = c.meta_token || 'EAA...';
  $('#c-ig').value = c.ig_user_id || '';
  estado.handle = c.handle || estado.handle;
}

$('#c-salvar').addEventListener('click', async () => {
  const corpo = {
    handle: $('#c-handle').value, marca: $('#c-marca').value,
    anthropic_api_key: $('#c-anthropic').value, gemini_api_key: $('#c-gemini').value,
    openai_api_key: $('#c-openai').value, elevenlabs_api_key: $('#c-elevenlabs').value,
    meta_token: $('#c-meta').value, ig_user_id: $('#c-ig').value,
  };
  for (const k of Object.keys(corpo)) if (!corpo[k]) delete corpo[k];
  await api('/api/config', { method: 'PUT', body: JSON.stringify(corpo) });
  $('#c-status').textContent = 'Salvo.';
  $$('#v-config input[type=text], #v-config input:not([type])').forEach(i => { if (i.id !== 'c-handle' && i.id !== 'c-marca') i.value = ''; });
  carregarConfig();
});

// ---------- gerar ----------
$('#btn-gerar').addEventListener('click', async () => {
  const modo = $('#modos .pilula.ativa').dataset.modo;
  const tema = $('#tema').value.trim();
  const ideia = (modo === 'audio' ? $('#ideia-audio').value : $('#ideia').value).trim();
  const banco_ids = $$('#lista-banco-sel input:checked').map(i => Number(i.value));
  if (!tema) return alert('Escreva o tema.');
  if (!ideia && !banco_ids.length) return alert('Narre, escreva ou marque algo do Banco Central.');
  const st = $('#status-gerar');
  $('#btn-gerar').disabled = true;

  if (estado.formato === 'live') {
    const parar = contando(st, 'Escrevendo três propostas de live...');
    try {
      const r = await api('/api/live/propostas', {
        method: 'POST',
        body: JSON.stringify({
          tema, ideia, banco_ids, duracao: estado.duracaoLive,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.propostas = r.propostas || [];
      estado.propostaEscolhida = null;
      estado.carrosselId = null;
      $('#btn-voltar-angulos').classList.add('oculto');
      pintarPropostas();
      parar(`${estado.propostas.length} propostas prontas. Escolha uma abaixo.`);
      $('#opcoes-live').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      parar('Erro: ' + e.message);
    } finally { $('#btn-gerar').disabled = false; }
    return;
  }

  if (estado.formato === 'reels') {
    const parar = contando(st, 'A escrever três aberturas...');
    try {
      const r = await api('/api/reels/ganchos', {
        method: 'POST',
        body: JSON.stringify({
          tema, ideia, banco_ids, duracao: estado.duracao, receita: $('#receita-reels').value,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.ganchos = r.ganchos || [];
      estado.razaoRecomendada = r.razao || '';
      estado.ganchoEscolhido = null;
      estado.carrosselId = null;
      $('#btn-voltar-angulos').classList.add('oculto');
      pintarGanchos();
      parar(`${estado.ganchos.length} aberturas prontas. Escolhe uma abaixo.`);
      $('#opcoes-reels').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      parar('Erro: ' + e.message);
    } finally { $('#btn-gerar').disabled = false; }
    return;
  }

  if (estado.formato === 'post') {
    const parar = contando(st, 'Escrevendo três ângulos diferentes do mesmo tema...');
    try {
      const r = await api('/api/post/gerar', {
        method: 'POST',
        body: JSON.stringify({
          tema, ideia, banco_ids, layout: estado.estilo,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.opcoes = r.opcoes || [];
      estado.anguloEscolhido = null;
      estado.carrosselId = null;
      estado.postDestaOpcoes = false;
      $('#btn-voltar-angulos').classList.add('oculto');
      pintarOpcoes();
      parar(`${estado.opcoes.length} ângulos prontos. Escolha um abaixo.`);
      $('#opcoes-post').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      parar('Erro: ' + e.message);
    } finally { $('#btn-gerar').disabled = false; }
    return;
  }

  const pararC = contando(st, 'Escrevendo no seu tom...');
  try {
    const r = await api('/api/gerar', {
      method: 'POST',
      body: JSON.stringify({ tema, ideia: ideia || '(usar o material do banco)', serie: $('#serie').value.trim(), banco_ids, layout: estado.layout, tom: estado.tom, foto: estado.foto,
      funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim() }),
    });
    estado.carrosselId = r.id;
    estado.slides = r.slides || [];
    $('#serie').value = r.serie || $('#serie').value;
    $('#legenda').value = r.legenda || '';
    $('#comentario').value = r.primeiro_comentario || '';
    $('#editor').classList.remove('oculto');
    pintarSlides();
    pararC(`Texto pronto: ${estado.slides.length} slides.`);
    $('#editor').scrollIntoView({ behavior: 'smooth' });
    await gerarImagensDoMeio();
  } catch (e) {
    pararC('Erro: ' + e.message);
  } finally { $('#btn-gerar').disabled = false; }
});

async function gerarImagensDoMeio() {
  const quantas = estado.slides.filter(s => geraImagem(s.tipo) && !s.imagem).length;
  if (!quantas) return;
  const st = $('#status-gerar');
  const parar = contando(st, `Texto pronto. Agora criando ${quantas} imagens...`);
  try {
    const r = await api('/api/carrosseis/' + estado.carrosselId + '/imagens', {
      method: 'POST', body: JSON.stringify({}),
    });
    estado.slides = r.slides;
    pintarSlides();
    parar(`Pronto: ${estado.slides.length} slides, ${r.geradas} imagens criadas.` +
      (r.erros.length ? ' Falhou em: ' + r.erros.join(' · ') : ''));
  } catch (e) {
    parar('O texto ficou pronto, mas as imagens falharam: ' + e.message);
  }
}

// ---------- propostas da live ----------
function pintarPropostas() {
  $('#opcoes-live').classList.remove('oculto');
  $('#editor').classList.add('oculto');
  $('#lista-propostas').innerHTML = estado.propostas.map((p, i) => `
    <div class="gancho ${estado.propostaEscolhida === i ? 'escolhida' : ''}">
      <div class="gancho-tipo">proposta ${i + 1}</div>
      <div class="gancho-frase">${(p.titulo || '').replace(/</g, '&lt;')}</div>
      <div class="dica">${(p.promessa || '').replace(/</g, '&lt;')}</div>
      ${p.para_quem ? `<div class="gancho-tela">${p.para_quem.replace(/</g, '&lt;')}</div>` : ''}
      ${(p.tres_pontos || []).length ? `<ul class="pontos">${p.tres_pontos.map(t => `<li>${t.replace(/</g, '&lt;')}</li>`).join('')}</ul>` : ''}
      <button class="botao mini usar-proposta" data-i="${i}">${estado.propostaEscolhida === i ? 'Em uso' : 'Usar esta'}</button>
    </div>`).join('');

  $$('.usar-proposta').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.i;
    b.disabled = true; b.textContent = 'Escrevendo...';
    const st = $('#status-gerar');
    const parar = contando(st, `Escrevendo o roteiro de ${estado.duracaoLive} minutos...`);
    try {
      const r = await api('/api/live/roteiro', {
        method: 'POST',
        body: JSON.stringify({
          tema: $('#tema').value, ideia: $('#ideia').value,
          banco_ids: $$('#lista-banco-sel input:checked').map(x => Number(x.value)),
          duracao: estado.duracaoLive, proposta: estado.propostas[i],
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      const capa = { tipo: estado.estilo, ...r.capa, imagem_ideia: r.imagem_ideia || '' };
      const salvo = await api('/api/live/salvar', {
        method: 'POST',
        body: JSON.stringify({
          id: estado.carrosselId || null,
          tema: $('#tema').value, ideia: $('#ideia').value, titulo: r.titulo,
          capa, roteiro: {
            blocos: r.blocos, perguntas_previstas: r.perguntas_previstas,
            nomes_sugeridos: r.nomes_sugeridos, fio: r.fio, pontos_principais: r.pontos_principais,
          },
          legenda: r.descricao, tom: estado.tom, foto: estado.foto, duracao: estado.duracaoLive,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.carrosselId = salvo.id;
      estado.propostaEscolhida = i;
      estado.roteiro = {
        blocos: r.blocos, perguntas_previstas: r.perguntas_previstas,
        nomes_sugeridos: r.nomes_sugeridos, fio: r.fio, pontos_principais: r.pontos_principais,
      };
      estado.slides = [capa];
      $('#legenda').value = r.descricao || '';
      $('#comentario').value = '';
      $('#btn-voltar-angulos').classList.remove('oculto');
      $('#btn-voltar-angulos').textContent = 'Ver as outras propostas';
      $('#opcoes-live').classList.add('oculto');
      $('#editor').classList.remove('oculto');
      pintarRoteiro();
      pintarSlides();
      parar(`Roteiro de ${estado.duracaoLive} minutos pronto, com ${r.blocos.length} blocos.`);
      $('#editor').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      parar('Erro: ' + e.message);
      b.disabled = false; b.textContent = 'Usar esta';
    }
  }));
}

// ---------- ganchos do reels ----------
function pintarGanchos() {
  $('#opcoes-reels').classList.remove('oculto');
  $('#editor').classList.add('oculto');
  $('#lista-ganchos').innerHTML = estado.ganchos.map((g, i) => {
    const info = estado.ganchosInfo[g.tipo] || {};
    return `
    <div class="gancho ${estado.ganchoEscolhido === i ? 'escolhida' : ''}">
      <div class="gancho-tipo">${info.nome || g.tipo}${g.recomendado ? ' · recomendada' : ''}</div>
      <div class="gancho-frase">${(g.frase || '').replace(/</g, '&lt;')}</div>
      ${g.tela ? `<div class="gancho-tela">no ecrã: ${g.tela.replace(/</g, '&lt;')}</div>` : ''}
      ${g.situacao && g.tipo !== 'problema' ? `<div class="dica">a seguir: ${g.situacao.replace(/</g, '&lt;')}</div>` : ''}
      ${g.resposta ? `<div class="dica">o vídeo revela: ${g.resposta.replace(/</g, '&lt;')}</div>` : ''}
      ${g.recomendado && estado.razaoRecomendada ? `<div class="dica">${estado.razaoRecomendada.replace(/</g, '&lt;')}</div>` : ''}
      ${g.porque ? `<div class="dica">${g.porque.replace(/</g, '&lt;')}</div>` : ''}
      <button class="botao mini usar-gancho" data-i="${i}">${estado.ganchoEscolhido === i ? 'Em uso' : 'Usar esta'}</button>
    </div>`;
  }).join('');

  $$('.usar-gancho').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.i;
    b.disabled = true; b.textContent = 'A escrever...';
    const st = $('#status-gerar');
    const parar = contando(st, `A escrever o roteiro de ${estado.duracao} segundos...`);
    try {
      const r = await api('/api/reels/roteiro', {
        method: 'POST',
        body: JSON.stringify({
          tema: $('#tema').value, ideia: $('#ideia').value,
          banco_ids: $$('#lista-banco-sel input:checked').map(x => Number(x.value)),
          duracao: estado.duracao, gancho: estado.ganchos[i], cta: $('#cta-reels').value.trim(),
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      const capa = { tipo: estado.estilo, ...r.capa, imagem_ideia: r.imagem_ideia || '' };
      const salvo = await api('/api/reels/salvar', {
        method: 'POST',
        body: JSON.stringify({
          id: estado.carrosselId || null,
          tema: $('#tema').value, ideia: $('#ideia').value, serie: $('#serie').value,
          capa, roteiro: { blocos: r.blocos }, legenda: r.legenda, comentario: r.primeiro_comentario,
          tom: estado.tom, foto: estado.foto, duracao: estado.duracao, cta: $('#cta-reels').value.trim(),
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.carrosselId = salvo.id;
      estado.ganchoEscolhido = i;
      estado.roteiro = { blocos: r.blocos };
      estado.slides = [capa];
      $('#legenda').value = r.legenda || '';
      $('#comentario').value = r.primeiro_comentario || '';
      $('#btn-voltar-angulos').classList.remove('oculto');
      $('#btn-voltar-angulos').textContent = 'Ver as outras aberturas';
      $('#opcoes-reels').classList.add('oculto');
  $('#opcoes-live').classList.add('oculto');
      $('#editor').classList.remove('oculto');
      pintarRoteiro();
      pintarSlides();
      parar(`Roteiro de ${estado.duracao} segundos pronto, com ${r.blocos.length} blocos.`);
      $('#editor').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      parar('Erro: ' + e.message);
      b.disabled = false; b.textContent = 'Usar este';
    }
  }));
}

function pintarRoteiro() {
  const r = estado.roteiro;
  $('#bloco-roteiro').classList.toggle('oculto', !r || !r.blocos);
  if (!r || !r.blocos) return;

  $('#resumo-live').classList.add('oculto');
  $('#bloco-youtube').classList.add('oculto');
  if (estado.formato === 'live') return pintarRoteiroLive(r);

  $('#roteiro').innerHTML = r.blocos.map((b, i) => `
    <div class="bloco-roteiro">
      <div class="bloco-cabeca"><span class="tempo">${b.tempo || ''}</span><span class="rotulo">${b.rotulo || ''}</span></div>
      <div class="rot">Fala</div>
      <textarea rows="3" data-bloco="${i}" data-campo="fala">${(b.fala || '').replace(/</g, '&lt;')}</textarea>
      <div class="dupla-roteiro">
        <div><div class="rot">Texto na tela</div>
          <input data-bloco="${i}" data-campo="tela" value="${(b.tela || '').replace(/"/g, '&quot;')}"></div>
        <div><div class="rot">Câmera</div>
          <input data-bloco="${i}" data-campo="camera" value="${(b.camera || '').replace(/"/g, '&quot;')}"></div>
      </div>
    </div>`).join('');
  $$('#roteiro [data-bloco]').forEach(el => el.addEventListener('input', () => {
    estado.roteiro.blocos[+el.dataset.bloco][el.dataset.campo] = el.value;
  }));
}

// O painel que ela bate o olho antes de entrar no ar
function pintarResumoLive(r) {
  const nomes = r.nomes_sugeridos || [];
  const pontos = r.pontos_principais || [];
  const caixa = $('#resumo-live');
  if (!nomes.length && !r.fio && !pontos.length) { caixa.classList.add('oculto'); return; }
  caixa.classList.remove('oculto');
  caixa.innerHTML = `
    <div class="resumo-cabeca">
      <h3>A live de uma olhada</h3>
      <span class="selo">${estado.duracaoLive} minutos</span>
    </div>

    ${nomes.length ? `<div class="rot">Três nomes para anunciar esta live · clique no que você quer usar</div>
    <div class="nomes">
      ${nomes.map((n, i) => `
        <button class="nome-live ${estado.nomeEscolhido === i ? 'ativa' : ''}" data-nome="${i}">
          <strong>${(n.nome || '').replace(/</g, '&lt;')}</strong>
          ${n.gancho ? `<span>${n.gancho.replace(/</g, '&lt;')}</span>` : ''}
        </button>`).join('')}
    </div>` : ''}

    ${r.fio ? `<div class="rot">O que vai acontecer</div>
      <p class="fio">${r.fio.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>` : ''}

    ${pontos.length ? `<div class="rot">O que a live entrega</div>
      <ul class="pontos-live">${pontos.map(t => `<li>${t.replace(/</g, '&lt;')}</li>`).join('')}</ul>` : ''}
  `;

  $$('#resumo-live .nome-live').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.nome;
    estado.nomeEscolhido = i;
    const n = nomes[i];
    $('#tema').value = n.nome;
    // o nome escolhido também vira a frase da capa
    if (estado.slides[0]) {
      estado.slides[0].titulo = n.nome;
      if (n.gancho) estado.slides[0].manuscrita = '';
      pintarSlides();
    }
    pintarResumoLive(r);
    if (estado.carrosselId) {
      try {
        await api('/api/carrosseis/' + estado.carrosselId, {
          method: 'PUT', body: JSON.stringify({ tema: n.nome, slides: estado.slides }),
        });
      } catch (e) {}
    }
  }));
}

// O que vai para o YouTube: a capa 16:9 e a descrição com capítulos
async function pintarYoutube() {
  if (estado.formato !== 'live' || !estado.carrosselId) {
    $('#bloco-youtube').classList.add('oculto');
    return;
  }
  try {
    const y = await api('/api/youtube/' + estado.carrosselId);
    $('#bloco-youtube').classList.remove('oculto');
    $('#yt-chapeu').value = y.thumb.chapeu || '';
    $('#yt-titulo').value = y.thumb.titulo || '';
    $('#yt-apoio').value = y.thumb.apoio || '';
    $('#yt-selo').value = y.thumb.selo || '';
    $('#yt-descricao').value = y.descricao || '';
    const capa = `/saidas/${estado.carrosselId}/capa-youtube.jpg`;
    const existe = await fetch(capa, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
    $('#previa-yt').innerHTML = existe
      ? `<img src="${capa}?t=${Date.now()}" alt="capa do vídeo">`
      : '<span>clique em gerar a capa</span>';
  } catch (e) {
    $('#bloco-youtube').classList.add('oculto');
  }
}

$('#btn-capa-yt').addEventListener('click', async () => {
  const b = $('#btn-capa-yt');
  b.disabled = true; b.textContent = 'Desenhando...';
  try {
    const r = await api('/api/youtube/' + estado.carrosselId + '/capa', {
      method: 'POST',
      body: JSON.stringify({
        thumb: {
          chapeu: $('#yt-chapeu').value, titulo: $('#yt-titulo').value,
          apoio: $('#yt-apoio').value, selo: $('#yt-selo').value,
        },
        foto: estado.foto,
      }),
    });
    $('#previa-yt').innerHTML = `<img src="${r.arquivo}?t=${Date.now()}" alt="capa do vídeo">`;
  } catch (e) {
    alert('Não consegui gerar a capa: ' + e.message);
  } finally {
    b.disabled = false; b.textContent = 'Gerar a capa';
  }
});

$('#btn-copiar-yt').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#yt-descricao').value);
    $('#btn-copiar-yt').textContent = 'Copiado';
    setTimeout(() => { $('#btn-copiar-yt').textContent = 'Copiar a descrição'; }, 1800);
  } catch (e) {
    $('#yt-descricao').select();
  }
});

// O roteiro de live é um mapa em tópicos, não um texto para ler
function pintarRoteiroLive(r) {
  pintarResumoLive(r);
  pintarYoutube();
  $('#roteiro').innerHTML = r.blocos.map((b, i) => `
    <div class="bloco-roteiro">
      <div class="bloco-cabeca"><span class="tempo">${b.tempo || ''}</span><span class="rotulo">${b.rotulo || ''}</span></div>
      ${b.abre !== undefined ? `<div class="rot">Abre com</div>
        <textarea rows="2" data-bloco="${i}" data-campo="abre">${(b.abre || '').replace(/</g, '&lt;')}</textarea>` : ''}
      <div class="rot">Tópicos</div>
      <textarea rows="${Math.max(3, (b.topicos || []).length)}" data-bloco="${i}" data-campo="topicos"
        >${(b.topicos || []).join('\n').replace(/</g, '&lt;')}</textarea>
      ${b.virada !== undefined ? `<div class="rot">Fecha com</div>
        <input data-bloco="${i}" data-campo="virada" value="${(b.virada || '').replace(/"/g, '&quot;')}">` : ''}
      <div class="dupla-roteiro">
        <div><div class="rot">Chat</div>
          <input data-bloco="${i}" data-campo="interacao" value="${(b.interacao || '').replace(/"/g, '&quot;')}"></div>
        <div><div class="rot">Retenção</div>
          <input data-bloco="${i}" data-campo="retencao" value="${(b.retencao || '').replace(/"/g, '&quot;')}"></div>
      </div>
    </div>`).join('');

  $$('#roteiro [data-bloco]').forEach(el => el.addEventListener('input', () => {
    const b = estado.roteiro.blocos[+el.dataset.bloco];
    if (el.dataset.campo === 'topicos') b.topicos = el.value.split('\n').filter(Boolean);
    else b[el.dataset.campo] = el.value;
  }));

  const p = r.perguntas_previstas || [];
  $('#bloco-perguntas').classList.toggle('oculto', !p.length);
  $('#perguntas').innerHTML = p.map((q, i) => `
    <div class="pergunta-prevista">
      <input data-pergunta="${i}" data-campo="pergunta" value="${(q.pergunta || '').replace(/"/g, '&quot;')}">
      <textarea rows="2" data-pergunta="${i}" data-campo="resposta">${(q.resposta || '').replace(/</g, '&lt;')}</textarea>
    </div>`).join('');
  $$('#perguntas [data-pergunta]').forEach(el => el.addEventListener('input', () => {
    estado.roteiro.perguntas_previstas[+el.dataset.pergunta][el.dataset.campo] = el.value;
  }));
}

// ---------- opções de post ----------
function pintarOpcoes() {
  $('#opcoes-post').classList.remove('oculto');
  $('#editor').classList.add('oculto');
  $('#lista-opcoes').innerHTML = estado.opcoes.map((o, i) => `
    <div class="opcao ${estado.anguloEscolhido === i ? 'escolhida' : ''}">
      <div class="previa-post"><iframe data-opcao="${i}" sandbox="allow-same-origin"></iframe></div>
      <div class="opcao-pe">
        <strong>${o.angulo || 'ângulo ' + (i + 1)}</strong>
        <button class="botao mini usar-opcao" data-i="${i}">${estado.anguloEscolhido === i ? 'Em uso' : 'Usar este'}</button>
      </div>
    </div>`).join('');

  estado.opcoes.forEach(async (o, i) => {
    const frame = document.querySelector(`iframe[data-opcao="${i}"]`);
    if (!frame) return;
    const r = await fetch('/api/previa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slide: o.lamina, serie: $('#serie').value, handle: estado.handle,
        foto: o.lamina.foto || estado.foto, layout: 'post', tom: estado.tom,
      }),
    });
    frame.srcdoc = await r.text();
  });

  $$('.usar-opcao').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.i;
    const o = estado.opcoes[i];
    b.disabled = true; b.textContent = 'Abrindo...';
    try {
      // Trocar de ângulo reaproveita o mesmo post, em vez de criar outro rascunho
      if (estado.carrosselId && estado.formato === 'post' && estado.postDestaOpcoes) {
        await api('/api/carrosseis/' + estado.carrosselId, {
          method: 'PUT',
          body: JSON.stringify({
            slides: [o.lamina], legenda: o.legenda, comentario: o.primeiro_comentario,
            tom: estado.tom, foto: estado.foto,
          }),
        });
      } else {
        const r = await api('/api/post/salvar', {
          method: 'POST',
          body: JSON.stringify({
            tema: $('#tema').value, ideia: $('#ideia').value, serie: $('#serie').value,
            lamina: o.lamina, legenda: o.legenda, comentario: o.primeiro_comentario,
            layout: 'post', tom: estado.tom, foto: estado.foto,
            funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
          }),
        });
        estado.carrosselId = r.id;
        estado.postDestaOpcoes = true;
      }
      estado.anguloEscolhido = i;
      $('#btn-voltar-angulos').classList.remove('oculto');
      estado.slides = [o.lamina];
      $('#legenda').value = o.legenda || '';
      $('#comentario').value = o.primeiro_comentario || '';
      $('#opcoes-post').classList.add('oculto');
      $('#editor').classList.remove('oculto');
      pintarSlides();
      $('#editor').scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      alert(e.message); b.disabled = false; b.textContent = 'Usar este';
    }
  }));
}

// ---------- editor de slides ----------
const CAMPOS_POR_LAYOUT = {
  modelo2life: {
    capa:     [['titulo', 'Título (frase de viragem entre **asteriscos**)', 'input'], ['subtitulo', 'Subtítulo', 'input'],
               ['sintese', 'Síntese em versaletes (opcional)', 'input']],
    interior: [['titulo', 'Título (parte a realçar entre **asteriscos**)', 'input'], ['corpo', 'Texto', 'textarea'],
               ['sintese', 'Síntese em versaletes (opcional)', 'input'], ['alinhar', 'Alinhar: centro ou esquerda', 'input']],
    fecho:    [['titulo', 'Frase final (viragem entre **asteriscos**)', 'input'],
               ['foto_fecho', 'Foto no fecho? (sim só se a foto tiver zona calma)', 'input']],
  },
  layout1: {
    capa:       [['titulo', 'Título', 'input'], ['manuscrita', 'Frase manuscrita', 'input']],
    caixas:     [],
    texto:      [['titulo', 'Título', 'input'], ['destaque', 'Caixa de destaque', 'input'],
                 ['corpo', 'Corpo', 'textarea'], ['manuscrita', 'Frase manuscrita', 'input']],
    cheia:      [['intro', 'Entrada', 'input'], ['titulo', 'Título', 'input'], ['manuscrita', 'Frase manuscrita', 'input']],
    fechamento: [['corpo', 'Corpo', 'textarea'], ['titulo', 'Título', 'input'],
                 ['cta', 'Fita de CTA', 'input'], ['manuscrita', 'Frase manuscrita', 'input']],
  },
  post: {
    frase:   [['intro', 'Linha antes (opcional)', 'input'], ['titulo', 'A frase', 'textarea'],
              ['manuscrita', 'Linha de mão (opcional)', 'input']],
    foto:    [['intro', 'Linha antes (opcional)', 'input'], ['titulo', 'A frase', 'textarea'],
              ['manuscrita', 'Linha de mão (opcional)', 'input']],
    lateral: [['intro', 'Linha antes (opcional)', 'input'], ['titulo', 'A frase', 'textarea'],
              ['manuscrita', 'Linha de mão (opcional)', 'input']],
  },
  layout3: {
    capa:       [['corpo', 'A tese (peso pesado)', 'textarea']],
    texto:      [['corpo', 'Texto (peso leve, linha em branco separa parágrafo)', 'textarea']],
    forte:      [['corpo', 'Texto (peso pesado)', 'textarea']],
    centro:     [['corpo', 'Frase centralizada', 'textarea']],
    fechamento: [['antes', 'Antes do emoji', 'input'], ['emoji', 'Emoji', 'input'],
                 ['depois', 'Depois do emoji', 'input']],
  },
  layout2: {
    capa:        [['titulo', 'Manchete', 'input'], ['subtitulo', 'Linha de apoio', 'input']],
    imagem_topo: [['titulo', 'Título', 'input'], ['corpo', 'Texto (linha em branco separa parágrafo)', 'textarea']],
    imagem_base: [['titulo', 'Título', 'input'], ['corpo', 'Texto (linha em branco separa parágrafo)', 'textarea']],
    meia:        [['titulo', 'Título', 'input'], ['corpo', 'Texto', 'textarea']],
    lista:       [['titulo', 'Título', 'input']],
    fechamento:  [['caixa', 'Frase na moldura', 'textarea'], ['corpo', 'Linha antes do CTA', 'input'],
                  ['cta', 'CTA grande', 'input']],
  },
};
// Slides que usam imagem, por layout
const COM_FOTO = {
  layout1: ['capa', 'fechamento'],
  layout2: ['capa', 'imagem_topo', 'imagem_base', 'meia', 'fechamento'],
  layout3: [],
  modelo2life: ['capa', 'fecho'],
  post: ['foto', 'lateral'],
};
// Slides cuja imagem e gerada pelo texto (as do meio). Capa e fechamento ficam com a foto dela.
const GERA_IMAGEM = { modelo2life: [], layout1: [], layout2: ['imagem_topo', 'imagem_base', 'meia'], layout3: [], post: [] };
function geraImagem(tipo) { return (GERA_IMAGEM[chaveLayout()] || []).includes(tipo); }

// Slides com lista de itens
const COM_ITENS = { modelo2life: [], layout1: ['caixas'], layout2: ['lista'], layout3: [], post: [] };

function chaveLayout() { return (estado.formato === 'post' || estado.formato === 'reels') ? 'post' : estado.layout; }
function campos() { return CAMPOS_POR_LAYOUT[chaveLayout()] || CAMPOS_POR_LAYOUT.layout1; }
function tipos() { return Object.keys(campos()); }
function usaFoto(tipo) { return (COM_FOTO[chaveLayout()] || []).includes(tipo); }
function usaItens(tipo) { return (COM_ITENS[chaveLayout()] || []).includes(tipo); }
function temRotulo() { return estado.layout === 'layout1'; }

// Mostra no cartão da lâmina que a IA está trabalhando nela
function marcarReescrevendo(i, ligado, erro) {
  const cartao = $$('#slides .slide-card')[i];
  if (!cartao) return;
  cartao.classList.toggle('reescrevendo', !!ligado);
  let faixa = cartao.querySelector('.faixa-reescreve');
  if (!faixa) {
    faixa = document.createElement('div');
    faixa.className = 'faixa-reescreve';
    cartao.querySelector('.campos').prepend(faixa);
  }
  faixa.textContent = erro || (ligado ? 'Reescrevendo esta lâmina no formato novo...' : '');
  faixa.classList.toggle('erro', !!erro);
  faixa.style.display = (ligado || erro) ? 'block' : 'none';
}

function pintarSlides() {
  const mapa = campos();
  $('#slides').innerHTML = estado.slides.map((s, i) => {
    const lista = mapa[s.tipo] || [];
    const campos_html = lista.map(([k, rot, tag]) => tag === 'textarea'
      ? `<div><div class="rot">${rot}</div><textarea rows="4" data-i="${i}" data-k="${k}">${(s[k] || '').replace(/</g, '&lt;')}</textarea></div>`
      : `<div><div class="rot">${rot}</div><input data-i="${i}" data-k="${k}" value="${(s[k] || '').replace(/"/g, '&quot;')}"></div>`
    ).join('');

    const itens = usaItens(s.tipo) ? `
      <div class="itens-caixa">
        ${(s.itens || []).map((it, j) => `
          <div class="dupla ${temRotulo() ? '' : 'simples'}">
            ${temRotulo() ? `<input data-i="${i}" data-item="${j}" data-k="rotulo" value="${(it.rotulo || '').replace(/"/g, '&quot;')}" placeholder="Rótulo">` : ''}
            <input data-i="${i}" data-item="${j}" data-k="texto" value="${(it.texto || '').replace(/"/g, '&quot;')}" placeholder="Texto">
            <button class="botao mini fantasma rm-item" data-i="${i}" data-item="${j}">×</button>
          </div>`).join('')}
        <button class="botao mini fantasma add-item" data-i="${i}">+ item</button>
      </div>` : '';

    const atual = s.imagem || s.foto || '';
    const gerada = String(atual).startsWith('geradas/');
    const bloco_gerar = geraImagem(s.tipo) ? `
      <div class="escolha-foto">
        <div class="rot">Imagem desta lâmina</div>
        <div class="linha-imagem">
          <div class="mini-gerada ${gerada ? '' : 'vazia'}"
            ${gerada ? `style="background-image:url('/${atual}')"` : ''}>${gerada ? '' : 'sem imagem'}</div>
          <div class="cresce">
            <input class="direcao" data-i="${i}" data-k="imagem_ideia"
              value="${(s.imagem_ideia || '').replace(/"/g, '&quot;')}"
              placeholder="Descreva a imagem que combina com este texto">
            <button class="botao mini gerar-img" data-i="${i}">${gerada ? 'Gerar outra' : 'Gerar imagem'}</button>
          </div>
        </div>
        <div class="rot dica-img" data-dica="${i}"></div>
      </div>` : '';

    const foto = usaFoto(s.tipo) && !geraImagem(s.tipo) ? `
      <div class="escolha-foto">
        <div class="rot">Sua foto nesta lâmina${s.imagem_ideia ? ` · sugestão: <em>${(s.imagem_ideia || '').replace(/</g, '&lt;')}</em>` : ''}</div>
        <div class="tiras">
          <div class="tira ${!s.foto ? 'ativa' : ''}" data-i="${i}" data-arquivo="">padrão</div>
          <div class="tira so-cor ${s.foto === 'nenhuma' ? 'ativa' : ''}" data-i="${i}" data-arquivo="nenhuma"
            title="Sem foto, só a cor da paleta">só cor</div>
          ${estado.fotos.map(f => `<div class="tira ${s.foto === f.arquivo ? 'ativa' : ''}" data-i="${i}" data-arquivo="${f.arquivo}"
            style="background-image:url('/fotos/${f.arquivo}')" title="${f.rotulo || ''}"></div>`).join('')}
        </div>
      </div>` : '';

    return `
    <div class="slide-card">
      <div class="previa"><iframe data-previa="${i}" sandbox="allow-same-origin"></iframe></div>
      <div class="campos">
        <div class="cabeca">
          <span class="num">SLIDE ${String(i + 1).padStart(2, '0')}</span>
          <select data-i="${i}" data-k="tipo">
            ${tipos().map(t => `<option ${t === s.tipo ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
          <button class="botao mini fantasma mover" data-i="${i}" data-dir="-1">↑</button>
          <button class="botao mini fantasma mover" data-i="${i}" data-dir="1">↓</button>
          <button class="botao mini fantasma apagar-s" data-i="${i}">Apagar</button>
        </div>
        ${campos_html}${itens}${bloco_gerar}${foto}
      </div>
    </div>`;
  }).join('');

  $$('#slides input[data-k], #slides textarea[data-k]').forEach(el => {
    el.addEventListener('input', () => {
      const i = +el.dataset.i;
      if (el.dataset.item !== undefined) {
        const j = +el.dataset.item;
        estado.slides[i].itens = estado.slides[i].itens || [];
        estado.slides[i].itens[j] = estado.slides[i].itens[j] || {};
        estado.slides[i].itens[j][el.dataset.k] = el.value;
      } else {
        estado.slides[i][el.dataset.k] = el.value;
      }
      previa(i);
    });
  });
  $$('#slides select[data-k=tipo]').forEach(el => el.addEventListener('change', async () => {
    const i = +el.dataset.i;
    const tipoNovo = el.value;
    const antiga = estado.slides[i];
    if (antiga.tipo === tipoNovo) return;

    // Troca imediata, para a tela responder na hora
    estado.slides[i] = { ...antiga, tipo: tipoNovo };
    if (usaItens(tipoNovo) && !estado.slides[i].itens) estado.slides[i].itens = [{ texto: '' }];
    pintarSlides();

    // E logo em seguida a IA veste a mesma ideia no formato novo
    const aviso = document.querySelector(`[data-dica="${i}"]`) || document.querySelector(`[data-reescreve="${i}"]`);
    marcarReescrevendo(i, true);
    try {
      const r = await api('/api/reescrever-lamina', {
        method: 'POST',
        body: JSON.stringify({
          lamina: antiga, tipo_novo: tipoNovo, layout: chaveLayout(),
          anterior: estado.slides[i - 1] || null, proxima: estado.slides[i + 1] || null,
          posicao: i + 1, total: estado.slides.length,
        }),
      });
      // A imagem da lâmina não se perde na troca
      const imagem = estado.slides[i].imagem, foto = estado.slides[i].foto;
      estado.slides[i] = { ...r.lamina, tipo: tipoNovo };
      if (imagem) estado.slides[i].imagem = imagem;
      if (foto) estado.slides[i].foto = foto;
      pintarSlides();
    } catch (e) {
      marcarReescrevendo(i, false, 'Não consegui reescrever: ' + e.message + '. O texto anterior está guardado, é só voltar ao tipo antigo.');
    }
  }));
  $$('#slides .gerar-img').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.i, s = estado.slides[i];
    const dica = document.querySelector(`[data-dica="${i}"]`);
    if (!s.imagem_ideia || !s.imagem_ideia.trim()) { dica.textContent = 'Escreva a direção de imagem primeiro.'; return; }
    b.disabled = true; const antes = b.textContent; b.textContent = 'Gerando...';
    dica.textContent = 'A imagem leva de 10 a 20 segundos.';
    try {
      const r = await api('/api/imagem', {
        method: 'POST',
        body: JSON.stringify({
          descricao: s.imagem_ideia, tipo: s.tipo, layout: estado.layout,
          contexto: [s.titulo, s.corpo].filter(Boolean).join('. '),
        }),
      });
      estado.slides[i].imagem = r.imagem;
      pintarSlides();
    } catch (e) { dica.textContent = 'Erro: ' + e.message; b.disabled = false; b.textContent = antes; }
  }));

  $$('#slides .tira').forEach(el => el.addEventListener('click', () => {
    const i = +el.dataset.i;
    estado.slides[i].foto = el.dataset.arquivo || null;
    if (el.dataset.arquivo === 'nenhuma') delete estado.slides[i].imagem;
    pintarSlides();
  }));
  $$('#slides .mover').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i, d = +b.dataset.dir, j = i + d;
    if (j < 0 || j >= estado.slides.length) return;
    const t = estado.slides[i]; estado.slides[i] = estado.slides[j]; estado.slides[j] = t;
    pintarSlides();
  }));
  $$('#slides .apagar-s').forEach(b => b.addEventListener('click', () => {
    estado.slides.splice(+b.dataset.i, 1); pintarSlides();
  }));
  $$('#slides .add-item').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i;
    estado.slides[i].itens = estado.slides[i].itens || [];
    estado.slides[i].itens.push({ texto: '' }); pintarSlides();
  }));
  $$('#slides .rm-item').forEach(b => b.addEventListener('click', () => {
    estado.slides[+b.dataset.i].itens.splice(+b.dataset.item, 1); pintarSlides();
  }));

  estado.slides.forEach((_, i) => previa(i));
}

let temporizador = {};
async function previa(i) {
  clearTimeout(temporizador[i]);
  temporizador[i] = setTimeout(async () => {
    const frame = document.querySelector(`iframe[data-previa="${i}"]`);
    if (!frame) return;
    const r = await fetch('/api/previa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slide: estado.slides[i], serie: $('#serie').value, handle: estado.handle,
        foto: estado.slides[i].imagem || estado.slides[i].foto || estado.foto,
        layout: chaveLayout() === 'post' ? 'post' : estado.layout, tom: estado.tom,
      }),
    });
    frame.srcdoc = await r.text();
  }, 260);
}

$('#serie').addEventListener('input', () => estado.slides.forEach((_, i) => previa(i)));

$('#btn-voltar-angulos').addEventListener('click', () => {
  if (estado.formato === 'live') {
    if (!estado.propostas.length) return;
    pintarPropostas();
    $('#opcoes-live').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (estado.formato === 'reels') {
    if (!estado.ganchos.length) return;
    pintarGanchos();
    $('#opcoes-reels').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (!estado.opcoes || !estado.opcoes.length) return;
  pintarOpcoes();
  $('#opcoes-post').scrollIntoView({ behavior: 'smooth' });
});

$('#btn-add').addEventListener('click', () => {
  estado.slides.push({ tipo: tipos()[1] || tipos()[0], titulo: '', corpo: '' });
  pintarSlides();
});

$('#btn-salvar').addEventListener('click', async () => {
  if (!estado.carrosselId) return;
  await api('/api/carrosseis/' + estado.carrosselId, {
    method: 'PUT',
    body: JSON.stringify({ slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value }),
  });
  $('#status-export').textContent = 'Salvo.';
});

$('#btn-exportar').addEventListener('click', async () => {
  if (!estado.carrosselId) return;
  const st = $('#status-export');
  st.textContent = 'Salvando e gerando as imagens...';
  $('#btn-exportar').disabled = true;
  try {
    await api('/api/carrosseis/' + estado.carrosselId, {
      method: 'PUT',
      body: JSON.stringify({
        slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value,
        tom: estado.tom, foto: estado.foto, comentario: $('#comentario').value,
        roteiro: estado.roteiro || undefined,
      }),
    });
    const r = await api('/api/carrosseis/' + estado.carrosselId + '/render', {
      method: 'POST', body: JSON.stringify({ foto: estado.foto }),
    });
    st.innerHTML = `<strong>Pronto: ${r.arquivos.length} imagens.</strong>
      <div class="acoes-export">
        <a class="botao" href="/api/carrosseis/${estado.carrosselId}/zip">Baixar tudo</a>
        <button class="botao fantasma" id="abrir-pasta">Abrir a pasta</button>
      </div>
      <div class="exportadas">` +
      r.arquivos.map((a, n) => `<a href="${a}" target="_blank" title="Slide ${n + 1}">
        <img src="${a}?t=${Date.now()}" loading="lazy"><span>${n + 1}</span></a>`).join('') + '</div>';
    const bp = document.getElementById('abrir-pasta');
    if (bp) bp.addEventListener('click', async () => {
      try { await api('/api/carrosseis/' + estado.carrosselId + '/abrir-pasta', { method: 'POST' }); }
      catch (e) { alert(e.message); }
    });
  } catch (e) { st.textContent = 'Erro: ' + e.message; }
  finally { $('#btn-exportar').disabled = false; }
});


// ---------- extras: capa de vídeo ----------
estado.capaFoto = null;
estado.capaTom = 'petrol';

function carregarExtras() {
  // as mesmas fotos e as mesmas paletas do resto do app
  $('#capa-fotos').innerHTML = estado.fotos.map(f => `
    <div class="foto-item ${estado.capaFoto === f.arquivo ? 'ativa' : ''}" data-arquivo="${f.arquivo}">
      <img src="/fotos/${f.arquivo}" loading="lazy">
      <div class="rotulo">${f.rotulo || ''}</div>
    </div>`).join('') || '<p class="dica">Suba fotos na aba Fotos para usar aqui.</p>';

  $$('#capa-fotos .foto-item').forEach(el => el.addEventListener('click', () => {
    estado.capaFoto = estado.capaFoto === el.dataset.arquivo ? null : el.dataset.arquivo;
    carregarExtras();
  }));

  const tons = estado.tons.layout1 || [];
  $('#capa-tons').innerHTML = tons.map(t => `
    <button class="pilula tom ${t.id === estado.capaTom ? 'ativa' : ''}" data-tom="${t.id}">
      <span class="bolinha" style="background:${t.fundo}"></span>${t.nome}</button>`).join('');
  $$('#capa-tons .tom').forEach(b => b.addEventListener('click', () => {
    estado.capaTom = b.dataset.tom;
    carregarExtras();
    if (estado.capas) pintarCapas();
  }));
}

$('#btn-capas').addEventListener('click', async () => {
  const tema = $('#capa-tema').value.trim();
  const conteudo = $('#capa-conteudo').value.trim();
  if (!tema) return alert('Escreva o tema do vídeo.');
  if (!conteudo) return alert('Me conte o que o vídeo fala. É disso que sai a frase da capa.');

  const st = $('#status-capas');
  const parar = contando(st, 'Escrevendo três capas...');
  $('#btn-capas').disabled = true;
  try {
    const r = await api('/api/extras/capas', {
      method: 'POST',
      body: JSON.stringify({ tema, conteudo, duracao: $('#capa-duracao').value.trim() }),
    });
    estado.capas = r.capas || [];
    parar(`${estado.capas.length} capas prontas. Desenhando...`);
    await pintarCapas();
    parar('Escolha a que combina com o vídeo e baixe.');
  } catch (e) {
    parar('Erro: ' + e.message);
  } finally { $('#btn-capas').disabled = false; }
});

const NOME_ABORDAGEM = {
  tensao: 'A tensão', contradicao: 'A contradição', pergunta: 'A pergunta',
};

async function pintarCapas() {
  const caixa = $('#capas-geradas');
  caixa.classList.remove('oculto');
  caixa.innerHTML = '<h3>As três capas</h3>' + estado.capas.map((c, i) => `
    <div class="capa-opcao">
      <div class="capa-previa" id="capa-img-${i}"><span>desenhando...</span></div>
      <div class="capa-lado">
        <div class="gancho-tipo">${NOME_ABORDAGEM[c.abordagem] || 'capa ' + (i + 1)}</div>
        ${c.porque ? `<p class="dica">${c.porque.replace(/</g, '&lt;')}</p>` : ''}
        <div class="rot">Chapéu</div>
        <input data-capa="${i}" data-campo="chapeu" value="${(c.chapeu || '').replace(/"/g, '&quot;')}">
        <div class="rot">Título · no máximo 6 palavras</div>
        <input data-capa="${i}" data-campo="titulo" value="${(c.titulo || '').replace(/"/g, '&quot;')}">
        <div class="rot">Linha de apoio</div>
        <input data-capa="${i}" data-campo="apoio" value="${(c.apoio || '').replace(/"/g, '&quot;')}">
        <div class="rot">Selo</div>
        <input data-capa="${i}" data-campo="selo" value="${(c.selo || '').replace(/"/g, '&quot;')}">
        <div class="capa-acoes">
          <button class="botao mini fantasma redesenhar" data-i="${i}">Redesenhar</button>
          <a class="botao mini baixar-capa oculto" id="baixar-${i}" download>Baixar</a>
        </div>
      </div>
    </div>`).join('');

  $$('#capas-geradas [data-capa]').forEach(el => el.addEventListener('input', () => {
    estado.capas[+el.dataset.capa][el.dataset.campo] = el.value;
  }));
  $$('#capas-geradas .redesenhar').forEach(b => b.addEventListener('click', () => desenharCapa(+b.dataset.i)));

  for (let i = 0; i < estado.capas.length; i++) await desenharCapa(i);
}

async function desenharCapa(i) {
  const alvo = document.getElementById('capa-img-' + i);
  if (!alvo) return;
  alvo.innerHTML = '<span>desenhando...</span>';
  try {
    const r = await api('/api/extras/capa/render', {
      method: 'POST',
      body: JSON.stringify({
        capa: estado.capas[i], foto: estado.capaFoto, tom: estado.capaTom, indice: i,
      }),
    });
    alvo.innerHTML = `<img src="${r.arquivo}?t=${Date.now()}" alt="capa ${i + 1}">`;
    const link = document.getElementById('baixar-' + i);
    if (link) { link.href = r.arquivo; link.classList.remove('oculto'); }
  } catch (e) {
    alvo.innerHTML = `<span class="aviso-pub">${e.message}</span>`;
  }
}

// ---------- comece aqui ----------
async function carregarComece() {
  const e = await api('/api/comece');
  const faltam = e.identidade_total - e.identidade_prontos.length;

  const passos = [
    {
      feito: e.chave_anthropic && e.chave_gemini,
      titulo: 'Cadastrar as suas chaves de IA',
      onde: 'Chaves e ajustes',
      pronto: 'As duas chaves estão no lugar.',
      falta: !e.chave_anthropic && !e.chave_gemini
        ? 'Faltam as duas: a da Anthropic, que escreve, e a do Gemini, que transcreve áudio e cria imagens.'
        : (!e.chave_anthropic ? 'Falta a da Anthropic, que é quem escreve os conteúdos.'
                              : 'Falta a do Gemini, que transcreve os seus áudios e cria as imagens.'),
      ajuda: 'A da Anthropic sai de console.anthropic.com, em API Keys. A do Gemini sai de aistudio.google.com/apikey. As duas pedem cartão, e o gasto é seu.',
    },
    {
      feito: faltam === 0,
      titulo: 'Escrever a sua identidade',
      onde: 'Identidade',
      pronto: `Os ${e.identidade_total} blocos estão preenchidos.`,
      falta: `${faltam} de ${e.identidade_total} blocos ainda estão com as perguntas-guia.`,
      ajuda: 'É o que decide a qualidade de tudo. Responda com as suas palavras, do jeito que você fala, não do jeito que se escreve bonito.',
    },
    {
      feito: e.fotos >= 3,
      titulo: 'Subir as suas fotos',
      onde: 'Fotos',
      pronto: `${e.fotos} fotos no banco.`,
      falta: e.fotos ? `Só ${e.fotos}. Suba pelo menos cinco para ter variação.` : 'Nenhuma foto ainda.',
      ajuda: 'Elas entram na capa e no fechamento. Dê nomes que você reconheça, tipo "blusa verde, sentada".',
    },
    {
      feito: e.cores_proprias,
      titulo: 'Colocar as suas cores',
      onde: 'Cores',
      pronto: 'As paletas estão com as suas cores.',
      falta: 'As cinco paletas ainda estão com as cores que vieram de fábrica.',
      ajuda: 'Opcional, mas é o que faz o feed parecer seu. Se tiver os códigos da sua marca, cole ali.',
      opcional: true,
    },
    {
      feito: e.conteudos > 0,
      titulo: 'Fazer o primeiro conteúdo',
      onde: 'Produzir',
      pronto: `${e.conteudos} conteúdos criados${e.publicados ? `, ${e.publicados} publicados` : ''}.`,
      falta: 'Escolha um formato, escreva o tema e veja o que sai.',
      ajuda: 'Só faça depois dos passos de cima. Com a identidade vazia, o texto sai genérico.',
    },
  ];

  const prontos = passos.filter(p => p.feito).length;
  $('#checklist').innerHTML = `
    <div class="progresso">
      <div class="barra"><span style="width:${(prontos / passos.length) * 100}%"></span></div>
      <span class="conta">${prontos} de ${passos.length}</span>
    </div>
    ${passos.map((p, i) => `
      <div class="passo-check ${p.feito ? 'feito' : ''}">
        <span class="marca">${p.feito ? '✓' : i + 1}</span>
        <div class="passo-texto">
          <strong>${p.titulo}</strong>
          ${p.opcional && !p.feito ? '<em class="opcional">opcional</em>' : ''}
          <div class="meta">${p.feito ? p.pronto : p.falta}</div>
          ${!p.feito ? `<div class="ajuda">${p.ajuda}</div>` : ''}
        </div>
        ${!p.feito ? `<button class="botao mini ir-para" data-aba="${
          { 'Chaves e ajustes': 'config', 'Identidade': 'identidade', 'Fotos': 'fotos',
            'Cores': 'visual', 'Produzir': 'produzir' }[p.onde]
        }">${p.onde}</button>` : ''}
      </div>`).join('')}`;

  $$('.ir-para').forEach(b => b.addEventListener('click', () => {
    document.querySelector(`.abas button[data-aba="${b.dataset.aba}"]`).click();
  }));
}

// ---------- as cores da marca ----------
const PAPEL_DO_TOKEN = {
  fundo: 'Fundo da lâmina', fundo2: 'Fundo de apoio', halo: 'Brilho do fundo',
  cartao: 'Cartão', papel: 'Papel (Reportagem)',
  tinta: 'Texto', titulo: 'Título', secundaria: 'Texto secundário',
  bloco: 'Caixa de destaque', sobreBloco: 'Texto na caixa',
  acento: 'Acento', ouro: 'Detalhe', apoio: 'Frase manuscrita', borda: 'Borda',
};

// Uma lâmina de exemplo em cada cor: é assim que ela entende sem ler nada
async function pintarAmostras(lista) {
  const exemplo = {
    tipo: 'texto',
    titulo: 'A sua cor em uma lâmina',
    destaque: 'é assim que vai sair',
    corpo: 'Este é o tamanho do texto que aparece nos seus conteúdos.',
    manuscrita: 'e a frase de mão fica assim',
  };
  $('#amostras').innerHTML = lista.map(p => `
    <div class="amostra">
      <div class="amostra-tela"><iframe data-amostra="${p.id}" sandbox="allow-same-origin"></iframe></div>
      <span>${p.nome}</span>
    </div>`).join('');

  for (const p of lista) {
    const frame = document.querySelector(`iframe[data-amostra="${p.id}"]`);
    if (!frame) continue;
    const r = await fetch('/api/previa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide: exemplo, serie: '', handle: estado.handle, layout: 'layout1', tom: p.id }),
    });
    frame.srcdoc = await r.text();
  }
}

async function carregarPaletas() {
  const lista = await api('/api/paletas');
  estado.paletas = lista;
  pintarAmostras(lista);
  $('#lista-paletas').innerHTML = lista.map(p => `
    <details class="paleta-bloco" ${p.personalizada ? 'open' : ''}>
      <summary>
        <span class="bolinha" style="background:${p.amostra}"></span>
        <strong>${p.nome}</strong>
        ${p.personalizada ? '<em class="marca-sua">sua</em>' : ''}
      </summary>
      <div class="cores">
        ${Object.entries(p.tokens).map(([chave, valor]) => `
          <label class="cor">
            <span>${PAPEL_DO_TOKEN[chave] || chave}</span>
            <input type="color" data-paleta="${p.id}" data-token="${chave}" value="${valor}">
            <input type="text" class="hex" data-paleta="${p.id}" data-token="${chave}"
              value="${valor}" maxlength="7" spellcheck="false">
          </label>`).join('')}
      </div>
    </details>`).join('');

  // os dois campos da mesma cor andam juntos
  $$('#lista-paletas input').forEach(el => el.addEventListener('input', () => {
    const par = $$(`#lista-paletas input[data-paleta="${el.dataset.paleta}"][data-token="${el.dataset.token}"]`);
    par.forEach(o => { if (o !== el && /^#[0-9a-fA-F]{6}$/.test(el.value)) o.value = el.value; });
  }));
}

// os pares cor e código andam juntos também aqui em cima
['escura','clara','acento','apoio'].forEach(nome => {
  const cor = $('#m-' + nome), hex = $('#m-' + nome + '-hex');
  cor.addEventListener('input', () => { hex.value = cor.value; });
  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) cor.value = hex.value;
  });
});

$('#btn-colar').addEventListener('click', async () => {
  const texto = $('#colar-cores').value.trim();
  if (!texto) return alert('Escreva como é a sua marca, ou cole os códigos das cores.');
  const b = $('#btn-colar');
  b.disabled = true; b.textContent = 'Entendendo...';
  try {
    const r = await api('/api/paletas/colar', { method: 'POST', body: JSON.stringify({ texto }) });
    await carregarLayouts();
    await carregarPaletas();
    const m = r.marca;
    const amostra = (c) => `<span class="pingo" style="background:${c}"></span>`;
    $('#status-cores').innerHTML = m
      ? `Pronto. ${amostra(m.escura)}${amostra(m.clara)}${amostra(m.acento)}${amostra(m.apoio)} ` +
        (r.explicacao ? `<em>${r.explicacao}</em>` : 'Veja abaixo como ficou.')
      : 'Pronto, as cores foram trocadas.';
  } catch (e) {
    $('#status-cores').textContent = e.message;
  } finally { b.disabled = false; b.textContent = 'Usar estas cores'; }
});

$('#btn-montar').addEventListener('click', async () => {
  const b = $('#btn-montar');
  b.disabled = true; b.textContent = 'Montando...';
  try {
    await api('/api/paletas/montar', {
      method: 'POST',
      body: JSON.stringify({
        escura: $('#m-escura-hex').value, clara: $('#m-clara-hex').value,
        acento: $('#m-acento-hex').value, apoio: $('#m-apoio-hex').value,
      }),
    });
    await carregarLayouts();
    await carregarPaletas();
    $('#status-cores').textContent = 'Pronto. Confira abaixo e ajuste o que quiser.';
  } catch (e) {
    $('#status-cores').textContent = 'Erro: ' + e.message;
  } finally { b.disabled = false; b.textContent = 'Montar as cinco paletas'; }
});

$('#salvar-cores').addEventListener('click', async () => {
  const novas = {};
  for (const p of estado.paletas) novas[p.id] = { nome: p.nome, amostra: p.amostra, escura: p.escura, tokens: {} };
  $$('#lista-paletas input.hex').forEach(el => {
    if (/^#[0-9a-fA-F]{6}$/.test(el.value)) novas[el.dataset.paleta].tokens[el.dataset.token] = el.value;
  });
  // a bolinha do menu segue o fundo
  for (const id of Object.keys(novas)) {
    if (novas[id].tokens.fundo) novas[id].amostra = novas[id].tokens.fundo;
  }
  try {
    await api('/api/paletas', { method: 'PUT', body: JSON.stringify(novas) });
    $('#status-cores').textContent = 'Salvo. Vale para tudo que for gerado daqui em diante.';
    await carregarLayouts();
    await carregarPaletas();
  } catch (e) { $('#status-cores').textContent = 'Erro: ' + e.message; }
});

$('#restaurar-cores').addEventListener('click', async () => {
  if (!confirm('Voltar as cinco paletas ao padrão?')) return;
  await api('/api/paletas', { method: 'DELETE' });
  await carregarLayouts();
  await carregarPaletas();
  $('#status-cores').textContent = 'Voltou ao padrão.';
});

// ---------- publicar no Instagram ----------
$('#btn-conferir').addEventListener('click', async () => {
  if (!estado.carrosselId) { $('#previa-pub').textContent = 'Gere ou abra um conteúdo primeiro.'; return; }
  const alvo = $('#previa-pub');
  const botao = $('#btn-conferir');
  botao.disabled = true;

  const mostrar = (p) => {
    const linhas = [];
    linhas.push(`<strong>${p.imagens.length} ${p.imagens.length === 1 ? 'imagem' : 'imagens'}</strong> · legenda com ${(p.legenda || '').split('\n').filter(Boolean).length} linhas`);
    if (p.quota) linhas.push(`Você publicou ${p.quota.usadas} de ${p.quota.total} vezes nas últimas 24 horas.`);
    if (p.problemas.length) linhas.push('<span class="aviso-pub">' + p.problemas.join('<br>') + '</span>');
    if (p.publicacao_direta === false) {
      linhas.push('<span class="aviso-pub">A publicação direta ainda não está liberada neste app. ' +
        'Use <strong>Baixar tudo</strong> ali em cima e poste pelo celular.</span>');
    }
    alvo.innerHTML = linhas.join('<br>');
    const podeIr = !p.problemas.length && p.publicacao_direta !== false;
    $('#acao-pub').classList.toggle('oculto', !podeIr);
    if (!$('#dia-agenda').value) {
      const h = new Date();
      $('#dia-agenda').value = `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,'0')}-${String(h.getDate()).padStart(2,'0')}`;
    }
    estado.previaPub = p;
  };

  let parar = contando(alvo, 'Conferindo...');
  try {
    let p = await api('/api/instagram/previa/' + estado.carrosselId);

    // Faltou imagem? Exporta na hora, em vez de mandar ela voltar
    if (!p.imagens.length) {
      parar('');
      parar = contando(alvo, 'As imagens ainda não existiam. Gerando agora...');
      await api('/api/carrosseis/' + estado.carrosselId, {
        method: 'PUT',
        body: JSON.stringify({
          slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value,
          tom: estado.tom, foto: estado.foto, comentario: $('#comentario').value,
          roteiro: estado.roteiro || undefined,
        }),
      });
      await api('/api/carrosseis/' + estado.carrosselId + '/render', {
        method: 'POST', body: JSON.stringify({ foto: estado.foto }),
      });
      p = await api('/api/instagram/previa/' + estado.carrosselId);
    }

    parar('');
    mostrar(p);
  } catch (e) {
    parar('Erro: ' + e.message);
    $('#acao-pub').classList.add('oculto');
  } finally {
    botao.disabled = false;
  }
});

function abrirModalPublicar(p, id) {
  estado.publicandoId = id || p.id || estado.carrosselId;
  const n = p.imagens.length;
  $('#modal-imagens').innerHTML = p.imagens.map((img, i) => `
    <div class="modal-thumb">
      <img src="/saidas/${estado.publicandoId}/${img}?t=${Date.now()}" alt="lâmina ${i + 1}">
      <span>${i + 1}</span>
    </div>`).join('');
  $('#modal-texto').textContent = (p.legenda || '').trim() || '(sem legenda)';
  $('#modal-aviso').innerHTML =
    `<strong>${n} ${n === 1 ? 'imagem' : 'imagens'}</strong> ${n === 1 ? 'vai' : 'vão'} para o seu feed agora, de verdade. ` +
    (p.quota ? `Você já publicou ${p.quota.usadas} de ${p.quota.total} vezes nas últimas 24 horas.` : '');
  $('#modal-publicar').classList.remove('oculto');
  $('#modal-ok').disabled = false;
  $('#modal-ok').textContent = 'Publicar agora';
}

function fecharModal() {
  $('#modal-publicar').classList.add('oculto');
}

$('#modal-cancelar').addEventListener('click', fecharModal);
$('#modal-publicar').addEventListener('click', (e) => {
  if (e.target.id === 'modal-publicar') fecharModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#modal-publicar').classList.contains('oculto')) fecharModal();
});

$('#btn-agendar').addEventListener('click', async () => {
  const dia = $('#dia-agenda').value;
  if (!dia) { alert('Escolha o dia.'); return; }
  const b = $('#btn-agendar');
  b.disabled = true; b.textContent = 'Mandando...';
  try {
    await api('/api/carrosseis/' + estado.carrosselId, {
      method: 'PUT',
      body: JSON.stringify({
        slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value,
        tom: estado.tom, foto: estado.foto, comentario: $('#comentario').value,
        roteiro: estado.roteiro || undefined,
      }),
    });
    await api('/api/agenda/' + estado.carrosselId, {
      method: 'POST', body: JSON.stringify({ dia }),
    });
    const d = new Date(dia + 'T12:00:00');
    $('#previa-pub').innerHTML = `<strong>Está no calendário</strong>, dia ${d.toLocaleDateString('pt-BR')}. ` +
      `Vá em <em>Calendário</em> para publicar quando quiser.`;
    $('#acao-pub').classList.add('oculto');
  } catch (e) {
    alert('Não consegui agendar: ' + e.message);
  } finally {
    b.disabled = false; b.textContent = 'Mandar para o calendário';
  }
});

$('#modal-ok').addEventListener('click', async () => {
  const b = $('#modal-ok');
  b.disabled = true;
  b.textContent = 'Publicando...';
  const parar = contando($('#modal-aviso'), 'Mandando para o Instagram...');
  try {
    const r = await api('/api/instagram/publicar/' + estado.publicandoId, { method: 'POST' });
    parar('');
    fecharModal();
    carregarCalendario();
    if (r.permalink) window.open(r.permalink, '_blank');
  } catch (e) {
    parar('');
    $('#modal-aviso').innerHTML = `<span class="aviso-pub">Não consegui publicar: ${e.message}</span>`;
    b.disabled = false;
    b.textContent = 'Tentar de novo';
  }
});

// ---------- calendário ----------
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
estado.mes = new Date();

async function carregarCalendario() {
  const [pubs, agenda] = await Promise.all([api('/api/publicacoes'), api('/api/agenda')]);
  estado.publicacoes = pubs;
  estado.agenda = agenda;
  pintarMes();
}

function pintarMes() {
  const ref = estado.mes;
  const ano = ref.getFullYear(), mes = ref.getMonth();
  $('#mes-nome').textContent = `${MESES[mes]} de ${ano}`;

  const noMes = (iso) => {
    const d = new Date(iso);
    return d.getFullYear() === ano && d.getMonth() === mes;
  };

  const publicados = (estado.publicacoes || []).filter(p => noMes(p.publicado_em));
  const agendados = (estado.agenda || []).filter(a => noMes(a.agendado_para + 'T12:00:00'));

  const porDia = {};
  const marcar = (dia, item) => { (porDia[dia] = porDia[dia] || []).push(item); };
  for (const p of publicados) marcar(new Date(p.publicado_em).getDate(), { ...p, tipo: 'publicado' });
  for (const a of agendados) marcar(new Date(a.agendado_para + 'T12:00:00').getDate(), { ...a, tipo: 'agendado' });

  const primeiro = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const hoje = new Date();
  const ehHoje = (d) => hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === d;

  let html = ['dom','seg','ter','qua','qui','sex','sáb'].map(d => `<div class="cab-dia">${d}</div>`).join('');
  for (let i = 0; i < primeiro; i++) html += '<div class="dia vazio"></div>';
  for (let d = 1; d <= dias; d++) {
    const its = porDia[d] || [];
    html += `<div class="dia ${ehHoje(d) ? 'hoje' : ''} ${its.length ? 'tem' : ''}">
      <span class="num-dia">${d}</span>
      ${its.map(x => `<span class="ponto ${x.formato || 'carrossel'} ${x.tipo}"
        title="${(x.titulo || x.tema || '').replace(/"/g, '&quot;')}"></span>`).join('')}
    </div>`;
  }
  $('#grade-mes').innerHTML = html;

  const cartaoAgendado = (a) => {
    const d = new Date(a.agendado_para + 'T12:00:00');
    return `
    <div class="item agendado">
      <div class="item-info">
        <span class="etiqueta ${a.formato || 'carrossel'}">${a.formato || 'carrossel'}</span>
        <div class="item-texto">
          <strong>${(a.tema || '(sem tema)').replace(/</g, '&lt;')}</strong>
          <div class="meta"><span class="status agendado">no calendário</span> · ${d.toLocaleDateString('pt-BR')}</div>
        </div>
      </div>
      <div class="item-acoes">
        <button class="botao mini publicar-ag" data-id="${a.id}">Publicar</button>
        <button class="botao mini fantasma tirar-ag" data-id="${a.id}">Tirar</button>
      </div>
    </div>`;
  };

  const cartaoPublicado = (p) => {
    const d = new Date(p.publicado_em);
    return `
    <div class="item">
      <div class="item-info">
        <span class="etiqueta ${p.formato || 'carrossel'}">${p.formato || 'carrossel'}</span>
        <div class="item-texto">
          <strong>${(p.titulo || '(sem título)').replace(/</g, '&lt;')}</strong>
          <div class="meta">
            <span class="status publicado">no ar</span> ·
            ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} às ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}
            ${p.manual ? ' · marcado à mão' : ''}
            ${p.permalink ? ` · <a href="${p.permalink}" target="_blank">ver no Instagram</a>` : ''}
          </div>
        </div>
      </div>
      <button class="botao mini fantasma apagar-pub" data-id="${p.id}">Apagar</button>
    </div>`;
  };

  const partes = [];
  if (agendados.length) partes.push('<h3>Esperando no calendário</h3>' + agendados.map(cartaoAgendado).join(''));
  if (publicados.length) partes.push('<h3>Já publicados</h3>' + publicados.map(cartaoPublicado).join(''));
  $('#lista-pub').innerHTML = partes.length ? partes.join('') : '<p class="dica">Nada neste mês ainda.</p>';

  $$('.apagar-pub').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Tirar este registro do calendário?')) return;
    await api('/api/publicacoes/' + b.dataset.id, { method: 'DELETE' });
    carregarCalendario();
  }));

  $$('.tirar-ag').forEach(b => b.addEventListener('click', async () => {
    await api('/api/agenda/' + b.dataset.id, { method: 'DELETE' });
    carregarCalendario();
  }));

  // Publicar direto do calendário: mesma confirmação, com a arte na frente
  $$('.publicar-ag').forEach(b => b.addEventListener('click', async () => {
    const id = Number(b.dataset.id);
    b.disabled = true; b.textContent = 'Conferindo...';
    try {
      const p = await api('/api/instagram/previa/' + id);
      if (p.problemas.length) {
        alert('Ainda não dá para publicar:\n\n' + p.problemas.join('\n'));
        return;
      }
      abrirModalPublicar(p, id);
    } catch (e) {
      alert('Erro: ' + e.message);
    } finally {
      b.disabled = false; b.textContent = 'Publicar';
    }
  }));
}

$('#mes-antes').addEventListener('click', () => {
  estado.mes = new Date(estado.mes.getFullYear(), estado.mes.getMonth() - 1, 1); pintarMes();
});
$('#mes-depois').addEventListener('click', () => {
  estado.mes = new Date(estado.mes.getFullYear(), estado.mes.getMonth() + 1, 1); pintarMes();
});

$('#marcar-pub').addEventListener('click', async () => {
  const titulo = prompt('O que você postou?');
  if (!titulo) return;
  const quando = prompt('Em que dia? (dd/mm/aaaa)', new Date().toLocaleDateString('pt-BR'));
  if (!quando) return;
  const [dia, mes, ano] = quando.split('/').map(Number);
  if (!dia || !mes || !ano) return alert('Data inválida. Use dd/mm/aaaa.');
  const formato = prompt('Qual formato? carrossel, post, reels ou live', 'carrossel') || 'carrossel';
  const link = prompt('Link do post (opcional)') || '';
  await api('/api/publicacoes', {
    method: 'POST',
    body: JSON.stringify({
      titulo, formato: formato.toLowerCase().trim(),
      publicado_em: new Date(ano, mes - 1, dia, 12, 0).toISOString(),
      permalink: link,
    }),
  });
  carregarCalendario();
});

// ---------- carrosseis salvos ----------
async function carregarCarrosseis() {
  const l = await api('/api/carrosseis');
  const FORMATOS = {
    carrossel: 'Carrossel', post: 'Post', reels: 'Reels', live: 'Live / YT',
  };
  $('#lista-carrosseis').innerHTML = l.length ? l.map(c => {
    const f = c.formato || 'carrossel';
    return `
    <div class="item">
      <div class="item-info">
        <span class="etiqueta ${f}">${FORMATOS[f] || f}</span>
        <div class="item-texto">
          <strong>${c.tema || '(sem tema)'}</strong>
          <div class="meta">
            <span class="status ${c.status}">${c.status}</span>
            ${c.funcao ? ' · ' + c.funcao : ''}${c.nivel ? ' · nível ' + c.nivel : ''}
            ${c.serie ? ' · ' + c.serie : ''} · ${(c.criado_em || '').slice(0, 10).split('-').reverse().join('/')}
          </div>
        </div>
      </div>
      <div class="item-acoes">
        <button class="botao mini abrir-c" data-id="${c.id}">Abrir</button>
        <button class="botao mini fantasma apagar-c" data-id="${c.id}">Apagar</button>
      </div>
    </div>`;
  }).join('') : '<p class="dica">Nenhum conteúdo ainda.</p>';

  $$('.abrir-c').forEach(b => b.addEventListener('click', async () => {
    const c = await api('/api/carrosseis/' + b.dataset.id);
    estado.carrosselId = c.id; estado.slides = c.slides; estado.layout = c.layout || 'layout1';
    estado.tom = c.tom || 'petrol';
    $$('#layouts .card').forEach(x => x.classList.toggle('ativa', x.dataset.id === estado.layout));
    pintarTons();
    $('#tema').value = c.tema || ''; $('#serie').value = c.serie || '';
    $('#ideia').value = c.ideia || ''; $('#legenda').value = c.legenda || '';
    $('#comentario').value = c.comentario || '';
    if (c.foto) { estado.foto = c.foto; pintarFotosSel(); }
    $$('.abas button').forEach(x => x.classList.remove('ativa'));
    document.querySelector('.abas button[data-aba=produzir]').classList.add('ativa');
    $$('.view').forEach(v => v.classList.remove('ativa'));
    $('#v-produzir').classList.add('ativa');
    estado.formato = c.formato || 'carrossel';
    $('#titulo-editor').textContent = estado.formato === 'reels' ? '3. Revisar o roteiro e a capa'
      : (estado.formato === 'post' ? '3. Revisar o post' : '3. Revisar slide a slide');
    $$('#formatos .pilula').forEach(x => x.classList.toggle('ativa', (x.dataset.formato || 'carrossel') === estado.formato));
    $('#btn-gerar').textContent = estado.formato === 'post' ? 'Gerar post' : 'Gerar carrossel';
    $('#opcoes-post').classList.add('oculto');
    $('#btn-voltar-angulos').classList.add('oculto');
    estado.opcoes = []; estado.anguloEscolhido = null; estado.postDestaOpcoes = false;
    estado.ganchos = []; estado.ganchoEscolhido = null;
    estado.propostas = []; estado.propostaEscolhida = null;
    $('#opcoes-live').classList.add('oculto');
    if (c.formato === 'live') estado.duracaoLive = c.duracao || estado.duracaoLive;
    estado.roteiro = c.roteiro || null;
    estado.duracao = c.duracao || estado.duracao;
    if (c.cta) $('#cta-reels').value = c.cta;
    pintarRoteiro();
    $('#editor').classList.remove('oculto');
    pintarSlides();
  }));
  $$('.apagar-c').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Apagar este carrossel?')) return;
    await api('/api/carrosseis/' + b.dataset.id, { method: 'DELETE' });
    carregarCarrosseis();
  }));
}

// ---------- início ----------
// Cada carregamento é independente: se um falhar, os outros continuam de pé
(async () => {
  const tarefas = [
    ['configurações', carregarConfig],
    ['layouts', carregarLayouts],
    ['estratégia', carregarEstrategia],
    ['estilos de post', carregarEstilosPost],
    ['reels', carregarReels],
    ['live', carregarLive],
    ['fotos', carregarFotos],
    ['banco central', carregarBanco],
  ];
  for (const [nome, tarefa] of tarefas) {
    try { await tarefa(); }
    catch (e) { console.error('Falhou ao carregar ' + nome + ':', e && e.message); }
  }
})();
