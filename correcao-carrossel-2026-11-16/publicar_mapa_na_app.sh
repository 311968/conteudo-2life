#!/bin/sh
# Atualiza o Mapa das Fontes dentro da app (public/mapa.html) a partir da cópia local do mapa.
# Correr sempre que o mapa for atualizado. A página fica atrás do login da app.
set -e
cd "$(dirname "$0")"
python mapa_para_app.py ../mapa-fontes-app-2life-2026-11-15.html mapa-app.html
scp -q mapa-app.html root@187.124.53.232:/root/mapa-app-novo.html
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com/public
B=/root/instaladores/conteudo-neia-2026-10-15/mapa-na-app; mkdir -p $B
[ -e mapa.html ] && cp mapa.html $B/mapa-$(date -u +%Y%m%dT%H%M%S).html || true
mv /root/mapa-app-novo.html mapa.html
echo "Mapa na app atualizado: $(wc -c < mapa.html) bytes"'
rm -f mapa-app.html
