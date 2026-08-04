/* monde.js - découverte : l'ordinateur, le corps, la nature, le Togo.

   Deux idées importantes ici :

   1. L'ORDINATEUR S'APPREND AUSSI. Un enfant qui n'a jamais tenu de souris
      échoue à un exercice de maths pour une raison qui n'a rien à voir avec
      les maths. Les modules « souris » et « clavier » servent à ça, et ils
      doivent être faits en premier par les débutants.

   2. Pour les connaissances (corps, nature, Togo), le par-cœur est en
      partie normal : il FAUT savoir que la capitale est Lomé. Mais on pose
      toujours la question dans les deux sens (région -> chef-lieu ET
      chef-lieu -> région) et on ajoute des questions de raisonnement, pour
      qu'une réponse apprise dans un sens ne suffise pas. */

var QMonde = (function () {

  /* Fabrique une question à choix à partir d'une liste de paires.
     sens = 0 : on donne le premier terme, on cherche le second.
     sens = 1 : l'inverse. C'est ce simple retournement qui empêche
     d'apprendre bêtement l'ordre des boutons. */
  function quiz(paires, sens, modele, expl) {
    var bonne = U.tire(paires);
    var autres = [];
    for (var i = 0; i < paires.length; i++) {
      if (paires[i][sens ? 0 : 1] !== bonne[sens ? 0 : 1]) { autres.push(paires[i]); }
    }
    autres = U.tireN(autres, 3);
    var choix = [{ t: bonne[sens ? 0 : 1], ok: true }];
    for (var k = 0; k < autres.length && choix.length < 4; k++) {
      choix.push({ t: autres[k][sens ? 0 : 1], ok: false });
    }
    return {
      texte: modele.replace('__', bonne[sens ? 1 : 0]),
      type: 'choix',
      choix: U.melange(choix),
      explication: expl ? expl.replace('__A', bonne[0]).replace('__B', bonne[1]) : (bonne[0] + ' → ' + bonne[1] + '.')
    };
  }

  /* ================================================================
     LA SOURIS (tous âges, à faire en premier si on n'a jamais
     touché un ordinateur)
     ================================================================ */
  function souris(niveau, mode) {
    if (mode === 'comprendre') {
      /* Viser et cliquer : une grande cible parmi d'autres images. */
      var cible = Icons.comptableAuHasard();
      var autres = [];
      while (autres.length < 3) {
        var c = Icons.comptableAuHasard();
        if (c !== cible && !U.dans(autres, c)) { autres.push(c); }
      }
      var choix = [{ visuel: { type: 'icone', icone: cible }, ok: true }];
      for (var i = 0; i < autres.length; i++) {
        choix.push({ visuel: { type: 'icone', icone: autres[i] }, ok: false });
      }
      return {
        variante: 'viser',
        texte: 'Clique sur : ' + Icons.nom(cible, 1),
        aide: 'Pose la main sur la souris. Déplace la flèche sur l\'image, puis appuie une fois sur le bouton de gauche.',
        type: 'choix',
        choix: U.melange(choix),
        explication: 'Bien joué. Un seul clic suffit.'
      };
    }

    if (mode === 'entrainement') {
      /* Viser petit : la précision du geste. */
      var ic = Icons.comptableAuHasard();
      var faux = [];
      while (faux.length < 5) {
        var f = Icons.comptableAuHasard();
        if (f !== ic) { faux.push(f); }
      }
      var opts = [{ visuel: { type: 'icone', icone: ic, petit: true }, ok: true }];
      for (var j = 0; j < faux.length; j++) {
        opts.push({ visuel: { type: 'icone', icone: faux[j], petit: true }, ok: false });
      }
      return {
        variante: 'precision',
        texte: 'Clique sur la petite image : ' + Icons.nom(ic, 1),
        type: 'choix',
        choix: U.melange(opts),
        explication: 'De plus en plus précis !'
      };
    }

    /* Glisser-déposer : le geste le plus difficile, et indispensable. */
    var objet = U.tire(['oeuf', 'mangue', 'banane', 'poisson']);
    return {
      variante: 'glisser',
      texte: 'Attrape ' + Icons.nom(objet, 1) + ' et dépose-le dans le panier.',
      aide: 'Appuie sur le bouton de la souris SANS le lâcher, déplace, puis lâche au-dessus du panier.',
      type: 'glisser',
      visuel: { type: 'glisser', icone: objet, cible: 'panier' },
      explication: 'Glisser-déposer : appuyer, déplacer, lâcher.'
    };
  }

  /* ================================================================
     LE CLAVIER (tous âges)
     ================================================================ */
  function clavier(niveau, mode) {
    var LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    if (mode === 'comprendre') {
      var l = LETTRES.charAt(U.hasard(0, 25));
      return {
        variante: 'lettre',
        texte: 'Tape la lettre :  ' + l,
        aide: 'Cherche la lettre sur le clavier, puis appuie dessus. Les lettres ne sont pas dans l\'ordre de l\'alphabet !',
        type: 'frappe',
        reponse: l,
        explication: 'La lettre ' + l + '.'
      };
    }

    if (mode === 'entrainement') {
      var m = U.tire(QFr.MOTS);
      return {
        variante: 'mot',
        texte: 'Tape ce mot :  ' + m.mot,
        visuel: { type: 'icone', icone: m.icone },
        type: 'frappe',
        reponse: m.mot,
        explication: 'On écrit « ' + m.mot + ' ».'
      };
    }

    var noms = QMath.NOMS;
    var phrase = U.tire(noms) + ' joue au ' + U.tire(['football', 'basket', 'rugby']);
    return {
      variante: 'phrase',
      texte: 'Tape cette phrase :  ' + phrase,
      aide: 'N\'oublie pas la barre d\'espace entre les mots, avec le pouce.',
      type: 'frappe',
      reponse: phrase,
      explication: 'La barre d\'espace sépare les mots.'
    };
  }

  /* ================================================================
     LE CORPS HUMAIN ET LA SANTÉ (8-15 ans)
     ================================================================ */
  var ORGANES = [
    ['le cœur', 'pomper le sang dans tout le corps'],
    ['les poumons', 'respirer, prendre l\'oxygène de l\'air'],
    ['l\'estomac', 'commencer à digérer les aliments'],
    ['le cerveau', 'commander le corps et réfléchir'],
    ['les reins', 'filtrer le sang et fabriquer l\'urine'],
    ['les muscles', 'faire bouger le corps'],
    ['les os', 'soutenir le corps et protéger les organes'],
    ['les yeux', 'voir']
  ];

  var SANTE = [
    ['le paludisme', 'les piqûres de moustique'],
    ['la carie dentaire', 'le sucre et le manque de brossage'],
    ['la diarrhée', 'l\'eau ou les aliments sales'],
    ['le rhume', 'un virus qui passe d\'une personne à l\'autre']
  ];

  function corps(niveau, mode) {
    if (mode === 'transfert') {
      /* Raisonnement, pas récitation. */
      var cas = [
        {
          q: 'Après avoir couru longtemps, ton cœur bat plus vite. Pourquoi ?',
          bon: 'Parce que les muscles ont besoin de plus de sang et d\'oxygène.',
          faux: ['Parce que le cœur est fatigué et veut se reposer.',
            'Parce qu\'il fait chaud dehors.'],
          e: 'En courant, les muscles consomment plus d\'oxygène : le cœur accélère pour en apporter davantage.'
        },
        {
          q: 'Pourquoi dort-on sous une moustiquaire ?',
          bon: 'Parce que les moustiques piquent surtout la nuit et transmettent le paludisme.',
          faux: ['Parce qu\'il fait plus frais sous la moustiquaire.',
            'Parce que cela empêche de faire des cauchemars.'],
          e: 'Le paludisme se transmet par la piqûre du moustique. La moustiquaire est la protection la plus efficace pendant le sommeil.'
        },
        {
          q: 'Pourquoi se laver les mains AVANT de manger et APRÈS les toilettes ?',
          bon: 'Parce que les microbes invisibles passent des mains à la bouche.',
          faux: ['Parce que les mains sales sentent mauvais.',
            'Parce que l\'eau donne de la force.'],
          e: 'On ne voit pas les microbes, mais ils passent par les mains. Le savon les enlève.'
        },
        {
          q: 'Un enfant a beaucoup de diarrhée. Que faut-il faire en premier ?',
          bon: 'Lui faire boire beaucoup, avec de l\'eau propre et du sel sucré.',
          faux: ['L\'empêcher de boire pour arrêter la diarrhée.',
            'Le faire courir pour transpirer.'],
          e: 'Le vrai danger est la déshydratation : il faut remplacer l\'eau perdue (solution eau + sel + sucre).'
        },
        {
          q: 'Pourquoi faut-il faire bouillir ou filtrer l\'eau du puits avant de la boire ?',
          bon: 'Parce qu\'une eau claire peut quand même contenir des microbes.',
          faux: ['Parce que l\'eau chaude désaltère mieux.',
            'Parce que cela lui donne meilleur goût.'],
          e: 'La transparence ne prouve pas la propreté : les microbes sont invisibles à l\'œil nu.'
        }
      ];
      var c = U.tire(cas);
      return {
        variante: 'probleme',
        texte: c.q,
        type: 'choix',
        choix: U.melange([{ t: c.bon, ok: true }, { t: c.faux[0], ok: false }, { t: c.faux[1], ok: false }]),
        explication: c.e
      };
    }

    if (mode === 'comprendre') {
      var q = quiz(ORGANES, 0, '__ : à quoi cela sert-il dans le corps ?', 'Rôle de __A : __B.');
      q.variante = 'objets';
      q.aide = 'Pense à ce que tu ressens dans ton corps quand tu cours, quand tu manges, quand tu respires.';
      return q;
    }

    /* Entraînement : on retourne la question. */
    if (Math.random() < 0.5) {
      var q2 = quiz(ORGANES, 1, 'Quel organe sert à __ ?', 'C\'est __A.');
      q2.variante = 'inverse';
      return q2;
    }
    var q3 = quiz(SANTE, 0, 'Qu\'est-ce qui provoque __ ?', '__A vient de __B.');
    q3.variante = 'chiffres';
    return q3;
  }

  /* ================================================================
     LA NATURE ET LE VIVANT (8-15 ans)
     ================================================================ */
  var VIVANT = [
    ['la poule', 'elle pond des œufs'],
    ['le manguier', 'il donne des mangues'],
    ['le maïs', 'on en fait de la pâte et de la farine'],
    ['la chèvre', 'elle donne du lait et de la viande'],
    ['le palmier', 'il donne de l\'huile'],
    ['l\'abeille', 'elle fabrique du miel et transporte le pollen']
  ];

  function nature(niveau, mode) {
    if (mode === 'transfert') {
      var cas = [
        {
          q: 'On enferme les poules la nuit dans le poulailler. Pourquoi surtout ?',
          bon: 'Pour les protéger des animaux qui les mangeraient.',
          faux: ['Pour qu\'elles pondent plus vite.', 'Pour qu\'elles n\'aient pas froid aux pattes.'],
          e: 'La nuit, les poules ne voient presque rien et ne peuvent pas fuir : le poulailler les protège des prédateurs.'
        },
        {
          q: 'Une plante que l\'on met dans un placard sombre finit par jaunir et mourir. Pourquoi ?',
          bon: 'Parce qu\'elle a besoin de lumière pour fabriquer sa nourriture.',
          faux: ['Parce qu\'elle a peur du noir.', 'Parce qu\'il fait trop froid dans le placard.'],
          e: 'Les feuilles utilisent la lumière du soleil pour fabriquer la nourriture de la plante.'
        },
        {
          q: 'Pourquoi la terre du jardin est-elle dure et craquelée après plusieurs semaines sans pluie ?',
          bon: 'Parce que l\'eau contenue dans la terre s\'est évaporée avec la chaleur.',
          faux: ['Parce que les plantes ont mangé la terre.', 'Parce que le vent a apporté du sable.'],
          e: 'La chaleur fait passer l\'eau à l\'état de vapeur : c\'est l\'évaporation.'
        },
        {
          q: 'On garde les graines de maïs de la récolte pour l\'année suivante. Pourquoi ?',
          bon: 'Parce qu\'une graine peut donner naissance à une nouvelle plante.',
          faux: ['Parce que les graines sèches se conservent mieux que la farine.',
            'Parce que les graines coûtent cher au marché.'],
          e: 'La graine contient une petite plante endormie et de la réserve de nourriture pour démarrer.'
        }
      ];
      var c = U.tire(cas);
      return {
        variante: 'probleme',
        texte: c.q,
        type: 'choix',
        choix: U.melange([{ t: c.bon, ok: true }, { t: c.faux[0], ok: false }, { t: c.faux[1], ok: false }]),
        explication: c.e
      };
    }

    if (mode === 'comprendre') {
      var q = quiz(VIVANT, 0, 'Que fait __ pour nous ?', '__A : __B.');
      q.variante = 'objets';
      return q;
    }
    var q2 = quiz(VIVANT, 1, 'De quel être vivant parle-t-on : « __ » ?', 'C\'est __A.');
    q2.variante = 'inverse';
    return q2;
  }

  /* ================================================================
     LE TOGO (9-16 ans)
     ================================================================ */
  /* On s'en tient à des couples stables. La région Maritime n'est pas dans
     la liste : depuis la création de la région du Grand Lomé, son chef-lieu
     prête à confusion, et on ne veut pas faire apprendre une réponse
     discutable. Lomé apparaît plus bas, comme capitale du pays. */
  var REGIONS = [
    ['la région des Plateaux', 'Atakpamé'],
    ['la région Centrale', 'Sokodé'],
    ['la région de la Kara', 'Kara'],
    ['la région des Savanes', 'Dapaong']
  ];

  var VOISINS = [
    ['le Ghana', 'à l\'ouest'],
    ['le Bénin', 'à l\'est'],
    ['le Burkina Faso', 'au nord'],
    ['l\'océan Atlantique', 'au sud']
  ];

  var REPERES = [
    ['Quelle est la capitale du Togo ?', 'Lomé'],
    ['Quel est le point le plus haut du Togo ?', 'le mont Agou'],
    ['Quelle monnaie utilise-t-on au Togo ?', 'le franc CFA'],
    ['Quelle est la langue de l\'école au Togo ?', 'le français'],
    ['Quel grand fleuve coule dans le sud du Togo ?', 'le Mono'],
    ['Quel jour le Togo est-il devenu indépendant ?', 'le 27 avril 1960']
  ];

  function togo(niveau, mode) {
    if (mode === 'transfert') {
      var cas = [
        {
          q: 'Tu pars de Lomé et tu roules vers le nord. Quelle grande ville rencontres-tu en dernier ?',
          bon: 'Dapaong',
          faux: ['Atakpamé', 'Sokodé'],
          e: 'Du sud au nord : Lomé, Atakpamé, Sokodé, Kara, puis Dapaong tout au nord.'
        },
        {
          q: 'Un camion part du port de Lomé pour livrer des marchandises au Burkina Faso. Dans quelle direction roule-t-il ?',
          bon: 'Vers le nord',
          faux: ['Vers le sud', 'Vers l\'ouest'],
          e: 'Le Burkina Faso est le voisin du nord ; le port de Lomé sert de porte d\'entrée pour les pays sans littoral.'
        },
        {
          q: 'Pourquoi le port de Lomé est-il si important pour le Togo ?',
          bon: 'Parce que c\'est par là que passent les marchandises échangées avec les autres pays.',
          faux: ['Parce que c\'est le seul endroit où l\'on peut pêcher.',
            'Parce que c\'est le point le plus haut du pays.'],
          e: 'Le port relie le Togo au reste du monde, et sert aussi aux pays voisins qui n\'ont pas d\'accès à la mer.'
        },
        {
          q: 'Le drapeau du Togo porte une étoile blanche sur un carré rouge. Quelles sont les autres couleurs ?',
          bon: 'Le vert et le jaune',
          faux: ['Le bleu et le blanc', 'Le noir et l\'orange'],
          e: 'Cinq bandes vertes et jaunes, un carré rouge et une étoile blanche.'
        },
        {
          q: 'Si tu marches vers le sud depuis Kara pendant très longtemps, sur quoi finis-tu par arriver ?',
          bon: 'L\'océan',
          faux: ['Le désert', 'La montagne la plus haute'],
          e: 'Le Togo est un pays tout en longueur : au sud se trouve la côte, sur le golfe de Guinée.'
        }
      ];
      var c = U.tire(cas);
      return {
        variante: 'probleme',
        texte: c.q,
        type: 'choix',
        choix: U.melange([{ t: c.bon, ok: true }, { t: c.faux[0], ok: false }, { t: c.faux[1], ok: false }]),
        explication: c.e
      };
    }

    var r = Math.random();
    if (mode === 'comprendre') {
      var q = quiz(REPERES, 0, '__', '__A  Réponse : __B.');
      q.variante = 'objets';
      q.aide = 'Prends ton temps, lis toutes les propositions avant de choisir.';
      return q;
    }
    if (r < 0.4) {
      var q1 = quiz(REGIONS, 0, 'Quel est le chef-lieu de __ ?', 'Le chef-lieu de __A est __B.');
      q1.variante = 'chiffres';
      return q1;
    }
    if (r < 0.7) {
      var q2 = quiz(REGIONS, 1, '__ est le chef-lieu de quelle région ?', '__B est le chef-lieu de __A.');
      q2.variante = 'inverse';
      return q2;
    }
    var q3 = quiz(VOISINS, 0, 'Où se trouve __ par rapport au Togo ?', '__A se trouve __B.');
    q3.variante = 'mot';
    return q3;
  }

  return { souris: souris, clavier: clavier, corps: corps, nature: nature, togo: togo };
})();
