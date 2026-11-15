# Proposta de 15/11/2026: aberturas dos reels segundo o Livro de Receitas v2.3 (§6 e §13).
# Uso: python aplicar_reels.py <pasta da app>
# 1. Confirma que os ficheiros da pasta sao exatamente os analisados (SHA-256 de producao a 15/11/2026).
# 2. Substitui reels.js pela versao da pasta proposta/.
# 3. Faz trocas exatas em ia.js, server.js, public/app.js e public/app.html (cada trecho tem de existir uma so vez).
# Nao reinicia nada, nao toca na base de dados nem nas chaves.
import hashlib, os, shutil, sys

pasta = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))

ESPERADO = {
    'reels.js': '2ccee1c674a0c9cf98b65d96fd4452490bf40d6f108bb10bad5cc79bec07a831',
    'ia.js': '653bfdbd0168c4704c7b703a90583cca075a64a348fa6ebc433b13ba03ff0dc4',
    'server.js': 'acb9bc172afd94b94e1592a58423fb05fe0bc4aa397373140f2d777b3da2dcd6',
    'public/app.js': '1a2c180bd1766196f5ebf693b7a9b2f690994f71cc25faba89c9190e27595849',
    'public/app.html': '160999daa3073ad1',  # prefixo confirmado a 15/11/2026
}

def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()

for rel, h in ESPERADO.items():
    atual = sha(os.path.join(pasta, rel))
    if not atual.startswith(h):
        sys.exit('PAROU: %s nao e a versao analisada (%s...). Nada foi alterado.' % (rel, atual[:16]))

def trocar(rel, pares):
    p = os.path.join(pasta, rel)
    s = open(p, encoding='utf-8', newline='').read()
    for a, b in pares:
        n = s.count(a)
        if n != 1:
            sys.exit('FALHOU em %s (%d ocorrencias): %s' % (rel, n, a[:70]))
        s = s.replace(a, b)
    open(p, 'w', encoding='utf-8', newline='').write(s)
    print('%s: %d trocas' % (rel, len(pares)))

