// REELS: roteiro para gravar, adaptado ao Metodo 2Life.
// Fonte: Livro de Receitas v2.4, §4 (estrutura narrativa), §6 (abertura dos reels), §13 (hooks) e §16 (legendas).
// Revisto a 15/11/2026, segunda ronda: duracao realista, publico de homens e mulheres, sem numeros nem
// experiencia em sessao inventados, frases protegidas literais, legenda que aprofunda sem repetir a fala.
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
const CTAS = ['salvar', 'comentar uma palavra', 'clicar no link da bio', 'mandar DM', 'nenhum, só absorver'];

const PROIBIDO = `- Abrir com "Sabias que…"
- Explicar antes de a pessoa se reconhecer numa situação
- Abrir uma curiosidade que o vídeo deixa sem resposta
- Lista longa de benefícios
- Promessa que o vídeo não sustenta
- Linguagem de guru, motivacional ou de hype
- Travessões em qualquer texto
- "Algo", "talvez" e "às vezes": nomeia a coisa concreta (em vez de "fizeste algo errado", "disseste o que não devias")
- Números, percentagens ou frequências ("todas as semanas", "muitas pessoas que acompanho") que não estejam no tema, na ideia ou no material marcado
- Afirmações sobre o que a Simone ouve ou vê em sessão, para além do molde da R3`;

// Ritmo de fala calmo em portugues de Portugal: cerca de 2,5 palavras por segundo
const PALAVRAS_POR_SEGUNDO = 2.5;

// Frases protegidas (Hierarquia §7): se entrarem, entram literais
const PROTEGIDAS = [
  'Toda a dificuldade em expandir revela um afastamento da essência.',
  'A confiança constrói-se na raiz.',
  'O 2Life transforma aquilo que já sabes sobre ti na confiança para te posicionares, agires e expandires a partir de quem és.',
  'O automático reage. A essência escolhe. A ação cria evidência. A repetição transforma a identidade.',
];

// Livro de Receitas v2.4, §16 "Legendas", aplicado aos reels
const REGRA_LEGENDA = `## LEGENDA (Livro de Receitas §16)
A legenda aprofunda a ideia do vídeo. Em nenhum parágrafo repete ou parafraseia a fala: nem a abertura, nem outra frase dita no vídeo. Só a última linha repete o CTA.
1. Primeira linha: funciona sozinha no feed, antes do "mais" (cerca de 125 caracteres). Abre com OUTRA situação reconhecível, ligada ao mesmo mecanismo, ou com a frase de viragem dita por outras palavras. Nunca com a frase da abertura.
2. Desenvolvimento: parágrafos de uma a três linhas, pela ordem cena, automatismo, significado e nova possibilidade. Acrescenta o que o vídeo não teve tempo de dizer. O padrão aparece como proteção, sem culpabilizar.
3. Pergunta ou microação: uma só, nas peças técnicas. Não se força nas peças de reconhecimento ou emocionais.
4. Última linha: um só CTA, o mesmo do vídeo.
Extensão: 6 a 10 linhas. Sem hashtags. "Sessão", nunca "consulta". A assinatura "A confiança constrói-se na raiz." só entra se ainda não estiver no vídeo.`;

