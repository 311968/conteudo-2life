# Constrói public/mapa.html (o Mapa das Fontes dentro da app 2Life) a partir da cópia local do mapa.
# A página fica atrás do login da app; tem uma barra para voltar à app e as ligações do modo de app.
# Uso: python mapa_para_app.py <mapa.html de origem> <ficheiro de saída>
import sys
origem, saida = sys.argv[1], sys.argv[2]
mapa = open(origem, encoding='utf-8').read()
if '<title>' not in mapa[:300] or '</style>' not in mapa:
    sys.exit('O ficheiro de origem não parece o mapa.')
cabeca = ('<!doctype html>\n<html lang="pt-PT">\n<head>\n<meta charset="utf-8">\n'
          '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
          '<link rel="manifest" href="/assets/manifest.webmanifest">\n'
          '<link rel="apple-touch-icon" href="/assets/icone-180.png">\n'
          '<meta name="theme-color" content="#F5F1EA">\n'
          '<meta name="apple-mobile-web-app-capable" content="yes">\n')
barra = ('\n<div style="position:sticky;top:0;z-index:50;background:#2E2B29;padding:12px 16px;'
         'padding-top:max(12px, env(safe-area-inset-top));font:600 15px Montserrat,system-ui,sans-serif">'
         '<a href="/" style="color:#F5F1EA;text-decoration:none">← Voltar à app 2Life</a></div>\n')
i = mapa.index('</style>') + len('</style>')
open(saida, 'w', encoding='utf-8', newline='').write(cabeca + mapa[:i] + '\n</head>\n<body style="margin:0">' + barra + mapa[i:] + '\n</body>\n</html>\n')
print('ok', saida)
