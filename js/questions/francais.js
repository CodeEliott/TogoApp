/* francais.js - fabriques de questions de français.

   Même principe qu'en mathématiques : rien n'est écrit en dur. Les phrases
   sont assemblées à partir de modèles, avec des prénoms, des objets et des
   nombres tirés au hasard. Un enfant qui aurait retenu « la réponse est
   toujours "est" » se trompe dès la phrase suivante.

   Pour les 6-9 ans, les exercices reposent sur des IMAGES et non sur la
   lecture : ils ne savent pas encore lire la consigne. */

var QFr = (function () {

  /* Mots dont on possède une image. C'est ce qui permet de travailler la
     lecture sans dépendre du son. */
  var MOTS = [
    { mot: 'poule', icone: 'poule', syl: ['pou', 'le'], lettre: 'p' },
    { mot: 'poisson', icone: 'poisson', syl: ['pois', 'son'], lettre: 'p' },
    { mot: 'panier', icone: 'panier', syl: ['pa', 'nier'], lettre: 'p' },
    { mot: 'ballon', icone: 'ballon', syl: ['bal', 'lon'], lettre: 'b' },
    { mot: 'banane', icone: 'banane', syl: ['ba', 'na', 'ne'], lettre: 'b' },
    { mot: 'bidon', icone: 'bidon', syl: ['bi', 'don'], lettre: 'b' },
    { mot: 'maison', icone: 'maison', syl: ['mai', 'son'], lettre: 'm' },
    { mot: 'mangue', icone: 'mangue', syl: ['man', 'gue'], lettre: 'm' },
    { mot: 'cahier', icone: 'cahier', syl: ['ca', 'hier'], lettre: 'c' },
    { mot: 'crayon', icone: 'crayon', syl: ['cra', 'yon'], lettre: 'c' },
    { mot: 'calebasse', icone: 'calebasse', syl: ['ca', 'le', 'basse'], lettre: 'c' },
    { mot: 'seau', icone: 'seau', syl: ['seau'], lettre: 's' },
    { mot: 'arbre', icone: 'arbre', syl: ['ar', 'bre'], lettre: 'a' },
    { mot: 'étoile', icone: 'etoile', syl: ['é', 'toi', 'le'], lettre: 'é' },
    { mot: 'œuf', icone: 'oeuf', syl: ['œuf'], lettre: 'o' },
    { mot: 'cœur', icone: 'coeur', syl: ['cœur'], lettre: 'c' }
  ];

  function motAuHasard() { return U.tire(MOTS); }

  function motsAvecLettre(l) {
    var out = [];
    for (var i = 0; i < MOTS.length; i++) { if (MOTS[i].lettre === l) { out.push(MOTS[i]); } }
    return out;
  }

  function motsSansLettre(l, n) {
    var out = [];
    for (var i = 0; i < MOTS.length; i++) { if (MOTS[i].lettre !== l) { out.push(MOTS[i]); } }
    return U.tireN(out, n);
  }

  /* ================================================================
     LES SONS ET LES LETTRES (6-8 ans) - tout en images
     ================================================================ */
  function sons(niveau, mode) {
    var lettres = ['p', 'b', 'm', 'c', 's'];
    var l = U.tire(lettres);
    var candidats = motsAvecLettre(l);
    if (!candidats.length) { l = 'p'; candidats = motsAvecLettre('p'); }
    var bon = U.tire(candidats);

    if (mode === 'transfert') {
      /* On inverse : on montre l'image, il faut trouver la lettre.
         Le sens de la question change complètement. */
      var autres = U.tireN(['p', 'b', 'm', 'c', 's', 'a'], 4);
      var choix = [{ t: bon.lettre.toUpperCase(), ok: true }];
      for (var i = 0; i < autres.length && choix.length < 3; i++) {
        if (autres[i] !== bon.lettre) { choix.push({ t: autres[i].toUpperCase(), ok: false }); }
      }
      return {
        variante: 'inverse',
        texte: 'Par quelle lettre commence ce mot ?',
        visuel: { type: 'icone', icone: bon.icone, legende: null },
        type: 'choix',
        choix: U.melange(choix),
        explication: '« ' + bon.mot +' » commence par la lettre ' + bon.lettre.toUpperCase() + '.'
      };
    }

    var faux = motsSansLettre(l, 2);
    var options = U.melange([
      { visuel: { type: 'icone', icone: bon.icone }, ok: true },
      { visuel: { type: 'icone', icone: faux[0].icone }, ok: false },
      { visuel: { type: 'icone', icone: faux[1].icone }, ok: false }
    ]);
    return {
      variante: mode === 'comprendre' ? 'objets' : 'image',
      texte: 'Quel objet commence par la lettre « ' + l.toUpperCase() + ' » ?',
      aide: mode === 'comprendre' ? 'Dis le nom de chaque image à voix haute et écoute le début du mot.' : null,
      type: 'choix',
      choix: options,
      explication: 'C\'était « ' + bon.mot + ' » : ' + bon.lettre.toUpperCase() + ' comme ' + bon.mot + '.'
    };
  }

  /* ================================================================
     SYLLABES ET MOTS (6-9 ans)
     ================================================================ */
  function syllabes(niveau, mode) {
    var m = motAuHasard();

    if (mode === 'comprendre') {
      return {
        variante: 'objets',
        texte: 'Combien de syllabes dans ce mot ?',
        aide: 'Frappe dans tes mains en disant le mot : ' + m.syl.join(' - ') + '.',
        visuel: { type: 'icone', icone: m.icone, legende: m.mot },
        type: 'choix',
        /* Attention aux mots d'une seule syllabe (« seau », « oeuf ») :
           « longueur - 1 » vaudrait 0 et ferait doublon avec la bonne
           réponse une fois ramené à 1. */
        choix: U.melange([
          { t: String(m.syl.length), ok: true },
          { t: String(m.syl.length + 1), ok: false },
          { t: String(m.syl.length > 1 ? m.syl.length - 1 : m.syl.length + 2), ok: false }
        ]),
        explication: m.mot + ' = ' + m.syl.join(' - ') + ', soit ' + m.syl.length + ' syllabe(s).'
      };
    }

    if (mode === 'entrainement') {
      /* Reconnaître le mot écrit qui correspond à l'image, parmi des mots
         très proches (erreurs typiques : lettres inversées, confusions). */
      var faux1 = brouille(m.mot), faux2 = brouille(m.mot);
      var essai = 0;
      while (faux2 === faux1 && essai < 10) { faux2 = brouille(m.mot); essai++; }
      return {
        variante: 'mot',
        texte: 'Quel est le bon mot pour cette image ?',
        visuel: { type: 'icone', icone: m.icone },
        type: 'choix',
        choix: U.melange([
          { t: m.mot, ok: true },
          { t: faux1, ok: false, msg: 'Regarde bien les lettres une par une.' },
          { t: faux2, ok: false, msg: 'Regarde bien les lettres une par une.' }
        ]),
        explication: 'On écrit « ' + m.mot + ' ».'
      };
    }

    /* Transfert : on donne les syllabes dans le désordre, il faut
       reconnaître le mot obtenu. On travaille sur des mots d'au moins
       deux syllabes, sinon il n'y a rien à remettre dans l'ordre. */
    var multi = [];
    for (var z = 0; z < MOTS.length; z++) { if (MOTS[z].syl.length > 1) { multi.push(MOTS[z]); } }
    m = U.tire(multi);

    var melangees = U.melange(m.syl.slice(0));
    var essais = 0;
    /* Le mélange doit vraiment changer l'ordre : sinon la « syllabes
       collées » serait identique au mot correct, et l'enfant verrait deux
       fois la même proposition. */
    while (melangees.join('') === m.mot && essais < 12) { melangees = U.melange(m.syl.slice(0)); essais++; }

    var autre = U.tire(multi);
    while (autre.mot === m.mot) { autre = U.tire(multi); }

    var propositions = [
      { t: m.mot, ok: true },
      { t: autre.mot, ok: false, msg: 'Ce mot n\'utilise pas ces syllabes.' }
    ];
    if (melangees.join('') !== m.mot) {
      propositions.push({ t: melangees.join(''), ok: false, msg: 'Les syllabes sont dans le désordre : il faut les remettre dans le bon ordre.' });
    }
    return {
      variante: 'inverse',
      texte: 'Avec ces syllabes, quel mot peut-on écrire ?  ' + melangees.join(' / '),
      type: 'choix',
      choix: U.melange(propositions),
      explication: m.syl.join(' + ') + ' = ' + m.mot + '.'
    };
  }

  /* Fabrique une faute d'orthographe plausible (lettre doublée, inversée,
     ou remplacée par une lettre visuellement proche). */
  function brouille(mot) {
    var t = mot.split('');
    var op = U.hasard(1, 3);
    var i = U.hasard(1, Math.max(1, t.length - 2));
    if (op === 1 && t.length > 2) { var x = t[i]; t[i] = t[i + 1]; t[i + 1] = x; }
    else if (op === 2) { t.splice(i, 0, t[i]); }
    else {
      var paires = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', a: 'o', o: 'a', u: 'n', e: 'a' };
      t[i] = paires[t[i]] || t[i];
    }
    var r = t.join('');
    return r === mot ? mot + 'e' : r;
  }

  /* ================================================================
     ORTHOGRAPHE - les homophones (9-14 ans)
     ================================================================ */
  var HOMOPHONES = [
    {
      paire: ['a', 'à'],
      modeles: [
        { p: 'NOM __ ramassé les œufs.', bon: 'a', regle: 'On peut dire « avait » : c\'est le verbe avoir, donc « a » sans accent.' },
        { p: 'NOM va __ l\'école.', bon: 'à', regle: 'On ne peut pas dire « avait l\'école » : c\'est « à » avec accent.' },
        { p: 'Le ballon est __ NOM.', bon: 'à', regle: 'Ici « à » indique à qui appartient le ballon.' },
        { p: 'NOM __ gagné le match.', bon: 'a', regle: '« avait gagné » fonctionne : c\'est le verbe avoir.' }
      ]
    },
    {
      paire: ['et', 'est'],
      modeles: [
        { p: 'NOM __ NOM2 jouent au football.', bon: 'et', regle: 'On peut remplacer par « ainsi que » : c\'est « et ».' },
        { p: 'Le repas __ prêt.', bon: 'est', regle: 'On peut dire « était prêt » : c\'est le verbe être, « est ».' },
        { p: 'NOM __ content de sa note.', bon: 'est', regle: '« était content » fonctionne : verbe être.' },
        { p: 'Prends le seau __ le savon.', bon: 'et', regle: '« ainsi que le savon » fonctionne : c\'est « et ».' }
      ]
    },
    {
      paire: ['ou', 'où'],
      modeles: [
        { p: 'Tu veux du riz __ du pain ?', bon: 'ou', regle: 'On peut dire « ou bien » : c\'est « ou » sans accent.' },
        { p: 'Dis-moi __ tu vas.', bon: 'où', regle: 'Ici on parle du lieu : « où » avec accent.' },
        { p: 'La salle __ nous mangeons est grande.', bon: 'où', regle: 'On parle du lieu : « où ».' },
        { p: 'On joue au basket __ au rugby ?', bon: 'ou', regle: '« ou bien » fonctionne : « ou ».' }
      ]
    },
    {
      paire: ['son', 'sont'],
      modeles: [
        { p: 'NOM cherche __ cahier.', bon: 'son', regle: 'On peut dire « mon cahier » : c\'est le déterminant « son ».' },
        { p: 'Les poules __ dans la cour.', bon: 'sont', regle: 'On peut dire « étaient » : verbe être, « sont ».' },
        { p: 'Les ballons __ dégonflés.', bon: 'sont', regle: '« étaient dégonflés » fonctionne : « sont ».' },
        { p: 'Il a perdu __ stylo.', bon: 'son', regle: '« mon stylo » fonctionne : « son ».' }
      ]
    },
    {
      paire: ['on', 'ont'],
      modeles: [
        { p: '__ va au terrain après le repas.', bon: 'on', regle: 'On peut remplacer par « il » : c\'est « on ».' },
        { p: 'Ils __ fini leurs devoirs.', bon: 'ont', regle: 'On peut dire « avaient fini » : verbe avoir, « ont ».' },
        { p: 'Les enfants __ soif.', bon: 'ont', regle: '« avaient soif » fonctionne : « ont ».' },
        { p: '__ ne peut pas courir sous la pluie.', bon: 'on', regle: '« il ne peut pas » fonctionne : « on ».' }
      ]
    }
  ];

  function orthographe(niveau, mode) {
    var h = U.tire(HOMOPHONES);
    var m = U.tire(h.modeles);
    var noms = [QMath.nom(), QMath.nom()];
    var phrase = m.p.replace('NOM2', noms[1]).replace('NOM', noms[0]);
    var mauvais = (h.paire[0] === m.bon) ? h.paire[1] : h.paire[0];

    if (mode === 'transfert') {
      /* On montre une phrase déjà écrite : est-elle correcte ?
         Beaucoup plus dur que choisir entre deux cases, et c'est ce qu'on
         fait vraiment quand on se relit. */
      var correcte = Math.random() < 0.5;
      var affichee = phrase.replace('__', correcte ? m.bon : mauvais);
      return {
        variante: 'relecture',
        texte: 'Cette phrase est-elle correctement écrite ?\n« ' + affichee + ' »',
        type: 'choix',
        choix: U.melange([
          { t: 'Oui, elle est correcte', ok: correcte },
          { t: 'Non, il y a une faute', ok: !correcte }
        ]),
        pourquoi: correcte ? null : {
          texte: 'Quelle est la bonne façon d\'écrire ?',
          choix: U.melange([
            { t: m.bon, ok: true },
            { t: mauvais, ok: false }
          ])
        },
        explication: m.regle
      };
    }

    return {
      variante: mode === 'comprendre' ? 'trou-aide' : 'trou',
      texte: 'Complète : « ' + phrase.replace('__', '.....') + ' »',
      aide: mode === 'comprendre' ? 'Essaie de remplacer par un autre mot pour vérifier.' : null,
      type: 'choix',
      choix: U.melange([
        { t: m.bon, ok: true },
        { t: mauvais, ok: false, msg: m.regle }
      ]),
      explication: '« ' + phrase.replace('__', m.bon) + ' ». ' + m.regle
    };
  }

  /* ================================================================
     GRAMMAIRE (10-15 ans) - nature des mots et accords
     ================================================================ */
  var SUJETS_S = ['Le garçon', 'La fille', 'Le pasteur', 'Le gardien', 'La poule', 'La maîtresse'];
  /* Pour l'exercice de mise au pluriel : uniquement des sujets masculins et
     des adjectifs dont le pluriel se forme simplement en ajoutant « s ».
     Sinon la « bonne réponse » serait fausse (« nouveaus », « joyeuxs »...). */
  var SUJETS_MASC = ['Le garçon', 'Le pasteur', 'Le gardien', 'Le joueur'];
  var ADJ_SIMPLES = ['grand', 'rapide', 'fatigué', 'propre', 'content', 'poli'];
  var SUJETS_P = ['Les garçons', 'Les filles', 'Les élèves', 'Les enfants', 'Les poules', 'Les joueurs'];
  var VERBES = [
    { inf: 'jouer', s: 'joue', p: 'jouent' },
    { inf: 'chanter', s: 'chante', p: 'chantent' },
    { inf: 'manger', s: 'mange', p: 'mangent' },
    { inf: 'courir', s: 'court', p: 'courent' },
    { inf: 'dormir', s: 'dort', p: 'dorment' },
    { inf: 'travailler', s: 'travaille', p: 'travaillent' }
  ];
  var COMPLS = ['dans la cour', 'sous le manguier', 'après le repas', 'avant la nuit',
    'sur le terrain', 'près du puits', 'pendant la récréation'];

  function grammaire(niveau, mode) {
    var pluriel = Math.random() < 0.5;
    var sujet = pluriel ? U.tire(SUJETS_P) : U.tire(SUJETS_S);
    var v = U.tire(VERBES);
    var compl = U.tire(COMPLS);
    var phrase = sujet + ' ' + (pluriel ? v.p : v.s) + ' ' + compl + '.';

    if (mode === 'comprendre') {
      return {
        variante: 'objets',
        texte: 'Complète : « ' + sujet + ' ..... ' + compl + '. »',
        aide: 'Regarde le sujet : est-il au singulier (un seul) ou au pluriel (plusieurs) ? Le verbe doit s\'accorder.',
        visuel: { type: 'texte', contenu: sujet + '  →  ' + (pluriel ? 'PLUSIEURS' : 'UN SEUL') },
        type: 'choix',
        choix: U.melange([
          { t: pluriel ? v.p : v.s, ok: true },
          { t: pluriel ? v.s : v.p, ok: false, msg: 'Le verbe doit s\'accorder avec le sujet : ' + sujet + ' → ' + (pluriel ? 'pluriel' : 'singulier') + '.' }
        ]),
        explication: '« ' + phrase + ' » : le verbe s\'accorde avec « ' + sujet + ' ».'
      };
    }

    if (mode === 'entrainement') {
      var mots = phrase.replace('.', '').split(' ');
      var cible, nature;
      var r = Math.random();
      if (r < 0.34) { cible = pluriel ? v.p : v.s; nature = 'un verbe'; }
      else if (r < 0.67) { cible = mots[mots.length - 1]; nature = 'un nom'; }
      else { cible = mots[0]; nature = 'un déterminant'; }
      return {
        variante: 'chiffres',
        texte: 'Dans la phrase « ' + phrase + ' », le mot « ' + cible + ' » est :',
        type: 'choix',
        choix: U.melange([
          { t: nature, ok: true },
          { t: nature === 'un verbe' ? 'un nom' : 'un verbe', ok: false },
          { t: 'un adjectif', ok: nature === 'un adjectif' }
        ]),
        explication: '« ' + cible + ' » est ' + nature + '.'
      };
    }

    /* Transfert : transformer la phrase. Il faut penser à TOUS les accords,
       pas seulement à celui qu'on a l'habitude de voir. */
    var adj = U.tire(ADJ_SIMPLES);
    var sujetS = U.tire(SUJETS_MASC);
    var faux1 = adj;
    return {
      variante: 'probleme',
      texte: 'Mets cette phrase au pluriel : « ' + sujetS + ' est ' + adj + '. »\nComment s\'écrit alors « ' + adj + ' » ?',
      type: 'choix',
      choix: U.melange([
        { t: adj + 's', ok: true },
        { t: faux1, ok: false, msg: 'L\'adjectif aussi doit s\'accorder, pas seulement le verbe.' },
        { t: adj + 'ent', ok: false, msg: '« -ent » est une terminaison de verbe, pas d\'adjectif.' }
      ]),
      pourquoi: {
        texte: 'Qu\'est-ce qui change encore dans la phrase au pluriel ?',
        choix: U.melange([
          { t: 'Le déterminant et le verbe : « Les ... sont ... ».', ok: true },
          { t: 'Rien d\'autre, seulement l\'adjectif.', ok: false },
          { t: 'Seulement le nom.', ok: false }
        ])
      },
      explication: 'Au pluriel : « Les ... sont ' + adj + 's. » Tout le groupe s\'accorde.'
    };
  }

  /* ================================================================
     CONJUGAISON (9-16 ans)
     ================================================================ */
  var PRONOMS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
  var CONJ = {
    'être': {
      present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
      imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient']
    },
    'avoir': {
      present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
      imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient']
    },
    'aller': {
      present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
      futur: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
      imparfait: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient']
    },
    'jouer': {
      present: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'],
      futur: ['jouerai', 'joueras', 'jouera', 'jouerons', 'jouerez', 'joueront'],
      imparfait: ['jouais', 'jouais', 'jouait', 'jouions', 'jouiez', 'jouaient']
    },
    'manger': {
      present: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
      futur: ['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront'],
      imparfait: ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient']
    },
    'finir': {
      present: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'],
      futur: ['finirai', 'finiras', 'finira', 'finirons', 'finirez', 'finiront'],
      imparfait: ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient']
    },
    'courir': {
      present: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'],
      futur: ['courrai', 'courras', 'courra', 'courrons', 'courrez', 'courront'],
      imparfait: ['courais', 'courais', 'courait', 'courions', 'couriez', 'couraient']
    },
    'faire': {
      present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
      futur: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
      imparfait: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient']
    }
  };
  var VERBES_LISTE = ['être', 'avoir', 'aller', 'jouer', 'manger', 'finir', 'courir', 'faire'];
  var TEMPS_LABEL = { present: 'présent', futur: 'futur', imparfait: 'imparfait' };

  function conjugaison(niveau, mode) {
    var verbe = U.tire(niveau <= 2 ? ['être', 'avoir', 'jouer', 'aller'] : VERBES_LISTE);
    var temps = niveau <= 1 ? 'present' : U.tire(niveau <= 3 ? ['present', 'futur'] : ['present', 'futur', 'imparfait']);
    var i = U.hasard(0, 5);
    var pron = PRONOMS[i];
    var bonne = CONJ[verbe][temps][i];
    var affiche = (pron === 'je' && 'aeiouéêh'.indexOf(bonne.charAt(0)) >= 0) ? 'j\'' : pron + ' ';

    /* Les mauvaises réponses sont les erreurs réelles : bonne personne mais
       mauvais temps, ou bon temps mais mauvaise personne. */
    var autreTemps = U.tire(['present', 'futur', 'imparfait']);
    while (autreTemps === temps) { autreTemps = U.tire(['present', 'futur', 'imparfait']); }
    var autrePers = U.hasardSauf(0, 5, [i]);
    var leurres = [
      { t: CONJ[verbe][autreTemps][i], ok: false, msg: 'Cette forme existe, mais c\'est le ' + TEMPS_LABEL[autreTemps] + '.' },
      { t: CONJ[verbe][temps][autrePers], ok: false, msg: 'Bon temps, mais ce n\'est pas la forme de « ' + pron + ' ».' }
    ];

    if (mode === 'entrainement') {
      return {
        variante: 'chiffres',
        texte: 'Conjugue « ' + verbe + ' » au ' + TEMPS_LABEL[temps] + ' : ' + affiche + '.....',
        type: 'choix',
        choix: U.melange([{ t: bonne, ok: true }].concat(leurres)),
        explication: affiche + bonne + ' (' + verbe + ', ' + TEMPS_LABEL[temps] + ').'
      };
    }

    if (mode === 'comprendre') {
      return {
        variante: 'objets',
        texte: 'Complète : ' + affiche + '..... (verbe « ' + verbe + ' », ' + TEMPS_LABEL[temps] + ')',
        aide: temps === 'present' ? 'Le présent, c\'est maintenant.' :
          (temps === 'futur' ? 'Le futur, c\'est plus tard : demain, la semaine prochaine.' :
            'L\'imparfait, c\'est avant, une habitude du passé.'),
        visuel: { type: 'texte', contenu: TEMPS_LABEL[temps].toUpperCase() },
        type: 'choix',
        choix: U.melange([{ t: bonne, ok: true }, leurres[0]]),
        explication: affiche + bonne + '.'
      };
    }

    /* Transfert : on donne la phrase, il faut reconnaître le temps.
       C'est l'opération inverse de la conjugaison mécanique. */
    var indices = { present: 'en ce moment', futur: 'demain', imparfait: 'autrefois' };
    return {
      variante: 'inverse',
      texte: 'À quel temps est cette phrase ?\n« ' + U.maj(affiche) + bonne + ' avec les autres. »',
      type: 'choix',
      choix: U.melange([
        { t: TEMPS_LABEL.present, ok: temps === 'present' },
        { t: TEMPS_LABEL.futur, ok: temps === 'futur' },
        { t: TEMPS_LABEL.imparfait, ok: temps === 'imparfait' }
      ]),
      pourquoi: {
        texte: 'Quel mot pourrait-on ajouter à cette phrase sans la rendre bizarre ?',
        choix: U.melange([
          { t: indices[temps], ok: true },
          { t: indices[autreTemps], ok: false }
        ])
      },
      explication: '« ' + bonne + ' » est la forme du ' + TEMPS_LABEL[temps] + '.'
    };
  }

  /* ================================================================
     COMPRÉHENSION DE TEXTE (10-18 ans)

     Les questions ne demandent JAMAIS de recopier une phrase du texte :
     il faut toujours calculer, déduire ou relier deux informations. C'est
     exactement ce que le par-cœur ne sait pas faire.
     ================================================================ */
  function comprehension(niveau, mode) {
    var n1 = QMath.nom(), n2 = QMath.nom();
    while (n2 === n1) { n2 = QMath.nom(); }

    var modeles = [

      function () {
        var depart = U.hasard(5, 7);
        var minutes = U.tire([15, 20, 25, 30, 40]);
        var arrivee = depart * 60 + 30 + minutes;
        return {
          texte: n1 + ' quitte le foyer à ' + depart + ' h 30 pour aller à l\'école. ' +
            'Le trajet dure ' + minutes + ' minutes à pied. Ce matin, ' + n1 +
            ' a oublié son cahier et a dû revenir le chercher : cela lui a pris 10 minutes de plus.',
          q: 'À quelle heure ' + n1 + ' est-il arrivé à l\'école ce matin ?',
          bonne: heure(arrivee + 10),
          leurres: [
            { t: heure(arrivee), msg: 'Tu as oublié les 10 minutes perdues à revenir chercher le cahier.' },
            { t: heure(depart * 60 + 30 + 10), msg: 'Là tu n\'as compté que le retour, pas le trajet.' }
          ],
          expl: depart + ' h 30 + ' + minutes + ' min + 10 min = ' + heure(arrivee + 10) + '.'
        };
      },

      function () {
        var poules = U.hasard(8, 20);
        var parJour = U.tire([2, 3, 4]);
        var jours = U.tire([5, 6, 7]);
        var casses = U.hasard(2, 8);
        return {
          texte: 'Au foyer, il y a ' + poules + ' poules. Ensemble, elles pondent ' + parJour +
            ' œufs par jour. Cette semaine, on a ramassé les œufs pendant ' + jours +
            ' jours, mais ' + casses + ' œufs se sont cassés en tombant du panier.',
          q: 'Combien d\'œufs reste-t-il à la fin de la semaine ?',
          bonne: String(parJour * jours - casses),
          leurres: [
            { t: String(parJour * jours), msg: 'Tu as oublié les œufs cassés.' },
            { t: String(poules * parJour), msg: 'Attention : les ' + parJour + ' œufs sont le total pour toutes les poules, pas par poule.' }
          ],
          expl: parJour + ' × ' + jours + ' = ' + (parJour * jours) + ' œufs, moins ' + casses +
            ' cassés = ' + (parJour * jours - casses) + '.'
        };
      },

      function () {
        var eq = U.tire(['football', 'basket', 'rugby']);
        var a = U.hasard(10, 40), b = U.hasard(10, 40);
        while (b === a) { b = U.hasard(10, 40); }
        var gagnant = a > b ? n1 : n2;
        return {
          texte: 'Samedi, l\'équipe de ' + n1 + ' et celle de ' + n2 + ' se sont affrontées au ' + eq +
            '. L\'équipe de ' + n1 + ' a marqué ' + a + ' points et celle de ' + n2 + ' en a marqué ' + b +
            '. Le pasteur a offert un régime de bananes à l\'équipe gagnante.',
          q: 'Qui a reçu les bananes, et avec combien de points d\'avance ?',
          bonne: gagnant + ', ' + Math.abs(a - b) + ' points',
          leurres: [
            { t: (a > b ? n2 : n1) + ', ' + Math.abs(a - b) + ' points', msg: 'Relis le score : c\'est l\'équipe qui a le PLUS de points qui gagne.' },
            { t: gagnant + ', ' + (a + b) + ' points', msg: 'Tu as additionné les deux scores. L\'avance, c\'est la différence.' }
          ],
          expl: gagnant + ' gagne. Écart : ' + Math.max(a, b) + ' - ' + Math.min(a, b) + ' = ' + Math.abs(a - b) + ' points.'
        };
      },

      function () {
        var bidons = U.hasard(3, 8);
        var litres = U.tire([10, 15, 20]);
        var pers = U.hasard(6, 15);
        var total = bidons * litres;
        return {
          texte: 'Chaque matin, les enfants remplissent ' + bidons + ' bidons de ' + litres +
            ' litres au puits. L\'eau sert à ' + pers + ' personnes pour toute la journée.',
          q: 'Combien de litres cela fait-il par personne, environ ?',
          bonne: String(Math.round(total / pers)),
          leurres: [
            { t: String(total), msg: 'C\'est le total pour tout le monde, pas par personne.' },
            { t: String(bidons * pers), msg: 'Regarde bien quelles grandeurs il faut combiner.' }
          ],
          expl: bidons + ' × ' + litres + ' = ' + total + ' litres, partagés entre ' + pers +
            ' personnes ≈ ' + Math.round(total / pers) + ' litres chacun.'
        };
      }
    ];

    var m = U.tire(modeles)();
    var choix = [{ t: m.bonne, ok: true }];
    for (var i = 0; i < m.leurres.length; i++) {
      choix.push({ t: m.leurres[i].t, ok: false, msg: m.leurres[i].msg });
    }

    return {
      variante: mode === 'transfert' ? 'probleme' : (mode === 'comprendre' ? 'texte-aide' : 'texte'),
      texte: m.q,
      aide: mode === 'comprendre' ? 'Relis le texte lentement. Souligne les nombres et ce qu\'ils représentent.' : null,
      visuel: { type: 'texte', contenu: m.texte, long: true },
      type: 'choix',
      choix: U.melange(choix),
      explication: m.expl
    };
  }

  function heure(minutesTotal) {
    var h = Math.floor(minutesTotal / 60), m = minutesTotal % 60;
    return h + ' h ' + (m < 10 ? '0' : '') + m;
  }

  return {
    sons: sons, syllabes: syllabes, orthographe: orthographe,
    grammaire: grammaire, conjugaison: conjugaison, comprehension: comprehension,
    MOTS: MOTS
  };
})();
