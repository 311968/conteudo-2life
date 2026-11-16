# 16/11/2026: secção «Stories» na app (menu 3 · Criar › Stories), com os textos por dia.
# - stories.js (servidor): tabela stories e rotas GET /api/stories e PUT /api/stories/:id
# - public/stories.js (página): cartões por dia, ecrãs editáveis, Copiar, Guardar, Marcar como publicado
# - server.js: liga as rotas; app.html: entrada no menu, secção e script. Não mexe no app.js.
# Uso: python aplicar_stories.py <pasta da app>
import sys, os, shutil
raiz = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
shutil.copyfile(os.path.join(aqui, 'stories', 'stories.js'), os.path.join(raiz, 'stories.js'))
shutil.copyfile(os.path.join(aqui, 'stories', 'stories-pagina.js'), os.path.join(raiz, 'public', 'stories.js'))
print('ok stories.js, public/stories.js')

def trocar(rel, pares):
    p = os.path.join(raiz, rel)
    t = open(p, encoding='utf-8').read()
    for a, b in pares:
        if t.count(a) != 1:
            sys.exit(f'{rel}: esperava 1 ocorrência: {a[:70]!r}')
        t = t.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='').write(t)
    print('ok', rel)

trocar('server.js', [
    ("app.get('/api/consumo', exigeLogin, (req, res) => res.json(consumo.totais()));\n",
     "app.get('/api/consumo', exigeLogin, (req, res) => res.json(consumo.totais()));\n"
     "// Stories: textos por dia (secção 3 · Criar › Stories)\nrequire('./stories').rotas(app, exigeLogin);\n"),
])
trocar('public/app.html', [
    ('      <button data-aba="produzir" class="ativa">Produzir</button>\n',
     '      <button data-aba="produzir" class="ativa">Produzir</button>\n      <button data-aba="stories">Stories</button>\n'),
    ('  <!-- EXTRAS -->\n',
     '  <!-- STORIES -->\n  <section id="v-stories" class="view">\n    <h2>Stories</h2>\n'
     '    <p class="dica">Os textos dos stories de cada dia. Edita, copia para o Instagram e marca como publicado.</p>\n'
     '    <div id="lista-stories"></div>\n  </section>\n\n  <!-- EXTRAS -->\n'),
    ('<script src="/app.js"></script>\n', '<script src="/app.js"></script>\n<script src="/stories.js"></script>\n'),
])
