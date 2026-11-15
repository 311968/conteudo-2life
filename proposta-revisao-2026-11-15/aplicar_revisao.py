# Proposta de 15/11/2026: revisao automatica de linguagem no fim de cada geracao (ia.js).
# Uso: python aplicar_revisao.py <pasta da app>
# Aplicar DEPOIS de aplicar_reels.py, aplicar_visual.py e aplicar_estrategia.py (esses confirmam as
# impressoes digitais de producao). Este so mexe em ia.js, num sitio onde os outros nao mexem:
# 1. muda o nome da funcao dos acentos para corrigirSoAcentos;
# 2. acrescenta, logo a seguir, a revisao de linguagem e uma nova corrigirAcentos que faz as duas coisas.
# Assim, todos os formatos (carrossel, post, reels, lives, capas) passam pela revisao sem mais trocas.
# Nao reinicia nada, nao toca na base de dados nem nas chaves.
import os, sys

pasta = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
p = os.path.join(pasta, 'ia.js')
s = open(p, encoding='utf-8', newline='').read()

if 'reverLinguagem' in s:
    sys.exit('PAROU: a revisao ja esta aplicada nesta pasta. Nada foi alterado.')

A = 'async function corrigirAcentos(json, client) {'
B = '// ---------- GERACAO DO CARROSSEL (Claude) ----------'
for t in (A, B):
    if s.count(t) != 1:
        sys.exit('FALHOU em ia.js (%d ocorrencias): %s\nNada foi alterado.' % (s.count(t), t))
if s.index(B) < s.index(A):
    sys.exit('FALHOU em ia.js: ordem inesperada. Nada foi alterado.')

novo = open(os.path.join(aqui, 'proposta', 'revisao.js'), encoding='utf-8', newline='').read()
s = s.replace(A, 'async function corrigirSoAcentos(json, client) {')
s = s.replace(B, novo.lstrip('\n') + B)
open(p, 'w', encoding='utf-8', newline='').write(s)
print('ia.js: revisao de linguagem acrescentada')
print('OK')
