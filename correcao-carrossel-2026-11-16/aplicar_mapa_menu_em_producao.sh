#!/bin/sh
# Acrescenta «Mapa das Fontes» ao menu da app (Extras) e publica o mapa dentro da app.
set -e
cd "$(dirname "$0")"
scp -q aplicar_mapa_menu.py root@187.124.53.232:/root/aplicar_mapa_menu_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.html | cut -c1-16)" = 98b361d7da7381e9 ] || { echo "Ficheiro diferente do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-mapa-menu; mkdir -p $B/public
cp public/app.html $B/public/
python3 /root/aplicar_mapa_menu_2026-11-16.py .
rm -f /root/aplicar_mapa_menu_2026-11-16.py
sha256sum public/app.html | cut -c1-16'
sh ./publicar_mapa_na_app.sh
ssh root@187.124.53.232 'curl -s -o /dev/null -w "mapa sem login: %{http_code} -> %{redirect_url}\n" http://127.0.0.1:3900/mapa.html'
