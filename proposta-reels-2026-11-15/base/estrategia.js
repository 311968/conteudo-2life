// ESTRATEGIA DO CONTEUDO — o segundo eixo.
// O layout diz COMO o texto se organiza. Isto diz PARA QUEM ele fala e PARA ONDE leva.
// Modelo do metodo: funcao principal -> nivel de consciencia -> avanco desejado.

const FUNCOES = {
  atracao: {
    nome: 'Atração',
    resumo: 'despertar percepção e alcançar quem ainda não te conhece',
  },
  conexao: {
    nome: 'Conexão',
    resumo: 'dar nome ao que ela vive, explicar caminhos e construir confiança',
  },
  venda: {
    nome: 'Venda',
    resumo: 'demonstrar o método, esclarecer dúvidas e facilitar a decisão',
  },
};

const NIVEIS = {
  1: {
    curto: 'não reconhece o problema',
    estado: 'Ainda não reconhece o problema. Acha normal o negócio depender dela para tudo.',
    funcao: 'Atração: despertar uma percepção.',
    exemplo: 'Se você se afastar por uma semana, o que continua funcionando na sua empresa?',
  },
  2: {
    curto: 'reconhece o problema',
    estado: 'Reconhece o problema. Está sobrecarregada e percebe que virou o limite do próprio negócio.',
    funcao: 'Atração e conexão: dar nome ao que ela vive e ajudá-la a compreender as causas.',
    exemplo: 'Quando todas as decisões passam por você, vender mais também pode significar trabalhar mais.',
  },
  3: {
    curto: 'busca solução',
    estado: 'Conhece possibilidades de solução. Considera processos, contratação, automação ou IA.',
    funcao: 'Conexão e construção de confiança: explicar caminhos e demonstrar aplicação.',
    exemplo: 'Como organizar o acompanhamento de propostas com apoio de IA.',
  },
  4: {
    curto: 'avalia o seu método',
    estado: 'Conhece a sua solução. Avalia se o seu método serve para o negócio dela.',
    funcao: 'Conexão e vendas: demonstrar seu método, diferenciais e evidências.',
    exemplo: 'Como trabalhamos modelo de negócio, processos e IA dentro da mentoria.',
  },
  5: {
    curto: 'decide se compra',
    estado: 'Conhece bem a oferta. Precisa decidir se compra e em quais condições.',
    funcao: 'Vendas: esclarecer dúvidas e facilitar a decisão.',
    exemplo: 'Para quem é a mentoria, o que está incluído, qual é o investimento e como entrar.',
  },
};

const AVANCOS = [
  'perceber que isso tem um custo',
  'dar nome ao que ela vive',
  'entender a causa, não o sintoma',
  'enxergar que existe caminho',
  'confiar que o método funciona',
  'querer saber como entrar',
  'decidir e dar o passo',
];

// O bloco que entra no prompt
function bloco({ funcao, nivel, avanco }) {
  if (!funcao && !nivel && !avanco) return '';
  const f = FUNCOES[funcao];
  const n = NIVEIS[nivel];

  return `# PARA QUEM ESTE CONTEÚDO FALA

Trabalhamos com cinco níveis de consciência da cliente. Este conteúdo foi marcado assim:

${f ? `**Função principal: ${f.nome}** (${f.resumo}).` : ''}
${n ? `**Nível de consciência: ${nivel}** — ${n.estado}
Função mais comum neste nível: ${n.funcao}
Exemplo de abordagem neste nível: "${n.exemplo}"` : ''}
${avanco ? `**Avanço desejado:** ao terminar de ler, ela precisa ${avanco}.` : ''}

Escreva PARA esse estado de consciência. Quem está no nível 1 ainda acha normal tudo passar pela mão dela: não adianta falar de método, precisa primeiro sentir o problema. Quem está no nível 4 já conhece o seu trabalho: não repita o diagnóstico básico, mostre o como e a evidência.

Três nuances que fazem diferença:
- O cruzamento é flexível. Um mesmo conteúdo pode atrair, conectar e estimular a compra ao mesmo tempo. A marcação diz a intenção principal, não uma camisa de força.
- Conhecer a autora e compreender o problema são coisas diferentes. A conexão acontece em qualquer nível, por identificação com a experiência dela, confiança na competência ou afinidade com a visão de negócio.
- Nenhum nível justifica promessa fácil ou pressão. Mesmo em conteúdo de venda, ela é adulta, direta e honesta sobre o que exige.`;
}

function lista() {
  return {
    funcoes: Object.entries(FUNCOES).map(([id, f]) => ({ id, ...f })),
    niveis: Object.entries(NIVEIS).map(([id, n]) => ({ id: Number(id), ...n })),
    avancos: AVANCOS,
  };
}

module.exports = { FUNCOES, NIVEIS, AVANCOS, bloco, lista };
