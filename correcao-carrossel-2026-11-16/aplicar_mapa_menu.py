# 16/11/2026: entrada «Mapa das Fontes» no menu da app (Extras), que abre /mapa.html dentro da app.
# É uma ligação (<a>), não um botão das abas, para não mexer na navegação das abas em app.js.
# Uso: python aplicar_mapa_menu.py <pasta da app>
import sys, os
p = os.path.join(sys.argv[1], 'public', 'app.html')
t = open(p, encoding='utf-8').read()
a = '      <button data-aba="extras">Capa de vídeo</button>\n    </div>\n'
if t.count(a) != 1:
    sys.exit('app.html: grupo Extras não encontrado')
b = ('      <button data-aba="extras">Capa de vídeo</button>\n'
     '      <a href="/mapa.html" style="display:block;padding:9px 12px;border-radius:9px;font-size:14.5px;font-weight:500;color:var(--petrol-lt);text-decoration:none">Mapa das Fontes</a>\n'
     '    </div>\n')
open(p, 'w', encoding='utf-8', newline='').write(t.replace(a, b))
print('ok public/app.html')
