# Proposta de 15/11/2026: layout "Modelo 2Life" na app de conteudo (BRAND.md v1.2).
# Uso: python aplicar_visual.py <pasta da app>
# 1. Confirma que os ficheiros sao os de producao analisados a 15/11/2026 (app.js: original ou ja com a proposta dos reels).
# 2. Copia o layout novo e os ficheiros da marca (layouts/modelo2life.js, layouts/marca/).
# 3. Regista o layout, passa o numero da lamina ao motor de imagens e acrescenta os campos ao editor.
# A EB Garamond instala-se a parte, com marca_fontes_eb.py <pasta>/fontes.
# Nao reinicia nada, nao toca na base de dados nem nas chaves.
import hashlib, os, shutil, sys

pasta = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
ESPERADO = {
    'layouts/index.js': ['3b982bb745c429961c71011576c4c020e633b57b42ab788a27e520089f952ba7'],
    'render.js': ['1052a31adf02287f21f9a8919421448c478ca665d0ab120cf679576fa594bb70'],
    'public/app.js': ['1a2c180bd1766196f5ebf693b7a9b2f690994f71cc25faba89c9190e27595849',   # producao
                      '83230be8162e8ddea84611b1dffe6e0d640399345f135e0b1a5c7fc159334502'],  # com a proposta dos reels
}
for rel, hs in ESPERADO.items():
    h = hashlib.sha256(open(os.path.join(pasta, rel), 'rb').read()).hexdigest()
    if h not in hs:
        sys.exit('PAROU: %s nao e a versao analisada (%s...). Nada foi alterado.' % (rel, h[:16]))
if os.path.exists(os.path.join(pasta, 'layouts', 'modelo2life.js')):
    sys.exit('PAROU: layouts/modelo2life.js ja existe. Nada foi alterado.')

def trocar(rel, pares):
    p = os.path.join(pasta, rel)
    s = open(p, encoding='utf-8', newline='').read()
    for a, b in pares:
        n = s.count(a)
        if n != 1:
            sys.exit('FALHOU em %s (%d ocorrencias): %s' % (rel, n, a[:70]))
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='').write(s)
    print('%s: %d trocas' % (rel, len(pares)))

# Verifica todas as trocas antes de escrever (para nao deixar a app a meio)
def verificar(rel, pares):
    s = open(os.path.join(pasta, rel), encoding='utf-8', newline='').read()
    for a, _ in pares:
        if s.count(a) != 1:
            sys.exit('PAROU antes de alterar: %s (%d ocorrencias): %s' % (rel, s.count(a), a[:70]))

INDEX = [
    ("const thumb = require('./thumb');",
     "const thumb = require('./thumb');\nconst modelo2life = require('./modelo2life');"),
    ("module.exports = {\n",
     "module.exports = {\n  modelo2life: Object.assign({}, modelo2life, { disponivel: true }),\n"),
]
RENDER = [
    ("...ctx, fotoUrl: fotoDoSlide, fontesCSS: 'fontes/fontes.css',",
     "...ctx, fotoUrl: fotoDoSlide, fontesCSS: 'fontes/fontes.css', numero: i + 1, total: slides.length,"),
]
APP = [
    ("  layout: 'layout1',", "  layout: 'modelo2life',"),
    ("const CAMPOS_POR_LAYOUT = {\n",
     """const CAMPOS_POR_LAYOUT = {
  modelo2life: {
    capa:     [['titulo', 'Título (frase de viragem entre **asteriscos**)', 'input'], ['subtitulo', 'Subtítulo', 'input'],
               ['sintese', 'Síntese em versaletes (opcional)', 'input'],
               ['logotipo', 'Logótipo: selo (por defeito), completo (só sem foto) ou sem', 'input']],
    interior: [['titulo', 'Título (parte a realçar entre **asteriscos**)', 'input'], ['corpo', 'Texto', 'textarea'],
               ['sintese', 'Síntese em versaletes (opcional)', 'input'], ['alinhar', 'Alinhar: centro ou esquerda', 'input']],
    fecho:    [['titulo', 'Frase final (viragem entre **asteriscos**)', 'input'],
               ['foto_fecho', 'Foto no fecho? sim só se a foto tiver zona calma, fora do rosto; senão, fica em Marfim', 'input'],
               ['logotipo', 'Logótipo: completo (por defeito) ou sem, se já estiver completo na capa', 'input']],
  },
"""),
    ("  layout3: [],\n  post: ['foto', 'lateral'],", "  layout3: [],\n  modelo2life: ['capa', 'fecho'],\n  post: ['foto', 'lateral'],"),
    ("const GERA_IMAGEM = { layout1: [],", "const GERA_IMAGEM = { modelo2life: [], layout1: [],"),
    ("const COM_ITENS = { layout1: ['caixas'],", "const COM_ITENS = { modelo2life: [], layout1: ['caixas'],"),
]
verificar('layouts/index.js', INDEX)
verificar('render.js', RENDER)
verificar('public/app.js', APP)

shutil.copyfile(os.path.join(aqui, 'app', 'layouts', 'modelo2life.js'), os.path.join(pasta, 'layouts', 'modelo2life.js'))
shutil.copytree(os.path.join(aqui, 'app', 'layouts', 'marca'), os.path.join(pasta, 'layouts', 'marca'))
print('layouts/modelo2life.js e layouts/marca/: copiados')
trocar('layouts/index.js', INDEX)
trocar('render.js', RENDER)
trocar('public/app.js', APP)
print('Concluido. Falta: marca_fontes_eb.py na pasta fontes e reiniciar so a app "conteudo", com autorizacao.')
