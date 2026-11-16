# 16/11/2026: registo do consumo de IA (Custo estimado de IA), a pedido da Simone.
# - ia.js: cada cliente da Anthropic passa por consumo.envolver (regista modelo, etapa, tokens e custo de cada chamada).
# - server.js: cada pedido de geração agrupa as suas chamadas (uma "geração"); a do carrossel liga-se ao rascunho guardado;
#   rotas /api/consumo (totais por conteúdo) e /api/carrosseis/:id/consumo (detalhe por geração e etapa).
# - app.js: em Conteúdos, cada conteúdo mostra «Custo estimado de IA»; um clique abre o detalhe. Reescrever lâmina
#   envia o id do carrossel, para essa geração aparecer à parte no mesmo conteúdo.
# Copia também consumo.js para a pasta da app. Corre depois de aplicar_genero.py.
# Uso: python aplicar_consumo.py <pasta da app>
import sys, os, shutil

raiz = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))

def trocar(rel, pares, todas=None):
    p = os.path.join(raiz, rel)
    t = open(p, encoding='utf-8').read()
    for antigo, novo in pares:
        n = t.count(antigo)
        esperado = (todas or {}).get(antigo, 1)
        if n != esperado:
            sys.exit(f'{rel}: esperava {esperado} ocorrência(s), encontrei {n}: {antigo[:70]!r}')
        t = t.replace(antigo, novo)
    open(p, 'w', encoding='utf-8', newline='').write(t)
    print('ok', rel)

shutil.copyfile(os.path.join(aqui, 'consumo.js'), os.path.join(raiz, 'consumo.js'))
print('ok consumo.js')

trocar('ia.js', [
    ("const Anthropic = require('@anthropic-ai/sdk');\n",
     "const Anthropic = require('@anthropic-ai/sdk');\nconst consumo = require('./consumo'); // regista tokens e custo estimado de cada chamada\n"),
    ("new Anthropic({ apiKey: key })", "consumo.envolver(new Anthropic({ apiKey: key }))"),
], todas={"new Anthropic({ apiKey: key })": 9})

trocar('server.js', [
    ("const ia = require('./ia');\n",
     "const ia = require('./ia');\nconst consumo = require('./consumo');\n"),
    ("// PRODUZIR\napp.post('/api/gerar',",
     "// Consumo de IA: cada pedido de geração agrupa as suas chamadas (só dados de consumo, sem textos nem chaves)\n"
     "app.use(consumo.middleware(['/api/gerar', '/api/post/gerar', '/api/reels/ganchos', '/api/reels/roteiro',\n"
     "  '/api/live/propostas', '/api/live/roteiro', '/api/reescrever-lamina']));\n"
     "app.get('/api/consumo', exigeLogin, (req, res) => res.json(consumo.totais()));\n"
     "app.get('/api/carrosseis/:id/consumo', exigeLogin, (req, res) => res.json(consumo.detalhe(Number(req.params.id))));\n\n"
     "// PRODUZIR\napp.post('/api/gerar',"),
    ("           'rascunho', funcao || null, Number(nivel) || null, avanco || null, agora, agora);\n    res.json({ ok: true, id: ins.lastInsertRowid, ...r });",
     "           'rascunho', funcao || null, Number(nivel) || null, avanco || null, agora, agora);\n    consumo.ligar(ins.lastInsertRowid);\n    res.json({ ok: true, id: ins.lastInsertRowid, ...r });"),
])

trocar('public/app.js', [
    ("async function carregarCarrosseis() {\n  const l = await api('/api/carrosseis');\n",
     "// Custo estimado de IA: o valor faturado é o da consola da Anthropic\n"
     "const dolares = (v) => 'US$ ' + Number(v || 0).toLocaleString('pt-PT', { minimumFractionDigits: 4, maximumFractionDigits: 4 });\n"
     "async function carregarCarrosseis() {\n  const l = await api('/api/carrosseis');\n"
     "  let custos = {};\n  try { custos = await api('/api/consumo'); } catch (e) { custos = {}; }\n"),
    ("            ${c.serie ? ' · ' + c.serie : ''} · ${(c.criado_em || '').slice(0, 10).split('-').reverse().join('/')}\n          </div>\n",
     "            ${c.serie ? ' · ' + c.serie : ''} · ${(c.criado_em || '').slice(0, 10).split('-').reverse().join('/')}\n          </div>\n"
     "          ${custos[c.id] ? `<div class=\"meta\"><button type=\"button\" class=\"ver-custo\" data-id=\"${c.id}\" style=\"background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer\">Custo estimado de IA: ${dolares(custos[c.id].custo)}${custos[c.id].geracoes > 1 ? ' · ' + custos[c.id].geracoes + ' gerações' : ''}</button></div><div class=\"detalhe-custo meta\" data-id=\"${c.id}\" hidden></div>` : ''}\n"),
    ("  $$('.abrir-c').forEach(b => b.addEventListener('click', async () => {\n    const c = await api('/api/carrosseis/' + b.dataset.id);\n",
     "  $$('.ver-custo').forEach(b => b.addEventListener('click', async () => {\n"
     "    const caixa = document.querySelector(`.detalhe-custo[data-id=\"${b.dataset.id}\"]`);\n"
     "    if (!caixa.hidden) { caixa.hidden = true; return; }\n"
     "    const g = await api('/api/carrosseis/' + b.dataset.id + '/consumo');\n"
     "    caixa.innerHTML = g.map((x, n) => `<div style=\"margin-top:8px\"><strong>Geração ${n + 1}</strong> · ${new Date(x.inicio).toLocaleString('pt-PT')} · ${dolares(x.custo_usd)}</div>`\n"
     "      + x.etapas.map(e => `<div>${e.etapa} · ${e.modelo} · ${e.tokens_entrada} tokens de entrada, ${e.tokens_saida} de saída · ${dolares(e.custo_usd)}</div>`).join('')).join('')\n"
     "      + '<div style=\"margin-top:8px\"><em>Custo estimado de IA. O valor faturado é o da consola da Anthropic.</em></div>';\n"
     "    caixa.hidden = false;\n"
     "  }));\n\n"
     "  $$('.abrir-c').forEach(b => b.addEventListener('click', async () => {\n    const c = await api('/api/carrosseis/' + b.dataset.id);\n"),
    ("          lamina: antiga, tipo_novo: tipoNovo, layout: chaveLayout(),\n",
     "          lamina: antiga, tipo_novo: tipoNovo, layout: chaveLayout(), carrossel_id: estado.carrosselId,\n"),
])
