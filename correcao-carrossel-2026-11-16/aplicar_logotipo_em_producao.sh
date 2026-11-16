#!/bin/sh
# Aplica a regra do logótipo de 16/11/2026 na app em produção (só a app "conteudo").
# Pára sem mexer em nada se os ficheiros no servidor não forem os esperados.
set -e
cd "$(dirname "$0")"
scp -q aplicar_logotipo.py root@187.124.53.232:/root/aplicar_logotipo_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.js | cut -c1-16)" = 38d8a172e594b9f1 ] && [ "$(sha256sum layouts/modelo2life.js | cut -c1-16)" = d78d2ed8679c302e ] && [ "$(sha256sum layouts/post.js | cut -c1-16)" = 2cd243fdab5d1aa2 ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-logotipo; mkdir -p $B/public $B/layouts
cp public/app.js $B/public/; cp layouts/modelo2life.js layouts/post.js $B/layouts/
python3 /root/aplicar_logotipo_2026-11-16.py .
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
echo "Feito. Cópia de segurança em $B"'
