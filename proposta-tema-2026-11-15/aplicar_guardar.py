# Correcao de 15/11/2026, encontrada no teste "abrir, editar e guardar em Conteudos":
# o botao "Salvar" do editor so guardava laminas, legenda e serie. O primeiro comentario e o guiao dos reels
# so ficavam gravados com "Exportar". Passa a guardar tambem o comentario e o guiao, como o "Exportar" ja faz.
# Uso: python aplicar_guardar.py <pasta da app>   (depois de aplicar_tema.py). Nao reinicia nada.
import os, sys

pasta = sys.argv[1]
p = os.path.join(pasta, 'public', 'app.js')
s = open(p, encoding='utf-8', newline='').read()
A = """    body: JSON.stringify({ slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value }),
  });
  $('#status-export').textContent = 'Salvo.';"""
B = """    body: JSON.stringify({ slides: estado.slides, legenda: $('#legenda').value, serie: $('#serie').value,
      comentario: $('#comentario').value, roteiro: estado.roteiro || undefined }),
  });
  $('#status-export').textContent = 'Guardado.';"""
if B in s:
    sys.exit('PAROU: a correcao ja esta aplicada nesta pasta. Nada foi alterado.')
if s.count(A) != 1:
    sys.exit('FALHOU em public/app.js: botao Salvar encontrado %d vezes. Nada foi alterado.' % s.count(A))
open(p, 'w', encoding='utf-8', newline='').write(s.replace(A, B))
print('public/app.js: "Salvar" guarda tambem o comentario e o guiao')
print('OK')
