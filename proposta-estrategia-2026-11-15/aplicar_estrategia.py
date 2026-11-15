# Proposta de 15/11/2026 (passo 3): estrategia da app segundo a Matriz de Comunicacao (§8, §14, §15)
# e o Livro de Receitas v2.4 (§3, §12, §14, §15).
# Uso: python aplicar_estrategia.py <pasta da app>
# Aplicar DEPOIS de aplicar_reels.py e aplicar_visual.py: esses confirmam as impressoes digitais de producao
# e parariam se este corresse primeiro. Este funciona com ou sem eles (nao toca nos mesmos trechos).
# 1. Confirma que estrategia.js e exatamente o de producao a 15/11/2026; para se nao for.
# 2. Substitui estrategia.js pela versao da pasta proposta/.
# 3. Faz trocas exatas em ia.js, reels.js, public/app.html e public/app.js (cada trecho uma so vez).
# Nao reinicia nada, nao toca na base de dados nem nas chaves.
import hashlib, os, shutil, sys

pasta = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
BASE = '37ec519330d31ff5923d87ca94f33f57ea4caa98e514824b7231a00195bcafa1'

def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()

atual = sha(os.path.join(pasta, 'estrategia.js'))
if atual == sha(os.path.join(aqui, 'proposta', 'estrategia.js')):
    sys.exit('PAROU: a proposta ja esta aplicada nesta pasta. Nada foi alterado.')
if atual != BASE:
    sys.exit('PAROU: estrategia.js nao e a versao analisada (%s...). Nada foi alterado.' % atual[:16])

def ler(rel):
    return open(os.path.join(pasta, rel), encoding='utf-8', newline='').read()

# Prepara todas as trocas em memoria; so grava se todas encaixarem.
novos = {}

def trocar(rel, pares):
    s = novos.get(rel, ler(rel))
    for a, b in pares:
        n = s.count(a)
        if n != 1:
            sys.exit('FALHOU em %s (%d ocorrencias): %s\nNada foi alterado.' % (rel, n, a[:70]))
        s = s.replace(a, b)
    novos[rel] = s

# ---------- ia.js: o lembrete por nivel passa a vir do estrategia.js ----------
s = ler('ia.js')
INI = "${marcacao && marcacao.nivel ? `ANTES DE ESCREVER, RELEIA A MARCAÇÃO:"
FIM = "a marcação manda mais que o roteiro padrão.` : ''}"
if s.count(INI) != 1 or s.count(FIM) != 1 or s.index(FIM) < s.index(INI):
    sys.exit('FALHOU em ia.js: lembrete por nivel nao encontrado. Nada foi alterado.')
antigo = s[s.index(INI):s.index(FIM) + len(FIM)]
trocar('ia.js', [(antigo, '${estrategia.lembrete(marcacao)}')])

# ---------- reels.js: sugestoes do CTA passam a ser o Banco de CTA do Livro §15 ----------
trocar('reels.js', [
    ("const CTAS = ['salvar', 'comentar uma palavra', 'clicar no link da bio', 'mandar DM', 'nenhum, só absorver'];",
     "const CTAS = [\n"
     "  'Repara em que situações este padrão decide primeiro.',\n"
     "  'Leva esta pergunta contigo hoje.',\n"
     "  'Reconheces este movimento em ti?',\n"
     "  'Qual destas situações te acontece com mais frequência?',\n"
     "  'Guarda para voltares a esta pergunta.',\n"
     "  'Continua no conteúdo seguinte desta série.',\n"
     "  'Descobre que padrões estão a condicionar as tuas escolhas.',\n"
     "  'Faz o diagnóstico e identifica o teu ponto de partida.',\n"
     "  'Se queres perceber se este processo faz sentido para ti, envia-me mensagem.',\n"
     "  'Marca uma Conversa 2Life.',\n"
     "  'Candidata-te ao 2Life.',\n"
     "  'Reserva o teu lugar.',\n"
     "  'Inicia o teu processo.',\n"
     "]; // Livro de Receitas v2.4 §15"),
])

# ---------- public/app.html: nomes dos campos ----------
trocar('public/app.html', [
    ('<span class="rot-est">Função</span>', '<span class="rot-est">Função ATA</span>'),
    ('<span class="rot-est">Ao ler, ela precisa</span>\n'
     '            <input id="avanco" list="avancos" placeholder="opcional · ex: perceber que isso tem um custo">',
     '<span class="rot-est">Próximo movimento</span>\n'
     '            <input id="avanco" list="avancos" placeholder="opcional · ex: Observação">'),
    ('<span class="rot-est">No fim, ela</span>\n'
     '              <input id="cta-reels" list="ctas" placeholder="opcional · ex: comentar uma palavra">',
     '<span class="rot-est">Frase do CTA</span>\n'
     '              <input id="cta-reels" list="ctas" placeholder="opcional · ex: Leva esta pergunta contigo hoje.">'),
])

# ---------- public/app.js: a lista mostra o nome da funcao ----------
trocar('public/app.js', [
    ("${c.funcao ? ' · ' + c.funcao : ''}",
     "${c.funcao ? ' · ' + ({ atracao: 'Atração', tecnico: 'Técnico', autoridade: 'Autoridade', conexao: 'Conexão', venda: 'Venda' }[c.funcao] || c.funcao) : ''}"),
])

# Tudo encaixou: grava.
for rel, s in novos.items():
    open(os.path.join(pasta, rel), 'w', encoding='utf-8', newline='').write(s)
    print('%s: alterado' % rel)
shutil.copyfile(os.path.join(aqui, 'proposta', 'estrategia.js'), os.path.join(pasta, 'estrategia.js'))
print('estrategia.js: substituido')
print('OK')
