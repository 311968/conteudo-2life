# Correcao de 15/11/2026: gerar so com o tema e o formato (a ideia central passa a ser opcional).
# Pedido da Simone: "escrever, pelas minhas palavras, o que quero comunicar, escolher o formato e receber um rascunho".
# Encontrado no percurso: a app recusava gerar sem ideia central ou material do Banco ("Preciso da ideia central...").
# Uso: python aplicar_tema.py <pasta da app>   (corre depois de aplicar_reels, aplicar_visual, aplicar_estrategia e aplicar_revisao)
# Mantem o fluxo e os campos da app; so deixa de exigir a ideia. Nao reinicia nada.
import os, re, sys

pasta = sys.argv[1]
def ler(rel):
    return open(os.path.join(pasta, rel), encoding='utf-8', newline='').read()

srv = ler('server.js')
app = ler('public/app.js')
if 'IDEIA_SO_TEMA' in srv:
    sys.exit('PAROU: a correcao ja esta aplicada nesta pasta. Nada foi alterado.')

EXIGE = "  if (!ideia && !temMaterial) return res.status(400).json({ erro: 'Preciso da ideia central, ou de material marcado.' });\n"
if srv.count(EXIGE) != 4:
    sys.exit('FALHOU em server.js: a exigencia da ideia aparece %d vezes (esperadas 4). Nada foi alterado.' % srv.count(EXIGE))
srv = srv.replace(EXIGE, '')

PADRAO = re.compile(r"ideia: ideia \|\| '[^']*'")
n = len(PADRAO.findall(srv))
if n != 6:
    sys.exit('FALHOU em server.js: %d textos por defeito da ideia (esperados 6). Nada foi alterado.' % n)
srv = PADRAO.sub('ideia: ideia || IDEIA_SO_TEMA', srv)

ANCORA = "const estrategia = require('./estrategia');"
if srv.count(ANCORA) != 1:
    sys.exit('FALHOU em server.js: ancora nao encontrada. Nada foi alterado.')
srv = srv.replace(ANCORA, ANCORA + "\n// Sem ideia central escrita, a IA parte do tema (15/11/2026)\n"
                  "const IDEIA_SO_TEMA = 'A ideia central não foi escrita: parte do tema (e do material marcado, se houver) e escolhe o ângulo mais forte, segundo a Matriz de Comunicação e as fontes do Método 2Life.';")

ALERTA = "  if (!ideia && !banco_ids.length) return alert('Narre, escreva ou marque algo do Banco Central.');\n"
if app.count(ALERTA) != 1:
    sys.exit('FALHOU em public/app.js: aviso da ideia encontrado %d vezes. Nada foi alterado.' % app.count(ALERTA))
app = app.replace(ALERTA, '')

open(os.path.join(pasta, 'server.js'), 'w', encoding='utf-8', newline='').write(srv)
open(os.path.join(pasta, 'public/app.js'), 'w', encoding='utf-8', newline='').write(app)
print('server.js e public/app.js: a ideia central passou a ser opcional')
print('OK')
