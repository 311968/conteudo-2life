# Regra do logótipo de 16/11/2026 (BRAND.md v1.3), confirmada pela Simone:
# em cada peça, uma de três opções: selo pequeno na primeira ou na última lâmina;
# logótipo grande no post estático (também sobre a foto dela) ou, no carrossel, só na última lâmina; ou nenhum.
# - Modelo 2Life: capa só "selo" ou "sem"; fecho "grande" (por defeito), "selo" ou "sem".
# - Post estático: campo "logotipo" com "sem" (por defeito, o post da mentora fica igual), "selo" ou "grande"
#   (composição do exemplo do Mapa: frase, logótipo grande sobre a foto, assinatura).
# Corre depois de aplicar_correcao.py e aplicar_correcao_2.py. Uso: python aplicar_logotipo.py <pasta da app>
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
    ("fecho com o logótipo completo. De 7 a 9 lâminas.'",
     "fecho com o logótipo grande, o selo ou nenhum. De 7 a 9 lâminas.'"),
    ("""    // Logotipo na capa (escolha da Simone): selo (por defeito), completo ou sem.
    // O completo, a 500 px com area livre, ocupa 871 px de altura: so cabe na capa editorial, sem foto.
    const logo = escolha(s.logotipo, ['selo', 'completo', 'sem'], 'selo');
    if (logo === 'completo' && !foto) {
      return `<div class="slide"><div class="raiz" style="background-image:url('${MARCA.raiz}')"></div>
      <div class="conteudo"><div class="miolo centro capa-logo">${s.titulo ? `<h1 class="capa-logo">${rico(s.titulo)}</h1>` : ''}
        <span class="livre"><img src="${MARCA.logoEscuro}" alt="Método 2Life"></span></div>
        <div class="base fim"><span class="desliza">DESLIZA PARA CONTINUAR</span></div>
      </div></div>`;
    }
""",
     """    // Logotipo na capa (regra de 16/11/2026): selo (por defeito) ou sem. O logotipo grande so vai na ultima lamina.
    const logo = escolha(s.logotipo, ['selo', 'sem'], 'selo');
"""),
    ("""    // Logotipo no fecho (escolha da Simone): completo (por defeito) ou sem, quando o completo ja esta na capa.
    const logo = escolha(s.logotipo, ['completo', 'sem'], 'completo');
""",
     """    // Logotipo no fecho (regra de 16/11/2026): grande (por defeito), selo no canto inferior direito, ou sem.
    let logo = escolha(s.logotipo, ['grande', 'completo', 'selo', 'sem'], 'grande');
    if (logo === 'completo') logo = 'grande';
"""),
    ("""        ${logo === 'completo' ? `<span class="livre">""",
     """        ${logo === 'grande' ? `<span class="livre">"""),
    ("""<div class="frase">A CONFIANÇA CONSTRÓI-SE NA RAIZ.</div>'}</div>
      </div></div></div>`;""",
     """<div class="frase">A CONFIANÇA CONSTRÓI-SE NA RAIZ.</div>'}</div>
      </div></div>${logo === 'selo' ? `<img class="selo selo-fecho" src="${escura ? MARCA.logoClaro : MARCA.logoEscuro}" alt="Método 2Life">` : ''}</div>`;"""),
    (".selo { width:${T.selo}px; display:block; }",
     ".selo { width:${T.selo}px; display:block; }\n.selo-fecho { position:absolute; right:84px; bottom:72px; }"),
])

trocar('public/app.js', [
    ("['logotipo', 'Logótipo: selo (por defeito), completo (só sem foto) ou sem', 'input']],",
     "['logotipo', 'Logótipo: selo (por defeito) ou sem. O grande só vai na última lâmina', 'input']],"),
    ("['logotipo', 'Logótipo: completo (por defeito) ou sem, se já estiver completo na capa', 'input']],",
     "['logotipo', 'Logótipo: grande (por defeito), selo ou sem', 'input']],"),
    ("function campos() { return CAMPOS_POR_LAYOUT[chaveLayout()] || CAMPOS_POR_LAYOUT.layout1; }",
     "function campos() {\n"
     "  const c = CAMPOS_POR_LAYOUT[chaveLayout()] || CAMPOS_POR_LAYOUT.layout1;\n"
     "  // Só no post estático: escolha do logótipo (regra de 16/11/2026). A capa dos reels fica como estava.\n"
     "  if (estado.formato !== 'post') return c;\n"
     "  const logo = ['logotipo', 'Logótipo: sem (por defeito), selo ou grande (grande: frase, logótipo e assinatura sobre a tua foto)', 'input'];\n"
     "  return Object.fromEntries(Object.entries(c).map(([t, f]) => [t, f.concat([logo])]));\n"
     "}"),
])

