// ESTRATEGIA DO CONTEUDO: o segundo eixo.
// O layout diz COMO o texto se organiza. Isto diz PARA QUEM fala e PARA ONDE leva.
// Fontes (15/11/2026): Matriz de Comunicacao 2Life §8 (niveis), §14 (ATA), §15 (CTA);
// Livro de Receitas v2.4 §3 (ficha), §12 (receitas por ATA), §14 (microacoes), §15 (banco de CTA).
// Se uma destas fontes mudar, este ficheiro muda com ela. Nao acrescentar regras que nao estejam la.

const FUNCOES = {
  atracao: {
    nome: 'Atração',
    resumo: 'fazer novas pessoas parar, reconhecer-se e entrar no universo 2Life',
    pergunta: 'Quero que a pessoa pense "isto acontece comigo"?',
    prioriza: 'situações concretas, contradições, frases internas, sinais do piloto automático, desejos reconhecíveis, linguagem simples e CTA leve',
    evita: 'excesso de explicação, jargão, apresentação longa do método ou convite prematuro',
    movimentos: 'observar, guardar, partilhar ou responder',
  },
  tecnico: {
    nome: 'Técnico',
    resumo: 'mostrar profundidade e ensinar um ponto útil e específico',
    pergunta: 'Quero que a pessoa pense "agora compreendo"?',
    prioriza: 'uma distinção específica, mecanismo psicológico, causa e consequência, exemplo aplicado, pergunta ou microação e CTA de aprofundamento',
    evita: 'entregar uma solução completa ou criar uma aula enciclopédica',
    movimentos: 'refletir, experimentar, aprofundar ou fazer diagnóstico',
  },
  autoridade: {
    nome: 'Autoridade',
    resumo: 'mostrar como a Simone pensa e trabalha',
    pergunta: 'Quero que a pessoa pense "é com esta profissional que quero trabalhar"?',
    prioriza: 'critérios de leitura, opinião fundamentada, método, processo, casos, evidências, decisões profissionais e convite coerente',
    evita: 'mostrar apenas aquilo que a Simone sabe: autoridade mostra como ela pensa',
    movimentos: 'conhecer o método, enviar mensagem, marcar conversa ou entrar',
  },
};

const NIVEIS = {
  1: {
    curto: 'sente desconforto',
    estado: 'Sente desconforto, mas não reconhece o padrão.',
    funcao: 'Trabalhar cenas, sintomas, perguntas de reconhecimento e pouco vocabulário técnico.',
    objetivo: 'isto acontece comigo',
  },
  2: {
    curto: 'reconhece a repetição',
    estado: 'Reconhece a repetição.',
    funcao: 'Nomear o piloto automático, a função protetora e o custo.',
    objetivo: 'isto é um padrão, não apenas quem sou',
  },
  3: {
    curto: 'compreende, não transforma',
    estado: 'Compreende, mas não transforma.',
    funcao: 'Trabalhar insight sem ação, crenças, identidade, desconforto, repetição e evidência.',
    objetivo: 'não me falta informação; falta transformar consciência em experiência',
  },
  4: {
    curto: 'disponível para agir',
    estado: 'Está disponível para escolher e agir.',
    funcao: 'Trabalhar microações, postura interna, dúvida, histórias de transformação e estrutura do método.',
    objetivo: 'estou disponível para fazer este trabalho',
  },
  5: {
    curto: 'preparada para entrar',
    estado: 'Está preparada para entrar num processo.',
    funcao: 'Comunicar método, fases, compromisso, resultados esperados, evidências, objeções e convite.',
    objetivo: 'este é o processo de que preciso',
  },
};

// Movimentos do CTA (Matriz §15), com os exemplos do Livro (§15; a microação vem do §14).
const MOVIMENTOS = {
  'Observação': {
    define: 'reconhecer o padrão sem exigir exposição',
    exemplos: ['Repara em que situações este padrão decide primeiro.', 'Leva esta pergunta contigo hoje.'],
  },
  'Microação': {
    define: 'transformar o conteúdo numa pequena experiência',
    exemplos: ['fazer uma pausa antes de responder', 'identificar o medo que tenta decidir', 'escrever o que quer e o que não quer', 'pedir ajuda numa situação concreta'],
    nota: 'A microação é pequena, observável e coerente com a mensagem. Não se insere por obrigação em conteúdos contemplativos, emocionais ou de bastidores.',
  },
  'Interação': {
    define: 'responder, votar, comentar ou partilhar',
    exemplos: ['Reconheces este movimento em ti?', 'Qual destas situações te acontece com mais frequência?'],
  },
  'Aprofundamento': {
    define: 'guardar, ver outro conteúdo ou continuar uma sequência',
    exemplos: ['Guarda para voltares a esta pergunta.', 'Continua no conteúdo seguinte desta série.'],
  },
  'Diagnóstico': {
    define: 'identificar os padrões que condicionam escolhas',
    exemplos: ['Descobre que padrões estão a condicionar as tuas escolhas.', 'Faz o diagnóstico e identifica o teu ponto de partida.'],
  },
  'Conversa': {
    define: 'perceber se o processo faz sentido e iniciar uma relação comercial',
    exemplos: ['Se queres perceber se este processo faz sentido para ti, envia-me mensagem.', 'Marca uma Conversa 2Life.'],
  },
  'Entrada': {
    define: 'candidatar-se, inscrever-se, reservar lugar ou iniciar o 2Life Individual',
    exemplos: ['Candidata-te ao 2Life.', 'Reserva o teu lugar.', 'Inicia o teu processo.'],
  },
};

