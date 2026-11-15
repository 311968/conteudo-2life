# Alterações à app de conteúdo (10/11/2026)

Scripts usados para adaptar o código da app (pacote da mentora) à marca 2Life. Se for instalada uma versão nova do pacote, estas alterações perdem-se e refazem-se com estes scripts (cópias também no servidor, em /root/instaladores/conteudo-neia-2026-10-15/pre-ptpt-2026-11-10/ e pre-fontes-2026-11-10/, com os ficheiros originais).

- ptpt.py: troca 6 instruções do ia.js de português do Brasil para português de Portugal e "tu".
- marca_layouts.py: nos layouts, troca as fontes (Playfair, Inter, Oswald, Caveat) por Cormorant Garamond, Montserrat e Allura, o azul-petróleo #122027 por Carvão #2E2B29, e põe as palavras de destaque em Bordô.
- marca_fontes.py: descarrega as três fontes do Google Fonts e acrescenta-as ao fontes.css.

A identidade (7 blocos) está em ../identidade-2026-11-10/. As cores estão guardadas nos dados da app (separador Cores).
