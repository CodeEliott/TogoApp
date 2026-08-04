/* math.js - fabriques de questions de mathématiques.

   RÈGLE ABSOLUE DU PROJET : aucune question n'est écrite en dur. Chaque
   question est fabriquée au moment où elle est posée, avec des nombres et
   des objets tirés au hasard. Il n'y a donc aucune suite de réponses à
   apprendre par cœur.

   Forme d'une question renvoyée par un générateur :

   {
     variante : 'objets' | 'chiffres' | 'mot' | 'probleme' | 'inverse',
                 -> quelle REPRÉSENTATION de la notion est utilisée.
                    Le moteur exige plusieurs représentations réussies
                    avant de valider la notion.
     texte    : la consigne,
     aide     : phrase d'aide (affichée en mode « on comprend »),
     visuel   : { type: 'groupes' | 'grille' | 'barre' | 'figure' | 'texte', ... },
     type     : 'choix' | 'nombre',
     choix    : [ { t: '12', ok: true, msg: 'explication si on clique' } ],
     reponse  : '12'                (pour type 'nombre'),
     pourquoi : { texte: '...', choix: [...] }   (facultatif),
     explication : phrase montrée après la réponse
   }

   Chaque générateur reçoit (niveau, mode) :
     niveau 1..6  -> difficulté à l'intérieur de la notion
     mode         -> 'comprendre' | 'entrainement' | 'transfert'
*/

