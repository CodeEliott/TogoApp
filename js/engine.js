/* engine.js - déroulement d'une partie et affichage des questions.

   Une partie = 8 questions sur une même notion. Pour chaque question, le
   moteur de maîtrise (mastery.js) décide du MODE : comprendre, entraînement
   ou transfert. Le générateur de la notion fabrique alors une question
   neuve adaptée à ce mode.

   Points de vigilance repris de l'objectif du projet :
   - l'ordre des propositions est mélangé à chaque affichage ;
   - le temps de réponse est mesuré (une réponse juste en moins de deux
     secondes en entraînement est notée comme « réflexe », à vérifier
     ensuite par une question de transfert) ;
   - une bonne réponse accompagnée d'une mauvaise explication ne valide
     PAS la notion. */

var Jeu = (function () {

  var NB_QUESTIONS = 8;

  var etat = null;

  function lancer(joueur, activite, onFin) {
    etat = {
      joueur: joueur,
      activite: activite,
      index: 0,
      justes: 0,
      total: 0,
      messages: [],
      onFin: onFin
    };
    question();
  }

  function question() {
    if (etat.index >= NB_QUESTIONS) { return fin(); }

    var mode = Mastery.modePourQuestion(etat.joueur, etat.activite.id, etat.index);
    var niveau = Mastery.niveau(etat.joueur, etat.activite.id);
    var q = null;

    /* On peut avoir à réessayer : le hasard produit parfois une question
       dont les propositions se retrouvent toutes identiques après le
       nettoyage des doublons. */
    for (var essai = 0; essai < 6 && !q; essai++) {
      var candidat;
      try { candidat = etat.activite.gen(niveau, mode); }
      catch (e) { candidat = null; }
      if (candidat) { q = nettoyer(candidat); }
    }
    if (!q) {
      /* Un générateur défaillant ne doit jamais bloquer un enfant devant
         un écran vide. */
      q = { variante: 'chiffres', texte: '2 + 2 = ?', type: 'nombre', reponse: '4', explication: '2 + 2 = 4.' };
    }
    q.mode = mode;
    etat.q = q;
    etat.debut = U.maintenant();
    afficher(q);
  }

  /* Contrôle qualité appliqué à toute question avant affichage.
     Renvoie null si la question est inutilisable : le moteur en demande
     alors une autre. */
  function nettoyer(q) {
    if (!q || !q.texte) { return null; }

    if (q.type === 'choix') {
      if (!q.choix || q.choix.length < 2) { return null; }
      q.choix = U.dedupChoix(q.choix);
      if (q.choix.length < 2) { return null; }
      var justes = 0;
      for (var i = 0; i < q.choix.length; i++) { if (q.choix[i].ok) { justes++; } }
      if (justes !== 1) { return null; }
    }

    if (q.type === 'nombre') {
      /* Le pavé à l'écran ne comporte que des chiffres : une réponse
         négative ou décimale serait impossible à saisir. */
      if (!/^\d+$/.test(String(q.reponse))) { return null; }
    }

    if (q.pourquoi && q.pourquoi.choix) {
      q.pourquoi.choix = U.dedupChoix(q.pourquoi.choix);
      if (q.pourquoi.choix.length < 2) { q.pourquoi = null; }
    }

    return q;
  }

  /* ---------------------------------------------------------------
     AFFICHAGE
     --------------------------------------------------------------- */

  function afficher(q) {
    var ecran = U.id('ecran');
    U.vide(ecran);

    var page = U.el('div', 'partie');

    /* Progression de la partie. */
    var prog = U.el('div', 'progression');
    for (var i = 0; i < NB_QUESTIONS; i++) {
      prog.appendChild(U.el('span', 'point' + (i < etat.index ? ' fait' : (i === etat.index ? ' actuel' : ''))));
    }
    page.appendChild(prog);

    /* Étiquette du mode : l'enfant voit ce qu'on attend de lui. */
    var lab = U.el('div', 'mode mode-' + q.mode);
    lab.appendChild(U.el('span', null, I18N.t('mode.' + q.mode)));
    page.appendChild(lab);

    /* Consigne. */
    var bloc = U.el('div', 'bloc-question');
    var lignes = String(q.texte).split('\n');
    for (var L = 0; L < lignes.length; L++) {
      bloc.appendChild(U.el('p', 'consigne-fr', lignes[L]));
    }
    var sec = I18N.t2('jeu.consigne');
    if (sec) { bloc.appendChild(U.el('p', 'consigne-2', sec)); }

    if (Voix.possible()) {
      var bEcoute = U.el('button', 'mini ecouter', I18N.t('jeu.ecoute'));
      bEcoute.type = 'button';
      U.clic(bEcoute, function () { Voix.dire(q.texte); });
      bloc.appendChild(bEcoute);
    }
    page.appendChild(bloc);

    /* Aide : uniquement en mode « on comprend ». C'est le moment où on
       explique, pas celui où on piège. */
    if (q.aide && q.mode === 'comprendre') {
      page.appendChild(U.el('p', 'aide', q.aide));
    }

    if (q.visuel) { page.appendChild(rendreVisuel(q.visuel)); }

    var zone = U.el('div', 'zone-reponse');
    page.appendChild(zone);
    page.appendChild(U.el('div', 'retour-vide'));

    U.id('ecran').appendChild(page);

    if (q.type === 'choix') { rendreChoix(q, zone); }
    else if (q.type === 'nombre') { rendreNombre(q, zone); }
    else if (q.type === 'frappe') { rendreFrappe(q, zone); }
    else if (q.type === 'glisser') { rendreGlisser(q, zone); }

    if (q.mode === 'comprendre' && q.aide) { Voix.dire(q.texte); }
  }

  /* ---- visuels ---- */

  function rendreVisuel(v) {
    var box = U.el('div', 'visuel');

    if (v.type === 'groupes') {
      var deja = 0;
      for (var g = 0; g < v.groupes.length; g++) {
        if (g > 0) {
          box.appendChild(U.el('span', 'sep', v.sep || '+'));
        }
        var tas = U.el('span', 'tas');
        for (var i = 0; i < v.groupes[g]; i++) {
          var n = Icons.noeud(v.icone, 44);
          if (v.barres && deja >= v.groupes[g] - v.barres) { n.className += ' barre-objet'; }
          tas.appendChild(n);
          deja++;
        }
        box.appendChild(tas);
      }
      return box;
    }

    if (v.type === 'grille') {
      var t = U.el('div', 'grille');
      for (var li = 0; li < v.lignes; li++) {
        var ligne = U.el('div', 'grille-ligne');
        if (v.etiquettes) { ligne.appendChild(U.el('span', 'etiquette', 'Enfant ' + (li + 1))); }
        for (var co = 0; co < v.colonnes; co++) { ligne.appendChild(Icons.noeud(v.icone, 34)); }
        t.appendChild(ligne);
      }
      box.appendChild(t);
      return box;
    }

    if (v.type === 'barre') {
      var barre = U.el('div', 'barre' + (v.compact ? ' barre-fine' : ''));
      for (var p = 0; p < v.total; p++) {
        barre.appendChild(U.el('span', 'part' + (p < v.pris ? ' pleine' : '')));
      }
      box.appendChild(barre);
      return box;
    }

    if (v.type === 'figure' && v.forme === 'rectangle') {
      var rap = Math.max(0.25, Math.min(1, v.l / v.L));
      var largeur = 260, hauteur = Math.round(260 * rap);
      var fig = U.el('div', 'figure');
      fig.innerHTML = '<svg width="' + (largeur + 60) + '" height="' + (hauteur + 50) + '">' +
        '<rect x="30" y="10" width="' + largeur + '" height="' + hauteur + '" fill="#e8f3ea" stroke="#2e8b57" stroke-width="3"/>' +
        '<text x="' + (30 + largeur / 2) + '" y="' + (hauteur + 34) + '" text-anchor="middle" font-size="17">' + v.L + ' m</text>' +
        '<text x="16" y="' + (10 + hauteur / 2) + '" text-anchor="middle" font-size="17" transform="rotate(-90 16 ' + (10 + hauteur / 2) + ')">' + v.l + ' m</text>' +
        '</svg>';
      box.appendChild(fig);
      return box;
    }

    if (v.type === 'icone') {
      box.appendChild(Icons.noeud(v.icone, v.petit ? 40 : 90));
      if (v.legende) { box.appendChild(U.el('p', 'legende', v.legende)); }
      return box;
    }

    if (v.type === 'texte') {
      box.appendChild(U.el('p', v.long ? 'texte-long' : 'texte-gros', v.contenu));
      return box;
    }

    return box;
  }

  /* ---- réponses à choix ---- */

  function rendreChoix(q, zone) {
    var grille = U.el('div', 'choix' + (q.choix.length > 4 ? ' choix-serre' : ''));
    var verrou = false;

    for (var i = 0; i < q.choix.length; i++) {
      (function (c) {
        var b = U.el('button', 'btn-choix' + (c.visuel ? ' btn-image' : ''));
        b.type = 'button';
        if (c.visuel) { b.appendChild(rendreVisuel(c.visuel)); }
        else { b.appendChild(U.el('span', null, c.t)); }
        U.clic(b, function () {
          if (verrou) { return; }
          verrou = true;
          b.className += c.ok ? ' juste' : ' faux';
          repondre(q, c.ok, c.msg, c.t);
        });
        grille.appendChild(b);
      })(q.choix[i]);
    }
    zone.appendChild(grille);
  }

  /* ---- réponse chiffrée, avec pavé à l'écran ----
     Beaucoup d'enfants ne savent pas encore taper au clavier : on doit
     pouvoir répondre entièrement à la souris. */

  function rendreNombre(q, zone) {
    var valeur = '';
    var aff = U.el('div', 'affichage-nombre', '');
    zone.appendChild(aff);

    function maj() { U.vide(aff); aff.appendChild(document.createTextNode(valeur || '?')); }
    maj();

    var pave = U.el('div', 'pave');
    var touches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
    for (var i = 0; i < touches.length; i++) {
      (function (t) {
        var b = U.el('button', 'touche' + (t === 'OK' ? ' touche-ok' : (t === 'C' ? ' touche-c' : '')), t);
        b.type = 'button';
        U.clic(b, function () {
          if (t === 'C') { valeur = ''; maj(); return; }
          if (t === 'OK') { valider(); return; }
          if (valeur.length < 7) { valeur += t; maj(); }
        });
        pave.appendChild(b);
      })(touches[i]);
    }
    zone.appendChild(pave);

    var fini = false;
    function valider() {
      if (fini || valeur === '') { return; }
      fini = true;
      var ok = (valeur === String(q.reponse));
      repondre(q, ok, null, valeur);
    }

    /* On accepte aussi le clavier pour ceux qui savent s'en servir. */
    document.onkeydown = function (ev) {
      var e = ev || window.event;
      var k = e.keyCode;
      if (fini) { return; }
      if (k >= 48 && k <= 57) { if (valeur.length < 7) { valeur += String(k - 48); maj(); } }
      else if (k >= 96 && k <= 105) { if (valeur.length < 7) { valeur += String(k - 96); maj(); } }
      else if (k === 8) { valeur = valeur.slice(0, -1); maj(); if (e.preventDefault) { e.preventDefault(); } }
      else if (k === 13) { valider(); }
    };
  }

  /* ---- frappe au clavier (module « clavier ») ---- */

  function normaliser(s) {
    s = String(s).toLowerCase();
    var de = 'àâäéèêëîïôöùûüç', vers = 'aaaeeeeiioouuuc';
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var p = de.indexOf(s.charAt(i));
      out += (p >= 0) ? vers.charAt(p) : s.charAt(i);
    }
    return out.replace(/\s+/g, ' ');
  }

  function rendreFrappe(q, zone) {
    var champ = U.el('input', 'champ-frappe');
    champ.type = 'text';
    champ.setAttribute('autocomplete', 'off');
    zone.appendChild(champ);

    var b = U.el('button', 'btn-valider', I18N.t('jeu.valider'));
    b.type = 'button';
    zone.appendChild(b);

    var fini = false;
    function valider() {
      if (fini) { return; }
      var saisi = champ.value;
      if (!saisi.length) { return; }
      fini = true;
      /* On est indulgent sur les accents et les majuscules : l'objectif
         ici est d'apprendre à se servir du clavier. */
      var ok = normaliser(saisi.replace(/^\s+|\s+$/g, '')) === normaliser(String(q.reponse));
      repondre(q, ok, ok ? null : 'Compare lettre par lettre avec le modèle.', saisi);
    }
    U.clic(b, valider);
    champ.onkeydown = function (ev) {
      var e = ev || window.event;
      if (e.keyCode === 13) { valider(); }
    };
    try { champ.focus(); } catch (e) { }
  }

  /* ---- glisser-déposer (module « souris ») ---- */

  function rendreGlisser(q, zone) {
    var aire = U.el('div', 'aire-glisser');
    var objet = U.el('div', 'objet-glissable');
    objet.appendChild(Icons.noeud(q.visuel.icone, 60));
    var cible = U.el('div', 'cible-glisser');
    cible.appendChild(Icons.noeud(q.visuel.cible, 90));
    aire.appendChild(objet);
    aire.appendChild(cible);
    zone.appendChild(aire);

    var enCours = false, fini = false, dx = 0, dy = 0;

    function pos(e) {
      if (e.touches && e.touches.length) { return { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
      return { x: e.clientX, y: e.clientY };
    }

    function debut(ev) {
      var e = ev || window.event;
      if (fini) { return; }
      enCours = true;
      var p = pos(e), r = objet.getBoundingClientRect();
      dx = p.x - r.left; dy = p.y - r.top;
      objet.className = 'objet-glissable en-main';
      if (e.preventDefault) { e.preventDefault(); }
    }

    function bouge(ev) {
      var e = ev || window.event;
      if (!enCours || fini) { return; }
      var p = pos(e), a = aire.getBoundingClientRect();
      objet.style.left = (p.x - a.left - dx) + 'px';
      objet.style.top = (p.y - a.top - dy) + 'px';
      if (e.preventDefault) { e.preventDefault(); }
    }

    function lache(ev) {
      var e = ev || window.event;
      if (!enCours || fini) { return; }
      enCours = false;
      objet.className = 'objet-glissable';
      var o = objet.getBoundingClientRect(), c = cible.getBoundingClientRect();
      var dedans = !(o.right < c.left || o.left > c.right || o.bottom < c.top || o.top > c.bottom);
      if (dedans) {
        fini = true;
        nettoyer();
        repondre(q, true, null, 'déposé');
      }
    }

    function nettoyer() {
      if (document.removeEventListener) {
        document.removeEventListener('mousemove', bouge, false);
        document.removeEventListener('mouseup', lache, false);
        document.removeEventListener('touchmove', bouge, false);
        document.removeEventListener('touchend', lache, false);
      }
    }

    if (objet.addEventListener) {
      objet.addEventListener('mousedown', debut, false);
      objet.addEventListener('touchstart', debut, false);
      document.addEventListener('mousemove', bouge, false);
      document.addEventListener('mouseup', lache, false);
      document.addEventListener('touchmove', bouge, false);
      document.addEventListener('touchend', lache, false);
    }

    /* Filet de sécurité : si le glisser ne fonctionne vraiment pas sur
       cette machine, un bouton permet de passer sans rester bloqué. */
    var secours = U.el('button', 'mini secours', 'Je n\'y arrive pas');
    secours.type = 'button';
    U.clic(secours, function () {
      if (fini) { return; }
      fini = true; nettoyer();
      repondre(q, false, 'Recommence doucement : appuie, garde le doigt appuyé, déplace, puis lâche.', '');
    });
    zone.appendChild(secours);
  }

  /* ---------------------------------------------------------------
     CORRECTION
     --------------------------------------------------------------- */

  function repondre(q, juste, message, donnee) {
    document.onkeydown = null;
    var ms = U.maintenant() - etat.debut;

    var rapport = Mastery.enregistrer(etat.joueur, etat.activite.id, q.variante, q.mode, juste, ms);
    etat.total++;
    if (juste) { etat.justes++; }

    /* Bonne réponse : on demande parfois de justifier. Une explication
       fausse annule le bénéfice de la bonne réponse. */
    if (juste && q.pourquoi && (q.mode === 'transfert' || Math.random() < 0.4)) {
      return demanderPourquoi(q, rapport);
    }
    montrerRetour(q, juste, message, rapport);
  }

  function demanderPourquoi(q, rapportPrec) {
    var ecran = U.id('ecran');
    U.vide(ecran);
    var page = U.el('div', 'partie');
    page.appendChild(U.el('div', 'mode mode-transfert', I18N.t('jeu.pourquoi')));
    var bloc = U.el('div', 'bloc-question');
    bloc.appendChild(U.el('p', 'consigne-fr', 'Bonne réponse. ' + q.pourquoi.texte));
    page.appendChild(bloc);
    var zone = U.el('div', 'zone-reponse');
    page.appendChild(zone);
    ecran.appendChild(page);

    var verrou = false;
    var grille = U.el('div', 'choix');
    for (var i = 0; i < q.pourquoi.choix.length; i++) {
      (function (c) {
        var b = U.el('button', 'btn-choix', null);
        b.type = 'button';
        b.appendChild(U.el('span', null, c.t));
        U.clic(b, function () {
          if (verrou) { return; }
          verrou = true;
          /* On enregistre l'explication comme une représentation à part
             entière : « savoir faire » et « savoir pourquoi » sont deux
             choses différentes. */
          var r = Mastery.enregistrer(etat.joueur, etat.activite.id, 'pourquoi', q.mode, c.ok, 0);
          if (!c.ok) {
            etat.messages.push('Réponse juste, mais l\'explication n\'était pas la bonne : on revoit la notion.');
          }
          montrerRetour(q, c.ok, c.ok ? null : (c.msg || 'Ce n\'est pas la bonne raison.'), r, true);
        });
        grille.appendChild(b);
      })(q.pourquoi.choix[i]);
    }
    zone.appendChild(grille);
  }

  function montrerRetour(q, juste, message, rapport, etaitPourquoi) {
    var page = document.getElementsByClassName ? document.getElementsByClassName('partie')[0] : null;
    if (!page) { return suite(); }

    var box = U.el('div', 'retour ' + (juste ? 'ok' : 'ko'));
    box.appendChild(U.el('p', 'retour-titre', juste ? I18N.t('jeu.bravo') : I18N.t('jeu.presque')));

    if (!juste && !etaitPourquoi && q.type !== 'choix' && q.reponse !== undefined) {
      box.appendChild(U.el('p', null, I18N.t('jeu.reponse') + ' : ' + q.reponse));
    }
    if (message) { box.appendChild(U.el('p', 'retour-msg', message)); }
    if (q.explication) { box.appendChild(U.el('p', 'retour-expl', q.explication)); }

    if (rapport && rapport.parcoeur) {
      box.appendChild(U.el('p', 'retour-alerte',
        'Tu répondais très vite, mais la question posée autrement t\'a arrêté. On reprend tranquillement avec les images.'));
    } else if (rapport && rapport.maitrise) {
      box.appendChild(U.el('p', 'retour-super', 'Tu as compris cette notion en profondeur. Elle passe au niveau supérieur !'));
    } else if (rapport && rapport.monte) {
      box.appendChild(U.el('p', 'retour-super', 'Bien ! On passe à des questions plus exigeantes.'));
    }

    var b = U.el('button', 'btn-valider', I18N.t('jeu.suivant'));
    b.type = 'button';
    U.clic(b, suite);
    box.appendChild(b);

    page.appendChild(box);
    if (q.explication) { Voix.dire(juste ? 'Bravo. ' + q.explication : q.explication); }
    try { b.focus(); } catch (e) { }
  }

  function suite() {
    etat.index++;
    question();
  }

  /* ---------------------------------------------------------------
     FIN DE PARTIE
     --------------------------------------------------------------- */

  function fin() {
    Voix.stop();
    document.onkeydown = null;
    Store.noteSeance(etat.joueur, etat.activite.id, etat.justes, etat.total);

    var ecran = U.id('ecran');
    U.vide(ecran);
    var page = U.el('div', 'partie fin');
    page.appendChild(U.el('h2', null, I18N.t('jeu.fini')));
    page.appendChild(U.el('p', 'score', etat.justes + ' / ' + etat.total));

    var e = Mastery.etat(etat.joueur, etat.activite.id);
    var m = U.el('div', 'bilan');
    m.appendChild(U.el('p', null, 'Notion : ' + etat.activite.titre));
    m.appendChild(U.el('p', null, 'Étape actuelle : ' + I18N.t('mode.' + e.mode)));
    if (e.mode === 'transfert') {
      m.appendChild(U.el('p', 'note', 'Encore quelques questions de réflexion et la notion sera validée. Reviens aussi un autre jour : c\'est ce qui fait qu\'on n\'oublie pas.'));
    }
    if (e.drapeau) {
      m.appendChild(U.el('p', 'note alerte', 'Tu vas vite, mais les questions posées autrement te bloquent. Prends le temps de regarder les images : c\'est là qu\'on comprend.'));
    }
    for (var i = 0; i < etat.messages.length; i++) { m.appendChild(U.el('p', 'note', etat.messages[i])); }
    page.appendChild(m);

    var boutons = U.el('div', 'boutons');
    var b1 = U.el('button', 'btn-valider', I18N.t('jeu.rejouer'));
    b1.type = 'button';
    U.clic(b1, function () { lancer(etat.joueur, etat.activite, etat.onFin); });
    var b2 = U.el('button', 'btn-secondaire', I18N.t('jeu.quitter'));
    b2.type = 'button';
    var cb = etat.onFin;
    U.clic(b2, function () { if (cb) { cb(); } });
    boutons.appendChild(b1); boutons.appendChild(b2);
    page.appendChild(boutons);

    ecran.appendChild(page);
  }

  return { lancer: lancer, NB_QUESTIONS: NB_QUESTIONS };
})();
