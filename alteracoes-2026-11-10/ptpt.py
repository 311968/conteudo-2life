import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
reps = [
    ("Transcreva este audio em portugues do Brasil, na integra",
     "Transcreva este audio em portugues de Portugal (europeu), na integra"),
    ("Voce e revisor de portugues do Brasil. Sua unica tarefa",
     "Voce e revisor de portugues de Portugal (europeu). Sua unica tarefa"),
    ("- Escreva em **português do Brasil com acentuação completa e correta**. Toda palavra que leva acento, cedilha ou til vai acentuada: negócio, lições, você, está, não, própria, mês, três, coração, decisão.",
     "- Escreva em **português de Portugal (europeu), com acentuação completa e correta**. Trate a pessoa por \"tu\", nunca por \"você\": estás, sentes, a tua vida. Use construções de Portugal (\"estás a fazer\", não \"está fazendo\"; \"ecrã\", \"telemóvel\", \"equipa\"). Toda palavra que leva acento, cedilha ou til vai acentuada: negócio, lições, estás, não, própria, mês, três, coração, decisão."),
    ("e que não há nenhum travessão. Estes dois erros invalidam a entrega.",
     "e que não há nenhum travessão, e que todo o texto está em português de Portugal, com \"tu\". Estes erros invalidam a entrega."),
    ("- Escreva em portugues do Brasil com acentuacao completa e correta.",
     "- Escreva em portugues de Portugal (europeu) com acentuacao completa e correta."),
    ("- Ela fala \"voce\", nunca \"meninas\". Proibido guru, hack, segredo, formula magica, 6 em 7.",
     "- Ela trata a pessoa por \"tu\", nunca por \"voce\". Proibido guru, hack, segredo, formula magica."),
]
for a, b in reps:
    n = s.count(a)
    if n != 1:
        sys.exit("FALHOU (%d ocorrencias): %s" % (n, a[:60]))
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print("6 trocas feitas")
