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

# Frase das provas que veio do pacote (exemplos de outro negocio, em portugues do Brasil)
linhas = s.split('\n')
alvo = [i for i, l in enumerate(linhas) if 'uma contadora que atendo' in l]
if len(alvo) != 1:
    sys.exit('FALHOU em ia.js: frase das provas encontrada %d vezes. Nada foi alterado.' % len(alvo))
linhas[alvo[0]] = ('Estes são os únicos casos reais que existem. Só podes contar um deles se estiver escrito aqui, '
                   'sempre anonimizado. Se o conteúdo pedir um exemplo que não existe nesta lista, escreve sem exemplo. '
                   'Inventar um caso, um número, uma frequência ou o que se passa em sessão é o erro mais grave possível.')
s = '\n'.join(linhas)

# Roteiro dos reels: depois da revisao, acerta a duracao pela metrica da app (2,5 palavras por segundo)
FUN = 'async function gerarRoteiroReels('
RET = 'return await corrigirAcentos(limpar(bruto), client);'
if s.count(FUN) != 1:
    sys.exit('FALHOU em ia.js: gerarRoteiroReels encontrada %d vezes. Nada foi alterado.' % s.count(FUN))
i = s.index(FUN)
j = s.find(RET, i)
k = s.find('\nasync function ', i + len(FUN))
if j < 0 or (k >= 0 and j > k):
    sys.exit('FALHOU em ia.js: fim de gerarRoteiroReels nao encontrado. Nada foi alterado.')
s = s[:j] + 'return await ajustarReel(await corrigirAcentos(limpar(fixarAbertura(bruto, gancho)), client), duracao, client);' + s[j + len(RET):]

novo = open(os.path.join(aqui, 'proposta', 'revisao.js'), encoding='utf-8', newline='').read()
s = s.replace(A, 'async function corrigirSoAcentos(json, client) {')
s = s.replace(B, novo.lstrip('\n') + B)
open(p, 'w', encoding='utf-8', newline='').write(s)
print('ia.js: revisao de linguagem e da peca acrescentadas; duracao dos reels acertada; frase das provas do pacote substituida')
print('OK')
