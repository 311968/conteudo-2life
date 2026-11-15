// REELS: roteiro para gravar, adaptado ao Metodo 2Life.
// Fonte: Livro de Receitas v2.3, §4 (estrutura narrativa), §6 (abertura dos reels) e §13 (hooks).
// A app entrega roteiro, texto no ecra, direcao de camara, legenda e capa. Nao gera video.
// Proposta de 15/11/2026, ainda nao aplicada em producao.

const DURACOES = {
  30: {
    nome: '30 segundos',
    resumo: 'abertura e uma ideia central completa',
    estrutura: `[0-3s] ABERTURA: plano de peito, câmara frontal. A primeira frase.
[3-25s] DESENVOLVIMENTO: uma ideia central, com no máximo um exemplo. Um ponto bem desenvolvido, nunca três.
[25-30s] FECHO E CTA: a frase que fica e um só CTA, proporcional ao movimento criado.`,
    blocos: 3,
  },
  60: {
    nome: '60 segundos',
    resumo: 'abertura, situação, mecanismo, possibilidade e CTA',
    estrutura: `[0-3s] ABERTURA: plano de peito, câmara frontal. A primeira frase.
[3-15s] SITUAÇÃO: a cena que a pessoa reconhece. Se a abertura já for a situação, aprofunda-a.
[15-40s] MECANISMO: a distinção que muda a leitura. O padrão como proteção, sem culpabilizar. Um exemplo concreto.
[40-52s] NOVA POSSIBILIDADE: como seria escolher a partir de outro lugar interno.
[52-60s] CTA: um só, proporcional ao movimento criado.`,
    blocos: 5,
  },
  90: {
    nome: '90 segundos',
    resumo: 'o tema inteiro, com exemplo e microação',
    estrutura: `[0-3s] ABERTURA: plano de peito, câmara frontal. A primeira frase.
[3-15s] SITUAÇÃO: a cena que a pessoa reconhece, com detalhe suficiente para se ver ali.
[15-40s] A LEITURA HABITUAL: porque é que o caminho óbvio não resolve. É aqui que está a distinção.
[40-65s] O MECANISMO: o que sustenta o padrão, com um exemplo concreto.
[65-80s] NOVA POSSIBILIDADE E MICROAÇÃO: uma escolha pequena, observável, coerente com a mensagem.
[80-90s] CTA: um só, sem pressa, com a frase que fecha.

Noventa segundos é muito tempo de atenção: usar só quando o tema o exige. Se a ideia couber em 60, fica melhor em 60.`,
    blocos: 6,
  },
};

// Livro de Receitas v2.3, §6 "Abertura dos reels"
const ABERTURAS = [
  {
    id: 'problema', nome: 'Problema concreto',
    quando: 'quando a situação, por si só, já gera identificação',
    regra: 'A primeira frase é a própria situação: uma cena, uma frase interna, uma escolha ou uma consequência visível.',
    exemplo: 'Dizes que sim e só depois percebes que querias dizer não.',
  },
  {
    id: 'contraintuitiva', nome: 'Afirmação contraintuitiva',
    quando: 'quando existe uma crença comum a contestar',
    regra: 'A frase seguinte traz uma situação reconhecível.',
    exemplo: 'Procuras mais clareza quando aquilo que te falta não é clareza.',
  },
  {
    id: 'curiosidade', nome: 'Curiosidade',
    quando: 'quando o tema é um mecanismo que a pessoa vive sem o ver',
    regra: 'A frase seguinte traz uma situação reconhecível. O vídeo entrega a resposta antes do CTA. A curiosidade incide sobre a experiência da pessoa.',
    exemplo: 'Entre o que te acontece e o que sentes, há uma frase que dizes a ti. Quase nunca a ouves.',
  },
];

// Receita R3, Autoridade clinica: abertura propria
const ABERTURA_R3 = {
  id: 'sessao', nome: 'Frase de sessão (R3)',
  quando: 'reel de autoridade clínica',
  regra: 'Abre com uma frase que surge em sessão, anonimizada, sem dados que identifiquem a pessoa: Quando alguém me diz "[frase]"…',
  exemplo: 'Quando alguém me diz "eu não consigo dizer não", não olho apenas para a dificuldade em dizer não.',
};

const RECEITAS = [
  { id: '', nome: 'Escolher pela abertura' },
  { id: 'r3', nome: 'R3 · Autoridade clínica' },
];

// Lista de sugestoes do campo CTA. Fase seguinte: substituir pelo Banco de CTA do Livro §15.
const CTAS = [
  'Repara em que situações este padrão decide primeiro.',
  'Leva esta pergunta contigo hoje.',
  'Reconheces este movimento em ti?',
  'Qual destas situações te acontece com mais frequência?',
  'Guarda para voltares a esta pergunta.',
  'Continua no conteúdo seguinte desta série.',
  'Descobre que padrões estão a condicionar as tuas escolhas.',
  'Faz o diagnóstico e identifica o teu ponto de partida.',
  'Se queres perceber se este processo faz sentido para ti, envia-me mensagem.',
  'Marca uma Conversa 2Life.',
  'Candidata-te ao 2Life.',
  'Reserva o teu lugar.',
  'Inicia o teu processo.',
]; // Livro de Receitas v2.4 §15

const PROIBIDO = `- Abrir com "Sabias que…"
- Explicar antes de a pessoa se reconhecer numa situação
- Abrir uma curiosidade que o vídeo deixa sem resposta
- Lista longa de benefícios
- Promessa que o vídeo não sustenta
- Linguagem de guru, motivacional ou de hype
- Travessões em qualquer texto`;

