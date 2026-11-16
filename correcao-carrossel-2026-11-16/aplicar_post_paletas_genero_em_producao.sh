#!/bin/sh
# Aplica aplicar_post_paletas_genero.py na app em produção (só a app "conteudo").
# Pára sem mexer em nada se os ficheiros no servidor não forem os esperados.
set -e
cd "$(dirname "$0")"
scp -q aplicar_post_paletas_genero.py root@187.124.53.232:/root/aplicar_post_paletas_genero_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.js | cut -c1-16)" = 7feb78b838efb625 ] && [ "$(sha256sum ia.js | cut -c1-16)" = 766abc6af1705c27 ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-post-paletas-genero; mkdir -p $B/public
cp public/app.js $B/public/; cp ia.js $B/
python3 /root/aplicar_post_paletas_genero_2026-11-16.py .
/opt/node22/bin/node --check ia.js
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum public/app.js ia.js | cut -c1-16
echo "Feito. Cópia de segurança em $B"'