// Sugestoes do campo "Proximo movimento" (o valor fica gravado tal como aparece).
const AVANCOS = Object.entries(MOVIMENTOS).map(([nome, m]) => `${nome}: ${m.define}`);

const REGRA_CTA = 'O CTA não deve pedir um movimento maior do que aquele para o qual o conteúdo preparou a pessoa.';

function movimento(avanco) {
  if (!avanco) return null;
  const nome = String(avanco).split(':')[0].trim();
  return MOVIMENTOS[nome] ? { nome, ...MOVIMENTOS[nome] } : null;
}

// O bloco que entra no prompt (ficha de decisao do Livro §3)
function bloco({ funcao, nivel, avanco }) {
  // Sem marcacao (a Simone so escreveu o tema): a IA escolhe a ficha pela Matriz, em vez de ficar sem estrategia.
  if (!funcao && !nivel && !avanco) return SEM_MARCACAO();
  const f = FUNCOES[funcao];
  const n = NIVEIS[nivel];
  const m = movimento(avanco);
  const linhas = ['# PARA QUEM ESTE CONTEÚDO FALA E PARA ONDE LEVA', '',
    'Ficha de decisão deste conteúdo (Livro de Receitas §3):', ''];

  if (f) {
    linhas.push(`**Função ATA predominante: ${f.nome}** (${f.resumo}).`,
      `Pergunta de resultado: ${f.pergunta}`,
      `Prioriza ${f.prioriza}. Evita ${f.evita}.`,
      `Movimentos coerentes com esta função: ${f.movimentos}.`, '');
  }
  if (n) {
    linhas.push(`**Nível de consciência ${nivel}:** ${n.estado}`,
      `${n.funcao} Objetivo: a pessoa pensar "${n.objetivo}".`, '');
  }
  if (m) {
    linhas.push(`**Próximo movimento (CTA): ${m.nome}**, ${m.define}.`,
      `Exemplos do Banco de CTA: ${m.exemplos.map(e => `"${e}"`).join('; ')}.`);
    if (m.nota) linhas.push(m.nota);
    linhas.push('');
  } else if (avanco) {
    linhas.push(`**Próximo movimento pretendido:** ${avanco}.`, '');
  }

  linhas.push('Como ler esta ficha:',
    '- O ATA diz a função estratégica da peça. Não substitui o nível de consciência nem a linguagem.',
    '- Uma peça pode cumprir várias funções, mas tem uma função predominante.',
    `- ${REGRA_CTA} Um só CTA, subtil e proporcional.`,
    '- Nenhum nível justifica promessa, garantia de resultado ou pressão.');
  return linhas.join('\n');
}

// Quando a ficha nao foi preenchida (15/11/2026: fluxo "so tema + formato")
function SEM_MARCACAO() {
  const funcoes = Object.values(FUNCOES).map(f => `- ${f.nome}: ${f.resumo}. Pergunta de resultado: ${f.pergunta} Movimentos coerentes: ${f.movimentos}.`).join('\n');
  const niveis = Object.entries(NIVEIS).map(([id, n]) => `- Nível ${id}: ${n.estado} Objetivo: "${n.objetivo}".`).join('\n');
  return `# PARA QUEM ESTE CONTEÚDO FALA E PARA ONDE LEVA

A ficha de decisão não foi preenchida (Livro de Receitas §3). Antes de escrever, escolhe tu, a partir do tema:
1. a função ATA predominante (Matriz de Comunicação §14):
${funcoes}
2. o nível de consciência com quem falas (Matriz §8):
${niveis}
3. um só próximo movimento, coerente com a função (Matriz §15, "Relação ATA e CTA"): Atração pede observar, guardar, partilhar ou responder; Técnico pede refletir, experimentar, aprofundar ou fazer diagnóstico; só a Autoridade pede conhecer o método, enviar mensagem, marcar conversa ou entrar. Como a Simone não marcou a função, o CTA é leve: Observação, Microação, Interação ou Aprofundamento. Nada de "envia-me mensagem", "manda-me mensagem", "marca uma Conversa" nem convite para entrar: esses ficam para quando ela marcar Autoridade.

${REGRA_CTA} Um só CTA, subtil e proporcional. Nenhum nível justifica promessa, garantia de resultado ou pressão.`;
}

// Lembrete no fim das instrucoes do carrossel, antes da ultima conferencia
function lembrete(marcacao) {
  if (!marcacao || !marcacao.nivel) return '';
  const n = NIVEIS[marcacao.nivel] || {};
  const f = FUNCOES[marcacao.funcao];
  const niveis = Object.entries(NIVEIS)
    .map(([id, x]) => `- Nível ${id} (${x.curto}): ${x.funcao} Objetivo: "${x.objetivo}".`).join('\n');
  return `ANTES DE ESCREVER, RELÊ A MARCAÇÃO: este conteúdo fala com quem está no NÍVEL ${marcacao.nivel} (${n.curto || ''})${f ? `, com função ATA ${f.nome}` : ''}.
O que muda na prática por nível (Matriz de Comunicação §8):
${niveis}
${REGRA_CTA}
Se o arco narrativo do layout não comportar este nível, adapta o arco: a marcação manda mais do que o roteiro padrão.`;
}

function lista() {
  return {
    funcoes: Object.entries(FUNCOES).map(([id, f]) => ({ id, ...f })),
    niveis: Object.entries(NIVEIS).map(([id, n]) => ({ id: Number(id), ...n })),
    avancos: AVANCOS,
  };
}

module.exports = { FUNCOES, NIVEIS, MOVIMENTOS, AVANCOS, REGRA_CTA, bloco, lembrete, lista };
