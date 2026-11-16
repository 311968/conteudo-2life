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
| 7 | `aplicar_gramatica.py` | Revisão da construção das frases com a IA, em todos os formatos (caso que falhou: «O piloto automático dizer sim por ti teve sempre uma função.»); ignora pedaços que continuam noutro campo |
| 8 | `aplicar_genero.py` | Revisão de género nova: não troca de género (usa substantivos e verbos); frases detetadas pelas regras vão marcadas; regras novas (enumerações, «ser/seres/ficar + palavra em -o/-a», «ti próprio», voz interior na primeira pessoa); a frase anterior vai como contexto; cada reescrita volta a passar pelas regras; frases sobre outra pessoa e a Simone a falar de si ficam iguais |
| 9 | `aplicar_consumo.py` + `consumo.js` | Registo do consumo de IA: modelo, etapa, tokens de entrada e de saída e custo estimado em dólares de cada chamada à Anthropic, agrupados por geração e ligados ao conteúdo; em Conteúdos, «Custo estimado de IA» com o detalhe por geração. Só dados de consumo: sem chaves, prompts nem textos |
| 10 | `aplicar_app_telemovel.py` + `assets/` | Ícone próprio (logótipo completo sobre Marfim) e modo de app no telemóvel (manifest em `/assets`, sem login); sem service worker |
| 11 | `aplicar_mapa_menu.py` + `mapa_para_app.py` | Mapa das Fontes dentro da app: menu › Extras › Mapa das Fontes abre `/mapa.html` (atrás do login), com barra para voltar à app |
| 12 | `aplicar_guardar_telemovel.py` | Botão «Guardar no telemóvel» depois de exportar: abre a folha de partilha do telemóvel com as imagens (Guardar imagens, Instagram); só em ecrãs tácteis |
| 13 | `aplicar_zona_grelha.py` | Zona segura da grelha na capa: conteúdo a 170 px do topo e do fundo, para aparecer inteiro no recorte quadrado ou 3:4 da grelha do perfil |

Os scripts `*_em_producao.sh` aplicam os passos 3 a 13. **Sempre que o mapa for atualizado, correr `publicar_mapa_na_app.sh`** para atualizar a cópia dentro da app. (o do passo 8 parte do `ia.js` anterior, guardado em `antes-genero/`) a partir deste computador.

- `base/`: cópia dos ficheiros de produção antes do passo 1 (e `ia.js`, `layouts/post.js` antes dos passos 3 e 4).
- `novo5/`: ficheiros depois do passo 5.
- `novo6/`: ficheiros depois do passo 6.
- `novo7/`: ficheiros depois do passo 7.
- `novo8/`: ficheiros depois do passo 8.
- `novo9/`: ficheiros depois do passo 9.
- `novo10/`: ficheiros depois do passo 10.
- `novo11/`: ficheiros depois do passo 11.
- `novo12/`: ficheiros depois do passo 12.
- `novo13/`: ficheiros tal como estão em produção depois do passo 13 (o `mapa.html` gera-se com `mapa_para_app.py`).

## Causa do problema de 16/11

O separador da app da Simone tinha sido aberto a 15/11 às 19:31 UTC, antes da integração das 22:40, e nunca foi recarregado: continuou a correr o app.js antigo, com o layout "Faixa e Caixa" por defeito.

## Teste pela interface

Rascunho 30 (carrossel, opções por defeito: Modelo 2Life, Marfim, foto-12), guardado, reaberto em Conteúdos e exportado; post 24 (logótipo grande sobre a foto); rascunho 31 com «Corte reto», guardado, reaberto e exportado (escolha preservada na imagem); rascunho 32, cópia do 31, com corte reto e selo no fecho, exportado (selo no canto inferior direito, igual à pré-visualização). Revisão da construção validada no fluxo do post (42 frases lidas, 2 corrigidas).

## Género no post (resolvido a 16/11)

Testado com as frases que falharam («seres generosa», «sentes-te mais cansado», «seres necessário», «ser mais assertiva», «menos amado», «ser vista», «Ser julgada», «Só honesto.», «contra ti próprio», «porque estou tão cansada»): todas sem marca de género e sem troca de género. O rascunho 30 e as frases sobre outra pessoa ficam iguais. Validado no fluxo normal: três ângulos do post sem marca de género.

## Custo estimado de IA (16/11)

Tabela `consumo_ia` na base de dados da app. Preços usados: tabela da Anthropic de 03/11/2026 (claude-sonnet-5: US$ 2 por milhão de tokens de entrada, US$ 10 por milhão de saída). Validado com dados de teste (cliente simulado, base de dados à parte; contas certas à mão; pedidos em simultâneo separados; nenhum texto guardado). A primeira medição real é o próximo carrossel gerado. Não regista as imagens do Gemini (só usadas noutros layouts e na transcrição de áudio).
