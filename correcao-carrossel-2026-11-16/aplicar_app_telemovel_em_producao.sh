#!/bin/sh
# Aplica aplicar_app_telemovel.py na app em produção (só a app "conteudo").
set -e
cd "$(dirname "$0")"
ssh root@187.124.53.232 'mkdir -p /root/app-telemovel-2026-11-16'
scp -q -r aplicar_app_telemovel.py assets root@187.124.53.232:/root/app-telemovel-2026-11-16/
ssh root@187.124.53.232 'set -e; cd /var/www/conteudo.metodo2life.com
[ "$(sha256sum public/app.html | cut -c1-16)" = 5e2fe62116151a11 ] && [ "$(sha256sum public/login.html | cut -c1-16)" = c0169f0390bcd8da ] && [ ! -e public/assets ] || { echo "Ficheiros diferentes do esperado: nada foi alterado."; exit 1; }
B=/root/instaladores/conteudo-neia-2026-10-15/antes-correcao-carrossel-2026-11-16/antes-app-telemovel; mkdir -p $B/public
cp public/app.html public/login.html $B/public/
python3 /root/app-telemovel-2026-11-16/aplicar_app_telemovel.py .
rm -rf /root/app-telemovel-2026-11-16
for u in /login /assets/manifest.webmanifest /assets/icone-180.png /assets/icone-512.png; do curl -s -o /dev/null -w "$u %{http_code} %{content_type}\n" http://127.0.0.1:3900$u; done
sha256sum public/app.html public/login.html | cut -c1-16'
