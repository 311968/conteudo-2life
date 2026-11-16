# 16/11/2026: botão «Guardar no telemóvel» depois de exportar.
# No telemóvel, «Baixar tudo» descarrega um .zip difícil de abrir. O botão novo abre a folha de partilha do
# telemóvel com as imagens todas (Guardar imagens, Instagram...). Só aparece em ecrãs tácteis com partilha de ficheiros.
# As imagens são preparadas logo a seguir a exportar, porque o iPhone só abre a partilha diretamente a partir do toque.
# Uso: python aplicar_guardar_telemovel.py <pasta da app>
import sys, os
p = os.path.join(sys.argv[1], 'public', 'app.js')
t = open(p, encoding='utf-8').read()
pares = [
    ("""        <a class="botao" href="/api/carrosseis/${estado.carrosselId}/zip">Baixar tudo</a>\n""",
     """        <button class="botao" id="guardar-telemovel" hidden>Guardar no telemóvel</button>\n"""
     """        <a class="botao" href="/api/carrosseis/${estado.carrosselId}/zip">Baixar tudo</a>\n"""),
    ("""    const bp = document.getElementById('abrir-pasta');\n""",
     """    prepararGuardarTelemovel(r.arquivos);\n    const bp = document.getElementById('abrir-pasta');\n"""),
    ("""$('#btn-exportar').addEventListener('click', async () => {\n""",
     """// Telemóvel: abre a folha de partilha com as imagens exportadas (Guardar imagens, Instagram...)
async function prepararGuardarTelemovel(arquivos) {
  const b = document.getElementById('guardar-telemovel');
  if (!b || !navigator.canShare || !window.matchMedia('(pointer: coarse)').matches) return;
  let ficheiros = null;
  try {
    ficheiros = await Promise.all(arquivos.map(async (a, n) => {
      const blob = await (await fetch(a)).blob();
      return new File([blob], 'lamina-' + String(n + 1).padStart(2, '0') + '.jpg', { type: blob.type || 'image/jpeg' });
    }));
    if (!navigator.canShare({ files: ficheiros })) return;
  } catch (e) { return; }
  b.hidden = false;
  b.addEventListener('click', async () => {
    try { await navigator.share({ files: ficheiros }); }
    catch (e) { if (e.name !== 'AbortError') $('#status-export').insertAdjacentHTML('beforeend', '<div class="dica">Não foi possível abrir a partilha. Toca nas imagens numeradas e guarda uma a uma.</div>'); }
  });
}

$('#btn-exportar').addEventListener('click', async () => {\n"""),
]
for a, b in pares:
    if t.count(a) != 1:
        sys.exit(f'app.js: esperava 1 ocorrência: {a[:60]!r}')
    t = t.replace(a, b)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('ok public/app.js')