function bloco(duracao) {
  const d = DURACOES[duracao] || DURACOES[30];
  return `# O QUE É UM REEL AQUI

O reel é a porta. Quem para no vídeo pela primeira vez decide em dois segundos se fica.

Este roteiro tem ${d.nome} (${d.resumo}).

## PRINCÍPIO
Primeiro, a pessoa vê-se. Depois compreende. Antes de qualquer explicação, a pessoa reconhece uma situação: uma cena, uma frase interna, uma escolha, uma sensação no corpo ou uma consequência visível.

## ESTRUTURA DESTA DURAÇÃO
${d.estrutura}

## O QUE NUNCA ENTRA
${PROIBIDO}

## COMO ESCREVER A FALA
Escreve sempre em português de Portugal e trata a pessoa por "tu". Cada frase tem de poder ser dita em voz alta sem soar artificial. Frase curta, respiração natural, sem tom de anúncio.

## TEXTO NO ECRÃ
É o que aparece escrito sobre o vídeo, não a transcrição da fala. Poucas palavras, que reforçam ou cortam. A frase da abertura entra logo no início, fica visível no feed e sai ao fim de poucos segundos; os textos seguintes acompanham cada parte, nunca sobrepostos.

## DIREÇÃO DE CÂMARA
Enquadramento, movimento e energia. Concreto e executável pela Simone sozinha, com o telemóvel.`;
}

// Instrucao da tarefa de aberturas
function tarefaAberturas(receita) {
  if (receita === 'r3') {
    return `Este reel segue a Receita R3, Autoridade clínica, que tem abertura própria.

Escreve TRÊS variações da abertura R3, todas do tipo "sessao":
- ${ABERTURA_R3.regra}
- Exemplo: "${ABERTURA_R3.exemplo}"
- A frase entre aspas é uma frase que a pessoa diz, reconhecível para quem vê. Nunca um caso real identificável, nunca um dado clínico.

Cada abertura leva:
- "tipo": "sessao"
- "frase": a frase falada de abertura, até 140 caracteres
- "tela": o texto no ecrã nesse momento, até 45 caracteres
- "situacao": o que é visível nessa frase (o problema aparente), numa linha
- "porque": uma linha a explicar porque funciona para este tema

Depois, em "recomendada", indica o número (0, 1 ou 2) da variação que melhor serve o tema, e em "razao" explica a escolha numa frase.`;
  }
  return `Escreve TRÊS aberturas para este tema, uma de cada tipo, por esta ordem:

${ABERTURAS.map(a => `- ${a.nome} ("${a.id}"): usar ${a.quando}. ${a.regra} Exemplo: "${a.exemplo}"`).join('\n')}

Regras:
- Quando a situação já gera identificação, a abertura mais forte é o problema concreto.
- A afirmação contraintuitiva e a curiosidade não substituem a situação: trazem-na logo a seguir. Escreve essa situação no campo "situacao".
- Na curiosidade, escreve em "resposta" aquilo que o vídeo vai revelar. O vídeo entrega essa resposta antes do CTA.
- As três são portas diferentes, não três versões da mesma frase.

Cada abertura leva:
- "tipo": o id do tipo ("problema", "contraintuitiva" ou "curiosidade")
- "frase": a frase falada de abertura, até 140 caracteres. Tem de caber em três segundos de fala.
- "tela": o texto no ecrã nesse momento, até 45 caracteres
- "situacao": a situação reconhecível que vem logo a seguir (no problema concreto, a própria situação)
- "resposta": só na curiosidade, o que o vídeo revela
- "porque": uma linha a explicar porque funciona para este tema

Depois, em "recomendada", indica o número (0, 1 ou 2) da abertura mais adequada ao tema e à marcação, e em "razao" explica a escolha numa frase.`;
}

// Regras para o roteiro, conforme a abertura escolhida
function regrasRoteiro(gancho) {
  const g = gancho || {};
  const linhas = ['O primeiro bloco usa exatamente a fala da abertura escolhida.'];
  if (g.tipo === 'contraintuitiva' || g.tipo === 'curiosidade') {
    linhas.push(`O segundo bloco traz logo a situação reconhecível${g.situacao ? `: ${g.situacao}` : ''}. Nada de explicação antes dela.`);
  }
  if (g.tipo === 'curiosidade') {
    linhas.push(`O vídeo entrega a resposta${g.resposta ? ` (${g.resposta})` : ''} num bloco próprio, antes do CTA. A pergunta aberta na abertura não pode ficar sem resposta.`);
  }
  if (g.tipo === 'sessao') {
    linhas.push(`Segue a Receita R3, Autoridade clínica, por esta ordem:
1. A frase que surge em sessão (a abertura).
2. Aquilo que é visível.
3. Aquilo que a Simone procura por baixo do comportamento.
4. O critério clínico ou a distinção.
5. A possibilidade de transformação.
Molde: Quando alguém me diz "[frase]", eu não olho apenas para [problema aparente]. Procuro perceber [pergunta ou mecanismo]. Porque [leitura clínica]. É aqui que começa a diferença entre compreender e transformar.
Usa sempre "sessão", nunca "consulta". Sem casos reais, sem dados clínicos, sem nada que identifique alguém.`);
  }
  return linhas.join('\n');
}

function lista() {
  return {
    duracoes: Object.entries(DURACOES).map(([id, d]) => ({ id: Number(id), nome: d.nome, resumo: d.resumo })),
    ganchos: [...ABERTURAS, ABERTURA_R3],
    receitas: RECEITAS,
    ctas: CTAS,
  };
}

// GANCHOS mantem o nome antigo para o resto da app continuar a funcionar
const GANCHOS = [...ABERTURAS, ABERTURA_R3];

module.exports = { DURACOES, ABERTURAS, ABERTURA_R3, RECEITAS, GANCHOS, CTAS, bloco, tarefaAberturas, regrasRoteiro, lista };