# ---------- ia.js ----------
trocar('ia.js', [
    ("async function gerarGanchosReels({ tema, ideia, referencias, duracao, marcacao }) {",
     "async function gerarGanchosReels({ tema, ideia, referencias, duracao, marcacao, receita }) {"),
    ("""# SUA TAREFA AGORA
Escreva TRES ganchos diferentes para este tema, cada um de um tipo diferente da lista abaixo. O gancho e a primeira frase do video, os dois ou tres primeiros segundos. E ele que decide se a pessoa assiste ou passa.

Tipos de gancho:
${reels.GANCHOS.map(g => `- ${g.nome} (${g.id}): ${g.como}. Exemplo: "${g.exemplo}"`).join('\\n')}

Cada gancho leva:
- "tipo": o id do tipo escolhido
- "frase": a frase falada de abertura, ate 110 caracteres. Tem que caber em 3 segundos de fala.
- "tela": o texto que aparece escrito na tela nesse momento, ate 45 caracteres
- "porque": uma linha explicando por que esse gancho funciona para este tema

Os tres precisam ser portas DIFERENTES, nao tres versoes da mesma frase.`;""",
     """# A TUA TAREFA AGORA
${reels.tarefaAberturas(receita)}`;"""),
    ("description: 'Entrega tres ganchos de abertura.',",
     "description: 'Entrega tres aberturas e indica a recomendada.',"),
    ("""                tipo: { type: 'string' }, frase: { type: 'string' },
                tela: { type: 'string' }, porque: { type: 'string' },""",
     """                tipo: { type: 'string' }, frase: { type: 'string' },
                tela: { type: 'string' }, porque: { type: 'string' },
                situacao: { type: 'string' }, resposta: { type: 'string' },"""),
    ("""          },
        },
        required: ['ganchos'],""",
     """          },
          recomendada: { type: 'integer' },
          razao: { type: 'string' },
        },
        required: ['ganchos', 'recomendada'],"""),
    ("""  if (!Array.isArray(bruto.ganchos)) throw new Error('Formato inesperado nos ganchos. Tente de novo.');
""",
     """  if (!Array.isArray(bruto.ganchos)) throw new Error('Formato inesperado nos ganchos. Tente de novo.');
  let rec = Number(bruto.recomendada);
  if (!(rec >= 0 && rec < bruto.ganchos.length)) rec = 0;
  bruto.ganchos = bruto.ganchos.map((g, i) => ({ ...g, recomendado: i === rec }));
  bruto.recomendada = rec;
"""),
    ("""# SUA TAREFA AGORA
O gancho ja esta escolhido. Escreva o roteiro COMPLETO a partir dele, respeitando a estrutura da duracao acima.

Entregue:
- "blocos": a lista de blocos do roteiro, na ordem. Cada bloco leva "tempo" (ex: "0-3s"), "rotulo" (ex: "GANCHO", "DESENVOLVIMENTO", "CTA"), "fala" (o que ela diz, palavra por palavra), "tela" (o texto que aparece na tela, curto) e "camera" (a direcao de camera).
- "legenda": a legenda do post, de 6 a 12 linhas, comecando com um gancho escrito e terminando com convite claro.""",
     """# A TUA TAREFA AGORA
A abertura já está escolhida. Escreve o roteiro COMPLETO a partir dela, em português de Portugal, a tratar a pessoa por "tu", respeitando a estrutura da duração acima.

Entrega:
- "blocos": a lista de blocos do roteiro, por ordem. Cada bloco leva "tempo" (ex: "0-3s"), "rotulo" (ex: "ABERTURA", "SITUAÇÃO", "MECANISMO", "CTA"), "fala" (o que a Simone diz, palavra por palavra), "tela" (o texto no ecrã, curto) e "camera" (a direção de câmara).
- "legenda": a legenda segundo o Livro de Receitas §16: de 6 a 10 linhas; a primeira linha funciona sozinha no feed (cerca de 125 caracteres) e abre com uma situação reconhecível ou com a frase de viragem; parágrafos de uma a três linhas; aprofunda a ideia sem repetir a fala; termina com um só CTA, o mesmo do vídeo; sem hashtags."""),
    ("""O primeiro bloco usa exatamente a fala do gancho escolhido.
${cta ? `O CTA pedido e: ${cta}.` : 'Escolha o CTA que faz mais sentido para esta duracao.'}`;""",
     """${reels.regrasRoteiro(gancho)}
${cta ? `O CTA pedido é: ${cta}.` : 'Escolhe um só CTA, proporcional ao movimento que o vídeo criou.'}`;"""),
    ("""GANCHO ESCOLHIDO (${gancho.tipo}):\\n"${gancho.frase}"\\nTexto de tela do gancho: ${gancho.tela || '(defina)'}`;""",
     """ABERTURA ESCOLHIDA (${gancho.tipo}):\\n"${gancho.frase}"\\nTexto no ecrã: ${gancho.tela || '(define)'}${gancho.situacao ? `\\nSituação que vem a seguir: ${gancho.situacao}` : ''}${gancho.resposta ? `\\nResposta que o vídeo entrega: ${gancho.resposta}` : ''}`;"""),
])

# ---------- server.js ----------
trocar('server.js', [
    ("""  const { tema, ideia, banco_ids, duracao, funcao, nivel, avanco } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  if (!ideia && !temMaterial) return res.status(400).json({ erro: 'Preciso da ideia central, ou de material marcado.' });
  try {
    let referencias = [];
    if (temMaterial) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarGanchosReels({""",
     """  const { tema, ideia, banco_ids, duracao, funcao, nivel, avanco, receita } = req.body || {};
  const temMaterial = Array.isArray(banco_ids) && banco_ids.length;
  if (!tema) return res.status(400).json({ erro: 'Preciso do tema.' });
  if (!ideia && !temMaterial) return res.status(400).json({ erro: 'Preciso da ideia central, ou de material marcado.' });
  try {
    let referencias = [];
    if (temMaterial) {
      const marca = banco_ids.map(() => '?').join(',');
      referencias = db.prepare(`SELECT titulo, conteudo FROM banco WHERE id IN (${marca})`).all(...banco_ids);
    }
    const r = await ia.gerarGanchosReels({
      receita: receita === 'r3' ? 'r3' : '',"""),
])

