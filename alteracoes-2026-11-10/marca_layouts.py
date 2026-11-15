import sys, os
pasta = sys.argv[1]
ficheiros = ['layout1.js', 'layout2.js', 'layout3.js', 'post.js', 'thumb.js']
trocas = [
    ("'Playfair Display',serif", "'Cormorant Garamond',serif"),
    ("'Inter',sans-serif", "'Montserrat',sans-serif"),
    ("'Oswald',sans-serif", "'Montserrat',sans-serif"),
    ("'Caveat',cursive", "'Allura',cursive"),
    ("#122027", "#2E2B29"),
    ("rgba(18,32,39,", "rgba(46,43,41,"),
]
estilo_antes = "<style>${css(ctx.tom)}</style>"
estilo_depois = ("<style>${css(ctx.tom)} .slide b{ color:var(--acento); } "
                 ".slide.escuro b, .slide.foto b{ color:var(--ouro); }</style>")
for f in ficheiros:
    p = os.path.join(pasta, f)
    s = open(p, encoding='utf-8').read()
    n = 0
    for a, b in trocas:
        n += s.count(a)
        s = s.replace(a, b)
    if s.count(estilo_antes) != 1:
        sys.exit('FALHOU: estilo nao encontrado em ' + f)
    s = s.replace(estilo_antes, estilo_depois)
    open(p, 'w', encoding='utf-8').write(s)
    print(f, n, 'trocas de fonte/cor + regra do destaque')
