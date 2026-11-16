# Correções da app a 16/11/2026 (percurso Produzir › Carrossel e logótipo)

Estado: **aplicado em produção** a 16/11/2026, a pedido da Simone. Cada script só corre se os ficheiros no servidor forem os esperados; antes de cada um há cópia de segurança em `/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/`.

| Ordem | Script | O que corrige |
|---|---|---|
| 1 | `aplicar_correcao.py` | Separador aberto antes de uma atualização deixa de gerar com o código antigo (versão do app.js, erro "recarrega a página"); Modelo 2Life por defeito também no servidor; Modelo 2Life só com Marfim e Bege |
| 2 | `aplicar_correcao_2.py` | Numeração certa na pré-visualização; legenda sem "\n" escrito à letra |
| 3 | `aplicar_logotipo.py` | Regra do logótipo de 16/11 (BRAND.md v1.3): capa selo ou sem; fecho grande, selo ou sem; post estático sem, selo ou grande sobre a foto |
| 4 | `aplicar_post_paletas_genero.py` | Post estático com as cinco paletas originais; revisão de género também nos ângulos do post; regra "a ti própria/próprio" |
| 5 | `aplicar_sintese.py` | Frase-síntese da capa em linhas equilibradas |
| 6 | `aplicar_corte.py` | Capa do Modelo 2Life: escolha «Foto esbatida (modelo 01)», por defeito, ou «Corte reto (modelo 02)»; sem foto, a capa continua editorial |

Os scripts `*_em_producao.sh` aplicam os passos 3 a 6 a partir deste computador.

- `base/`: cópia dos ficheiros de produção antes do passo 1 (e `ia.js`, `layouts/post.js` antes dos passos 3 e 4).
- `novo5/`: ficheiros depois do passo 5.
- `novo6/`: ficheiros tal como estão em produção depois do passo 6 (impressões digitais iguais às do servidor).

## Causa do problema de 16/11

O separador da app da Simone tinha sido aberto a 15/11 às 19:31 UTC, antes da integração das 22:40, e nunca foi recarregado: continuou a correr o app.js antigo, com o layout "Faixa e Caixa" por defeito.

## Teste pela interface

Rascunho 30 (carrossel, opções por defeito: Modelo 2Life, Marfim, foto-12), guardado, reaberto em Conteúdos e exportado; post 24 (logótipo grande sobre a foto); rascunho 31 com «Corte reto», guardado, reaberto e exportado (escolha preservada na imagem). Comparação com as referências do Mapa: https://claude.ai/artifact/EELivLrEsXWDmndWjKsAD4
