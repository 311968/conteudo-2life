# Correção do percurso Produzir > Carrossel (16/11/2026)
# 1. Separadores abertos antes de uma atualização deixam de gerar com o código antigo:
#    o servidor calcula a versão da app (impressão digital do app.js) e recusa a geração
#    a quem não a envia ou envia outra, com a mensagem para recarregar a página.
# 2. Modelo 2Life por defeito também no servidor (antes: layout1).
# 3. Modelo 2Life só com os fundos da marca: Marfim (por defeito) e Bege.
# Uso: python aplicar_correcao.py <pasta da app>
import sys, os

raiz = sys.argv[1]

def trocar(rel, pares):
    p = os.path.join(raiz, rel)
    t = open(p, encoding='utf-8').read()
    for antigo, novo in pares:
        n = t.count(antigo)
        if n != 1:
            sys.exit(f'{rel}: esperava 1 ocorrência, encontrei {n}: {antigo[:70]!r}')
        t = t.replace(antigo, novo)
    open(p, 'w', encoding='utf-8', newline='').write(t)
    print('ok', rel)

trocar('server.js', [
    ("const app = express();\n",
     "const app = express();\n"
     "// Versão da app = impressão digital do app.js. Um separador aberto antes de uma atualização\n"
     "// continua a correr o código antigo (no percurso do carrossel, o layout antigo por defeito).\n"
     "const VERSAO_APP = crypto.createHash('sha256')\n"
     "  .update(fs.readFileSync(path.join(__dirname, 'public', 'app.js'))).digest('hex').slice(0, 12);\n"
     "const ROTAS_GERACAO = ['/api/gerar', '/api/post/gerar', '/api/reels/ganchos', '/api/reels/roteiro',\n"
     "  '/api/live/propostas', '/api/live/roteiro'];\n"
     "app.use((req, res, next) => {\n"
     "  if (req.method !== 'POST' || !ROTAS_GERACAO.includes(req.path)) return next();\n"
     "  if (req.get('X-App-Versao') === VERSAO_APP) return next();\n"
     "  res.status(409).json({ erro: 'A app foi atualizada. Recarrega a página (tecla F5) e gera de novo.', recarregar: true });\n"
     "});\n"),
    ("app.get('/api/me', (req, res) => res.json({ logado: !!(req.session && req.session.logado) }));\n",
     "app.get('/api/me', (req, res) => res.json({ logado: !!(req.session && req.session.logado) }));\n"
     "app.get('/api/versao', (req, res) => { res.set('Cache-Control', 'no-store'); res.json({ versao: VERSAO_APP }); });\n"),
    ("    tons: paletas.lista().map(p => ({ id: p.id, nome: p.nome, fundo: p.amostra, escura: p.escura })),\n",
     "    tons: l.TONS || paletas.lista().map(p => ({ id: p.id, nome: p.nome, fundo: p.amostra, escura: p.escura })),\n"),
    ("      serie, referencias, layout,\n      marcacao",
     "      serie, referencias, layout: layout || 'modelo2life',\n      marcacao"),
    (".run(tema, ideia, r.serie || serie || '', layout || 'layout1', tom || 'clara', foto || null,\n           JSON.stringify(r.slides || []), r.legenda || '', r.primeiro_comentario || '',\n           'rascunho', funcao",
     ".run(tema, ideia, r.serie || serie || '', layout || 'modelo2life', tom || 'clara', foto || null,\n           JSON.stringify(r.slides || []), r.legenda || '', r.primeiro_comentario || '',\n           'rascunho', funcao"),
])

trocar('public/app.js', [
    ("async function api(rota, opcoes = {}) {\n  const r = await fetch(rota, {\n    headers: opcoes.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },\n    ...opcoes,\n  });\n",
     "// Versão que esta página carregou; o servidor recusa gerar com uma página desatualizada\n"
     "const versaoApp = fetch('/api/versao').then(r => r.json()).then(j => j.versao).catch(() => '');\n"
     "async function api(rota, opcoes = {}) {\n  const versao = await versaoApp;\n  const r = await fetch(rota, {\n"
     "    headers: Object.assign(opcoes.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }, { 'X-App-Versao': versao }),\n"
     "    ...opcoes,\n  });\n"),
    ("  const tons = estado.tons[estado.layout] || [];\n  atualizarBlocoFotos();\n  if (!tons.length) return;\n",
     "  const tons = estado.tons[estado.layout] || [];\n  atualizarBlocoFotos();\n  if (!tons.length) return;\n"
     "  // Um fundo que este layout não tem (ex.: Bordô no Modelo 2Life) passa ao primeiro (Marfim)\n"
     "  if (!tons.some(t => t.id === estado.tom)) estado.tom = tons[0].id;\n"),
])

trocar('layouts/modelo2life.js', [
    ("module.exports = { NOME, DESCRICAO, TIPOS, INSTRUCOES,",
     "// Fundos da marca: Marfim por defeito, Bege como alternativa (BRAND.md v1.2)\n"
     "const TONS = [\n"
     "  { id: 'clara', nome: 'Marfim', fundo: C.marfim, escura: false },\n"
     "  { id: 'areia', nome: 'Bege', fundo: C.bege, escura: false },\n"
     "];\n\n"
     "module.exports = { NOME, DESCRICAO, TIPOS, TONS, INSTRUCOES,"),
])
