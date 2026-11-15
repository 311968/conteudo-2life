// LIVE / YT — roteiro em topicos para live ou video de YouTube.
// Live nao se le, se conduz. Por isso o roteiro e em bullets, nao em texto corrido.

const DURACOES = {
  10: {
    nome: '10 minutos',
    resumo: 'um ponto só, direto ao osso',
    estrutura: `[0-1min] ABERTURA
Cumprimenta, diz o que vai entregar e POR QUE vale ficar. Rapido: em dez minutos nao ha tempo de aquecimento longo.

[1-2min] O PROBLEMA
Nomeia a situacao que a pessoa vive, em poucas frases. Primeira interacao com o chat.

[2-5min] BLOCO 1
O ponto que abre a cabeca. A distincao que muda a leitura.

[5-8min] BLOCO 2
O pratico: o que ela faz na segunda-feira de manha.

[8-10min] FECHAMENTO E CONVITE
Retoma os dois pontos em uma frase cada e faz o convite.`,
  },
  20: {
    nome: '20 minutos',
    resumo: 'dois pontos e espaço para o chat',
    estrutura: `[0-2min] ABERTURA
Cumprimenta, diz o que vai entregar nos proximos vinte minutos e POR QUE vale ficar ate o fim.

[2-4min] O PROBLEMA
Nomeia a situacao com detalhe suficiente para ela se reconhecer. Primeira interacao com o chat, enquanto mais gente entra.

[4-9min] BLOCO 1
O primeiro ponto. O mais facil de aceitar, o que abre a cabeca.

[9-14min] BLOCO 2
O segundo ponto. Aqui mora a distincao que muda tudo.

[14-17min] BLOCO 3
O pratico: o que ela faz na segunda-feira de manha.

[17-20min] FECHAMENTO E CONVITE
Retoma os tres pontos em uma frase cada, responde uma ou duas perguntas do chat e faz o convite.`,
  },
  30: {
    nome: '30 minutos',
    resumo: 'três pontos, perguntas e convite',
    estrutura: `[0-3min] ABERTURA
Cumprimenta, diz o que vai entregar nos proximos 30 minutos e POR QUE vale ficar ate o fim.
Ainda nao entrega conteudo: cria a razao de ficar.

[3-6min] O PROBLEMA
Nomeia a situacao que a pessoa vive, com detalhe suficiente para ela se reconhecer.
Aqui entra a primeira interacao com o chat, enquanto mais gente vai entrando.

[6-13min] BLOCO 1
O primeiro ponto. O mais facil de aceitar, o que abre a cabeca.

[13-20min] BLOCO 2
O segundo ponto. Aqui mora a distincao que muda a leitura das coisas.

[20-25min] BLOCO 3
O terceiro ponto, o mais pratico: o que ela faz na segunda-feira de manha.

[25-28min] PERGUNTAS
Responde o chat. Deixa espaco para duas ou tres perguntas previstas.

[28-30min] FECHAMENTO E CONVITE
Retoma os tres pontos em uma frase cada e faz o convite.`,
  },
};

const REGRAS = `# COMO ESCREVER UM ROTEIRO DE LIVE

Live nao se le. Se conduz. O roteiro e um MAPA para ela olhar de canto de olho, nao um texto para recitar.

Por isso, cada bloco vem em TOPICOS CURTOS. Cada topico e uma frase de no maximo 90 caracteres, que ela bate o olho e sabe o que falar. Nunca escreva paragrafos.

Excecao: a frase de abertura do bloco e a frase de virada podem vir escritas por inteiro, porque sao as que precisam sair redondas.

# RETENCAO
Numa live, gente entra o tempo todo e gente sai o tempo todo. Num video de YouTube, a pessoa abandona no primeiro trecho sem graca. Por isso cada bloco leva:
- "retencao": uma frase que segura quem esta pensando em sair, ou que recoloca quem acabou de chegar. Exemplo: "daqui a pouco eu mostro o erro que quase todo mundo comete nessa hora".
- "interacao": uma pergunta ou comando para o chat. Serve para ela respirar, para o algoritmo e para a pessoa se comprometer.

# O QUE NUNCA ENTRA
- Texto corrido para ler
- Lista de beneficios
- Promessa que ela nao vai cumprir nos 30 minutos
- "Me segue" como unico convite
- Travessao em qualquer lugar`;

function bloco(duracao) {
  const d = DURACOES[duracao] || DURACOES[30];
  return `# O QUE VOCE ESTA ESCREVENDO AGORA

Um roteiro de LIVE ou video de YouTube de ${d.nome} (${d.resumo}).

## ESTRUTURA DOS ${duracao || 30} MINUTOS
${d.estrutura}

${REGRAS}`;
}

function lista() {
  return Object.entries(DURACOES).map(([id, d]) => ({ id: Number(id), nome: d.nome, resumo: d.resumo }));
}

module.exports = { DURACOES, REGRAS, bloco, lista };
