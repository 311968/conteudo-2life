# Proposta: revisão automática de linguagem (15/11/2026)

Estado: **proposta, não aplicada em produção.**

## Porquê

No teste dos reels com a IA real (15/11), o texto saiu com quatro falhas, apesar de as instruções as proibirem: "talvez" duas vezes, "fizeste algo errado", "já não és obrigada" (o público inclui homens) e "Em sessão, ouço isto quase todas as semanas" (um dado que ninguém deu à IA).

## O que faz

No fim de cada geração, a app já tinha uma revisão: a dos acentos. Esta proposta acrescenta-lhe uma segunda, em dois tempos:

1. **Procura, sem IA**, em todos os textos gerados (falas, ecrã, legenda, capa, comentário):

| Procura | Regra de origem |
|---|---|
| "talvez", "às vezes", "algo" | Hierarquia §5; CLAUDE.md |
| travessões | Regras de escrita da Simone |
| "você" | Trato por "tu" |
| frases ditas à pessoa só no feminino ("és obrigada", "ficas sozinha") | O público inclui homens (CLAUDE.md do projeto) |
| números e frequências sobre a prática ("ouço isto todas as semanas", "80%", "a maioria das pessoas que acompanho") | Não inventar dados (Hierarquia §5) |

2. **Só se encontrar alguma coisa**, envia à IA apenas essas frases, cada uma com o problema encontrado, e pede-lhe que as reescreva só no necessário. As frases revistas voltam para o mesmo sítio. Sem problemas, não há pedido extra nem custo.

Se a revisão falhar (por exemplo, sem ligação), fica o texto original e a geração não se perde.

Vale para todos os formatos que passam pela revisão final: carrossel, post, reels, lives e capas.

## Limites

- A procura do feminino apanha as formas mais comuns ("és/estás/ficas … -ada, -ida, -osa, -inha"). Não apanha todas.
- "Repete isto todos os dias" passa: só se apanham frequências ligadas à prática da Simone ("ouço", "vejo", "acompanho"…).
- Não substitui a tua leitura antes de publicar.

## Ficheiros

| Ficheiro | Conteúdo |
|---|---|
| `proposta/revisao.js` | O código acrescentado ao `ia.js` |
| `aplicar_revisao.py` | Aplica a proposta a uma pasta da app; recusa correr duas vezes |
| `teste/` | Teste local com as quatro propostas aplicadas e a IA falsa a devolver os textos reais do teste de 15/11 (`node teste/testar.js`) |

## Teste local (15/11/2026): 19 de 19 verificações certas

As quatro falhas do teste real são apanhadas e trocadas no sítio certo; o resto do texto, a estrutura dos blocos e a recomendação ficam iguais; um texto limpo não gera pedido extra; oito frases de controlo (quatro que devem ser apanhadas e quatro que devem passar).

A cadeia completa (reels, layout, estratégia, revisão) foi aplicada a uma cópia limpa de produção, com sintaxe certa em todos os ficheiros.

## Encontrado no teste

O corretor de acentos do pacote foi chamado no roteiro "significado", que estava bem acentuado: confunde palavras como "esta" com "está". Gasta um pedido a mais sem necessidade. Já estava nas limpezas do pacote por fazer.

## Para aplicar em produção (só com "sim" da Simone)

1. Aplicar **depois** de `aplicar_reels.py`, `aplicar_visual.py` e `aplicar_estrategia.py`.
2. Cópia de segurança do `ia.js`.
3. Correr `aplicar_revisao.py` na pasta da app, `node --check ia.js` e `pm2 restart conteudo` (só esta app).
