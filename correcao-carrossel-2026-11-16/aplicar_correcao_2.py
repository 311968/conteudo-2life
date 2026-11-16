# Correção 2 do percurso Produzir > Carrossel (16/11/2026), depois de aplicar_correcao.py
# 1. Pré-visualização com a numeração certa (antes: todas as lâminas mostravam "01").
# 2. Legenda e primeiro comentário sem "\n" escrito à letra (a IA devolveu-o assim no teste).
# Uso: python aplicar_correcao_2.py <pasta da app>
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
    ("  const { slide, serie, handle, foto, layout, tom } = req.body || {};\n  const l = layouts[layout || 'layout1'];",
     "  const { slide, serie, handle, foto, layout, tom, numero, total } = req.body || {};\n  const l = layouts[layout || 'layout1'];"),
    ("  res.type('html').send(l.paginaHTML(slide || {}, { serie, handle, fotoUrl, tom }));",
     "  res.type('html').send(l.paginaHTML(slide || {}, { serie, handle, fotoUrl, tom,\n"
     "    numero: Number(numero) || 1, total: Number(total) || 1 }));"),
    ("    const agora = new Date().toISOString();\n    const ins = db.prepare(`INSERT INTO carrosseis\n      (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status,\n       funcao, nivel, avanco, criado_em, atualizado_em)",
     "    // A IA pode devolver \"\\n\" escrito à letra: passa a mudança de parágrafo verdadeira\n"
     "    const quebras = (s) => String(s || '').replace(/\\\\n/g, '\\n');\n"
     "    r.legenda = quebras(r.legenda); r.primeiro_comentario = quebras(r.primeiro_comentario);\n"
     "    const agora = new Date().toISOString();\n    const ins = db.prepare(`INSERT INTO carrosseis\n      (tema, ideia, serie, layout, tom, foto, slides, legenda, comentario, status,\n       funcao, nivel, avanco, criado_em, atualizado_em)"),
])

trocar('public/app.js', [
    ("        layout: chaveLayout() === 'post' ? 'post' : estado.layout, tom: estado.tom,\n      }),\n    });\n    frame.srcdoc = await r.text();",
     "        layout: chaveLayout() === 'post' ? 'post' : estado.layout, tom: estado.tom,\n"
     "        numero: i + 1, total: estado.slides.length,\n      }),\n    });\n    frame.srcdoc = await r.text();"),
])
