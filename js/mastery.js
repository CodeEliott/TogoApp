/* mastery.js - le moteur pedagogique. C'est le coeur du projet.

   Le probleme observe a l'orphelinat : les enfants sont excellents pour
   memoriser des suites de gestes. Dans un jeu classique, ils retiennent
   "reponse A, puis C, puis A" et gagnent sans rien comprendre.

   Ici on ne suit donc PAS "niveau 12 termine". On suit la maitrise d'une
   NOTION, et pour valider une notion il faut la reussir sous plusieurs
   representations differentes :

     - representation "objets"   : 7 oeufs dessines
     - representation "chiffres" : 7
     - representation "mot"      : sept
     - representation "probleme" : une histoire a resoudre
     - representation "inverse"  : trouver ce qui manque au depart

   Trois modes s'enchainent :

     1. COMPRENDRE   -> on montre, on manipule, on aide. Pas de piege.
     2. ENTRAINEMENT -> on repete pour automatiser.
     3. TRANSFERT    -> probleme jamais vu, question "pourquoi ?".
                        C'est ici que le par-coeur ne suffit plus.

   Et un detecteur de par-coeur : un enfant qui repond tres vite et juste
   en entrainement mais qui echoue au transfert est automatiquement
   redescendu en mode COMPRENDRE, et signale sur le tableau de bord de
   l'animateur. C'est exactement le cas qu'on veut rattraper. */

