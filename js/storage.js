/* storage.js - sauvegarde des joueurs et de leurs progres.

   Tout reste sur l'ordinateur (localStorage du navigateur). Aucune donnee
   ne part sur internet : l'application fonctionne sans connexion.

   Attention : chaque ordinateur a sa propre memoire. Un enfant qui change
   de poste ne retrouve pas ses progres, sauf si on utilise l'export /
   import de l'espace animateur (un simple fichier a copier sur une cle
   USB). C'est volontaire : pas de serveur a maintenir. */

var Store = (function () {

  var CLE = 'lasolution.v1';
  var memoire = null;      /* copie en memoire vive */
  var disponible = true;   /* false si le navigateur refuse localStorage */

  function brut() {
    try {
      var s = window.localStorage.getItem(CLE);
      return s ? s : null;
    } catch (e) { disponible = false; return null; }
  }

  function ecrire() {
    try {
      window.localStorage.setItem(CLE, JSON.stringify(memoire));
    } catch (e) { disponible = false; }
  }

  function defaut() {
    return {
      version: 1,
      reglages: { code: '1234', langue2: 'aucune', voix: true },
      joueurs: []
    };
  }

  function charger() {
    if (memoire) { return memoire; }
    var s = brut();
    if (s) {
      try { memoire = JSON.parse(s); } catch (e) { memoire = null; }
    }
    if (!memoire || !memoire.joueurs) { memoire = defaut(); ecrire(); }
    if (!memoire.reglages) { memoire.reglages = defaut().reglages; }
    return memoire;
  }

  function sauver() { ecrire(); }

  function estDisponible() { return disponible; }

  /* ---------- reglages ---------- */

  function reglages() { return charger().reglages; }

  function setReglage(cle, valeur) {
    charger().reglages[cle] = valeur;
    sauver();
  }

  /* ---------- joueurs ---------- */

  function joueurs() { return charger().joueurs; }

  function creerJoueur(prenom, avatar, age) {
    var d = charger();
    var j = {
      id: 'j' + U.maintenant() + '_' + U.hasard(100, 999),
      prenom: prenom,
      avatar: avatar || 'etoile',
      age: age || 10,
      cree: U.maintenant(),
      derniere: U.maintenant(),
      minutes: 0,
      parties: 0,
      concepts: {},   /* rempli par Mastery */
      journal: []     /* dernieres seances : {jour, concept, justes, total} */
    };
    d.joueurs.push(j);
    sauver();
    return j;
  }

  function joueur(id) {
    var l = joueurs();
    for (var i = 0; i < l.length; i++) { if (l[i].id === id) { return l[i]; } }
    return null;
  }

  function supprimerJoueur(id) {
    var d = charger();
    for (var i = 0; i < d.joueurs.length; i++) {
      if (d.joueurs[i].id === id) { d.joueurs.splice(i, 1); break; }
    }
    sauver();
  }

  function noteSeance(j, concept, justes, total) {
    j.derniere = U.maintenant();
    j.parties = (j.parties || 0) + 1;
    j.journal = j.journal || [];
    j.journal.unshift({ jour: U.jour(), concept: concept, justes: justes, total: total });
    if (j.journal.length > 60) { j.journal.length = 60; }
    sauver();
  }

  /* ---------- export / import ---------- */

  function exporter() {
    var texte = JSON.stringify(charger(), null, 1);
    var nom = 'progres-la-solution-' + U.jour() + '.json';
    try {
      var blob = new Blob([texte], { type: 'application/json' });
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = nom;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 2000);
      return true;
    } catch (e) {
      /* Vieux navigateur : on ouvre le texte dans une fenetre, l'animateur
         fait "Enregistrer sous". Moins joli mais ca ne perd rien. */
      var w = window.open('', '_blank');
      if (w) { w.document.write('<pre>' + texte.replace(/</g, '&lt;') + '</pre>'); return true; }
      return false;
    }
  }

  /* Fusionne un fichier de progres avec ce qui est deja sur la machine.
     En cas de doublon (meme identifiant), on garde la version la plus
     recemment utilisee. */
  function importer(texte) {
    var entrant;
    try { entrant = JSON.parse(texte); } catch (e) { return { ok: false, message: 'Fichier illisible.' }; }
    if (!entrant || !entrant.joueurs) { return { ok: false, message: 'Ce fichier ne contient pas de progrès.' }; }
    var d = charger(), ajoutes = 0, majs = 0;
    for (var i = 0; i < entrant.joueurs.length; i++) {
      var e = entrant.joueurs[i], trouve = null;
      for (var k = 0; k < d.joueurs.length; k++) { if (d.joueurs[k].id === e.id) { trouve = k; break; } }
      if (trouve === null) { d.joueurs.push(e); ajoutes++; }
      else if ((e.derniere || 0) > (d.joueurs[trouve].derniere || 0)) { d.joueurs[trouve] = e; majs++; }
    }
    sauver();
    return { ok: true, message: ajoutes + ' joueur(s) ajouté(s), ' + majs + ' mis à jour.' };
  }

  return {
    charger: charger, sauver: sauver, estDisponible: estDisponible,
    reglages: reglages, setReglage: setReglage,
    joueurs: joueurs, creerJoueur: creerJoueur, joueur: joueur,
    supprimerJoueur: supprimerJoueur, noteSeance: noteSeance,
    exporter: exporter, importer: importer
  };
})();
