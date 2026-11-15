// Respostas de EXEMPLO, escritas a mao a 15/11/2026 segundo o Livro de Receitas v2.3.
// Nao foram geradas pela app. Servem para testar o circuito e para mostrar o resultado esperado.
// Tema do teste: o significado que atribuimos ao que nos acontece.

module.exports = {
  aberturas: {
    ganchos: [
      {
        tipo: 'problema',
        frase: 'Mandaste uma mensagem e a resposta não chegou. Uma hora depois, já tens a certeza de que disseste o que não devias.',
        tela: 'A resposta não chegou. A conclusão chegou logo.',
        situacao: 'Mandaste uma mensagem e a resposta não chegou.',
        porque: 'A situação é comum e a pessoa reconhece-se antes de qualquer explicação.',
      },
      {
        tipo: 'contraintuitiva',
        frase: 'Não é o que te acontece que te tira a confiança. É a conclusão que tiras sobre ti nos segundos seguintes.',
        tela: 'Não é o que acontece. É o que concluis.',
        situacao: 'Um colega passa por ti sem te cumprimentar e concluis logo que fizeste mal.',
        porque: 'Contesta a ideia comum de que são os acontecimentos que nos abalam.',
      },
      {
        tipo: 'curiosidade',
        frase: 'Entre o que te acontece e o que sentes, há uma frase que dizes a ti. Quase nunca a ouves. E é ela que decide o resto do teu dia.',
        tela: 'Há uma frase que decide o teu dia.',
        situacao: 'A resposta à tua mensagem não chega e, em segundos, sentes um aperto no peito.',
        resposta: 'A frase é "isto quer dizer que eu…": o significado automático que aprendeste a dar ao que te acontece.',
        porque: 'O tema é um mecanismo invisível; a pergunta prende e o vídeo responde-lhe.',
      },
    ],
    recomendada: 2,
    razao: 'O tema é um mecanismo que a pessoa vive sem o ver: a curiosidade abre a pergunta e o vídeo revela a própria frase.',
  },

  roteiroCuriosidade: {
    blocos: [
      { tempo: '0-3s', rotulo: 'ABERTURA', fala: 'Entre o que te acontece e o que sentes, há uma frase que dizes a ti. Quase nunca a ouves. E é ela que decide o resto do teu dia.', tela: 'Há uma frase que decide o teu dia.', camera: 'Plano de peito, câmara frontal, olhar direto.' },
      { tempo: '3-15s', rotulo: 'SITUAÇÃO', fala: 'Mandas uma mensagem. A resposta não chega. Em segundos, sentes um aperto no peito e começas a reler tudo o que escreveste.', tela: 'A resposta não chega.', camera: 'Mesmo plano, ritmo mais lento.' },
      { tempo: '15-40s', rotulo: 'MECANISMO', fala: 'Antes do aperto, houve uma frase: "isto quer dizer que eu…". Que eu incomodei. Que não sou importante. Que fiz mal. Não é o silêncio que te dói. É o significado que lhe dás. E esse significado foi aprendido: em algum momento, preparar-te para a rejeição pareceu mais seguro do que seres apanhado de surpresa.', tela: '"Isto quer dizer que eu…"', camera: 'Aproximação lenta.' },
      { tempo: '40-52s', rotulo: 'NOVA POSSIBILIDADE', fala: 'Quando ouves a frase, ganhas uma escolha. Podes perguntar: que outra leitura é possível aqui? O automático reage. A essência escolhe.', tela: 'O automático reage. A essência escolhe.', camera: 'Plano estável, pausa antes da última frase.' },
      { tempo: '52-60s', rotulo: 'CTA', fala: 'Repara em que situações esta frase decide primeiro.', tela: 'Repara na frase.', camera: 'Sorriso leve, fim em silêncio.' },
    ],
    legenda: 'A resposta não chega e, em segundos, já concluíste alguma coisa sobre ti.\n\nNão é o silêncio que dói. É o significado que lhe dás.\n\nEsse significado foi aprendido. Em algum momento, protegeu-te.\n\nQuando começas a ouvir a frase "isto quer dizer que eu…", deixas de obedecer-lhe sem escolha.\n\nRepara em que situações esta frase decide primeiro.',
    primeiro_comentario: 'Qual é a tua frase "isto quer dizer que eu…"?',
    capa: { titulo: 'Há uma frase que decide o teu dia' },
    imagem_ideia: 'telemóvel pousado numa mesa de madeira, luz de fim de tarde, ecrã apagado',
  },

  aberturasR3: {
    ganchos: [
      { tipo: 'sessao', frase: 'Quando alguém me diz "eu fico a remoer tudo o que me dizem", não olho apenas para o que lhe disseram.', tela: '"Fico a remoer tudo."', situacao: 'A pessoa fica presa a uma frase ou a um silêncio do outro.', porque: 'É uma frase que muita gente diz a si própria.' },
      { tipo: 'sessao', frase: 'Quando alguém me diz "não sei porque é que isto me afeta tanto", a pergunta que faço é outra.', tela: '"Porque é que me afeta tanto?"', situacao: 'Uma reação maior do que o acontecimento.', porque: 'Abre a distinção entre o acontecimento e o significado.' },
      { tipo: 'sessao', frase: 'Quando alguém me diz "eu sei que estou a exagerar", procuro perceber o que aquela situação lhe diz sobre si.', tela: '"Eu sei que estou a exagerar."', situacao: 'A pessoa sabe que a reação é desproporcionada e não consegue pará-la.', porque: 'Liga-se à armadilha da compreensão: saber e continuar a repetir.' },
    ],
    recomendada: 2,
    razao: 'A frase mostra quem já compreende o padrão e continua preso a ele, o território da autoridade clínica.',
  },

  roteiroR3: {
    blocos: [
      { tempo: '0-3s', rotulo: 'ABERTURA', fala: 'Quando alguém me diz "eu sei que estou a exagerar", procuro perceber o que aquela situação lhe diz sobre si.', tela: '"Eu sei que estou a exagerar."', camera: 'Plano de peito, câmara frontal.' },
      { tempo: '3-15s', rotulo: 'O QUE É VISÍVEL', fala: 'O que se vê é uma reação maior do que o acontecimento: uma mensagem sem resposta, um tom mais seco, e o dia fica estragado.', tela: 'Uma reação maior do que o acontecimento.', camera: 'Mesmo plano.' },
      { tempo: '15-35s', rotulo: 'O QUE PROCURO', fala: 'Em sessão, não fico pelo acontecimento. Procuro o significado que a pessoa lhe deu, quase sem dar por isso: "se não me respondem, é porque não conto".', tela: '"Se não me respondem, não conto."', camera: 'Aproximação lenta.' },
      { tempo: '35-50s', rotulo: 'CRITÉRIO CLÍNICO', fala: 'A intensidade não está no que aconteceu. Está na conclusão sobre si que esse acontecimento confirmou. Enquanto essa conclusão não for vista, cada novo silêncio parece uma prova.', tela: 'Cada silêncio parece uma prova.', camera: 'Plano estável.' },
      { tempo: '50-60s', rotulo: 'POSSIBILIDADE E CTA', fala: 'É aqui que começa a diferença entre compreender e transformar. Se queres perceber se este processo faz sentido para ti, envia-me mensagem.', tela: 'Compreender não é transformar.', camera: 'Olhar direto, pausa final.' },
    ],
    legenda: 'Saber que estás a exagerar não chega para parar a reação.\n\nEm sessão, olho para o significado que a pessoa deu ao que aconteceu, quase sem dar por isso.\n\nA intensidade não está no acontecimento. Está na conclusão sobre si que ele confirmou.\n\nÉ aqui que começa a diferença entre compreender e transformar.\n\nSe queres perceber se este processo faz sentido para ti, envia-me mensagem.',
    primeiro_comentario: 'Que frase dizes a ti quando alguém não te responde?',
    capa: { titulo: 'Saber que exageras não chega' },
    imagem_ideia: 'cadeira junto a uma janela com luz suave, caderno fechado',
  },
};
