# 16/11/2026: ícone próprio e modo de app no telemóvel (ecrã inteiro, sem barra do navegador).
# Copia assets/ (ícones e manifest) para public/assets/, servida sem login, e liga-os em app.html e login.html.
# Sem service worker: a app não guarda páginas antigas (o aviso "A app foi atualizada" continua a funcionar).
# Uso: python aplicar_app_telemovel.py <pasta da app>
import sys, os, shutil
raiz = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
destino = os.path.join(raiz, 'public', 'assets')
os.makedirs(destino, exist_ok=True)
for f in ['manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png', 'icone-512-mascara.png']:
    shutil.copyfile(os.path.join(aqui, 'assets', f), os.path.join(destino, f))
print('ok public/assets')
VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
LIGACOES = VIEWPORT + ('<link rel="manifest" href="/assets/manifest.webmanifest">\n'
    '<link rel="icon" type="image/png" sizes="192x192" href="/assets/icone-192.png">\n'
    '<link rel="apple-touch-icon" href="/assets/icone-180.png">\n'
    '<meta name="theme-color" content="#F5F1EA">\n'
    '<meta name="mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-capable" content="yes">\n'
    '<meta name="apple-mobile-web-app-title" content="2Life">\n'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n')
for rel in ['public/app.html', 'public/login.html']:
    p = os.path.join(raiz, rel)
    t = open(p, encoding='utf-8').read()
    if t.count(VIEWPORT) != 1:
        sys.exit(f'{rel}: linha do viewport não encontrada')
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(VIEWPORT, LIGACOES))
    print('ok', rel)
