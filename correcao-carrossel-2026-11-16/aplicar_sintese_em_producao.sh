#!/bin/sh
# Aplica aplicar_sintese.py na app em produção (só a app "conteudo").
set -e
cd "$(dirname "$0")"
scp -q aplicar_sintese.py root@187.124.53.232:/root/aplicar_sintese_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum layouts/modelo2life.js | cut -c1-16)" = 110fe48e84e680b5 ] || { echo "Ficheiro diferente do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-sintese; mkdir -p $B/layouts
cp layouts/modelo2life.js $B/layouts/
python3 /root/aplicar_sintese_2026-11-16.py .
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum layouts/modelo2life.js | cut -c1-16'
