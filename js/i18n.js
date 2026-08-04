/* i18n.js - textes de l'interface.

   Le francais est la langue de l'ecole au Togo : c'est la langue principale
   de l'application et le contenu des exercices reste en francais.

   Une deuxieme langue (ewe / mina) peut etre affichee EN PLUS, en petit,
   sous les consignes, pour les plus jeunes qui lisent encore mal.

   IMPORTANT : le tableau LOCALE.ee est volontairement vide. Je ne veux pas
   inventer des traductions approximatives qui seraient ensuite apprises par
   les enfants. Remplis-le avec eux : c'est une excellente activite, ils
   adorent voir leur langue apparaitre dans l'ordinateur, et ce sont eux les
   experts. Il suffit d'ecrire la traduction entre les guillemets. Toute
   entree laissee vide retombe automatiquement sur le francais. */

var I18N = (function () {

  var FR = {
    'app.titre': 'La Solution',
    'app.soustitre': 'Apprendre en jouant',
    'accueil.choisir': 'Qui joue ?',
    'accueil.nouveau': 'Nouveau joueur',
    'accueil.animateur': 'Espace animateur',
    'accueil.aucun': 'Personne ne joue encore. Clique sur « Nouveau joueur ».',

    'profil.prenom': 'Ton prénom',
    'profil.avatar': 'Choisis ton image',
    'profil.age': 'Ton âge',
    'profil.creer': 'C\'est parti !',
    'profil.manque': 'Écris ton prénom d\'abord.',

    'menu.titre': 'Que veux-tu apprendre ?',
    'menu.maths': 'Les nombres',
    'menu.francais': 'Les mots',
    'menu.monde': 'Le monde',
    'menu.ordi': 'L\'ordinateur',
    'menu.progres': 'Mes progrès',
    'menu.changer': 'Changer de joueur',

    'jeu.valider': 'Valider',
    'jeu.continuer': 'Continuer',
    'jeu.suivant': 'Question suivante',
    'jeu.pourquoi': 'Et pourquoi ?',
    'jeu.bravo': 'Bravo !',
    'jeu.presque': 'Pas encore',
    'jeu.ecoute': 'Écouter',
    'jeu.aide': 'Aide-toi de l\'image',
    'jeu.fini': 'Partie terminée',
    'jeu.rejouer': 'Rejouer',
    'jeu.quitter': 'Retour au menu',
    'jeu.reponse': 'La bonne réponse était',

    'mode.comprendre': 'On comprend',
    'mode.entrainement': 'On s\'entraîne',
    'mode.transfert': 'On réfléchit',

    'prog.titre': 'Mes progrès',
    'prog.maitrise': 'Compris',
    'prog.encours': 'En cours',
    'prog.pasvu': 'Pas encore essayé',
    'prog.revoir': 'À revoir',

    'anim.titre': 'Espace animateur',
    'anim.code': 'Code',
    'anim.entrer': 'Entrer',
    'anim.mauvaiscode': 'Code incorrect.',
    'anim.export': 'Enregistrer les progrès (fichier)',
    'anim.import': 'Charger un fichier de progrès',
    'anim.langue': 'Deuxième langue affichée',
    'anim.aucune': 'Aucune',
    'anim.supprimer': 'Supprimer ce joueur',
    'anim.confirmer': 'Confirmer la suppression ?',
    'anim.parcoeur': 'Répond par cœur sans comprendre',
    'anim.retour': 'Retour'
  };

  /* A remplir avec les enfants. Une chaine vide = on affiche le francais. */
  var LOCALE = {
    ee: {
      /* Exemple, une fois verifie avec eux :
         'jeu.bravo': '...',
         'accueil.choisir': '...', */
    },
    mina: {
    }
  };

  var langue2 = 'aucune';

  function setLangue2(code) { langue2 = code || 'aucune'; }
  function getLangue2() { return langue2; }

  function t(cle) {
    return FR[cle] !== undefined ? FR[cle] : cle;
  }

  /* Traduction secondaire, ou null s'il n'y en a pas. */
  function t2(cle) {
    if (langue2 === 'aucune') { return null; }
    var table = LOCALE[langue2];
    if (!table) { return null; }
    var v = table[cle];
    return (v && v.length) ? v : null;
  }

  /* Bloc de texte "consigne" avec, si disponible, la ligne en langue locale. */
  function consigne(texte, cle) {
    var box = U.el('div', 'consigne');
    box.appendChild(U.el('p', 'consigne-fr', texte));
    var sec = cle ? t2(cle) : null;
    if (sec) { box.appendChild(U.el('p', 'consigne-2', sec)); }
    return box;
  }

  return { t: t, t2: t2, consigne: consigne, setLangue2: setLangue2, getLangue2: getLangue2, langues: ['aucune', 'ee', 'mina'] };
})();