trocar('layouts/post.js', [
    ("const paletas = require('./paletas');\n",
     "const paletas = require('./paletas');\n"
     "const fs = require('fs');\nconst path = require('path');\n"
     "const modelo2life = require('./modelo2life');\n\n"
     "// Logotipo (regra de 16/11/2026, BRAND.md v1.3): sem (por defeito), selo ou grande\n"
     "const marca = (nome) => {\n"
     "  try { return 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'marca', nome)).toString('base64'); }\n"
     "  catch (e) { return ''; }\n"
     "};\n"
     "const LOGO = { escuro: marca('logo-escuro.png'), claro: marca('logo-claro.png') };\n"
     "const escolhaLogo = (v) => { const x = String(v == null ? '' : v).trim().toLowerCase();\n"
     "  return x === 'completo' ? 'grande' : (['selo', 'grande'].includes(x) ? x : 'sem'); };\n"
     "const paletaEscura = (tom) => { const p = paletas.lista().find(x => x.id === tom); return !!(p && p.escura); };\n"
     "function selo(s, ctx, claro) {\n"
     "  if (escolhaLogo(s.logotipo) !== 'selo') return '';\n"
     "  // No canto livre de cada estilo: em baixo na frase; em cima na foto (o texto fica em baixo); na lateral, em baixo à direita, por cima do @\n"
     "  const lugar = s.tipo === 'lateral' ? 'right:58px;bottom:118px' : (s.tipo === 'foto' && ctx.fotoUrl ? 'left:72px;top:56px' : 'left:72px;bottom:56px');\n"
     "  return `<img src=\"${claro ? LOGO.claro : LOGO.escuro}\" alt=\"Método 2Life\" style=\"position:absolute;${lugar};width:140px;z-index:4\">`;\n"
     "}\n"),
    ("""  if (s.tipo === 'lateral') {
    return `<div class="slide lateral">""",
     """  if (s.tipo === 'lateral') {
    return `<div class="slide lateral">${selo(s, ctx, paletaEscura(ctx.tom))}"""),
    ("""    return `<div class="slide foto">
      <div class="fundo\"""",
     """    return `<div class="slide foto">${selo(s, ctx, true)}
      <div class="fundo\""""),
    ("""  return `<div class="slide cor">
    ${serie}""",
     """  return `<div class="slide cor">${selo(s, ctx, paletaEscura(ctx.tom))}
    ${serie}"""),
    ("function paginaHTML(slide, ctx) {\n  const fontes = ctx.fontesCSS || '/fontes/fontes.css';\n  return `<!doctype html><html lang=\"pt-br\">",
     "function paginaHTML(slide, ctx) {\n"
     "  // Logotipo grande: a composicao do exemplo do Mapa (frase, logotipo grande sobre a foto, assinatura)\n"
     "  if (escolhaLogo(slide && slide.logotipo) === 'grande') {\n"
     "    const comFoto = !!ctx.fotoUrl && slide.tipo !== 'frase';\n"
     "    return modelo2life.paginaHTML({ tipo: 'fecho', titulo: slide.titulo, logotipo: 'grande', foto_fecho: comFoto ? 'sim' : '' },\n"
     "      Object.assign({}, ctx, { fotoUrl: comFoto ? ctx.fotoUrl : '' }));\n"
     "  }\n"
     "  const fontes = ctx.fontesCSS || '/fontes/fontes.css';\n  return `<!doctype html><html lang=\"pt-br\">"),
])
