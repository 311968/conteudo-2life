# Integração na app e correções do percurso (15/11/2026)

Estado: **integrado em produção** a 15/11/2026, por pedido da Simone ("Integra as quatro propostas no código da app").

## O que foi feito no servidor

1. Confirmado, só em leitura, que os 8 ficheiros da app eram iguais à cópia `proposta-reels-2026-11-15/base/`.
2. Cópia de segurança do código e da base de dados: `/root/instaladores/conteudo-neia-2026-10-15/pre-integracao-2026-11-15/` (e `antes-atualizacao-1` a `-4` para cada atualização seguinte).
3. Aplicado, por ordem: `marca_fontes_eb.py` (EB Garamond nas fontes da app), `aplicar_reels.py`, `aplicar_visual.py`, `aplicar_estrategia.py`, `aplicar_revisao.py`, `aplicar_tema.py`, `aplicar_guardar.py`. Só a app "conteudo" foi reiniciada.
4. Blocos de identidade 3 (voz) e 6 (regras) regravados a partir de `identidade-2026-11-10/`; 1, 2, 4, 5 e 7 já eram iguais.
5. Quatro atualizações depois do teste (pastas `integracao-2026-11-15/atualizacao-1` a `-4`), cada uma só se os ficheiros em produção fossem os esperados.

## Correções do percurso (esta pasta)

| Script | Falha encontrada | Correção |
|---|---|---|
| `aplicar_tema.py` | A app recusava gerar só com o tema ("Preciso da ideia central…") | A ideia central é opcional; sem ela, a IA parte do tema e da Matriz |
| `aplicar_guardar.py` | O botão "Salvar" não guardava o comentário nem o guião dos reels | Passa a guardá-los, como o "Exportar" |

## Teste pela interface (`testar-interface.js`)

Os mesmos pedidos que os botões fazem: entrar, gerar só com tema e formato, escolher a abertura recomendada, guardar em Conteúdos, abrir, editar e guardar. A senha é lida do `.env` da app e nunca é mostrada.

Quatro voltas (`resultado-interface.json`, `-2`, `-3`, `-4`). Falhas corrigidas pelo caminho (nas propostas dos reels, do layout, da estratégia e da revisão): reels de 30 s com a estrutura de 60 s; frases telegráficas ao encurtar; género (listas substituídas por uma leitura da IA, sem barras "o/a"); título da capa acima do limite; CTA de Conversa sem marcação; paráfrase e repetição da frase-mestre no fecho.

Rascunhos finais do teste: ids 11 (reel) e 12 (carrossel), série "Teste da app · 15/11". Os ids 5 a 10 são versões anteriores, marcadas "pode apagar".
