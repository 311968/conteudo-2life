# Proposta: estratégia da app (passo 3, 15/11/2026)

Estado: **proposta, não aplicada em produção.**

A app pergunta, em cada conteúdo, a função, o nível de consciência e o próximo movimento, e passa estas respostas à IA. Até aqui, as três vinham do pacote original, escritas para outro negócio (empresária sobrecarregada, mentoria de negócio e IA, português do Brasil). Esta proposta põe no lugar delas as fontes oficiais.

## O que muda

| Campo na app | Antes (pacote) | Depois | Fonte |
|---|---|---|---|
| Função | Atração, Conexão, Venda | **Função ATA:** Atração, Técnico, Autoridade, cada uma com a pergunta de resultado, o que prioriza e o que evita | Matriz §14; Livro §3.4 e §12 |
| Nível | 5 níveis do negócio enxuto, com exemplos de outro negócio | 5 níveis da Matriz, com o que trabalhar e o objetivo de cada um | Matriz §8; Livro §3.5 |
| "Ao ler, ela precisa" | 7 avanços genéricos | **Próximo movimento:** Observação, Microação, Interação, Aprofundamento, Diagnóstico, Conversa, Entrada, com os exemplos do Banco de CTA | Matriz §15; Livro §14 e §15 |
| CTA dos reels ("No fim, ela") | salvar, comentar uma palavra, mandar DM… | **Frase do CTA:** as 13 frases do Banco de CTA | Livro §15 |
| Lembrete final do carrossel | regras por nível do pacote ("aqui pode e deve citar a oferta pelo nome") | os 5 níveis da Matriz e a regra do CTA proporcional | Matriz §8; Livro §15 |

A ligação entre a função e o CTA segue a Matriz §15 ("Relação ATA e CTA"). As fontes não ligam cada nível a um CTA, por isso a app também não o faz: aplica a regra "O CTA não deve pedir um movimento maior do que aquele para o qual o conteúdo preparou a pessoa".

Conteúdos já gravados com a marcação antiga continuam a abrir e a gerar: a função antiga é ignorada, o nível e o texto livre passam.

Não muda: base de dados, chaves, layouts, cores, aberturas dos reels.

## Ligação ao bloco 6 de identidade

O bloco 6 (regras), gravado na app a 10/11, tinha a frase "Correspondência com as funções desta app: Atração = Atração; Conexão = Técnico; Venda = Autoridade e convite." Com esta proposta, deixa de fazer sentido. A cópia local em `identidade-2026-11-10/6-regras.md` já foi corrigida (cópia anterior em `6-regras.antes-2026-11-15.md`). O bloco tem de ser regravado na app ao mesmo tempo que esta proposta é publicada.

## Ficheiros

| Ficheiro | Conteúdo |
|---|---|
| `proposta/estrategia.js` | O novo `estrategia.js` |
| `aplicar_estrategia.py` | Aplica a proposta a uma pasta da app. Para se `estrategia.js` não for o de produção, e não grava nada se algum trecho não encaixar |
| `teste/` | Teste local com as três propostas aplicadas (reels, visual, estratégia), base de dados e IA falsas (`node teste/testar.js`) |

## Teste local (15/11/2026): 17 de 17 verificações certas

Verifica as opções que a app mostra, os pedidos de carrossel (atração, nível 1, Observação; autoridade, nível 5, Conversa) e de reel (técnico, nível 3, Microação), as marcações antigas e a linguagem. Os pedidos completos estão em `teste/saida/`; `exemplo-bloco.txt` mostra o texto que a IA passa a receber.

O script também foi testado numa cópia de produção sozinho, depois dos reels e do layout, e uma segunda vez na mesma pasta (para sem alterar nada).

## Para aplicar em produção (só com "sim" da Simone)

1. Aplicar **depois** de `aplicar_reels.py` e `aplicar_visual.py` (esses confirmam as impressões digitais de produção antes de tudo).
2. Cópia de segurança de `estrategia.js`, `ia.js`, `reels.js`, `public/app.html` e `public/app.js`.
3. Enviar `aplicar_estrategia.py` e `proposta/estrategia.js` e correr o script na pasta da app.
4. `node --check` nos ficheiros e `pm2 restart conteudo` (só esta app).
5. Regravar o bloco 6 na app a partir de `identidade-2026-11-10/6-regras.md`.

## Encontrado no teste, fora deste passo

O `ia.js` ainda diz à IA, na parte das provas: "Pode contar a história de uma delas sem dizer o nome ("uma contadora que atendo", "uma dona de loja da mentoria")". O texto é do pacote, em português do Brasil e de outro negócio. Fica para um passo seguinte.
