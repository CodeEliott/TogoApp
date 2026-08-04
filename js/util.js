/* util.js - petites fonctions partout utilisees.
   Ecrit en JavaScript "ES5" (var, function, concatenation de chaines) pour
   rester compatible avec Chrome 49 / Firefox 52, les derniers navigateurs
   disponibles sur Windows XP. */

var U = (function () {

  function id(x) { return document.getElementById(x); }

  /* Cree un element. cls et texte sont optionnels. */
  function el(tag, cls, texte) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (texte !== undefined && texte !== null) { n.appendChild(document.createTextNode(String(texte))); }
    return n;
  }

  function vide(n) { while (n.firstChild) { n.removeChild(n.firstChild); } }

  function ajoute(parent) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) { parent.appendChild(arguments[i]); }
    }
    return parent;
  }

  /* Entier aleatoire entre a et b inclus. */
  function hasard(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* Un element au hasard dans un tableau. */
  function tire(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

  /* n elements distincts au hasard. */
  function tireN(liste, n) {
    var copie = melange(liste.slice(0));
    return copie.slice(0, Math.min(n, copie.length));
  }

  /* Melange un tableau sur place (Fisher-Yates).
     C'est une piece maitresse du projet : les propositions de reponse sont
     toujours melangees, sinon les enfants memorisent la POSITION du bon
     bouton au lieu d'apprendre la notion. */
  function melange(liste) {
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = liste[i]; liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }

  /* Tire un nombre au hasard en evitant certaines valeurs (pour fabriquer
     des mauvaises reponses qui ne tombent pas sur la bonne). */
  function hasardSauf(a, b, interdits) {
    var essais = 0, v;
    do { v = hasard(a, b); essais++; } while (dans(interdits, v) && essais < 60);
    return v;
  }

  function dans(liste, v) {
    for (var i = 0; i < liste.length; i++) { if (liste[i] === v) { return true; } }
    return false;
  }

  /* Supprime les propositions de reponse identiques, en gardant toujours
     la bonne. Deux boutons portant le meme texte, c'est incomprehensible
     pour un enfant : il clique sur l'un des deux et on lui dit qu'il a
     faux. Ce filtre est applique a TOUTES les questions par le moteur,
     y compris a celles des generateurs qu'on ajoutera plus tard. */
  function dedupChoix(choix) {
    var vus = [], out = [], i;
    /* La bonne reponse passe en premier pour ne jamais etre eliminee. */
    for (i = 0; i < choix.length; i++) { if (choix[i].ok) { out.push(choix[i]); vus.push(String(choix[i].t)); } }
    for (i = 0; i < choix.length; i++) {
      var c = choix[i];
      if (c.ok) { continue; }
      if (c.visuel && c.t === undefined) { out.push(c); continue; }
      var cle = String(c.t);
      if (dans(vus, cle)) { continue; }
      vus.push(cle); out.push(c);
    }
    return melange(out);
  }

  /* Enleve les doublons d'un tableau de nombres ou de chaines. */
  function unique(liste) {
    var out = [];
    for (var i = 0; i < liste.length; i++) { if (!dans(out, liste[i])) { out.push(liste[i]); } }
    return out;
  }

  /* Montant en francs CFA, avec espace tous les 3 chiffres. */
  function cfa(n) {
    var s = String(Math.round(n)), out = '', c = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      out = s.charAt(i) + out; c++;
      if (c % 3 === 0 && i > 0) { out = ' ' + out; }
    }
    return out + ' F';
  }

  /* Nombre ecrit en lettres, jusqu'a 100. Sert a faire varier la
     representation d'un meme nombre (chiffre / mot / quantite dessinee). */
  var UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  var DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function enLettres(n) {
    n = Math.round(n);
    if (n < 0) { return 'moins ' + enLettres(-n); }
    if (n < 20) { return UNITES[n]; }
    if (n === 100) { return 'cent'; }
    if (n > 100) { return String(n); }
    var d = Math.floor(n / 10), u = n % 10;
    if (d === 7 || d === 9) { u = n - (d === 7 ? 60 : 80); }
    var base = DIZAINES[d];
    if (d === 8 && u === 0) { return 'quatre-vingts'; }
    if (u === 0) { return base; }
    if (u === 1 && d !== 8 && d !== 9) { return base + ' et un'; }
    if (u === 11 && (d === 7)) { return 'soixante et onze'; }
    return base + '-' + (u < 20 ? UNITES[u] : String(u));
  }

  /* Accord simple pour les phrases generees. */
  function pluriel(n, mot, motPluriel) {
    return n > 1 ? (motPluriel || (mot + 's')) : mot;
  }

  function maj(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* PGCD, utilise pour simplifier les fractions. */
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }

  /* Enregistre un clic de facon compatible (pas d'addEventListener sur IE8,
     mais on garde le fallback : ca ne coute rien). */
  function clic(n, fn) {
    if (n.addEventListener) { n.addEventListener('click', fn, false); }
    else { n.attachEvent('onclick', fn); }
    return n;
  }

  function maintenant() { return (new Date()).getTime(); }

  function jour(t) {
    var d = new Date(t || maintenant());
    var m = d.getMonth() + 1, j = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (j < 10 ? '0' : '') + j;
  }

  return {
    id: id, el: el, vide: vide, ajoute: ajoute,
    hasard: hasard, tire: tire, tireN: tireN, melange: melange,
    hasardSauf: hasardSauf, dans: dans, unique: unique, dedupChoix: dedupChoix,
    cfa: cfa, enLettres: enLettres, pluriel: pluriel, maj: maj, pgcd: pgcd,
    clic: clic, maintenant: maintenant, jour: jour
  };
})();
