#!/bin/sh
# Aplica aplicar_corte.py na app em produção (só a app "conteudo").
set -e
cd "$(dirname "$0")"
scp -q aplicar_corte.py root@187.124.53.232:/root/aplicar_corte_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.js | cut -c1-16)" = 311ce3535e0d3ca6 ] && [ "$(sha256sum layouts/modelo2life.js | cut -c1-16)" = 425aa547e10218ad ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-corte; mkdir -p $B/public $B/layouts
cp public/app.js $B/public/; cp layouts/modelo2life.js $B/layouts/
python3 /root/aplicar_corte_2026-11-16.py .
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum public/app.js layouts/modelo2life.js | cut -c1-16'
