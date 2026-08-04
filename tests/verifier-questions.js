/* Test de robustesse : on fabrique des milliers de questions et on vérifie
   qu'aucune n'est cassée. */
const fs = require('fs');
const vm = require('vm');
const path = require('path').join(__dirname, '..') + '/';

const ctx = {
  window: { localStorage: null },
  document: {
    createElement: () => ({ appendChild(){}, className:'', style:{}, setAttribute(){} }),
    createTextNode: () => ({}),
    getElementById: () => null
  },
  console
};
ctx.window.window = ctx.window;
vm.createContext(ctx);

for (const f of ['js/util.js','js/icons.js','js/i18n.js','js/questions/math.js',
                 'js/questions/francais.js','js/questions/monde.js']) {
  vm.runInContext(fs.readFileSync(path + f, 'utf8'), ctx, { filename: f });
}
// registry.js a besoin de Mastery -> on reconstruit la liste à la main
vm.runInContext(`
var GENS = {
 'math.compter':QMath.compter,'math.nombres':QMath.nombres,'math.addition':QMath.addition,
 'math.soustraction':QMath.soustraction,'math.multiplication':QMath.multiplication,
 'math.division':QMath.division,'math.fractions':QMath.fractions,'math.monnaie':QMath.monnaie,
 'math.pourcentage':QMath.pourcentage,'math.geometrie':QMath.geometrie,'math.algebre':QMath.algebre,
 'fr.sons':QFr.sons,'fr.syllabes':QFr.syllabes,'fr.orthographe':QFr.orthographe,
 'fr.grammaire':QFr.grammaire,'fr.conjugaison':QFr.conjugaison,'fr.comprehension':QFr.comprehension,
 'sci.corps':QMonde.corps,'sci.nature':QMonde.nature,'geo.togo':QMonde.togo,
 'ordi.souris':QMonde.souris,'ordi.clavier':QMonde.clavier
};`, ctx);

const GENS = ctx.GENS;
const MODES = ['comprendre', 'entrainement', 'transfert'];
let erreurs = []; const rejets = {};
const variantes = {};
const N = 400;

function verifie(id, q, niveau, mode) {
  const E = (m) => erreurs.push(`${id} [n${niveau}/${mode}] ${m}`);
  if (!q) return E('question nulle');
  if (typeof q.texte !== 'string' || !q.texte.length) return E('texte manquant');
  for (const mot of ['undefined', 'NaN', 'null', 'Infinity']) {
    if (q.texte.indexOf(mot) >= 0) E(`"${mot}" dans le texte: ${q.texte}`);
    if (q.explication && String(q.explication).indexOf(mot) >= 0) E(`"${mot}" dans l'explication: ${q.explication}`);
  }
  if (!q.variante) E('variante manquante');
  else {
    variantes[id] = variantes[id] || new Set();
    variantes[id].add(q.variante);
  }
  if (!['choix', 'nombre', 'frappe', 'glisser'].includes(q.type)) return E('type inconnu: ' + q.type);

  if (q.type === 'choix') {
    if (!q.choix || q.choix.length < 2) return E('moins de 2 propositions');
    const justes = q.choix.filter(c => c.ok === true).length;
    if (justes !== 1) E(`${justes} bonne(s) réponse(s) au lieu d'une : ` + JSON.stringify(q.choix.map(c => c.t)));
    // Le moteur dédoublonne avant affichage : on vérifie ce qui reste.
    const brut = q.choix.filter(c => !c.visuel).map(c => c.t);
    q.choix = ctx.U.dedupChoix(q.choix);
    if (q.choix.length < 2) {
      rejets[id] = (rejets[id] || 0) + 1;
      E('après dédoublonnage il ne reste qu\'une proposition : ' + JSON.stringify(brut));
    }
    for (const c of q.choix) {
      if (!c.visuel && (c.t === undefined || c.t === null || String(c.t) === '' || String(c.t).indexOf('undefined') >= 0)) {
        E('proposition vide/undefined');
      }
    }
  }
  if (q.type === 'nombre') {
    if (q.reponse === undefined) return E('réponse manquante');
    if (!/^\d+$/.test(String(q.reponse))) E('réponse non saisissable au pavé numérique : ' + q.reponse);
  }
  if (q.type === 'frappe' && !q.reponse) E('réponse à taper manquante');
  if (q.pourquoi) {
    const j = q.pourquoi.choix.filter(c => c.ok === true).length;
    if (j !== 1) E(`justification : ${j} bonne(s) réponse(s)`);
  }
  if (!q.explication) E('explication manquante');
}

for (const id of Object.keys(GENS)) {
  for (let niveau = 1; niveau <= 6; niveau++) {
    for (const mode of MODES) {
      for (let i = 0; i < N; i++) {
        let q;
        try { q = GENS[id](niveau, mode); }
        catch (e) { erreurs.push(`${id} [n${niveau}/${mode}] EXCEPTION ${e.message}`); continue; }
        verifie(id, q, niveau, mode);
      }
    }
  }
}

// Chaque notion doit pouvoir produire au moins 3 représentations distinctes,
// sinon le moteur ne validera jamais la maîtrise.
for (const id of Object.keys(GENS)) {
  const v = variantes[id] || new Set();
  if (v.size < 3) erreurs.push(`${id} : seulement ${v.size} représentation(s) (${[...v].join(', ')}) -> maîtrise impossible`);
}

console.log(`Questions fabriquées : ${Object.keys(GENS).length * 6 * 3 * N}`);
console.log(`Erreurs : ${erreurs.length}\n`);
const cat = {};
for (const e of erreurs) {
  const k = e.replace(/\[n\d\//, '[').replace(/ ?: .*/, '').replace(/ -> .*/, '');
  (cat[k] = cat[k] || { n: 0, ex: e }).n++;
}
Object.entries(cat).sort((a, b) => b[1].n - a[1].n)
  .forEach(([k, v]) => console.log(String(v.n).padStart(6) + '  ' + k + '\n          ex: ' + v.ex.slice(0, 150)));
