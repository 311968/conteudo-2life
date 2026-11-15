# Proposta: aberturas dos reels (15/11/2026)

Estado: **proposta, não aplicada em produção.** Segue o Livro de Receitas v2.3, §6 "Abertura dos reels" e §13.

## Verificação do servidor (15/11/2026, só leitura)

| Ficheiro | Produção | Cópia analisada |
|---|---|---|
| `reels.js` | `2ccee1c6…` | igual ao pacote |
| `estrategia.js` | `37ec5193…` | igual ao pacote |
| `server.js` | `acb9bc17…` | igual ao pacote |
| `public/app.js` | `1a2c180b…` | igual ao pacote |
| `public/app.html` | `160999da…` | igual ao pacote |
| `ia.js` | `653bfdbd…` | pacote + correção PT-PT de 10/11 + modelo de transcrição de 16/10 (cópia em `base/ia.js`) |

## O que muda

- **`reels.js`** (substituído): três aberturas (problema concreto, afirmação contraintuitiva, curiosidade) e a abertura própria da R3; estrutura por duração em português de Portugal, alinhada com o Livro §4; o princípio "Primeiro, a pessoa vê-se".
- **`ia.js`**: a IA escreve uma abertura de cada tipo, indica a recomendada e a razão; para a curiosidade, devolve a situação que vem a seguir e a resposta que o vídeo entrega. O roteiro é escrito a partir da abertura escolhida, com a situação no segundo bloco e a resposta antes do CTA. Com a receita R3, escreve três variações "Quando alguém me diz…" e o roteiro segue os 5 passos da R3.
- **`server.js`**: passa a opção "Receita" ao gerar as aberturas.
- **`public/app.html` e `public/app.js`**: campo "Receita" (Escolher pela abertura ou R3); a abertura recomendada aparece assinalada, com a razão; textos do passo 3 em português de Portugal.

Não muda: carrossel, post, live, base de dados, chaves, layouts, cores.

## Ficheiros

| Pasta | Conteúdo |
|---|---|
| `base/` | Cópia exata de produção a 15/11/2026 |
| `proposta/reels.js` | O novo `reels.js` |
| `aplicar_reels.py` | Aplica a proposta a uma pasta da app. Para se algum ficheiro não for a versão analisada |
| `resultado/` | `base/` com a proposta aplicada (para comparar) |
| `teste/` | Teste local com base de dados e IA falsas (`node teste/testar.js`) |

## Teste local (15/11/2026): 18 de 18 verificações certas

Tema: o significado que atribuímos ao que nos acontece. Os pedidos completos que a app enviaria à IA estão em `teste/saida/`. As respostas da IA no teste são exemplos escritos à mão (`teste/respostas-de-exemplo.js`): o teste prova o circuito, não a qualidade da escrita da IA. A qualidade testa-se com a IA real, depois da aprovação.

## Para aplicar em produção (só com "sim" da Simone)

1. Voltar a confirmar as impressões digitais no servidor (o script também o faz).
2. Cópia de segurança dos 5 ficheiros em `/root/instaladores/conteudo-neia-2026-10-15/pre-reels-2026-11-15/`.
3. Enviar `aplicar_reels.py` e `proposta/reels.js` e correr o script na pasta da app.
4. `node --check` nos ficheiros e `pm2 restart conteudo` (só esta app).
5. A Simone gera o reel de teste na app, com e sem R3.

Reverter: repor os 5 ficheiros da cópia de segurança e reiniciar só o "conteudo". Se a autora lançar uma versão nova do pacote, a alteração refaz-se com este script (que para se os ficheiros forem diferentes).

## Fase seguinte (por aprovar)

Ver `sistema-2life/indice-de-regras.md` no meu-negocio, secção "App de conteúdo".
