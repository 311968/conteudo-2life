# 16/11/2026: a frase-síntese da capa partia-se com uma palavra sozinha na segunda linha ("POR / TI").
# Linhas equilibradas, como na referência do Mapa. Corre depois de aplicar_logotipo.py.
import sys, os
p = os.path.join(sys.argv[1], 'layouts', 'modelo2life.js')
t = open(p, encoding='utf-8').read()
antigo = ".sintese { font-weight:600; font-size:${T.rodape}px; letter-spacing:.12em; text-transform:uppercase; color:${C.cinzento}; }"
if t.count(antigo) != 1:
    sys.exit('modelo2life.js: linha da síntese não encontrada')
t = t.replace(antigo, antigo[:-2] + " text-wrap:balance; }")
open(p, 'w', encoding='utf-8', newline='').write(t)
print('ok layouts/modelo2life.js')
