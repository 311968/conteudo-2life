# 16/11/2026: zona segura da grelha na capa do Modelo 2Life.
# Na grelha do perfil, o Instagram mostra um recorte central da capa: quadrado (corta 135 px em cima e em baixo)
# ou 3:4 (corta 34 px de cada lado). O cabeçalho, o número, o selo e «Desliza para continuar» ficavam de fora.
# Na capa, o conteúdo passa a ficar a 170 px do topo e do fundo (margens laterais de 84 px já estavam dentro).
# Só a capa muda; as lâminas interiores e o fecho ficam iguais. Uso: python aplicar_zona_grelha.py <pasta da app>
import sys, os
p = os.path.join(sys.argv[1], 'layouts', 'modelo2life.js')
t = open(p, encoding='utf-8').read()
pares = [
    ("""      <div class="conteudo${foto ? ' coluna' : ''}">""",
     """      <div class="conteudo grelha${foto ? ' coluna' : ''}">"""),
    (""".conteudo.coluna { right:auto; width:540px; }""",
     """.conteudo.coluna { right:auto; width:540px; }\n/* Zona segura da grelha (16/11/2026): na capa, nada a menos de 170 px do topo e do fundo */\n.conteudo.grelha { top:170px; bottom:170px; }"""),
]
for a, b in pares:
    if t.count(a) != 1:
        sys.exit(f'modelo2life.js: esperava 1 ocorrência: {a[:60]!r}')
    t = t.replace(a, b)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('ok layouts/modelo2life.js')
