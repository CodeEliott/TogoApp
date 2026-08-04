/* ui.js - les écrans de l'application.

   Interface volontairement très simple : gros boutons, peu de texte, pas de
   menu caché. Un enfant de 6 ans doit pouvoir arriver seul jusqu'à son
   premier exercice, et un enfant de 17 ans ne doit pas trouver ça bébé. */

var App = (function () {

  var joueur = null;
  var ecranActuel = 'accueil';
  var pileRetour = [];

  var AVATARS = ['poule', 'ballon', 'basket', 'rugby', 'poisson', 'mangue', 'etoile', 'coeur', 'arbre', 'maison'];

  /* --------------------------------------------------------------- */

  function aller(nom, arg, sansHistorique) {
    Voix.stop();
    document.onkeydown = null;
    if (!sansHistorique && ecranActuel) { pileRetour.push({ nom: ecranActuel, arg: argCourant }); }
    ecranActuel = nom;
    argCourant = arg;
    var e = U.id('ecran');
    U.vide(e);
    ECRANS[nom](arg);
    majBandeau();
    try { window.scrollTo(0, 0); } catch (err) { }
  }

  var argCourant = null;

  function retour() {
    var p = pileRetour.pop();
    if (!p) { return aller('accueil', null, true); }
    ecranActuel = p.nom; argCourant = p.arg;
    var e = U.id('ecran');
    U.vide(e);
    Voix.stop();
    document.onkeydown = null;
    ECRANS[p.nom](p.arg);
    majBandeau();
  }

  function majBandeau() {
    var b = U.id('btn-retour');
    b.style.display = (ecranActuel === 'accueil') ? 'none' : 'inline-block';
    var t = U.id('titre-bandeau');
    U.vide(t);
    t.appendChild(document.createTextNode(I18N.t('app.titre')));
    var j = U.id('joueur-bandeau');
    U.vide(j);
    if (joueur) {
      j.appendChild(Icons.noeud(joueur.avatar, 26));
      j.appendChild(document.createTextNode(' ' + joueur.prenom));
    }
  }

  /* --------------------------------------------------------------- */

  var ECRANS = {};

  /* ---- Accueil : choix du joueur ---- */
  ECRANS.accueil = function () {
    joueur = null;
    var e = U.id('ecran');
    var page = U.el('div', 'page accueil');

    var entete = U.el('div', 'entete');
    entete.appendChild(U.el('h1', null, I18N.t('app.titre')));
    entete.appendChild(U.el('p', 'soustitre', I18N.t('app.soustitre')));
    page.appendChild(entete);

    page.appendChild(U.el('h2', null, I18N.t('accueil.choisir')));

    var liste = Store.joueurs();
    if (!liste.length) {
      page.appendChild(U.el('p', 'vide', I18N.t('accueil.aucun')));
    } else {
      var g = U.el('div', 'joueurs');
      /* Les derniers joueurs actifs en premier : sur un poste partagé,
         c'est presque toujours celui qu'on cherche. */
      var tri = liste.slice(0).sort(function (a, b) { return (b.derniere || 0) - (a.derniere || 0); });
      for (var i = 0; i < tri.length; i++) {
        (function (j) {
          var b = U.el('button', 'carte-joueur');
          b.type = 'button';
          b.appendChild(Icons.noeud(j.avatar, 56));
          b.appendChild(U.el('span', 'nom', j.prenom));
          U.clic(b, function () { joueur = j; aller('menu'); });
          g.appendChild(b);
        })(tri[i]);
      }
      page.appendChild(g);
    }

    var bas = U.el('div', 'boutons');
    var bN = U.el('button', 'btn-valider', I18N.t('accueil.nouveau'));
    bN.type = 'button';
    U.clic(bN, function () { aller('nouveau'); });
    var bA = U.el('button', 'btn-secondaire', I18N.t('accueil.animateur'));
    bA.type = 'button';
    U.clic(bA, function () { aller('codeAnim'); });
    bas.appendChild(bN); bas.appendChild(bA);
    page.appendChild(bas);

    if (!Store.estDisponible()) {
      page.appendChild(U.el('p', 'alerte',
        'Attention : ce navigateur n\'enregistre pas les progrès. Ils seront perdus en fermant la page. Voir le fichier LISEZ-MOI.'));
    }

    e.appendChild(page);
  };

  /* ---- Création d'un joueur ---- */
  ECRANS.nouveau = function () {
    var e = U.id('ecran');
    var page = U.el('div', 'page');
    page.appendChild(U.el('h2', null, I18N.t('accueil.nouveau')));

    page.appendChild(U.el('label', 'label', I18N.t('profil.prenom')));
    var champ = U.el('input', 'champ');
    champ.type = 'text';
    champ.setAttribute('maxlength', '18');
    page.appendChild(champ);

    page.appendChild(U.el('label', 'label', I18N.t('profil.age')));
    var ages = U.el('div', 'ages');
    var ageChoisi = { v: 10 };
    for (var a = 6; a <= 18; a++) {
      (function (n) {
        var b = U.el('button', 'btn-age' + (n === 10 ? ' choisi' : ''), String(n));
        b.type = 'button';
        U.clic(b, function () {
          ageChoisi.v = n;
          var tous = ages.getElementsByTagName('button');
          for (var k = 0; k < tous.length; k++) { tous[k].className = 'btn-age'; }
          b.className = 'btn-age choisi';
        });
        ages.appendChild(b);
      })(a);
    }
    page.appendChild(ages);

    page.appendChild(U.el('label', 'label', I18N.t('profil.avatar')));
    var av = U.el('div', 'avatars');
    var avChoisi = { v: AVATARS[0] };
    for (var i = 0; i < AVATARS.length; i++) {
      (function (nom, idx) {
        var b = U.el('button', 'btn-avatar' + (idx === 0 ? ' choisi' : ''));
        b.type = 'button';
        b.appendChild(Icons.noeud(nom, 46));
        U.clic(b, function () {
          avChoisi.v = nom;
          var tous = av.getElementsByTagName('button');
          for (var k = 0; k < tous.length; k++) { tous[k].className = 'btn-avatar'; }
          b.className = 'btn-avatar choisi';
        });
        av.appendChild(b);
      })(AVATARS[i], i);
    }
    page.appendChild(av);

    var msg = U.el('p', 'alerte');
    msg.style.display = 'none';
    page.appendChild(msg);

    var b = U.el('button', 'btn-valider', I18N.t('profil.creer'));
    b.type = 'button';
    U.clic(b, function () {
      var prenom = champ.value.replace(/^\s+|\s+$/g, '');
      if (!prenom.length) {
        U.vide(msg);
        msg.appendChild(document.createTextNode(I18N.t('profil.manque')));
        msg.style.display = 'block';
        return;
      }
      joueur = Store.creerJoueur(prenom, avChoisi.v, ageChoisi.v);
      pileRetour = [];
      aller('menu', null, true);
    });
    page.appendChild(b);

    e.appendChild(page);
    try { champ.focus(); } catch (err) { }
  };

  /* ---- Menu principal du joueur ---- */
  ECRANS.menu = function () {
    var e = U.id('ecran');
    var page = U.el('div', 'page');
    page.appendChild(U.el('h2', null, 'Bonjour ' + joueur.prenom + ' ! ' + I18N.t('menu.titre')));

    var g = U.el('div', 'tuiles');
    for (var i = 0; i < Activites.matieres.length; i++) {
      (function (m) {
        var b = U.el('button', 'tuile ' + m.couleur);
        b.type = 'button';
        b.appendChild(Icons.noeud(m.icone, 64));
        b.appendChild(U.el('span', 'tuile-titre', m.titre));
        U.clic(b, function () { aller('matiere', m.id); });
        g.appendChild(b);
      })(Activites.matieres[i]);
    }
    page.appendChild(g);

    var b2 = U.el('button', 'btn-secondaire', I18N.t('menu.progres'));
    b2.type = 'button';
    U.clic(b2, function () { aller('progres'); });
    page.appendChild(b2);

    var b3 = U.el('button', 'btn-secondaire', I18N.t('menu.changer'));
    b3.type = 'button';
    U.clic(b3, function () { pileRetour = []; aller('accueil', null, true); });
    page.appendChild(b3);

    e.appendChild(page);
  };

  /* ---- Liste des activités d'une matière ---- */
  ECRANS.matiere = function (idMatiere) {
    var e = U.id('ecran');
    var page = U.el('div', 'page');
    var m = null;
    for (var k = 0; k < Activites.matieres.length; k++) {
      if (Activites.matieres[k].id === idMatiere) { m = Activites.matieres[k]; }
    }
    page.appendChild(U.el('h2', null, m ? m.titre : ''));

    var liste = Activites.conseillees(joueur, idMatiere);
    var g = U.el('div', 'activites');
    for (var i = 0; i < liste.length; i++) {
      (function (a) {
        var etat = Mastery.etat(joueur, a.id);
        var s = Mastery.score(joueur, a.id);
        var b = U.el('button', 'carte-activite' + (Activites.estDeSonAge(a, joueur) ? '' : ' hors-age'));
        b.type = 'button';
        b.appendChild(Icons.noeud(a.icone, 44));
        var txt = U.el('span', 'act-txt');
        txt.appendChild(U.el('span', 'act-titre', a.titre));
        txt.appendChild(U.el('span', 'act-resume', a.resume));
        var jauge = U.el('span', 'jauge');
        var rempli = U.el('span', 'jauge-plein');
        rempli.style.width = s + '%';
        jauge.appendChild(rempli);
        txt.appendChild(jauge);
        txt.appendChild(U.el('span', 'act-etat',
          etat.n === 0 ? I18N.t('prog.pasvu')
            : (I18N.t('mode.' + etat.mode) + (etat.niveau > 1 ? '  -  niveau ' + etat.niveau : ''))));
        b.appendChild(txt);
        if (Activites.aRevoir(joueur, a)) { b.appendChild(U.el('span', 'pastille', I18N.t('prog.revoir'))); }
        U.clic(b, function () { aller('jeu', a.id); });
        g.appendChild(b);
      })(liste[i]);
    }
    page.appendChild(g);
    e.appendChild(page);
  };

  /* ---- Une partie ---- */
  ECRANS.jeu = function (idActivite) {
    var a = Activites.parId(idActivite);
    if (!a) { return aller('menu', null, true); }
    Jeu.lancer(joueur, a, function () { retour(); });
  };

  /* ---- Progrès du joueur ---- */
  ECRANS.progres = function () {
    var e = U.id('ecran');
    var page = U.el('div', 'page');
    page.appendChild(U.el('h2', null, I18N.t('prog.titre') + ' - ' + joueur.prenom));

    var compris = 0, encours = 0;
    var g = U.el('div', 'progres-liste');
    var liste = Activites.liste;
    for (var i = 0; i < liste.length; i++) {
      var a = liste[i];
      var etat = Mastery.etat(joueur, a.id);
      if (etat.n === 0) { continue; }
      if (etat.niveau > 1) { compris++; } else { encours++; }
      var ligne = U.el('div', 'progres-ligne');
      ligne.appendChild(Icons.noeud(a.icone, 30));
      ligne.appendChild(U.el('span', 'pl-titre', a.titre));
      var jauge = U.el('span', 'jauge');
      var rempli = U.el('span', 'jauge-plein');
      rempli.style.width = Mastery.score(joueur, a.id) + '%';
      jauge.appendChild(rempli);
      ligne.appendChild(jauge);
      ligne.appendChild(U.el('span', 'pl-etat', etat.niveau > 1 ? ('niveau ' + etat.niveau) : I18N.t('mode.' + etat.mode)));
      g.appendChild(ligne);
    }
    if (!compris && !encours) {
      page.appendChild(U.el('p', 'vide', 'Tu n\'as pas encore joué. Choisis une activité !'));
    } else {
      var res = U.el('p', 'resume-progres');
      res.appendChild(document.createTextNode(compris + ' notion(s) au niveau supérieur, ' + encours + ' en cours.'));
      page.appendChild(res);
      page.appendChild(g);
    }
    e.appendChild(page);
  };

  /* ---- Code d'accès animateur ---- */
  ECRANS.codeAnim = function () {
    var e = U.id('ecran');
    var page = U.el('div', 'page');
    page.appendChild(U.el('h2', null, I18N.t('anim.titre')));
    page.appendChild(U.el('label', 'label', I18N.t('anim.code')));
    var champ = U.el('input', 'champ');
    champ.type = 'password';
    page.appendChild(champ);
    var msg = U.el('p', 'alerte');
    msg.style.display = 'none';
    page.appendChild(msg);
    var b = U.el('button', 'btn-valider', I18N.t('anim.entrer'));
    b.type = 'button';
    function tenter() {
      if (champ.value === Store.reglages().code) { aller('animateur'); }
      else {
        U.vide(msg);
        msg.appendChild(document.createTextNode(I18N.t('anim.mauvaiscode')));
        msg.style.display = 'block';
      }
    }
    U.clic(b, tenter);
    champ.onkeydown = function (ev) { var x = ev || window.event; if (x.keyCode === 13) { tenter(); } };
    page.appendChild(b);
    e.appendChild(page);
    try { champ.focus(); } catch (err) { }
  };

  /* ---- Tableau de bord de l'animateur ---- */
  ECRANS.animateur = function () {
    var e = U.id('ecran');
    var page = U.el('div', 'page anim');
    page.appendChild(U.el('h2', null, I18N.t('anim.titre')));

    /* 1. Ce qui demande une intervention humaine, tout en haut. */
    var alertes = U.el('div', 'bloc-anim');
    alertes.appendChild(U.el('h3', null, 'À regarder en priorité'));
    var liste = Store.joueurs(), rien = true;
    for (var i = 0; i < liste.length; i++) {
      var j = liste[i];
      var res = Mastery.resume(j);
      for (var k = 0; k < res.length; k++) {
        if (res[k].drapeau) {
          rien = false;
          var a = Activites.parId(res[k].concept);
          var l = U.el('p', 'alerte-ligne');
          l.appendChild(U.el('strong', null, j.prenom));
          l.appendChild(document.createTextNode(' - ' + (a ? a.titre : res[k].concept) + ' : ' + I18N.t('anim.parcoeur') +
            ' (' + res[k].ok + ' bonnes sur ' + res[k].n + ', mais bloque dès qu\'on change la question).'));
          alertes.appendChild(l);
        }
      }
    }
    if (rien) { alertes.appendChild(U.el('p', 'vide', 'Rien à signaler pour le moment.')); }
    page.appendChild(alertes);

    /* 2. Tableau des joueurs. */
    var bloc = U.el('div', 'bloc-anim');
    bloc.appendChild(U.el('h3', null, 'Les joueurs (' + liste.length + ')'));
    var tri = liste.slice(0).sort(function (a, b) { return (b.derniere || 0) - (a.derniere || 0); });
    for (var n = 0; n < tri.length; n++) {
      (function (j) {
        var res = Mastery.resume(j);
        var compris = 0;
        for (var z = 0; z < res.length; z++) { if (res[z].niveau > 1) { compris++; } }
        var d = U.el('div', 'ligne-joueur');
        d.appendChild(Icons.noeud(j.avatar, 30));
        d.appendChild(U.el('span', 'lj-nom', j.prenom + ' (' + j.age + ' ans)'));
        d.appendChild(U.el('span', 'lj-info', (j.parties || 0) + ' parties  -  ' + compris + ' notion(s) validée(s)  -  vu le ' + U.jour(j.derniere)));
        var bd = U.el('button', 'mini danger', I18N.t('anim.supprimer'));
        bd.type = 'button';
        U.clic(bd, function () {
          if (window.confirm(I18N.t('anim.confirmer') + ' (' + j.prenom + ')')) {
            Store.supprimerJoueur(j.id);
            aller('animateur', null, true);
          }
        });
        d.appendChild(bd);
        bloc.appendChild(d);

        /* Détail : ce qui bloque et ce qui est acquis. */
        if (res.length) {
          var det = U.el('div', 'detail-joueur');
          for (var y = 0; y < res.length; y++) {
            var act = Activites.parId(res[y].concept);
            var sp = U.el('span', 'puce' + (res[y].drapeau ? ' puce-alerte' : (res[y].niveau > 1 ? ' puce-ok' : '')));
            sp.appendChild(document.createTextNode((act ? act.titre : res[y].concept) + ' : ' + res[y].score + '%'));
            det.appendChild(sp);
          }
          bloc.appendChild(det);
        }
      })(tri[n]);
    }
    if (!tri.length) { bloc.appendChild(U.el('p', 'vide', 'Aucun joueur sur cet ordinateur.')); }
    page.appendChild(bloc);

    /* 3. Sauvegarde et réglages. */
    var outils = U.el('div', 'bloc-anim');
    outils.appendChild(U.el('h3', null, 'Sauvegarde et réglages'));
    outils.appendChild(U.el('p', 'note',
      'Les progrès sont enregistrés sur CET ordinateur uniquement. Exporte le fichier sur une clé USB pour les conserver ou les transférer.'));

    var bx = U.el('button', 'btn-secondaire', I18N.t('anim.export'));
    bx.type = 'button';
    U.clic(bx, function () { Store.exporter(); });
    outils.appendChild(bx);

    var labelImport = U.el('label', 'label', I18N.t('anim.import'));
    outils.appendChild(labelImport);
    var fichier = U.el('input', 'champ');
    fichier.type = 'file';
    fichier.setAttribute('accept', '.json');
    var retourImport = U.el('p', 'note');
    fichier.onchange = function () {
      if (!fichier.files || !fichier.files.length) { return; }
      if (typeof window.FileReader === 'undefined') {
        U.vide(retourImport);
        retourImport.appendChild(document.createTextNode('Ce navigateur ne sait pas lire les fichiers. Utilise un navigateur plus récent pour l\'import.'));
        return;
      }
      var fr = new window.FileReader();
      fr.onload = function () {
        var r = Store.importer(String(fr.result));
        U.vide(retourImport);
        retourImport.appendChild(document.createTextNode(r.message));
        if (r.ok) { window.setTimeout(function () { aller('animateur', null, true); }, 1200); }
      };
      fr.readAsText(fichier.files[0]);
    };
    outils.appendChild(fichier);
    outils.appendChild(retourImport);

    /* Deuxième langue affichée. */
    outils.appendChild(U.el('label', 'label', I18N.t('anim.langue')));
    var choixLangue = U.el('div', 'boutons');
    var noms = { aucune: I18N.t('anim.aucune'), ee: 'Éwé', mina: 'Mina' };
    for (var q = 0; q < I18N.langues.length; q++) {
      (function (code) {
        var b = U.el('button', 'mini' + (I18N.getLangue2() === code ? ' choisi' : ''), noms[code]);
        b.type = 'button';
        U.clic(b, function () {
          I18N.setLangue2(code);
          Store.setReglage('langue2', code);
          aller('animateur', null, true);
        });
        choixLangue.appendChild(b);
      })(I18N.langues[q]);
    }
    outils.appendChild(choixLangue);
    outils.appendChild(U.el('p', 'note',
      'Les traductions en éwé et en mina sont à écrire avec les enfants dans le fichier js/i18n.js. Tant qu\'elles sont vides, le français s\'affiche seul.'));

    /* Son. */
    outils.appendChild(U.el('label', 'label', 'Lecture des consignes à voix haute'));
    var bs = U.el('button', 'mini', Voix.estActif() ? 'Activée' : 'Désactivée');
    bs.type = 'button';
    U.clic(bs, function () {
      Voix.setActif(!Voix.estActif());
      Store.setReglage('voix', Voix.estActif());
      aller('animateur', null, true);
    });
    outils.appendChild(bs);
    if (!Voix.possible()) {
      outils.appendChild(U.el('p', 'note',
        'Aucune voix française n\'est installée sur cet ordinateur : le bouton « Écouter » n\'apparaîtra pas. Tous les exercices restent utilisables sans le son.'));
    }

    page.appendChild(outils);
    e.appendChild(page);
  };

  /* --------------------------------------------------------------- */

  function demarrer() {
    var r = Store.reglages();
    I18N.setLangue2(r.langue2 || 'aucune');
    Voix.setActif(r.voix !== false);
    U.clic(U.id('btn-retour'), retour);
    aller('accueil', null, true);
  }

  return { demarrer: demarrer, aller: aller, retour: retour };
})();
