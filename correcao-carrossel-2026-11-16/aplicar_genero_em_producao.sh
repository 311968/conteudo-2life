#!/bin/sh
# Aplica a versão final de aplicar_genero.py na app em produção (só a app "conteudo").
# Parte do ia.js anterior à revisão de género (cópia em antes-genero/, impressão 59edf0aef9fa4e88).
set -e
cd "$(dirname "$0")"
scp -q aplicar_genero.py root@187.124.53.232:/root/aplicar_genero_2026-11-16.py
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
A=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-genero
case "$(sha256sum ia.js | cut -c1-16)" in 59edf0aef9fa4e88|4b762fb139875568|62f90cd17471a5a3|d3d6eb13373c2613|0dd5d66a537ddd58) ;; *) echo "Ficheiro diferente do esperado: nada foi alterado."; exit 1;; esac
[ "$(sha256sum $A/ia.js | cut -c1-16)" = 59edf0aef9fa4e88 ] || { echo "Cópia de segurança diferente: nada foi alterado."; exit 1; }
T=$(mktemp -d); cp $A/ia.js $T/ia.js
python3 /root/aplicar_genero_2026-11-16.py $T
[ "$(sha256sum $T/ia.js | cut -c1-16)" = 7c41c176c45ad0e4 ] || { echo "Resultado diferente do testado: nada foi alterado."; exit 1; }
cp ia.js $A/ia-versao-1-genero.js
cp $T/ia.js ia.js; rm -rf $T
/opt/node22/bin/node --check ia.js
pm2 restart conteudo >/dev/null; sleep 3
curl -s -o /dev/null -w "App a responder: %{http_code}\n" http://127.0.0.1:3900/api/versao
sha256sum ia.js | cut -c1-16'
