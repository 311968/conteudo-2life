# 16/11/2026: escolha da foto na capa do Modelo 2Life, no editor:
# "Foto esbatida (modelo 01)" por defeito ou "Corte reto (modelo 02)". Sem foto, a capa continua editorial.
# Corre depois de aplicar_sintese.py. Uso: python aplicar_corte.py <pasta da app>
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

trocar('layouts/modelo2life.js', [
    ("""<div class="foto-dir${s.recorte ? ' recorte' : ''}\"""",
     """<div class="foto-dir${(s.recorte === true || s.corte === 'reto') ? ' recorte' : ''}\""""),
])

trocar('public/app.js', [
    ("['logotipo', 'Logótipo: selo (por defeito) ou sem. O grande só vai na última lâmina', 'input']],",
     "['logotipo', 'Logótipo: selo (por defeito) ou sem. O grande só vai na última lâmina', 'input'],\n"
     "               ['corte', 'Foto na capa (sem foto escolhida, a capa é editorial)', 'select',\n"
     "                [['esbatida', 'Foto esbatida (modelo 01)'], ['reto', 'Corte reto (modelo 02)']]]],"),
    ("    const campos_html = lista.map(([k, rot, tag]) => tag === 'textarea'\n",
     "    const campos_html = lista.map(([k, rot, tag, opcoes]) => tag === 'select'\n"
     "      ? `<div><div class=\"rot\">${rot}</div><select data-i=\"${i}\" data-k=\"${k}\">${opcoes.map(([v, nome]) =>\n"
     "          `<option value=\"${v}\" ${(s[k] || opcoes[0][0]) === v ? 'selected' : ''}>${nome}</option>`).join('')}</select></div>`\n"
     "      : tag === 'textarea'\n"),
    ("  $$('#slides input[data-k], #slides textarea[data-k]').forEach(el => {",
     "  $$('#slides input[data-k], #slides textarea[data-k], #slides select[data-k]:not([data-k=tipo])').forEach(el => {"),
])
