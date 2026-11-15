// Gera o carrossel da Semana Limites (aprovado a 10/11/2026) com o motor de imagens da propria app
// (render.js) e o layout Modelo 2Life, na copia local teste-app. Nada sai do computador.
// Corre com: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" NODE_PATH=C:/Users/fsimo/turma7-2life/node_modules node gerar-carrossel-app.js
const path = require('path');
const { renderizar } = require('./teste-app/render.js');

// Textos do carrossel aprovado (conteudo-redes-sociais/plano-semana-limites.md), distribuidos pelos campos do layout.
const slides = [
  { tipo: 'capa', titulo: 'Não te falta **assertividade.**', subtitulo: 'Falta-te sentir que podes desiludir alguém e continuar a ter lugar.' },
  { tipo: 'interior', titulo: 'Pensas que o problema é não saberes dizer não.', corpo: 'Por isso ensaias a frase, escolhes as palavras, esperas pelo momento certo. E quando chega a hora, sai um **sim**.' },
  { tipo: 'interior', titulo: 'Um limite não é uma **rejeição.**', corpo: 'É informação: mostra ao outro onde tu começas.' },
  { tipo: 'interior', titulo: 'Não é fraqueza. É **proteção.**', corpo: 'Quando aprendeste que o teu valor estava em seres útil aos outros, dizer não passou a ser sentido como perder o lugar. Por isso o corpo trava antes de a cabeça decidir.' },
  { tipo: 'interior', alinhar: 'esquerda', titulo: 'Dizes: "claro, eu trato disso."', corpo: 'Pedem-te para ficares com mais um projeto. Já estás no limite. À noite, sentes cansaço e um **ressentimento** que não sabes onde pôr.' },
  { tipo: 'interior', titulo: 'O que **não resolve**', corpo: 'Frases feitas para dizer não. Mais técnicas de assertividade. Prometer a ti próprio que da próxima vez é diferente.\nEnquanto o não for sentido como **perigo**, o sim volta a sair.' },
  { tipo: 'interior', titulo: 'O que começa a **transformar**', corpo: 'Perceber o que temes perder quando dizes não. E sustentar um não pequeno, sem te justificares demais, para aprenderes por experiência que continuas a ter **lugar**.' },
  { tipo: 'interior', titulo: 'Completa esta frase:', corpo: '**"Se eu disser não, tenho medo de que…"**\nEscreve a primeira resposta que surgir. É aí que começa a raiz.' },
  { tipo: 'fecho', titulo: 'O piloto automático protege-te. Mas não pode **decidir** a tua vida.' },
];

(async () => {
  const destino = path.join(__dirname, 'carrossel-app');
  const arquivos = await renderizar(slides, { serie: 'Semana Limites', handle: '@simoneferreirapsicologia', tom: 'clara', fotoArquivo: 'foto-08.jpeg' },
    destino, 'modelo2life');
  console.log(arquivos.length, 'lâminas em', destino);
})().catch(e => { console.error('ERRO', e.message); process.exit(1); });
