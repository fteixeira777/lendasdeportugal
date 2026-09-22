/* Original quest narratives, fictional rather than historical evidence. */
window.ORIGINAL_QUESTS = [
  { id:'templar',   name:'The Templar Cipher',     icon:'⚔️',  tokens:50,  radius:25,
    desc:'"Seek the ancient seal near the fortress walls. The knights buried their secrets where the river meets the stone."',
    lore:'You found a Templar seal — marked with the cross of the warrior monks who once guarded Portugal\'s frontier.',
    offset:{x:120,y:-80} },
  { id:'moorish',   name:'The Moorish Scroll',      icon:'📜',  tokens:75,  radius:25,
    desc:'"In the shadow of the minaret turned church, a scroll waits for eyes that dare read the old tongue."',
    lore:'An ancient Arabic scroll describes the city before the Reconquista — vibrant markets, fountains, a living world.',
    offset:{x:-90,y:150} },
  { id:'navigator', name:"The Navigator's Compass", icon:'🧭',  tokens:100, radius:25,
    desc:'"Where the caravels were born, a compass points inward. Find it before the tide erases the mark."',
    lore:'A brass compass used by a navigator of the Age of Discovery — it still points toward the unknown.',
    offset:{x:200,y:100} },
  { id:'star',      name:'The Hidden Star',          icon:'✡️',  tokens:80,  radius:25,
    desc:'"In the old Judiaria, carved where hands once lit hidden candles — a six-pointed star endures."',
    lore:'A Star of David carved secretly by conversos during the Inquisition, hidden in plain sight for centuries.',
    offset:{x:-150,y:-120} }
];

// Test pins sourced from municipal publications; not field-validated.
window.PACOS_QUESTS = [
  {
    "id": "pacos-carvalho",
    "region": "pacos",
    "name": "O Segredo do Carvalho",
    "icon": "🌳",
    "symbol": "♧",
    "tokens": 50,
    "radius": 40,
    "lat": 41.278333,
    "lng": -8.373889,
    "place": "Jardim Municipal · Praça Dr. Luís",
    "desc": "No Jardim Municipal, procura a memória do carvalho. Aproxima-te do ponto e decifra a pista.",
    "lore": "Encontraste a folha do guardião, uma relíquia fictícia desta aventura inspirada no Jardim Municipal.",
    "question": "A árvore guarda um código: IV · II · I. Qual é a sequência correta?",
    "choices": [
      "4 · 2 · 1",
      "6 · 2 · 1",
      "4 · 3 · 1"
    ],
    "answer": 0,
    "source": "https://www.outdooractive.pt/pt/poi/porto-e-norte/jardim-municipal-de-pacos-de-ferreira/803708938/"
  },
  {
    "id": "pacos-palavras",
    "region": "pacos",
    "name": "A Chave das Palavras",
    "icon": "📖",
    "symbol": "▤",
    "tokens": 75,
    "radius": 40,
    "lat": 41.278239266186965,
    "lng": -8.375992196403164,
    "place": "Biblioteca Municipal Prof. Vieira Dinis",
    "desc": "Junto à Biblioteca Municipal, um livro imaginário esconde uma chave. Resolve a pista no exterior, sem precisares de entrar.",
    "lore": "A chave das palavras abre o arquivo imaginário de Paços de Ferreira. Mais uma história para o teu diário.",
    "question": "Tenho páginas e uma lombada, mas não sou uma estrada. O que sou?",
    "choices": [
      "Uma bússola",
      "Um livro",
      "Uma árvore"
    ],
    "answer": 1,
    "source": "https://www.cm-pacosdeferreira.pt/3384/post-scriptum-antonio-carlos-cortez"
  },
  {
    "id": "pacos-parque",
    "region": "pacos",
    "name": "A Bússola Verde",
    "icon": "🧭",
    "symbol": "✥",
    "tokens": 100,
    "radius": 40,
    "lat": 41.273893312953994,
    "lng": -8.374408430770654,
    "place": "Parque Urbano de Paços de Ferreira",
    "desc": "No Parque Urbano, segue a curiosidade até à bússola verde. Para num local seguro antes de resolveres o enigma.",
    "lore": "Descobriste a bússola verde, a última relíquia fictícia do percurso de teste de Paços de Ferreira.",
    "question": "Estás virado a norte e dás meia-volta. Para onde ficas virado?",
    "choices": [
      "Este",
      "Oeste",
      "Sul"
    ],
    "answer": 2,
    "source": "https://www.cm-pacosdeferreira.pt/3454/feira-de-sao-martinho-25"
  }
];
