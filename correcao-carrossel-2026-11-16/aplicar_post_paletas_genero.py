# Ronda de 16/11/2026, depois de aplicar_logotipo.py:
# 1. Post estático com as cinco paletas originais (a restrição Marfim/Bege fica só no carrossel Modelo 2Life).
# 2. Revisão de género também nos ângulos do post ({opcoes: [...]}), que ficavam de fora.
# 3. Regra de linguagem: "a ti própria/próprio" (como "a ti mesmo").
# Uso: python aplicar_post_paletas_genero.py <pasta da app>
import sys, os

raiz = sys.argv[1]

def trocar(rel, pares):
    p = os.path.join(raiz, rel)
    t = open(p, encoding='utf-8').read()
    for antigo, novo in pares:
        n = t.count(antigo)
        if n != 1:
            sys.exit(f'{rel}: esperava 1 ocorrência, encontrei {n}: {antigo[:70]!r}')
        t = t.replace(antigo, novo)
    open(p, 'w', encoding='utf-8', newline='').write(t)
    print('ok', rel)

trocar('public/app.js', [
    ("  const tons = estado.tons[estado.layout] || [];\n  atualizarBlocoFotos();",
     "  // Post e capa dos reels: as cinco paletas originais. Marfim e Bege só no carrossel Modelo 2Life.\n"
     "  const tons = estado.tons[chaveLayout() === 'post' ? 'layout1' : estado.layout] || [];\n  atualizarBlocoFotos();"),
])

trocar('ia.js', [
    ("  if (!json || typeof json !== 'object' || (!json.legenda && !Array.isArray(json.blocos) && !Array.isArray(json.slides))) return json;",
     "  if (!json || typeof json !== 'object' || (!json.legenda && !Array.isArray(json.blocos) && !Array.isArray(json.slides) && !Array.isArray(json.opcoes))) return json;"),
    ("  { re: pal(String.raw`(?:a ti|de ti|contigo|para ti)\\s+mesm[oa]s?`),\n"
     "    regra: 'fala com a pessoa só num género (\"a ti mesmo\", \"contigo mesma\"): escreve sem \"mesmo\" nem \"mesma\", só \"a ti\" ou \"contigo\"' },",
     "  { re: pal(String.raw`(?:a ti|de ti|contigo|para ti)\\s+(?:mesm[oa]s?|própri[oa]s?)`),\n"
     "    regra: 'fala com a pessoa só num género (\"a ti mesmo\", \"a ti própria\", \"contigo mesma\"): escreve sem \"mesmo\", \"mesma\", \"próprio\" nem \"própria\", só \"a ti\" ou \"contigo\"' },"),
])
