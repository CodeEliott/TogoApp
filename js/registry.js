/* registry.js - catalogue des activités.

   Chaque entrée relie un identifiant de notion (utilisé par le moteur de
   maîtrise pour suivre les progrès) à sa fabrique de questions.

   ageMin / ageMax servent seulement à PROPOSER les activités adaptées :
   rien n'est interdit. Un grand qui a des lacunes doit pouvoir refaire les
   additions sans avoir l'impression d'être puni, et un petit très à l'aise
   doit pouvoir aller voir plus loin. */

var Activites = (function () {

  var LISTE = [
    /* ---- L'ordinateur (à faire en premier quand on débute) ---- */
    { id: 'ordi.souris', titre: 'La souris', matiere: 'ordi', icone: 'souris', ageMin: 6, ageMax: 18, gen: QMonde.souris,
      resume: 'Viser, cliquer, glisser-déposer.' },
    { id: 'ordi.clavier', titre: 'Le clavier', matiere: 'ordi', icone: 'clavier', ageMin: 6, ageMax: 18, gen: QMonde.clavier,
      resume: 'Trouver les lettres, écrire un mot, une phrase.' },

    /* ---- Les nombres ---- */
    { id: 'math.compter', titre: 'Compter', matiere: 'nombres', icone: 'oeuf', ageMin: 6, ageMax: 9, gen: QMath.compter,
      resume: 'Dénombrer des objets, associer quantité et nombre.' },
    { id: 'math.nombres', titre: 'Les nombres', matiere: 'nombres', icone: 'etoile', ageMin: 6, ageMax: 10, gen: QMath.nombres,
      resume: 'Lire, écrire, comparer et ranger les nombres.' },
    { id: 'math.addition', titre: 'Additions', matiere: 'nombres', icone: 'panier', ageMin: 6, ageMax: 12, gen: QMath.addition,
      resume: 'Ajouter, et retrouver ce qui manque.' },
    { id: 'math.soustraction', titre: 'Soustractions', matiere: 'nombres', icone: 'poule', ageMin: 7, ageMax: 13, gen: QMath.soustraction,
      resume: 'Enlever, comparer, calculer un écart.' },
    { id: 'math.multiplication', titre: 'Multiplications', matiere: 'nombres', icone: 'basket', ageMin: 8, ageMax: 15, gen: QMath.multiplication,
      resume: 'Les tables, mais en comprenant ce qu\'elles veulent dire.' },
    { id: 'math.division', titre: 'Divisions et partages', matiere: 'nombres', icone: 'mangue', ageMin: 9, ageMax: 16, gen: QMath.division,
      resume: 'Partager équitablement, et le reste.' },
    { id: 'math.fractions', titre: 'Fractions', matiere: 'nombres', icone: 'banane', ageMin: 10, ageMax: 18, gen: QMath.fractions,
      resume: 'Les parts, comparer, additionner.' },
    { id: 'math.monnaie', titre: 'L\'argent (F CFA)', matiere: 'nombres', icone: 'calebasse', ageMin: 9, ageMax: 18, gen: QMath.monnaie,
      resume: 'Payer, rendre la monnaie, tenir un budget.' },
    { id: 'math.pourcentage', titre: 'Pourcentages', matiere: 'nombres', icone: 'ballon', ageMin: 12, ageMax: 18, gen: QMath.pourcentage,
      resume: 'Réductions, proportions, statistiques de match.' },
    { id: 'math.geometrie', titre: 'Formes et mesures', matiere: 'nombres', icone: 'maison', ageMin: 10, ageMax: 18, gen: QMath.geometrie,
      resume: 'Périmètre, aire, terrains de sport.' },
    { id: 'math.algebre', titre: 'Trouver l\'inconnue', matiere: 'nombres', icone: 'crayon', ageMin: 13, ageMax: 18, gen: QMath.algebre,
      resume: 'Les équations, à partir de situations réelles.' },

    /* ---- Les mots ---- */
    { id: 'fr.sons', titre: 'Les sons et les lettres', matiere: 'mots', icone: 'coeur', ageMin: 6, ageMax: 9, gen: QFr.sons,
      resume: 'Reconnaître le début des mots. Tout en images.' },
    { id: 'fr.syllabes', titre: 'Syllabes et mots', matiere: 'mots', icone: 'cahier', ageMin: 6, ageMax: 10, gen: QFr.syllabes,
      resume: 'Découper les mots, lire le bon mot.' },
    { id: 'fr.orthographe', titre: 'Orthographe', matiere: 'mots', icone: 'crayon', ageMin: 9, ageMax: 18, gen: QFr.orthographe,
      resume: 'a / à, et / est, ou / où, son / sont, on / ont.' },
    { id: 'fr.conjugaison', titre: 'Conjugaison', matiere: 'mots', icone: 'etoile', ageMin: 9, ageMax: 18, gen: QFr.conjugaison,
      resume: 'Présent, futur, imparfait.' },
    { id: 'fr.grammaire', titre: 'Grammaire', matiere: 'mots', icone: 'cahier', ageMin: 10, ageMax: 18, gen: QFr.grammaire,
      resume: 'Nature des mots et accords.' },
    { id: 'fr.comprehension', titre: 'Comprendre un texte', matiere: 'mots', icone: 'maison', ageMin: 10, ageMax: 18, gen: QFr.comprehension,
      resume: 'Lire une histoire et raisonner dessus.' },

    /* ---- Le monde ---- */
    { id: 'sci.corps', titre: 'Le corps et la santé', matiere: 'monde', icone: 'coeur', ageMin: 8, ageMax: 18, gen: QMonde.corps,
      resume: 'Les organes, l\'hygiène, le paludisme.' },
    { id: 'sci.nature', titre: 'La nature', matiere: 'monde', icone: 'arbre', ageMin: 8, ageMax: 18, gen: QMonde.nature,
      resume: 'Les plantes, les animaux, l\'eau.' },
    { id: 'geo.togo', titre: 'Le Togo', matiere: 'monde', icone: 'drapeau', ageMin: 9, ageMax: 18, gen: QMonde.togo,
      resume: 'Les villes, les régions, les voisins.' }
  ];

  var MATIERES = [
    { id: 'ordi', titre: 'L\'ordinateur', icone: 'souris', couleur: 'c-ordi' },
    { id: 'nombres', titre: 'Les nombres', icone: 'oeuf', couleur: 'c-nombres' },
    { id: 'mots', titre: 'Les mots', icone: 'cahier', couleur: 'c-mots' },
    { id: 'monde', titre: 'Le monde', icone: 'drapeau', couleur: 'c-monde' }
  ];

  function parId(id) {
    for (var i = 0; i < LISTE.length; i++) { if (LISTE[i].id === id) { return LISTE[i]; } }
    return null;
  }

  function parMatiere(m) {
    var out = [];
    for (var i = 0; i < LISTE.length; i++) { if (LISTE[i].matiere === m) { out.push(LISTE[i]); } }
    return out;
  }

  /* Activités conseillées pour un joueur : celles de son âge d'abord,
     puis les autres.

     L'ordre doit rester STABLE. Une première version triait aussi par
     priorité de révision : la liste se réorganisait après chaque partie,
     et le bouton qu'un enfant venait d'utiliser changeait de place. Les
     plus jeunes repèrent les boutons par leur position bien avant de
     savoir lire leur titre : ce genre de « liste intelligente » leur fait
     perdre leurs repères. La priorité de révision est donc signalée par
     une étiquette « À revoir » sur la carte, sans jamais la déplacer. */
  function conseillees(joueur, matiere) {
    var l = matiere ? parMatiere(matiere) : LISTE.slice(0);
    var age = joueur.age || 10;
    var rang = {};
    for (var i = 0; i < LISTE.length; i++) { rang[LISTE[i].id] = i; }
    l.sort(function (a, b) {
      var da = (age < a.ageMin ? a.ageMin - age : (age > a.ageMax ? age - a.ageMax : 0));
      var db = (age < b.ageMin ? b.ageMin - age : (age > b.ageMax ? age - b.ageMax : 0));
      if (da !== db) { return da - db; }
      return rang[a.id] - rang[b.id];
    });
    return l;
  }

  /* Faut-il proposer de revoir cette notion ? (notion signalée « par cœur »,
     ou pas retravaillée depuis une semaine). */
  function aRevoir(joueur, a) {
    var e = Mastery.etat(joueur, a.id);
    if (e.n === 0) { return false; }
    if (e.drapeau) { return true; }
    return (U.maintenant() - (e.dernier || 0)) > 7 * 86400000;
  }

  function estDeSonAge(a, joueur) {
    var age = joueur.age || 10;
    return age >= a.ageMin && age <= a.ageMax;
  }

  return {
    liste: LISTE, matieres: MATIERES, parId: parId, parMatiere: parMatiere,
    conseillees: conseillees, estDeSonAge: estDeSonAge, aRevoir: aRevoir
  };
})();
