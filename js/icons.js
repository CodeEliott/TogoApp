/* icons.js - jeu d'icones dessinees en SVG.

   Pourquoi pas des emojis ? Windows XP et Windows 7 n'ont pas de police
   emoji en couleur : les enfants verraient des carres vides. Pourquoi pas
   des images PNG ? Il faudrait des dizaines de fichiers et ils ne se
   chargent pas toujours en protocole file://. Le SVG en ligne, lui, marche
   partout et se redimensionne sans devenir flou. */

var Icons = (function () {

  var D = {};

  D.oeuf = '<ellipse cx="24" cy="27" rx="14" ry="18" fill="#fdf3dc" stroke="#c9a227" stroke-width="2"/>';

  D.poule = '<ellipse cx="26" cy="30" rx="15" ry="12" fill="#e8e2d5" stroke="#7a6a52" stroke-width="2"/>' +
            '<circle cx="14" cy="19" r="8" fill="#e8e2d5" stroke="#7a6a52" stroke-width="2"/>' +
            '<path d="M14 10 q3 -5 6 -1 q-3 1 -6 1z" fill="#d21034"/>' +
            '<circle cx="11" cy="18" r="1.6" fill="#333"/>' +
            '<path d="M6 20 l-5 2 l5 2z" fill="#f2a900"/>' +
            '<path d="M22 42 l0 4 M32 42 l0 4" stroke="#f2a900" stroke-width="2"/>';

  D.ballon = '<circle cx="24" cy="24" r="17" fill="#fff" stroke="#333" stroke-width="2"/>' +
             '<path d="M24 12 l8 6 -3 10 h-10 l-3 -10z" fill="#333"/>';

  D.basket = '<circle cx="24" cy="24" r="17" fill="#e8792b" stroke="#8c4a12" stroke-width="2"/>' +
             '<path d="M7 24h34 M24 7v34 M12 12 q12 12 0 24 M36 12 q-12 12 0 24" stroke="#8c4a12" stroke-width="1.6" fill="none"/>';

  D.rugby = '<ellipse cx="24" cy="24" rx="18" ry="11" fill="#8b4a2b" stroke="#5b2d16" stroke-width="2" transform="rotate(-25 24 24)"/>' +
            '<path d="M16 30 l16 -12 M20 26 l3 3 M24 22 l3 3" stroke="#fff" stroke-width="1.8" fill="none"/>';

  D.panier = '<path d="M8 18 h32 l-4 22 h-24z" fill="#c98b45" stroke="#7a4f20" stroke-width="2"/>' +
             '<path d="M12 18 q12 -14 24 0" fill="none" stroke="#7a4f20" stroke-width="2"/>';

  D.arbre = '<rect x="21" y="26" width="6" height="16" fill="#7a4f20"/>' +
            '<circle cx="24" cy="19" r="13" fill="#2e8b57"/>';

  D.maison = '<path d="M6 24 L24 8 L42 24z" fill="#d21034"/>' +
             '<rect x="12" y="24" width="24" height="18" fill="#f0e0c0" stroke="#7a6a52" stroke-width="1.5"/>' +
             '<rect x="21" y="31" width="7" height="11" fill="#7a4f20"/>';

  D.poisson = '<ellipse cx="22" cy="24" rx="14" ry="9" fill="#3b8fd4" stroke="#1e5a8a" stroke-width="2"/>' +
              '<path d="M36 24 l9 -7 v14z" fill="#3b8fd4" stroke="#1e5a8a" stroke-width="2"/>' +
              '<circle cx="14" cy="21" r="1.7" fill="#fff"/>';

  D.banane = '<path d="M10 14 q4 22 26 22 q-6 -6 -6 -12 q6 6 10 4 q-16 6 -30 -14z" fill="#f5c518" stroke="#a8860a" stroke-width="1.6"/>';

  D.mangue = '<ellipse cx="24" cy="27" rx="14" ry="15" fill="#f08c1e" stroke="#a85c0a" stroke-width="2"/>' +
             '<path d="M24 12 q6 -6 10 -4" stroke="#2e8b57" stroke-width="2.5" fill="none"/>';

  D.seau = '<path d="M10 18 h28 l-4 24 h-20z" fill="#3b8fd4" stroke="#1e5a8a" stroke-width="2"/>' +
           '<path d="M10 18 q14 -12 28 0" fill="none" stroke="#1e5a8a" stroke-width="2"/>';

  D.etoile = '<path d="M24 6 l5.5 12.5 13.5 1.5 -10 9 3 13.5 -12 -7 -12 7 3 -13.5 -10 -9 13.5 -1.5z" fill="#ffce00" stroke="#c9a227" stroke-width="1.5"/>';

  D.coeur = '<path d="M24 42 C6 30 6 14 16 12 c5 -1 8 3 8 6 c0 -3 3 -7 8 -6 c10 2 10 18 -8 30z" fill="#d21034"/>';

  D.cahier = '<rect x="10" y="7" width="28" height="34" rx="2" fill="#fff" stroke="#555" stroke-width="2"/>' +
             '<path d="M16 15h16 M16 22h16 M16 29h10" stroke="#3b8fd4" stroke-width="2"/>';

  D.crayon = '<path d="M10 38 l3 -9 20 -20 6 6 -20 20z" fill="#f5c518" stroke="#a8860a" stroke-width="1.6"/>' +
             '<path d="M10 38 l3 -9 6 6z" fill="#444"/>';

  D.calebasse = '<circle cx="24" cy="29" r="14" fill="#c98b45" stroke="#7a4f20" stroke-width="2"/>' +
                '<path d="M10 26 q14 8 28 0" fill="none" stroke="#7a4f20" stroke-width="2"/>';

  D.bidon = '<rect x="12" y="14" width="24" height="28" rx="3" fill="#ffce00" stroke="#a8860a" stroke-width="2"/>' +
            '<rect x="20" y="7" width="8" height="8" fill="#a8860a"/>';

  D.souris = '<rect x="15" y="8" width="18" height="32" rx="9" fill="#eee" stroke="#555" stroke-width="2"/>' +
             '<path d="M24 8 v12" stroke="#555" stroke-width="2"/>';

  D.clavier = '<rect x="4" y="14" width="40" height="22" rx="3" fill="#eee" stroke="#555" stroke-width="2"/>' +
              '<path d="M10 20h4 M18 20h4 M26 20h4 M34 20h4 M10 26h4 M18 26h4 M26 26h4 M34 26h4 M14 32h20" stroke="#777" stroke-width="2.5"/>';

  D.drapeau = '<rect x="10" y="10" width="30" height="8" fill="#2e8b57"/>' +
              '<rect x="10" y="18" width="30" height="8" fill="#ffce00"/>' +
              '<rect x="10" y="26" width="30" height="8" fill="#2e8b57"/>' +
              '<rect x="10" y="10" width="14" height="16" fill="#d21034"/>' +
              '<path d="M17 14 l1.6 3.6 3.9 .4 -2.9 2.6 .9 3.9 -3.5 -2 -3.5 2 .9 -3.9 -2.9 -2.6 3.9 -.4z" fill="#fff"/>' +
              '<rect x="7" y="8" width="3" height="34" fill="#7a4f20"/>';

  var ORDRE = ['oeuf', 'poule', 'ballon', 'basket', 'rugby', 'panier', 'arbre', 'maison',
    'poisson', 'banane', 'mangue', 'seau', 'etoile', 'coeur', 'cahier', 'crayon', 'calebasse', 'bidon'];

  /* Icones utilisables comme "objets a compter". */
  var COMPTABLES = ['oeuf', 'poule', 'ballon', 'basket', 'rugby', 'poisson', 'banane', 'mangue',
    'arbre', 'maison', 'etoile', 'seau', 'calebasse', 'crayon'];

  var NOMS = {
    oeuf: ['œuf', 'œufs'], poule: ['poule', 'poules'], ballon: ['ballon', 'ballons'],
    basket: ['ballon de basket', 'ballons de basket'], rugby: ['ballon de rugby', 'ballons de rugby'],
    panier: ['panier', 'paniers'], arbre: ['arbre', 'arbres'], maison: ['maison', 'maisons'],
    poisson: ['poisson', 'poissons'], banane: ['banane', 'bananes'], mangue: ['mangue', 'mangues'],
    seau: ['seau', 'seaux'], etoile: ['étoile', 'étoiles'], coeur: ['cœur', 'cœurs'],
    cahier: ['cahier', 'cahiers'], crayon: ['crayon', 'crayons'],
    calebasse: ['calebasse', 'calebasses'], bidon: ['bidon', 'bidons'],
    souris: ['souris', 'souris'], clavier: ['clavier', 'claviers'], drapeau: ['drapeau', 'drapeaux']
  };

  /* Rend l'icone sous forme de chaine SVG. */
  function svg(nom, taille) {
    var d = D[nom] || D.etoile;
    var t = taille || 48;
    return '<svg viewBox="0 0 48 48" width="' + t + '" height="' + t + '" aria-hidden="true">' + d + '</svg>';
  }

  /* Rend l'icone dans un element DOM pret a inserer. */
  function noeud(nom, taille) {
    var s = U.el('span', 'ic');
    s.innerHTML = svg(nom, taille);
    return s;
  }

  function nom(icone, n) {
    var couple = NOMS[icone] || ['objet', 'objets'];
    return n > 1 ? couple[1] : couple[0];
  }

  function comptableAuHasard() { return U.tire(COMPTABLES); }

  return {
    svg: svg, noeud: noeud, nom: nom, liste: ORDRE,
    comptables: COMPTABLES, comptableAuHasard: comptableAuHasard
  };
})();
