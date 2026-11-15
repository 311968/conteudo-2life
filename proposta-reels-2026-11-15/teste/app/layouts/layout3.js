// LAYOUT 3 — "Manifesto" (referencia: carrossel de fundo chapado)
// So tipografia sobre cor chapada. Sem imagem, sem rodape.
// Slide 1080x1350. Tipos: capa | texto | forte | centro | fechamento

const NOME = 'Manifesto';
const DESCRICAO = 'Opinião. Uma tese que contraria o senso comum, o erro que quase todo mundo comete, a distinção que muda tudo e a virada. Sem imagem nenhuma. Sempre 10 lâminas.';

const TIPOS = ['capa', 'texto', 'forte', 'centro', 'fechamento'];

const paletas = require('./paletas');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function rico(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}
function paragrafos(s) {
  return String(s || '').split(/\n\s*\n/).filter(Boolean)
    .map(p => `<p>${rico(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');
}

function css(tom) {
  return `
  ${paletas.raiz(tom)}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1080px; height:1350px; overflow:hidden; }
  .slide{ width:1080px; height:1350px; display:flex; flex-direction:column; justify-content:center;
    padding:96px 88px; background:var(--fundo); color:var(--tinta);
    font-family:'Inter',sans-serif; letter-spacing:-0.022em; }
  .slide.meio{ text-align:center; align-items:center; }

  .bloco p{ margin-bottom:46px; }
  .bloco p:last-child{ margin-bottom:0; }

  /* peso leve: a lamina que explica */
  .leve p{ font-weight:300; font-size:67px; line-height:1.16; }
  .leve.menor p{ font-size:59px; }
  .leve b{ font-weight:600; }

  /* peso pesado: a lamina que crava */
  .pesado p{ font-weight:800; font-size:79px; line-height:1.08; }
  .pesado.menor p{ font-size:67px; }
  .pesado b{ font-weight:800; }

  .cta{ font-weight:800; font-size:90px; line-height:1.1; text-align:center; }
  .cta .emoji{ display:block; font-size:120px; line-height:1.3; margin:8px 0; }
  .cta.menor{ font-size:74px; }
  `;
}

// Quanto mais longo o texto, menor o corpo
function classeTamanho(texto, limite) {
  return String(texto || '').length > limite ? 'menor' : '';
}

function slideHTML(s, ctx) {
  const corpo = s.corpo || s.titulo || '';
  switch (s.tipo) {
    case 'capa':
    case 'forte':
      return `<div class="slide">
        <div class="bloco pesado ${classeTamanho(corpo, 120)}">${paragrafos(corpo)}</div>
      </div>`;

    case 'centro':
      return `<div class="slide meio">
        <div class="bloco pesado ${classeTamanho(corpo, 120)}">${paragrafos(corpo)}</div>
      </div>`;

    case 'fechamento':
      return `<div class="slide meio">
        <div class="cta ${classeTamanho((s.antes || '') + (s.depois || ''), 44)}">
          ${s.antes ? rico(s.antes) : ''}
          ${s.emoji ? `<span class="emoji">${esc(s.emoji)}</span>` : ''}
          ${s.depois ? rico(s.depois) : ''}
        </div>
      </div>`;

    case 'texto':
    default:
      return `<div class="slide">
        <div class="bloco leve ${classeTamanho(corpo, 230)}">${paragrafos(corpo)}</div>
      </div>`;
  }
}

function paginaHTML(slide, ctx) {
  const fontes = ctx.fontesCSS || '/fontes/fontes.css';
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <link rel="stylesheet" href="${fontes}">
  <style>${css(ctx.tom)}</style></head><body>${slideHTML(slide, ctx)}</body></html>`;
}

const INSTRUCOES = `# ESTRUTURA DO CARROSSEL (layout 3, manifesto)

Exatamente 10 lâminas, nem mais nem menos. Aqui não existe imagem nenhuma: só a frase sobre cor chapada. Por isso cada lâmina precisa se sustentar sozinha, como uma tese escrita na parede.

O arco é de opinião, não de tutorial, e ocupa as 10 lâminas assim:
1. capa: a frase que contraria o senso comum
2 e 3: o erro que quase todo mundo comete, nomeado sem meias palavras
4, 5 e 6: a distinção que muda tudo, o corte fino entre uma coisa e outra
7 e 8: o que isso significa na prática para quem lê
9: a virada, dita em poucas palavras
10: o convite para comentar

# TIPOS DE LÂMINA DISPONÍVEIS

- "capa": { tipo, corpo } → peso pesado, alinhado à esquerda. A tese, em até 90 caracteres.
- "texto": { tipo, corpo } → peso leve, alinhado à esquerda. É a lâmina que explica. De 1 a 3 parágrafos separados por linha em branco, até 260 caracteres no total.
- "forte": { tipo, corpo } → peso pesado, alinhado à esquerda. É a lâmina que crava. Até 160 caracteres.
- "centro": { tipo, corpo } → peso pesado, centralizado. Para frase curta e ritmada, de preferência em partes separadas por ponto ("Tem que mostrar visão. Opinião. Método."). Até 90 caracteres. No máximo duas por carrossel.
- "fechamento": { tipo, antes, emoji, depois } → última lâmina, centralizada. Exemplo: antes "Comenta", emoji "🔥", depois "se você concorda". O emoji é opcional.

Alterne peso: uma lâmina leve que explica, depois uma pesada que crava. Nunca três pesadas seguidas.

Frase curta. Quebre o raciocínio em lâminas, em vez de encher uma só. São sempre 10 lâminas: se o assunto parecer curto, abra mais o raciocínio em vez de espremer; se parecer longo, corte o que não for essencial.

Não use **negrito** aqui: o peso da lâmina inteira já faz esse trabalho.

Em toda lâmina preencha "imagem_ideia" com uma frase curta, mesmo que este layout não use imagem. Serve de registro.`;

module.exports = { NOME, DESCRICAO, TIPOS, INSTRUCOES, paginaHTML, slideHTML, css };
