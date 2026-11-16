#!/bin/sh
# Aplica aplicar_gramatica.py na app em produção (só a app "conteudo").
set -e
cd "$(dirname "$0")"
scp -q aplicar_gramatica.py root@187.124.53.232:/root/aplicar_gramatica_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum ia.js | cut -c1-16)" = bf51a62a8661bc0b ] || { echo "Ficheiro diferente do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-gramatica; mkdir -p $B
cp ia.js $B/
python3 /root/aplicar_gramatica_2026-11-16.py .
/opt/node22/bin/node --check ia.js
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum ia.js | cut -c1-16'