var QMath = (function () {

  /* Prénoms du quotidien de l'orphelinat : les problèmes parlent d'eux. */
  var NOMS = ['Kossi', 'Afi', 'Kodjo', 'Ama', 'Yao', 'Akou', 'Komla', 'Adjo', 'Mawuli',
    'Sena', 'Edem', 'Délali', 'Enyonam', 'Kafui', 'Elom', 'Selorm', 'Dzifa', 'Essi'];

  function nom() { return U.tire(NOMS); }
  function deuxNoms() { var a = nom(), b = nom(); while (b === a) { b = nom(); } return [a, b]; }

  /* Construit une liste de propositions numériques, mélangée.
     `leurres` sont les erreurs typiques : on les propose exprès, pour
     pouvoir réagir à l'erreur précise que l'enfant commet. */
  function choixNb(bonne, leurres, msgs) {
    var liste = [{ t: String(bonne), ok: true }];
    var vus = [bonne];
    for (var i = 0; i < leurres.length && liste.length < 4; i++) {
      var v = leurres[i];
      if (v === null || v === undefined || U.dans(vus, v) || v < 0) { continue; }
      vus.push(v);
      liste.push({ t: String(v), ok: false, msg: (msgs && msgs[i]) || null });
    }
    /* On complète avec des voisins plausibles si besoin. */
    var garde = 0;
    while (liste.length < 3 && garde < 40) {
      garde++;
      var c = bonne + U.tire([-3, -2, -1, 1, 2, 3, 10, -10]);
      if (c < 0 || U.dans(vus, c)) { continue; }
      vus.push(c); liste.push({ t: String(c), ok: false });
    }
    return U.melange(liste);
  }

  function grp(icone, groupes, sep) {
    return { type: 'groupes', icone: icone, groupes: groupes, sep: sep || null };
  }

  /* ================================================================
     COMPTER (6-8 ans) - dénombrement, « combien y en a-t-il »
     ================================================================ */
  function compter(niveau, mode) {
    var max = [0, 6, 9, 12, 15, 20, 25][Math.min(niveau, 6)];
    var ic = Icons.comptableAuHasard();

    if (mode === 'comprendre') {
      var n = U.hasard(2, Math.min(max, 8));
      return {
        variante: 'objets',
        texte: 'Compte : combien y a-t-il de ' + Icons.nom(ic, 2) + ' ?',
        aide: 'Touche-les du doigt sur l\'écran, un par un, en comptant à voix haute.',
        visuel: grp(ic, [n]),
        type: 'choix',
        choix: choixNb(n, [n - 1, n + 1, n + 2], ['Tu en as oublié un.', 'Tu en as compté un de trop.', null]),
        explication: 'Il y en a ' + n + ', on dit « ' + U.enLettres(n) + ' ».'
      };
    }

    if (mode === 'entrainement') {
      /* Deux groupes séparés : on compte le total. Représentation
         différente, même notion. */
      var a = U.hasard(2, Math.max(3, Math.floor(max / 2)));
      var b = U.hasard(1, Math.max(2, Math.floor(max / 2)));
      return {
        variante: 'groupes',
        texte: 'Combien de ' + Icons.nom(ic, 2) + ' en tout ?',
        visuel: grp(ic, [a, b], 'et'),
        type: 'choix',
        choix: choixNb(a + b, [a + b - 1, a + b + 1, a]),
        explication: a + ' et ' + b + ', cela fait ' + (a + b) + '.'
      };
    }

    /* Transfert : on part du MOT écrit, il faut retrouver la quantité.
       Un enfant qui a seulement mémorisé « l'image avec beaucoup de
       points = 8 » se trompe ici. */
    var cible = U.hasard(3, Math.min(max, 12));
    var faux1 = U.hasardSauf(2, Math.min(max, 14), [cible]);
    var faux2 = U.hasardSauf(2, Math.min(max, 14), [cible, faux1]);
    var options = U.melange([
      { visuel: grp(ic, [cible]), ok: true },
      { visuel: grp(ic, [faux1]), ok: false },
      { visuel: grp(ic, [faux2]), ok: false }
    ]);
    return {
      variante: 'mot',
      texte: 'Montre le groupe où il y a « ' + U.enLettres(cible) + ' » ' + Icons.nom(ic, 2) + '.',
      type: 'choix',
      choix: options,
      explication: '« ' + U.enLettres(cible) + ' » s\'écrit ' + cible + '.'
    };
  }

  /* ================================================================
     LES NOMBRES (6-9 ans) - chiffre, mot, ordre, comparaison
     ================================================================ */
  function nombres(niveau, mode) {
    var max = [0, 10, 20, 50, 100, 500, 1000][Math.min(niveau, 6)];

    if (mode === 'comprendre') {
      var n = U.hasard(1, Math.min(max, 20));
      return {
        variante: 'mot',
        texte: 'Quel nombre s\'écrit « ' + U.enLettres(n) + ' » ?',
        aide: 'Lis le mot doucement, puis cherche le chiffre qui lui correspond.',
        visuel: n <= 12 ? grp('etoile', [n]) : null,
        type: 'choix',
        choix: choixNb(n, [n + 1, n - 1, n * 10 > max ? n + 2 : n * 10]),
        explication: '« ' + U.enLettres(n) + ' » s\'écrit ' + n + '.'
      };
    }

    if (mode === 'entrainement') {
      if (Math.random() < 0.5) {
        var a = U.hasard(1, max), b = U.hasardSauf(1, max, [a]);
        var grand = Math.max(a, b);
        return {
          variante: 'chiffres',
          texte: 'Quel nombre est le plus grand ?',
          type: 'choix',
          choix: U.melange([{ t: String(a), ok: a === grand }, { t: String(b), ok: b === grand }]),
          explication: grand + ' est plus grand que ' + Math.min(a, b) + '.'
        };
      }
      var d = U.hasard(2, max - 2);
      return {
        variante: 'chiffres',
        texte: 'Quel nombre vient juste après ' + d + ' ?',
        type: 'nombre',
        reponse: String(d + 1),
        explication: 'Après ' + d + ' vient ' + (d + 1) + '.'
      };
    }

    /* Transfert : ranger trois nombres, ou trouver un nombre à partir de
       sa description. Impossible à faire par réflexe. */
    if (Math.random() < 0.5) {
      var t = U.melange([U.hasard(1, max), U.hasard(1, max), U.hasard(1, max)]);
      t = U.unique(t);
      while (t.length < 3) { t.push(U.hasardSauf(1, max, t)); }
      var trie = t.slice(0).sort(function (x, y) { return x - y; });
      return {
        variante: 'probleme',
        texte: 'Range du plus petit au plus grand : lequel vient en PREMIER ?',
        visuel: { type: 'texte', contenu: t.join('   -   ') },
        type: 'choix',
        choix: U.melange([
          { t: String(t[0]), ok: t[0] === trie[0] },
          { t: String(t[1]), ok: t[1] === trie[0] },
          { t: String(t[2]), ok: t[2] === trie[0] }
        ]),
        explication: 'Dans l\'ordre : ' + trie.join(' < ') + '.'
      };
    }
    var dizaines = U.hasard(1, Math.min(9, Math.floor(max / 10)));
    var unites = U.hasard(0, 9);
    var val = dizaines * 10 + unites;
    return {
      variante: 'inverse',
      texte: 'Je pense à un nombre avec ' + dizaines + ' dizaine(s) et ' + unites + ' unité(s). Quel est ce nombre ?',
      type: 'nombre',
      reponse: String(val),
      explication: dizaines + ' dizaines = ' + (dizaines * 10) + ', plus ' + unites + ' unités = ' + val + '.'
    };
  }

  /* ================================================================
     ADDITION (6-10 ans)
     ================================================================ */
  function addition(niveau, mode) {
    var max = [0, 5, 10, 20, 50, 100, 500][Math.min(niveau, 6)];
    var ic = Icons.comptableAuHasard();
    var a, b;

    if (mode === 'comprendre') {
      a = U.hasard(1, Math.min(max, 7)); b = U.hasard(1, Math.min(max, 6));
      return {
        variante: 'objets',
        texte: 'Combien cela fait-il en tout ?',
        aide: 'Compte le premier groupe, puis continue de compter avec le deuxième.',
        visuel: grp(ic, [a, b], '+'),
        type: 'choix',
        choix: choixNb(a + b, [a + b - 1, a + b + 1, Math.abs(a - b)],
          ['Il en manque un.', 'Un de trop.', 'Attention : ici on ajoute, on n\'enlève pas.']),
        explication: a + ' + ' + b + ' = ' + (a + b) + '.'
      };
    }

    if (mode === 'entrainement') {
      a = U.hasard(2, max); b = U.hasard(2, max);
      return {
        variante: 'chiffres',
        texte: a + ' + ' + b + ' = ?',
        type: 'nombre',
        reponse: String(a + b),
        explication: a + ' + ' + b + ' = ' + (a + b) + '.'
      };
    }

    /* Transfert : problème raconté, ou addition à trou (opération inverse). */
    if (Math.random() < 0.55) {
      var p = deuxNoms();
      a = U.hasard(3, max); b = U.hasard(3, max);
      var objet = Icons.nom(ic, 2);
      return {
        variante: 'probleme',
        texte: p[0] + ' a ramassé ' + a + ' ' + objet + '. ' + p[1] + ' en a ramassé ' + b +
          '. Combien en ont-ils à eux deux ?',
        type: 'choix',
        choix: choixNb(a + b, [Math.abs(a - b), a, b],
          ['Là tu as cherché la différence. La question demande le total.', null, null]),
        pourquoi: {
          texte: 'Pourquoi as-tu additionné ?',
          choix: U.melange([
            { t: 'Parce qu\'on met les deux tas ensemble.', ok: true },
            { t: 'Parce qu\'il y a deux nombres dans l\'histoire.', ok: false, msg: 'Deux nombres ne veulent pas dire addition : parfois il faut soustraire.' },
            { t: 'Parce que le plus grand nombre est en premier.', ok: false }
          ])
        },
        explication: a + ' + ' + b + ' = ' + (a + b) + ' ' + objet + '.'
      };
    }
    a = U.hasard(2, max); var total = a + U.hasard(2, max);
    return {
      variante: 'inverse',
      texte: a + ' + ? = ' + total + '. Quel nombre manque ?',
      aide: 'Cherche ce qu\'il faut ajouter à ' + a + ' pour arriver à ' + total + '.',
      type: 'nombre',
      reponse: String(total - a),
      explication: total + ' - ' + a + ' = ' + (total - a) + ', donc le nombre manquant est ' + (total - a) + '.'
    };
  }

  /* ================================================================
     SOUSTRACTION (7-11 ans)
     ================================================================ */
  function soustraction(niveau, mode) {
    var max = [0, 8, 15, 30, 60, 100, 500][Math.min(niveau, 6)];
    var ic = Icons.comptableAuHasard();
    var a, b;

    if (mode === 'comprendre') {
      a = U.hasard(4, Math.min(max, 10)); b = U.hasard(1, a - 1);
      return {
        variante: 'objets',
        texte: 'Il y avait ' + a + ' ' + Icons.nom(ic, a) + '. On en enlève ' + b + '. Combien en reste-t-il ?',
        aide: 'Les objets barrés sont ceux qu\'on enlève. Compte ceux qui restent.',
        visuel: { type: 'groupes', icone: ic, groupes: [a], barres: b },
        type: 'choix',
        choix: choixNb(a - b, [a + b, a - b - 1, a - b + 1],
          ['Attention : ici on enlève, on n\'ajoute pas.', null, null]),
        explication: a + ' - ' + b + ' = ' + (a - b) + '.'
      };
    }

    if (mode === 'entrainement') {
      a = U.hasard(5, max); b = U.hasard(1, a);
      return {
        variante: 'chiffres',
        texte: a + ' - ' + b + ' = ?',
        type: 'nombre',
        reponse: String(a - b),
        explication: a + ' - ' + b + ' = ' + (a - b) + '.'
      };
    }

    var p = deuxNoms();
    if (Math.random() < 0.5) {
      a = U.hasard(10, max); b = U.hasard(2, a - 1);
      return {
        variante: 'probleme',
        texte: p[0] + ' avait ' + a + ' ' + Icons.nom(ic, a) + '. Il en donne ' + b + ' à ' + p[1] +
          '. Combien lui en reste-t-il ?',
        type: 'choix',
        choix: choixNb(a - b, [a + b, b, a],
          ['Il en donne, donc il en a moins qu\'avant.', 'C\'est ce que reçoit ' + p[1] + ', pas ce qui reste à ' + p[0] + '.', null]),
        explication: a + ' - ' + b + ' = ' + (a - b) + '.'
      };
    }
    /* Comparaison : « combien de plus ? » - même opération, tout autre habillage. */
    a = U.hasard(10, max); b = U.hasardSauf(2, max, [a]);
    var g = Math.max(a, b), pt = Math.min(a, b);
    return {
      variante: 'probleme',
      texte: p[0] + ' a marqué ' + a + ' points au basket, ' + p[1] + ' en a marqué ' + b +
        '. Combien de points d\'écart ?',
      type: 'nombre',
      reponse: String(g - pt),
      pourquoi: {
        texte: 'Pourquoi une soustraction alors que personne ne perd de points ?',
        choix: U.melange([
          { t: 'Parce que soustraire sert aussi à comparer deux nombres.', ok: true },
          { t: 'Parce qu\'il faut toujours soustraire quand il y a deux joueurs.', ok: false },
          { t: 'Parce que le mot « écart » veut dire moins.', ok: false, msg: 'C\'est le sens de la question qui compte, pas un mot magique.' }
        ])
      },
      explication: g + ' - ' + pt + ' = ' + (g - pt) + ' points d\'écart.'
    };
  }

  /* ================================================================
     MULTIPLICATION (8-13 ans)
     Ici le par-cœur est le plus dangereux : réciter « 7 fois 8, 56 »
     sans savoir ce que ça veut dire. D'où la grille d'objets.
     ================================================================ */
  function multiplication(niveau, mode) {
    var maxTable = [0, 5, 6, 8, 10, 12, 15][Math.min(niveau, 6)];
    var a = U.hasard(2, maxTable), b = U.hasard(2, maxTable);
    var ic = Icons.comptableAuHasard();

    if (mode === 'comprendre') {
      a = U.hasard(2, Math.min(maxTable, 6)); b = U.hasard(2, Math.min(maxTable, 6));
      return {
        variante: 'objets',
        texte: a + ' rangées de ' + b + ' ' + Icons.nom(ic, b) + '. Combien en tout ?',
        aide: 'Multiplier, c\'est compter des groupes tous pareils. Tu peux aussi additionner ' +
          b + ' plus ' + b + ' plus ...',
        visuel: { type: 'grille', icone: ic, lignes: a, colonnes: b },
        type: 'choix',
        choix: choixNb(a * b, [a + b, a * b - b, a * b + b],
          ['Là tu as additionné. Ici chaque rangée compte ' + b + ' objets.', null, null]),
        explication: a + ' × ' + b + ' = ' + (a * b) + ', c\'est ' + a + ' fois ' + b + '.'
      };
    }

    if (mode === 'entrainement') {
      return {
        variante: 'chiffres',
        texte: a + ' × ' + b + ' = ?',
        type: 'nombre',
        reponse: String(a * b),
        explication: a + ' × ' + b + ' = ' + (a * b) + '.'
      };
    }

    var r = Math.random();
    if (r < 0.35) {
      /* Inverse : on donne le résultat, il faut retrouver l'opération.
         Impossible en récitant la table dans l'ordre. */
      var prod = a * b;
      var faux = [];
      for (var i = 0; i < 6 && faux.length < 3; i++) {
        var x = U.hasard(2, maxTable), y = U.hasard(2, maxTable);
        if (x * y !== prod) { faux.push({ t: x + ' × ' + y, ok: false }); }
      }
      return {
        variante: 'inverse',
        texte: 'Quelle multiplication donne ' + prod + ' ?',
        type: 'choix',
        choix: U.melange([{ t: a + ' × ' + b, ok: true }].concat(faux.slice(0, 3))),
        explication: a + ' × ' + b + ' = ' + prod + '.'
      };
    }
    if (r < 0.7) {
      var p = nom();
      return {
        variante: 'probleme',
        texte: p + ' range les œufs dans ' + a + ' paniers. Chaque panier contient ' + b +
          ' œufs. Combien d\'œufs au total ?',
        type: 'choix',
        choix: choixNb(a * b, [a + b, a * b - a, b],
          ['Attention : il y a ' + a + ' paniers de ' + b + ', pas ' + a + ' plus ' + b + '.', null, null]),
        pourquoi: {
          texte: 'Pourquoi une multiplication ?',
          choix: U.melange([
            { t: 'Parce que tous les paniers contiennent le même nombre d\'œufs.', ok: true },
            { t: 'Parce que le nombre est grand.', ok: false },
            { t: 'Parce qu\'il y a le mot « total ».', ok: false, msg: 'Une addition aussi donne un total. Ce qui compte, c\'est que les groupes soient identiques.' }
          ])
        },
        explication: a + ' paniers × ' + b + ' œufs = ' + (a * b) + ' œufs.'
      };
    }
    /* Facteur manquant. */
    return {
      variante: 'inverse',
      texte: a + ' × ? = ' + (a * b) + '. Quel nombre manque ?',
      type: 'nombre',
      reponse: String(b),
      explication: (a * b) + ' ÷ ' + a + ' = ' + b + '.'
    };
  }

  /* ================================================================
     DIVISION ET PARTAGE (9-14 ans)
     ================================================================ */
  function division(niveau, mode) {
    var maxD = [0, 4, 5, 7, 9, 12, 15][Math.min(niveau, 6)];
    var d = U.hasard(2, maxD), q = U.hasard(2, maxD);
    var total = d * q;
    var ic = Icons.comptableAuHasard();

    if (mode === 'comprendre') {
      d = U.hasard(2, 4); q = U.hasard(2, 5); total = d * q;
      return {
        variante: 'objets',
        texte: 'On partage ' + total + ' ' + Icons.nom(ic, total) + ' entre ' + d +
          ' enfants, également. Combien chacun en reçoit-il ?',
        aide: 'Distribue un objet à chaque enfant, puis recommence, jusqu\'à ce qu\'il n\'en reste plus.',
        visuel: { type: 'grille', icone: ic, lignes: d, colonnes: q, etiquettes: true },
        type: 'choix',
        choix: choixNb(q, [total, d, q + 1]),
        explication: total + ' ÷ ' + d + ' = ' + q + ' pour chacun.'
      };
    }

    if (mode === 'entrainement') {
      return {
        variante: 'chiffres',
        texte: total + ' ÷ ' + d + ' = ?',
        type: 'nombre',
        reponse: String(q),
        explication: total + ' ÷ ' + d + ' = ' + q + '.'
      };
    }

    if (Math.random() < 0.5) {
      /* Division avec reste : le cas que le par-cœur rate toujours. */
      var reste = U.hasard(1, d - 1);
      var t2 = total + reste;
      return {
        variante: 'probleme',
        texte: 'Il y a ' + t2 + ' ' + Icons.nom(ic, t2) + ' à partager entre ' + d +
          ' enfants. Chacun doit en avoir autant. Combien en restera-t-il à la fin ?',
        type: 'nombre',
        reponse: String(reste),
        aide: 'Combien chacun peut-il en prendre ? Et ensuite, combien n\'ont pas pu être distribués ?',
        explication: t2 + ' = ' + d + ' × ' + q + ' + ' + reste + '. Chacun en a ' + q +
          ', et il en reste ' + reste + '.'
      };
    }
    return {
      variante: 'inverse',
      texte: 'Chaque équipe de football compte ' + q + ' joueurs. Il y a ' + total +
        ' joueurs en tout. Combien d\'équipes peut-on former ?',
      type: 'choix',
      choix: choixNb(d, [total - q, q, total]),
      pourquoi: {
        texte: 'Ici on cherche le nombre de groupes, pas la taille des groupes. Quelle opération ?',
        choix: U.melange([
          { t: 'Une division : on cherche combien de fois ' + q + ' tient dans ' + total + '.', ok: true },
          { t: 'Une multiplication, car il y a plusieurs équipes.', ok: false },
          { t: 'Une soustraction, car on retire les joueurs un par un.', ok: false, msg: 'On peut le faire ainsi, mais c\'est très long : la division fait ça d\'un coup.' }
        ])
      },
      explication: total + ' ÷ ' + q + ' = ' + d + ' équipes.'
    };
  }

  /* ================================================================
     FRACTIONS (10-15 ans)
     ================================================================ */
  function fractions(niveau, mode) {
    var maxDen = [0, 4, 6, 8, 10, 12, 12][Math.min(niveau, 6)];
    var den = U.hasard(2, maxDen), num = U.hasard(1, den - 1);

    if (mode === 'comprendre') {
      den = U.tire([2, 3, 4, 5, 6, 8]); num = U.hasard(1, den - 1);
      return {
        variante: 'objets',
        texte: 'Quelle fraction de la barre est coloriée ?',
        aide: 'En bas, on compte les parts égales : c\'est le dénominateur. En haut, les parts coloriées.',
        visuel: { type: 'barre', total: den, pris: num },
        type: 'choix',
        choix: U.melange([
          { t: num + '/' + den, ok: true },
          { t: den + '/' + num, ok: false, msg: 'Tu as inversé : le nombre de parts TOTALES va en bas.' },
          { t: num + '/' + (den - num), ok: false, msg: 'En bas on met TOUTES les parts, pas seulement celles qui restent.' }
        ]),
        explication: num + ' parts coloriées sur ' + den + ' parts égales, donc ' + num + '/' + den + '.'
      };
    }

    if (mode === 'entrainement') {
      if (Math.random() < 0.5) {
        var a = U.hasard(1, 5), b = U.hasard(2, 6);
        var c = U.hasard(1, 5);
        return {
          variante: 'chiffres',
          texte: a + '/' + b + ' + ' + c + '/' + b + ' = ?  (donne le numérateur du résultat)',
          type: 'nombre',
          reponse: String(a + c),
          explication: 'Même dénominateur : on additionne seulement les numérateurs. ' +
            a + '/' + b + ' + ' + c + '/' + b + ' = ' + (a + c) + '/' + b + '.'
        };
      }
      var t = U.tire([12, 16, 20, 24, 30, 36]);
      var dd = U.tire([2, 3, 4, 6]);
      while (t % dd !== 0) { dd = U.tire([2, 3, 4, 6]); }
      return {
        variante: 'chiffres',
        texte: 'Combien font 1/' + dd + ' de ' + t + ' ?',
        type: 'nombre',
        reponse: String(t / dd),
        explication: t + ' ÷ ' + dd + ' = ' + (t / dd) + '.'
      };
    }

    if (Math.random() < 0.5) {
      /* Comparaison de fractions : le piège classique du par-cœur, car
         « le plus grand nombre en bas » ne veut PAS dire la plus grande
         fraction. */
      var d1 = U.tire([2, 3, 4, 5, 6, 8]), d2 = U.tire([2, 3, 4, 5, 6, 8]);
      while (d2 === d1) { d2 = U.tire([2, 3, 4, 5, 6, 8]); }
      var plusGrande = (1 / d1 > 1 / d2) ? d1 : d2;
      return {
        variante: 'probleme',
        texte: 'On partage la même mangue. Vaut-il mieux recevoir 1/' + d1 + ' ou 1/' + d2 + ' ?',
        type: 'choix',
        choix: U.melange([
          { t: '1/' + d1, ok: d1 === plusGrande },
          { t: '1/' + d2, ok: d2 === plusGrande }
        ]),
        pourquoi: {
          texte: 'Pourquoi ?',
          choix: U.melange([
            { t: 'Plus on partage entre de personnes, plus les parts sont petites.', ok: true },
            { t: 'Parce que le plus grand nombre donne la plus grosse part.', ok: false, msg: 'Attention, c\'est l\'inverse pour les fractions : 1/8 est plus petit que 1/2.' },
            { t: 'Parce que les deux parts sont égales.', ok: false }
          ])
        },
        explication: '1/' + plusGrande + ' est la plus grosse part : moins il y a de parts, plus chaque part est grande.'
      };
    }
    var eq = U.tire([2, 3, 4, 5]);
    var n0 = U.hasard(1, 4), d0 = U.hasard(n0 + 1, 8);
    return {
      variante: 'inverse',
      texte: n0 + '/' + d0 + ' = ? / ' + (d0 * eq) + '. Quel numérateur manque ?',
      type: 'nombre',
      reponse: String(n0 * eq),
      aide: 'Le dénominateur a été multiplié par ' + eq + '. Il faut faire pareil en haut.',
      explication: 'On multiplie en haut et en bas par ' + eq + ' : ' + (n0 * eq) + '/' + (d0 * eq) + '.'
    };
  }

  /* ================================================================
     ARGENT - FRANCS CFA (9-18 ans). Utile tout de suite au marché.
     ================================================================ */
  var PRODUITS = [
    { nom: 'un pain', prix: [100, 200, 250] },
    { nom: 'un sachet d\'eau', prix: [25, 50] },
    { nom: 'un cahier', prix: [200, 300, 500] },
    { nom: 'un stylo', prix: [100, 150, 200] },
    { nom: 'une mangue', prix: [50, 100, 150] },
    { nom: 'un régime de bananes', prix: [500, 750, 1000] },
    { nom: 'un savon', prix: [200, 250, 300] },
    { nom: 'un kilo de riz', prix: [500, 600, 700] },
    { nom: 'un ballon', prix: [2000, 2500, 3000] }
  ];

  function monnaie(niveau, mode) {
    var p = U.tire(PRODUITS);
    var prix = U.tire(p.prix);
    var qte = U.hasard(2, [0, 3, 4, 5, 6, 8, 10][Math.min(niveau, 6)]);

    if (mode === 'comprendre') {
      return {
        variante: 'objets',
        texte: 'Tu achètes ' + qte + ' fois ' + p.nom + ' à ' + U.cfa(prix) + ' l\'unité. Combien payes-tu ?',
        aide: 'Additionne ' + U.cfa(prix) + ' autant de fois qu\'il y a d\'articles, ou multiplie.',
        visuel: { type: 'texte', contenu: qte + ' × ' + U.cfa(prix) },
        type: 'choix',
        choix: choixNb(prix * qte, [prix + qte, prix * qte - prix, prix]),
        explication: qte + ' × ' + prix + ' = ' + U.cfa(prix * qte) + '.'
      };
    }

    if (mode === 'entrainement') {
      var donne = Math.ceil((prix * qte) / 500) * 500 + U.tire([0, 500, 1000]);
      return {
        variante: 'chiffres',
        texte: 'Total à payer : ' + U.cfa(prix * qte) + '. Tu donnes ' + U.cfa(donne) +
          '. Combien te rend-on ?',
        type: 'nombre',
        reponse: String(donne - prix * qte),
        explication: donne + ' - ' + (prix * qte) + ' = ' + U.cfa(donne - prix * qte) + '.'
      };
    }

    /* Transfert : budget, ou « est-ce que ça suffit ? » */
    if (Math.random() < 0.5) {
      var budget = U.tire([1000, 2000, 5000]);
      var possible = Math.floor(budget / prix);
      return {
        variante: 'probleme',
        texte: 'Tu as ' + U.cfa(budget) + '. ' + U.maj(p.nom) + ' coûte ' + U.cfa(prix) +
          '. Combien peux-tu en acheter au maximum ?',
        type: 'nombre',
        reponse: String(possible),
        aide: 'Combien de fois ' + prix + ' tient dans ' + budget + ' ?',
        explication: budget + ' ÷ ' + prix + ' = ' + possible + ' (on ne peut pas acheter un morceau d\'article).'
      };
    }
    var p2 = U.tire(PRODUITS);
    var prix2 = U.tire(p2.prix);
    var q2 = U.hasard(1, 4);
    var totalAchat = prix * qte + prix2 * q2;
    var billet = U.tire([2000, 5000, 10000]);
    while (billet < totalAchat) { billet = billet * 2; }
    return {
      variante: 'probleme',
      texte: 'Au marché : ' + qte + ' × ' + p.nom + ' à ' + U.cfa(prix) + ' et ' + q2 + ' × ' +
        p2.nom + ' à ' + U.cfa(prix2) + '. Tu payes avec ' + U.cfa(billet) + '. Combien te rend-on ?',
      type: 'nombre',
      reponse: String(billet - totalAchat),
      aide: 'D\'abord le total des achats, ensuite seulement la monnaie.',
      explication: 'Total : ' + U.cfa(totalAchat) + '. Monnaie : ' + billet + ' - ' + totalAchat +
        ' = ' + U.cfa(billet - totalAchat) + '.'
    };
  }

  /* ================================================================
     POURCENTAGES ET PROPORTIONS (12-18 ans)
     ================================================================ */
  function pourcentage(niveau, mode) {
    var pcts = [10, 20, 25, 50, 75, 5, 15, 30];
    var pc = U.tire(pcts.slice(0, Math.min(4 + niveau, pcts.length)));
    var base = U.tire([200, 400, 500, 800, 1000, 1200, 2000, 4000]);

    if (mode === 'comprendre') {
      pc = U.tire([10, 25, 50]);
      return {
        variante: 'objets',
        texte: 'Combien font ' + pc + ' % de ' + base + ' ?',
        aide: pc === 50 ? '50 %, c\'est la moitié.' : (pc === 25 ? '25 %, c\'est le quart.' : '10 %, c\'est diviser par 10.'),
        visuel: { type: 'barre', total: 100, pris: pc, compact: true },
        type: 'choix',
        choix: choixNb(base * pc / 100, [base - pc, pc, base * pc]),
        explication: pc + ' % de ' + base + ' = ' + base + ' × ' + pc + ' ÷ 100 = ' + (base * pc / 100) + '.'
      };
    }

    if (mode === 'entrainement') {
      return {
        variante: 'chiffres',
        texte: pc + ' % de ' + base + ' = ?',
        type: 'nombre',
        reponse: String(base * pc / 100),
        explication: base + ' × ' + pc + ' ÷ 100 = ' + (base * pc / 100) + '.'
      };
    }

    if (Math.random() < 0.5) {
      var remise = U.tire([10, 20, 25, 50]);
      return {
        variante: 'probleme',
        texte: 'Un maillot coûte ' + U.cfa(base) + '. Le vendeur fait ' + remise +
          ' % de réduction. Combien payes-tu ?',
        type: 'choix',
        choix: choixNb(base * (100 - remise) / 100, [base * remise / 100, base - remise, base],
          ['C\'est la réduction elle-même, pas le prix à payer.', null, null]),
        pourquoi: {
          texte: 'Pourquoi ne pas s\'arrêter à ' + (base * remise / 100) + ' ?',
          choix: U.melange([
            { t: 'Parce que ce nombre est la remise ; il faut la retirer du prix.', ok: true },
            { t: 'Parce qu\'il faut toujours multiplier à la fin.', ok: false },
            { t: 'Parce que le prix ne change jamais.', ok: false }
          ])
        },
        explication: 'Remise : ' + U.cfa(base * remise / 100) + '. Prix payé : ' + U.cfa(base * (100 - remise) / 100) + '.'
      };
    }
    var tirs = U.tire([10, 20, 25, 40, 50]);
    var reussis = U.hasard(1, tirs);
    return {
      variante: 'inverse',
      texte: 'Au basket, ' + nom() + ' tente ' + tirs + ' tirs et en réussit ' + reussis +
        '. Quel est son pourcentage de réussite ?',
      type: 'nombre',
      reponse: String(Math.round(reussis / tirs * 100)),
      aide: 'Pourcentage = partie ÷ total × 100.',
      explication: reussis + ' ÷ ' + tirs + ' × 100 = ' + Math.round(reussis / tirs * 100) + ' %.'
    };
  }

  /* ================================================================
     GÉOMÉTRIE ET MESURES (10-16 ans) - le terrain de sport
     ================================================================ */
  function geometrie(niveau, mode) {
    var L = U.hasard(4, 6 + niveau * 4), l = U.hasard(3, 4 + niveau * 3);

    if (mode === 'comprendre') {
      L = U.hasard(4, 9); l = U.hasard(2, 6);
      return {
        variante: 'objets',
        texte: 'Quel est le périmètre de ce terrain (le tour complet) ?',
        aide: 'Le périmètre, c\'est la longueur du chemin si tu fais le tour à pied : ' +
          L + ' + ' + l + ' + ' + L + ' + ' + l + '.',
        visuel: { type: 'figure', forme: 'rectangle', L: L, l: l },
        type: 'choix',
        choix: choixNb(2 * (L + l), [L * l, L + l, 2 * L],
          ['Ça, c\'est l\'aire (l\'intérieur), pas le tour.', 'Tu n\'as compté que deux côtés sur quatre.', null]),
        explication: 'Périmètre = 2 × (' + L + ' + ' + l + ') = ' + (2 * (L + l)) + ' m.'
      };
    }

    if (mode === 'entrainement') {
      var aire = Math.random() < 0.5;
      return {
        variante: 'chiffres',
        texte: 'Rectangle de ' + L + ' m sur ' + l + ' m. Quel est ' + (aire ? 'l\'aire en m² ?' : 'le périmètre en m ?'),
        visuel: { type: 'figure', forme: 'rectangle', L: L, l: l },
        type: 'nombre',
        reponse: String(aire ? L * l : 2 * (L + l)),
        explication: aire ? ('Aire = ' + L + ' × ' + l + ' = ' + (L * l) + ' m².')
          : ('Périmètre = 2 × (' + L + ' + ' + l + ') = ' + (2 * (L + l)) + ' m.')
      };
    }

    if (Math.random() < 0.5) {
      /* Transfert : deux rectangles de même périmètre mais d'aires
         différentes. Impossible à deviner par habitude. */
      var a1 = { L: 8, l: 4 }, a2 = { L: 6, l: 6 };
      return {
        variante: 'probleme',
        texte: 'Deux enclos à poules ont le même tour de grillage (24 m) : l\'un fait 8 m × 4 m, ' +
          'l\'autre 6 m × 6 m. Lequel donne le plus de place aux poules ?',
        type: 'choix',
        choix: U.melange([
          { t: 'Le 6 m × 6 m', ok: true },
          { t: 'Le 8 m × 4 m', ok: false, msg: '8 × 4 = 32 m², alors que 6 × 6 = 36 m². Le carré gagne.' },
          { t: 'Les deux pareils, le tour est le même', ok: false, msg: 'Même périmètre ne veut pas dire même aire ! C\'est le piège.' }
        ]),
        explication: '8 × 4 = 32 m² et 6 × 6 = 36 m². À périmètre égal, le carré offre la plus grande aire.'
      };
    }
    var aireCible = L * l;
    return {
      variante: 'inverse',
      texte: 'Un terrain rectangulaire a une aire de ' + aireCible + ' m² et une longueur de ' +
        L + ' m. Quelle est sa largeur ?',
      type: 'nombre',
      reponse: String(l),
      aide: 'Aire = Longueur × largeur. Donc largeur = Aire ÷ Longueur.',
      explication: aireCible + ' ÷ ' + L + ' = ' + l + ' m.'
    };
  }

  /* ================================================================
     ALGÈBRE (13-18 ans)
     ================================================================ */
  function algebre(niveau, mode) {
    var a = U.hasard(2, 3 + niveau), x = U.hasard(2, 5 + niveau), b = U.hasard(1, 10 + niveau * 3);
    var res = a * x + b;

    if (mode === 'comprendre') {
      a = U.hasard(2, 4); x = U.hasard(2, 6); b = U.hasard(1, 10); res = a * x + b;
      return {
        variante: 'objets',
        texte: 'Une balance est en équilibre : ' + a + ' sacs identiques plus ' + b +
          ' kg d\'un côté, ' + res + ' kg de l\'autre. Combien pèse un sac ?',
        aide: 'Enlève d\'abord les ' + b + ' kg des deux côtés, puis partage en ' + a + ' parts égales.',
        visuel: { type: 'texte', contenu: a + 'x + ' + b + ' = ' + res },
        type: 'choix',
        choix: choixNb(x, [res - b, res / a, x + 1],
          ['Tu as bien enlevé ' + b + ', mais il reste à partager entre les ' + a + ' sacs.', null, null]),
        explication: a + 'x + ' + b + ' = ' + res + ' → ' + a + 'x = ' + (res - b) + ' → x = ' + x + '.'
      };
    }

    if (mode === 'entrainement') {
      return {
        variante: 'chiffres',
        texte: 'Résous : ' + a + 'x + ' + b + ' = ' + res + '.  x = ?',
        type: 'nombre',
        reponse: String(x),
        explication: a + 'x = ' + res + ' - ' + b + ' = ' + (res - b) + ', donc x = ' + (res - b) + ' ÷ ' + a + ' = ' + x + '.'
      };
    }

    if (Math.random() < 0.5) {
      var prixU = U.tire([150, 200, 250, 500]);
      var frais = U.tire([200, 500, 1000]);
      var n = U.hasard(2, 8);
      var totalP = prixU * n + frais;
      return {
        variante: 'probleme',
        texte: 'Un taxi-moto demande ' + U.cfa(frais) + ' de prise en charge plus ' + U.cfa(prixU) +
          ' par kilomètre. La course a coûté ' + U.cfa(totalP) + '. Combien de kilomètres ?',
        type: 'nombre',
        reponse: String(n),
        aide: 'Écris l\'équation : ' + prixU + ' × k + ' + frais + ' = ' + totalP + '.',
        pourquoi: {
          texte: 'Pourquoi retirer ' + U.cfa(frais) + ' avant de diviser ?',
          choix: U.melange([
            { t: 'Parce que cette somme ne dépend pas du nombre de kilomètres.', ok: true },
            { t: 'Parce qu\'il faut toujours soustraire en premier.', ok: false, msg: 'Non : ici c\'est parce que cette part est fixe.' },
            { t: 'Parce que c\'est le plus petit nombre.', ok: false }
          ])
        },
        explication: '(' + totalP + ' - ' + frais + ') ÷ ' + prixU + ' = ' + n + ' km.'
      };
    }
    /* On garde un résultat positif : le pavé de saisie à l'écran ne
       comporte pas de signe « moins ». Les nombres relatifs viendront
       dans une notion à part. */
    var retire = U.hasard(1, Math.max(1, a * x - 1));
    return {
      variante: 'inverse',
      texte: 'Si x = ' + x + ', que vaut ' + a + 'x - ' + retire + ' ?',
      type: 'nombre',
      reponse: String(a * x - retire),
      explication: a + ' × ' + x + ' - ' + retire + ' = ' + (a * x - retire) + '.'
    };
  }

  return {
    compter: compter, nombres: nombres, addition: addition, soustraction: soustraction,
    multiplication: multiplication, division: division, fractions: fractions,
    monnaie: monnaie, pourcentage: pourcentage, geometrie: geometrie, algebre: algebre,
    NOMS: NOMS, nom: nom, choixNb: choixNb
  };
})();
