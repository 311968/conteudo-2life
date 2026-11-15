import sys, os, re, hashlib, urllib.request
# Descarrega Cormorant Garamond, Montserrat e Allura do Google Fonts (subconjuntos latin e latin-ext)
# para a pasta indicada e acrescenta os @font-face ao fontes.css dessa pasta.
pasta = sys.argv[1]
URL = ('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700'
       '&family=Montserrat:wght@400;500;600;700&family=Allura&display=swap')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
css = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': UA}), timeout=30).read().decode()
blocos = re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S)
saida = ['', '/* Fontes da marca 2Life (BRAND.md), acrescentadas a 10/11/2026 */']
total = 0
for subconjunto, bloco in blocos:
    if subconjunto not in ('latin', 'latin-ext'):
        continue
    m = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', bloco)
    if not m:
        continue
    url = m.group(1)
    nome = 'marca-' + hashlib.sha1(url.encode()).hexdigest()[:10] + '.woff2'
    dados = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()
    if dados[:4] != b'wOF2':
        sys.exit('FALHOU: ficheiro nao e woff2: ' + url)
    open(os.path.join(pasta, nome), 'wb').write(dados)
    saida.append('/* ' + subconjunto + ' */')
    saida.append(bloco.replace(url, nome))
    total += 1
familias = set(re.findall(r"font-family: '([^']+)'", '\n'.join(saida)))
if familias != {'Cormorant Garamond', 'Montserrat', 'Allura'}:
    sys.exit('FALHOU: familias inesperadas ' + str(familias))
with open(os.path.join(pasta, 'fontes.css'), 'a', encoding='utf-8') as f:
    f.write('\n'.join(saida) + '\n')
print(total, 'ficheiros de fonte;', sorted(familias))