function bloco(duracao) {
  const d = DURACOES[duracao] || DURACOES[30];
  return `# O QUE É UM REEL AQUI

O reel é a porta. Quem para no vídeo pela primeira vez decide em dois segundos se fica.

Este roteiro tem ${d.nome} (${d.resumo}).

## PRINCÍPIO
Primeiro, a pessoa vê-se. Depois compreende. Antes de qualquer explicação, a pessoa reconhece uma situação: uma cena, uma frase interna, uma escolha, uma sensação no corpo ou uma consequência visível.

## ESTRUTURA DESTA DURAÇÃO
${d.estrutura}
Usa exatamente ${d.blocos} blocos, com estes rótulos e por esta ordem. Não acrescentes blocos de outra duração.

## DURAÇÃO REALISTA
A fala é dita a ritmo calmo: cerca de ${PALAVRAS_POR_SEGUNDO} palavras por segundo. A fala de cada bloco cabe no tempo do bloco (3 segundos são cerca de 8 palavras; 12 segundos, cerca de 30; 25 segundos, cerca de 60). Em todo o vídeo, no máximo ${Math.round(Number(duracao in DURACOES ? duracao : 30) * PALAVRAS_POR_SEGUNDO)} palavras faladas. Se a abertura precisar de mais tempo, ajusta os tempos dos blocos para que somem a duração do vídeo.

## PÚBLICO
O público são pessoas funcionais e competentes, homens e mulheres. Escreve de forma que ambos se reconheçam: quando falas com a pessoa ("tu"), evita adjetivos só no feminino ou só no masculino ("estás cansada", "és obrigada"); prefere formas sem género ("não tens de", "sem descanso"). Vale também para a voz interior da pessoa e para o texto no ecrã ("ainda consigo sozinha" → "ainda consigo sem ajuda"). Nunca uses barras ("o/a").

## FRASES PROTEGIDAS
Se usares alguma destas frases, usa-a literalmente, sem mudar uma palavra:
${PROTEGIDAS.map(f => `- "${f}"`).join('\n')}
${Number(duracao) >= 60
    ? 'O mecanismo do método usa-se sempre na formulação integral, com as quatro frases. A forma curta "O automático reage. A essência escolhe." é a mensagem-mãe da Matriz de Comunicação e também se escreve literal, mas não substitui o mecanismo.'
    : 'Num reel de 30 segundos não cabe o mecanismo integral: não o uses. Se quiseres, usa só a mensagem-mãe da Matriz de Comunicação, literal: "O automático reage. A essência escolhe."'}

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
- "frase": a frase falada de abertura, completa até ao fim do molde, com a frase da pessoa entre aspas e sem reticências: Quando alguém me diz "[frase]", não olho apenas para [problema aparente]. Sem dizer quantas vezes a ouves; no máximo 22 palavras (cerca de nove segundos de fala)
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
- "frase": a frase falada de abertura, até 110 caracteres (cerca de 8 a 14 palavras, três a cinco segundos de fala). Linguagem concreta: nada de "algo", "talvez" ou "às vezes".
- "tela": o texto no ecrã nesse momento, até 45 caracteres
- "situacao": a situação reconhecível que vem logo a seguir (no problema concreto, a própria situação)
- "resposta": só na curiosidade, o que o vídeo revela
- "porque": uma linha a explicar porque funciona para este tema

Depois, em "recomendada", indica o número (0, 1 ou 2) da abertura mais adequada ao tema e à marcação, e em "razao" explica a escolha numa frase.`;
}

// Regras para o roteiro, conforme a abertura escolhida
function regrasRoteiro(gancho) {
  const g = gancho || {};
  const linhas = ['O primeiro bloco usa exatamente a fala da abertura escolhida.', REGRA_LEGENDA,
    'A capa e o primeiro comentário seguem as mesmas regras de linguagem: sem "algo", "talvez" ou "às vezes", sem números ou frequências que não foram dados, sem afirmações sobre o que acontece em sessão.',
    'Um só CTA editorial: o do último bloco, repetido na última linha da legenda. O primeiro comentário é uma pergunta ou uma frase para a conversa, nunca outro CTA (nada de "guarda", "partilha", "envia", "marca", "segue" ou "comenta").'];
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
Usa sempre "sessão", nunca "consulta". Sem casos reais, sem dados clínicos, sem nada que identifique alguém.
O bloco do mecanismo começa pelo passo 3, dito pela Simone: "Procuro perceber…" (o que procura por baixo do comportamento), e só depois o critério ou a distinção.
A frase de sessão entra só pelo molde ("Quando alguém me diz…"). Não digas quantas vezes a ouves, há quanto tempo, nem a quantas pessoas: nem na fala, nem na capa, nem na legenda.`);
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
