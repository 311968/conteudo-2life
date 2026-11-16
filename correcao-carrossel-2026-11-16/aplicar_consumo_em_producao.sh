#!/bin/sh
# Aplica aplicar_consumo.py na app em produção (só a app "conteudo"), com cópia do código e da base de dados.
set -e
cd "$(dirname "$0")"
ssh root@187.124.53.232 'mkdir -p /root/aplicar-consumo-2026-11-16'
scp -q aplicar_consumo.py consumo.js root@187.124.53.232:/root/aplicar-consumo-2026-11-16/
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum ia.js | cut -c1-16)" = 7c41c176c45ad0e4 ] && [ "$(sha256sum server.js | cut -c1-16)" = 19665556fc4a7731 ] && [ "$(sha256sum public/app.js | cut -c1-16)" = a8e696940ba4a082 ] && [ ! -e consumo.js ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-consumo; mkdir -p $B/public
cp ia.js server.js $B/; cp public/app.js $B/public/
/opt/node22/bin/node -e "require(\"better-sqlite3\")(\"conteudo.db\").backup(\"$B/conteudo.db\").then(()=>console.log(\"cópia da base de dados ok\"))"
python3 /root/aplicar-consumo-2026-11-16/aplicar_consumo.py .
/opt/node22/bin/node --check ia.js; /opt/node22/bin/node --check server.js; /opt/node22/bin/node --check consumo.js
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum ia.js server.js public/app.js consumo.js | cut -c1-16
/opt/node22/bin/node -e "const D=require(\"better-sqlite3\")(\"conteudo.db\",{readonly:true}); console.log(\"tabela consumo_ia:\", D.prepare(\"SELECT count(*) n FROM consumo_ia\").get().n, \"linhas\")"
rm -rf /root/aplicar-consumo-2026-11-16'
