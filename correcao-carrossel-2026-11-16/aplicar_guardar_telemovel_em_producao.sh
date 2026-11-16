#!/bin/sh
# Aplica aplicar_guardar_telemovel.py na app em produção (só o app.js; sem reiniciar o servidor).
set -e
cd "$(dirname "$0")"
scp -q aplicar_guardar_telemovel.py root@187.124.53.232:/root/aplicar_guardar_telemovel_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.js | cut -c1-16)" = 033c322ed7b7c8e5 ] || { echo "Ficheiro diferente do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-guardar-telemovel; mkdir -p $B/public
cp public/app.js $B/public/
python3 /root/aplicar_guardar_telemovel_2026-11-16.py .
rm -f /root/aplicar_guardar_telemovel_2026-11-16.py
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum public/app.js | cut -c1-16'