var Mastery = (function () {

  var MODES = ['comprendre', 'entrainement', 'transfert'];

  /* Seuils de passage d'un mode au suivant. */
  var SEUIL_COMPRENDRE = 4;   /* bonnes reponses d'affilee */
  var SEUIL_ENTRAINEMENT = 6; /* bonnes reponses, sur au moins 2 representations */
  var SEUIL_TRANSFERT = 5;    /* bonnes reponses en mode transfert */
  var RAPIDE_MS = 2200;       /* en dessous : reponse "reflexe", pas reflechie */

  function etat(joueur, concept) {
    if (!joueur.concepts) { joueur.concepts = {}; }
    if (!joueur.concepts[concept]) {
      joueur.concepts[concept] = {
        n: 0, ok: 0,
        mode: 'comprendre',
        serie: 0,
        rates: 0,
        v: {},              /* par representation : {n, ok} */
        tr: { n: 0, ok: 0 },/* compteur specifique au mode transfert */
        jours: [],
        parcoeur: 0,
        drapeau: false,
        rapideJuste: false, /* derniere reponse : juste ET tres rapide */
        niveau: 1,
        maitrise: false,
        dernier: 0
      };
    }
    return joueur.concepts[concept];
  }

  function representation(e, variante) {
    if (!e.v[variante]) { e.v[variante] = { n: 0, ok: 0 }; }
    return e.v[variante];
  }

  /* Combien de representations differentes sont reussies au moins 2 fois ? */
  function representationsSolides(e) {
    var c = 0;
    for (var k in e.v) { if (e.v.hasOwnProperty(k) && e.v[k].ok >= 2) { c++; } }
    return c;
  }

  function monter(e) {
    var i = U.dans(MODES, e.mode) ? indexMode(e.mode) : 0;
    if (i < MODES.length - 1) { e.mode = MODES[i + 1]; e.serie = 0; }
  }

  function descendre(e) {
    var i = indexMode(e.mode);
    if (i > 0) { e.mode = MODES[i - 1]; e.serie = 0; }
  }

  function indexMode(m) {
    for (var i = 0; i < MODES.length; i++) { if (MODES[i] === m) { return i; } }
    return 0;
  }

  /* Enregistre une reponse et fait evoluer l'etat.
     Retourne un petit rapport utilise par l'interface pour expliquer ce
     qui vient de se passer (montee de niveau, retour en arriere...). */
  function enregistrer(joueur, concept, variante, mode, juste, ms) {
    var e = etat(joueur, concept);
    var r = { monte: false, descendu: false, parcoeur: false, maitrise: false };

    e.n++;
    e.dernier = U.maintenant();
    var v = representation(e, variante);
    v.n++;

    var j = U.jour();
    if (!U.dans(e.jours, j)) { e.jours.push(j); if (e.jours.length > 30) { e.jours.shift(); } }

    if (mode === 'transfert') { e.tr.n++; }

    if (juste) {
      e.ok++; v.ok++; e.serie++; e.rates = 0;
      if (mode === 'transfert') { e.tr.ok++; }

      /* Detection du par-coeur, partie 1 : reponse juste mais quasi
         instantanee en entrainement. On garde le drapeau pour la
         prochaine question de transfert. */
      e.rapideJuste = (mode === 'entrainement' && ms > 0 && ms < RAPIDE_MS);

      if (e.mode === 'comprendre' && e.serie >= SEUIL_COMPRENDRE) { monter(e); r.monte = true; }
      else if (e.mode === 'entrainement' && e.serie >= SEUIL_ENTRAINEMENT && representationsSolides(e) >= 2) { monter(e); r.monte = true; }
      else if (e.mode === 'transfert' && e.tr.ok >= SEUIL_TRANSFERT && representationsSolides(e) >= 3) {
        /* Derniere condition, la plus importante : il faut avoir travaille
           la notion sur au moins deux journees differentes. Une notion
           "comprise" en une seule seance est presque toujours une notion
           apprise par coeur ; elle est oubliee la semaine suivante. */
        if (e.jours.length >= 2) {
          e.maitrise = true; r.maitrise = true;
          e.niveau = Math.min(e.niveau + 1, 6);
          /* On repart en entrainement au niveau superieur : la notion
             reste revisitee de temps en temps. */
          e.mode = 'entrainement'; e.serie = 0; e.tr = { n: 0, ok: 0 }; e.v = {};
        }
      }
    } else {
      e.serie = 0; e.rates++;

      /* Detection du par-coeur, partie 2 : il repondait vite et juste en
         entrainement, et il se trompe des qu'on change la forme de la
         question. Signe classique d'une reponse memorisee. */
      if (mode === 'transfert' && e.rapideJuste) {
        e.parcoeur++;
        e.rapideJuste = false;
        if (e.parcoeur >= 2) { e.drapeau = true; }
        e.mode = 'comprendre'; e.serie = 0;
        r.parcoeur = true; r.descendu = true;
      } else if (e.rates >= 2) {
        descendre(e); r.descendu = true;
      }

      /* Signal global : tres bon en repetition, faible des qu'il faut
         reflechir. */
      if (e.tr.n >= 5 && (e.tr.ok / e.tr.n) < 0.4 && e.n >= 12 && (e.ok / e.n) > 0.7) {
        e.drapeau = true;
      }
    }

    /* Un bon passage en transfert efface le soupcon. */
    if (juste && mode === 'transfert' && e.tr.n >= 4 && (e.tr.ok / e.tr.n) > 0.7) {
      e.drapeau = false;
    }

    Store.sauver();
    return r;
  }

  function mode(joueur, concept) { return etat(joueur, concept).mode; }
  function niveau(joueur, concept) { return etat(joueur, concept).niveau; }

  /* Un enfant signale "par coeur" repasse plus souvent par le mode
     comprendre, meme s'il a des bonnes reponses. */
  function modePourQuestion(joueur, concept, indexQuestion) {
    var e = etat(joueur, concept);
    if (e.drapeau && indexQuestion % 2 === 0) { return 'comprendre'; }
    /* On glisse regulierement une question de transfert meme pendant
       l'entrainement : c'est le meilleur moyen de verifier que ce qui est
       automatise est aussi compris. */
    if (e.mode === 'entrainement' && indexQuestion > 0 && indexQuestion % 4 === 3) { return 'transfert'; }
    return e.mode;
  }

  /* Score 0..100 pour l'affichage des progres. */
  function score(joueur, concept) {
    var e = etat(joueur, concept);
    if (e.n === 0) { return 0; }
    var base = indexMode(e.mode) * 25;
    var bonus = 0;
    if (e.mode === 'comprendre') { bonus = Math.min(24, e.serie / SEUIL_COMPRENDRE * 24); }
    else if (e.mode === 'entrainement') { bonus = Math.min(24, e.serie / SEUIL_ENTRAINEMENT * 24); }
    else { bonus = Math.min(24, e.tr.ok / SEUIL_TRANSFERT * 24); }
    var s = Math.round(base + bonus);
    if (e.niveau > 1) { s = Math.max(s, 75); }
    return Math.min(100, s);
  }

  /* Notions a revoir en priorite : jamais vues, ou vues il y a longtemps,
     ou signalees "par coeur". */
  function priorite(joueur, concept) {
    var e = etat(joueur, concept);
    if (e.drapeau) { return 100; }
    if (e.n === 0) { return 60; }
    var jours = (U.maintenant() - (e.dernier || 0)) / 86400000;
    return Math.min(90, 20 + jours * 8 + (e.maitrise ? -20 : 10));
  }

  function resume(joueur) {
    var out = [];
    if (!joueur.concepts) { return out; }
    for (var k in joueur.concepts) {
      if (joueur.concepts.hasOwnProperty(k)) {
        var e = joueur.concepts[k];
        out.push({
          concept: k, mode: e.mode, score: score(joueur, k), niveau: e.niveau,
          n: e.n, ok: e.ok, drapeau: e.drapeau, dernier: e.dernier
        });
      }
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  return {
    etat: etat, enregistrer: enregistrer, mode: mode, niveau: niveau,
    modePourQuestion: modePourQuestion, score: score, priorite: priorite,
    resume: resume, MODES: MODES
  };
})();
