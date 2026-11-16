// STORIES (16/11/2026): secção do menu "3 · Criar › Stories". Mostra os stories por dia, com cada ecrã
// editável, botão Copiar, Guardar e Marcar como publicado. Não mexe no resto da app.
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  async function pedir(rota, opcoes = {}) {
    const r = await fetch(rota, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opcoes));
    if (r.status === 401) { location.href = '/login'; throw new Error('Sessão expirada.'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || 'Deu erro.');
    return j;
  }

  async function carregar() {
    const caixa = document.getElementById('lista-stories');
    if (!caixa) return;
    caixa.innerHTML = '<p class="dica">A carregar…</p>';
    let lista;
    try { lista = await pedir('/api/stories'); } catch (e) { caixa.innerHTML = '<p class="dica">Erro: ' + esc(e.message) + '</p>'; return; }
    if (!lista.length) { caixa.innerHTML = '<p class="dica">Ainda não há stories.</p>'; return; }

    caixa.innerHTML = lista.map(s => {
      const d = new Date(s.dia + 'T12:00:00');
      const titulo = `${DIAS[d.getDay()]} ${s.dia.slice(8, 10)}/${s.dia.slice(5, 7)} · ${esc(s.receita || '')}`;
      const publicado = s.estado === 'publicado';
      return `<div class="story-dia" data-id="${s.id}" style="background:var(--cream);border-radius:14px;padding:16px;margin-bottom:18px${publicado ? ';opacity:.75' : ''}">
        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline">
          <strong style="font-size:17px">${titulo}</strong>
          <span class="meta" style="font-size:12px">${publicado ? 'publicado' : 'por publicar'}</span>
        </div>
        <div class="dica" style="margin-top:4px">${esc([s.semana, s.funcao, s.pilar, s.cta].filter(Boolean).join(' · '))}</div>
        ${s.notas ? `<div class="dica">${esc(s.notas)}</div>` : ''}
        ${s.ecras.map((e, i) => `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--borda)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <strong style="font-size:13px">Ecrã ${i + 1}${e.papel ? ' · ' + esc(e.papel) : ''}</strong>
            <button type="button" class="botao mini fantasma copiar-story" data-i="${i}">Copiar</button>
          </div>
          <textarea rows="3" data-i="${i}" style="margin-top:6px">${esc(e.texto)}</textarea>
          <input data-i="${i}" value="${esc(e.autocolante)}" placeholder="Autocolante (sondagem, caixa de perguntas…), opcional" style="margin-top:6px">
          ${e.nota ? `<div class="dica">${esc(e.nota)}</div>` : ''}
        </div>`).join('')}
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;align-items:center">
          <button type="button" class="botao mini guardar-story">Guardar</button>
          <button type="button" class="botao mini fantasma estado-story">${publicado ? 'Marcar como por publicar' : 'Marcar como publicado'}</button>
          <span class="dica estado-guardar" style="margin:0"></span>
        </div>
      </div>`;
    }).join('');

    const porId = Object.fromEntries(lista.map(s => [String(s.id), s]));
    caixa.querySelectorAll('.story-dia').forEach(cartao => {
      const s = porId[cartao.dataset.id];
      const msg = cartao.querySelector('.estado-guardar');
      const ler = () => s.ecras.map((e, i) => Object.assign({}, e, {
        texto: cartao.querySelector(`textarea[data-i="${i}"]`).value,
        autocolante: cartao.querySelector(`input[data-i="${i}"]`).value,
      }));
      cartao.querySelectorAll('.copiar-story').forEach(b => b.addEventListener('click', () => {
        const campo = cartao.querySelector(`textarea[data-i="${b.dataset.i}"]`);
        const feito = () => { b.textContent = 'Copiado'; setTimeout(() => { b.textContent = 'Copiar'; }, 1500); };
        const manual = () => { campo.focus(); campo.select(); msg.textContent = 'Texto selecionado: copia com o menu do telemóvel.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(campo.value).then(feito, manual);
        else manual();
      }));
      cartao.querySelector('.guardar-story').addEventListener('click', async () => {
        msg.textContent = 'A guardar…';
        try { const ecras = ler(); await pedir('/api/stories/' + s.id, { method: 'PUT', body: JSON.stringify({ ecras }) }); s.ecras = ecras; msg.textContent = 'Guardado.'; }
        catch (e) { msg.textContent = 'Erro: ' + e.message; }
      });
      cartao.querySelector('.estado-story').addEventListener('click', async () => {
        const estado = s.estado === 'publicado' ? 'rascunho' : 'publicado';
        try { await pedir('/api/stories/' + s.id, { method: 'PUT', body: JSON.stringify({ ecras: ler(), estado }) }); carregar(); }
        catch (e) { msg.textContent = 'Erro: ' + e.message; }
      });
    });
  }

  document.querySelectorAll('.abas button[data-aba="stories"]').forEach(b => b.addEventListener('click', carregar));
})();
