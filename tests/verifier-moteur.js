/* Simulation de trois profils d'enfants pour vérifier que le moteur
   pédagogique fait bien ce qu'on attend de lui. */
const fs = require('fs'), vm = require('vm');
const path = require('path').join(__dirname, '..') + '/';
const ctx = { window: {}, document: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path + 'js/util.js', 'utf8'), ctx);
vm.runInContext('var Store = { sauver: function(){} };', ctx);
vm.runInContext(fs.readFileSync(path + 'js/mastery.js', 'utf8'), ctx);
const { Mastery, U } = ctx;

const CONCEPT = 'math.multiplication';

/* Reproduit la boucle du moteur : le mode de chaque question est décidé
   par Mastery.modePourQuestion, exactement comme dans engine.js. */
function joue(profil, nbQuestions, joueur) {
  joueur = joueur || { concepts: {} };
  for (let i = 0; i < nbQuestions; i++) {
    const mode = Mastery.modePourQuestion(joueur, CONCEPT, i % 8);
    const { juste, ms, variante } = profil(mode, i);
    Mastery.enregistrer(joueur, CONCEPT, variante, mode, juste, ms);
  }
  return joueur;
}

const VARIANTES = { comprendre: 'objets', entrainement: 'chiffres', transfert: 'probleme' };

/* A. L'enfant qui comprend : répond juste, en prenant le temps. */
const A = (mode) => ({ juste: true, ms: 4000, variante: VARIANTES[mode] });

/* B. L'enfant qui apprend par cœur : ultra-rapide et juste en répétition,
      mais perdu dès que la question change de forme. */
const B = (mode) => mode === 'entrainement'
  ? { juste: true, ms: 900, variante: 'chiffres' }
  : (mode === 'transfert'
    ? { juste: false, ms: 6000, variante: 'probleme' }
    : { juste: true, ms: 3000, variante: 'objets' });

/* C. L'enfant qui clique au hasard. */
const C = (mode) => ({ juste: Math.random() < 0.33, ms: 700, variante: VARIANTES[mode] });

function bilan(nom, j) {
  const e = Mastery.etat(j, CONCEPT);
  console.log(`${nom.padEnd(26)} mode=${e.mode.padEnd(13)} niveau=${e.niveau}  ` +
    `score=${String(Mastery.score(j, CONCEPT)).padStart(3)}%  ` +
    `parcoeur=${e.parcoeur}  signalé=${e.drapeau ? 'OUI' : 'non'}  ` +
    `justes=${e.ok}/${e.n}`);
  return e;
}

console.log('=== 40 questions, une seule journée ===');
const a1 = joue(A, 40); const ea1 = bilan('A comprend', a1); const niveauJour1 = ea1.niveau;
const b1 = joue(B, 40); const eb1 = bilan('B par coeur', b1);
const c1 = joue(C, 40); const ec1 = bilan('C au hasard', c1);

console.log('\n=== puis 40 questions un AUTRE jour ===');
[a1, b1, c1].forEach(j => { const e = Mastery.etat(j, CONCEPT); e.jours.push('2026-08-05'); });
const ea2 = bilan('A comprend', joue(A, 40, a1));
const eb2 = bilan('B par coeur', joue(B, 40, b1));
const ec2 = bilan('C au hasard', joue(C, 40, c1));

console.log('\n=== vérifications ===');
const check = (ok, txt) => console.log((ok ? '  OK   ' : '  RATÉ ') + txt);
check(ea2.niveau > 1, 'A (comprend) finit par valider la notion et monter de niveau');
check(eb2.niveau === 1, 'B (par coeur) ne valide JAMAIS la notion malgré ses bonnes réponses');
check(eb2.drapeau === true, 'B est signalé à l\'animateur comme "répond par coeur"');
check(eb1.parcoeur > 0, 'le piège rapide-puis-transfert a bien été déclenché pour B');
check(ec2.niveau === 1 && !ec2.maitrise, 'C (hasard) ne progresse pas');
check(niveauJour1 === 1, 'A ne valide PAS la notion en une seule journée (anti-bachotage)');

/* Le détecteur ne doit pas punir un enfant simplement rapide ET solide. */
const D = (mode) => ({ juste: true, ms: 800, variante: VARIANTES[mode] });
const d = joue(D, 80); d.concepts[CONCEPT].jours.push('2026-08-05');
const ed = bilan('D rapide mais juste', joue(D, 40, d));
check(!ed.drapeau, 'D (rapide mais qui réussit aussi les transferts) n\'est PAS signalé à tort');
check(ed.niveau > 1, 'D progresse normalement');
