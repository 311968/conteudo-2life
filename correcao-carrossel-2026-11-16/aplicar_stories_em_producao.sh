#!/bin/sh
# Aplica aplicar_stories.py na app em produção e mete os stories da Semana Limites (só a app "conteudo").
set -e
cd "$(dirname "$0")"
ssh root@187.124.53.232 'mkdir -p /root/stories-2026-11-16/stories'
scp -q aplicar_stories.py root@187.124.53.232:/root/stories-2026-11-16/
scp -q stories/stories.js stories/stories-pagina.js root@187.124.53.232:/root/stories-2026-11-16/stories/
scp -q ../semana-limites-2026-11-16/stories-semana.json root@187.124.53.232:/root/stories-2026-11-16/
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum server.js | cut -c1-16)" = 26e13b249ae4602b ] && [ "$(sha256sum public/app.html | cut -c1-16)" = 876496ee275fc809 ] && [ ! -e stories.js ] && [ ! -e public/stories.js ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-stories; mkdir -p $B/public
cp server.js $B/; cp public/app.html $B/public/
/opt/node22/bin/node -e "require(\"better-sqlite3\")(\"conteudo.db\").backup(\"$B/conteudo.db\").then(()=>console.log(\"cópia da base de dados ok\"))"
python3 /root/stories-2026-11-16/aplicar_stories.py .
/opt/node22/bin/node --check server.js; /opt/node22/bin/node --check stories.js
/opt/node22/bin/node -e "const s=require(\"./stories\"); const n=s.semear(JSON.parse(require(\"fs\").readFileSync(\"/root/stories-2026-11-16/stories-semana.json\",\"utf8\"))); console.log(\"stories metidos:\", n)"
rm -rf /root/stories-2026-11-16
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
curl -s -o /dev/null -w "stories sem login: %{http_code}\n" http://127.0.0.1:3900/api/stories
sha256sum server.js public/app.html stories.js public/stories.js | cut -c1-16'