# ---------- public/app.html ----------
trocar('public/app.html', [
    ("""              <datalist id="ctas"></datalist>
            </div>""",
     """              <datalist id="ctas"></datalist>
            </div>
            <div class="linha-est">
              <span class="rot-est">Receita</span>
              <select id="receita-reels"></select>
            </div>"""),
    ("""        <h2>3. Escolha o gancho</h2>
        <span class="dica">Os dois primeiros segundos decidem se ela assiste. Clique no que você quer.</span>""",
     """        <h2>3. Escolhe a abertura</h2>
        <span class="dica">Os dois primeiros segundos decidem se a pessoa fica. A abertura recomendada aparece assinalada.</span>"""),
])

# ---------- public/app.js ----------
trocar('public/app.js', [
    ("""  $('#ctas').innerHTML = e.ctas.map(c => `<option value="${c}">`).join('');""",
     """  $('#ctas').innerHTML = e.ctas.map(c => `<option value="${c}">`).join('');
  $('#receita-reels').innerHTML = (e.receitas || []).map(r => `<option value="${r.id}">${r.nome}</option>`).join('');"""),
    ("const parar = contando(st, 'Escrevendo três ganchos de abertura...');",
     "const parar = contando(st, 'A escrever três aberturas...');"),
    ("""          tema, ideia, banco_ids, duracao: estado.duracao,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.ganchos = r.ganchos || [];""",
     """          tema, ideia, banco_ids, duracao: estado.duracao, receita: $('#receita-reels').value,
          funcao: estado.funcao, nivel: estado.nivel, avanco: $('#avanco').value.trim(),
        }),
      });
      estado.ganchos = r.ganchos || [];
      estado.razaoRecomendada = r.razao || '';"""),
    ("parar(`${estado.ganchos.length} ganchos prontos. Escolha um abaixo.`);",
     "parar(`${estado.ganchos.length} aberturas prontas. Escolhe uma abaixo.`);"),
    ("""      <div class="gancho-tipo">${info.nome || g.tipo}</div>
      <div class="gancho-frase">${(g.frase || '').replace(/</g, '&lt;')}</div>
      ${g.tela ? `<div class="gancho-tela">na tela: ${g.tela.replace(/</g, '&lt;')}</div>` : ''}""",
     """      <div class="gancho-tipo">${info.nome || g.tipo}${g.recomendado ? ' · recomendada' : ''}</div>
      <div class="gancho-frase">${(g.frase || '').replace(/</g, '&lt;')}</div>
      ${g.tela ? `<div class="gancho-tela">no ecrã: ${g.tela.replace(/</g, '&lt;')}</div>` : ''}
      ${g.situacao && g.tipo !== 'problema' ? `<div class="dica">a seguir: ${g.situacao.replace(/</g, '&lt;')}</div>` : ''}
      ${g.resposta ? `<div class="dica">o vídeo revela: ${g.resposta.replace(/</g, '&lt;')}</div>` : ''}
      ${g.recomendado && estado.razaoRecomendada ? `<div class="dica">${estado.razaoRecomendada.replace(/</g, '&lt;')}</div>` : ''}"""),
    ("${estado.ganchoEscolhido === i ? 'Em uso' : 'Usar este'}",
     "${estado.ganchoEscolhido === i ? 'Em uso' : 'Usar esta'}"),
    ("b.disabled = true; b.textContent = 'Escrevendo...';\n    const st = $('#status-gerar');\n    const parar = contando(st, `Escrevendo o roteiro de ${estado.duracao} segundos...`);",
     "b.disabled = true; b.textContent = 'A escrever...';\n    const st = $('#status-gerar');\n    const parar = contando(st, `A escrever o roteiro de ${estado.duracao} segundos...`);"),
    ("$('#btn-voltar-angulos').textContent = 'Ver os outros ganchos';",
     "$('#btn-voltar-angulos').textContent = 'Ver as outras aberturas';"),
])

# ---------- reels.js ----------
shutil.copyfile(os.path.join(aqui, 'proposta', 'reels.js'), os.path.join(pasta, 'reels.js'))
print('reels.js: substituido pela proposta')
print('Concluido. Falta reiniciar so a app "conteudo" (pm2 restart conteudo), com autorizacao.')
