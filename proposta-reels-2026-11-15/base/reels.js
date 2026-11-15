// REELS — roteiro para gravar, no padrao da skill reels-neia.
// O app entrega roteiro, texto de tela, direcao de camera, legenda e a capa. Nao gera video.

const DURACOES = {
  30: {
    nome: '30 segundos',
    resumo: 'gancho mais uma ideia central completa',
    estrutura: `[0-3s] GANCHO: busto, camera frontal. A primeira frase.
[3-25s] DESENVOLVIMENTO: uma ideia central, com no maximo um exemplo ou analogia. Um ponto bem desenvolvido, nunca tres pontos.
[25-30s] CTA: a acao especifica, ou uma frase de fechamento que gruda.`,
    blocos: 3,
  },
  60: {
    nome: '60 segundos',
    resumo: 'gancho, desenvolvimento e CTA',
    estrutura: `[0-3s] GANCHO: busto, camera frontal. A primeira frase.
[3-15s] CONTEXTO: nomeia a situacao que a pessoa vive, para ela se reconhecer.
[15-40s] DESENVOLVIMENTO: o mecanismo, o como, a distincao que muda a leitura. Aqui cabe um exemplo concreto.
[40-52s] CONSEQUENCIA: o que muda quando ela faz diferente.
[52-60s] CTA: a acao especifica.`,
    blocos: 5,
  },
  90: {
    nome: '90 segundos',
    resumo: 'o assunto inteiro, com exemplo e aplicacao',
    estrutura: `[0-3s] GANCHO: busto, camera frontal. A primeira frase.
[3-15s] CONTEXTO: nomeia a situacao que a pessoa vive, com detalhe suficiente para ela se ver ali.
[15-40s] O ERRO DE LEITURA: por que o caminho obvio nao resolve. Aqui mora a distincao que muda tudo.
[40-65s] O MECANISMO: o como, passo a passo, com um exemplo concreto e aplicavel.
[65-80s] CONSEQUENCIA: o que muda no negocio dela quando faz diferente. Pode usar um caso real das provas.
[80-90s] CTA: a acao especifica, sem pressa, com a frase que fecha.

Noventa segundos e muito tempo de atencao: so use quando o assunto realmente exige. Se a ideia couber em 60, ela fica melhor em 60. Nunca encha linguica para chegar no tempo.`,
    blocos: 6,
  },
};

const GANCHOS = [
  { id: 'contradicao', nome: 'Contradição',
    como: 'vai contra o que o mercado diz',
    exemplo: 'Você não precisa postar todo dia.' },
  { id: 'dor', nome: 'Nomeação de dor',
    como: 'chama pelo nome quem sente aquilo',
    exemplo: 'Se você sabe o que fazer mas não consegue fazer...' },
  { id: 'afirmacao', nome: 'Afirmação provocadora',
    como: 'uma posição que cria tensão',
    exemplo: '80% do resultado é quem você é. 20% é a estratégia.' },
  { id: 'pergunta', nome: 'Pergunta cirúrgica',
    como: 'faz a pessoa se reconhecer',
    exemplo: 'Qual é o teto que o seu negócio não consegue ultrapassar?' },
  { id: 'revelacao', nome: 'Promessa de revelação',
    como: 'cria curiosidade sobre o que vem',
    exemplo: 'Existe uma razão para o seu faturamento oscilar todo mês.' },
];

const CTAS = ['salvar', 'comentar uma palavra', 'clicar no link da bio', 'mandar DM', 'nenhum, só absorver'];

// O que nunca entra num roteiro dela
const PROIBIDO = `- "Você sabia que..." como abertura
- Lista longa de benefícios
- "Me segue para mais conteúdo" como único CTA
- Promessa que não pode ser cumprida em 60 segundos
- Linguagem de guru ou hype
- Travessão em qualquer texto`;

function bloco(duracao) {
  const d = DURACOES[duracao] || DURACOES[30];
  return `# O QUE E UM REELS AQUI

O Reel não é o conteúdo. É a porta. Quem para no seu vídeo pela primeira vez não sabe se você existe, e você tem 2 segundos para mudar isso.

Este roteiro tem ${d.nome} (${d.resumo}).

## ESTRUTURA DESTA DURAÇÃO
${d.estrutura}

## O QUE NUNCA ENTRA
${PROIBIDO}

## COMO ESCREVER A FALA
Cada palavra precisa poder ser dita em voz alta sem soar artificial. Escreva como ela fala, não como um assistente escreve. Frase curta, respiração natural, sem locução de comercial.

## TEXTO DE TELA
É o que aparece escrito sobre o vídeo, não a transcrição da fala. Poucas palavras, que reforçam ou cortam. No gancho, o texto de tela costuma repetir a frase mais forte.

## DIREÇÃO DE CÂMERA
Enquadramento, movimento e energia. Concreto e executável por ela sozinha, com o celular.`;
}

function lista() {
  return {
    duracoes: Object.entries(DURACOES).map(([id, d]) => ({ id: Number(id), nome: d.nome, resumo: d.resumo })),
    ganchos: GANCHOS,
    ctas: CTAS,
  };
}

module.exports = { DURACOES, GANCHOS, CTAS, bloco, lista };
