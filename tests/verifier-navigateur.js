/* Test dans un vrai navigateur : on crée un joueur et on joue à TOUTES les
   activités, en cliquant comme un enfant, en surveillant la moindre erreur
   JavaScript. */
const { chromium } = require('playwright');

(async () => {
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1024, height: 768 } });

  const erreurs = [];
  page.on('pageerror', e => erreurs.push('ERREUR JS : ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erreurs.push('CONSOLE : ' + m.text()); });

  await page.goto('file://' + require('path').join(__dirname, '..', 'index.html') + '');

  // --- création d'un joueur ---
  await page.click('button:has-text("Nouveau joueur")');
  await page.fill('.champ', 'Kossi');
  await page.click('.btn-age >> text="8"');
  await page.click('.btn-avatar >> nth=1');
  await page.click('button:has-text("C\'est parti")');
  if (!(await page.locator('.tuiles').isVisible())) throw new Error('menu non affiché');
  console.log('Création du joueur : OK');

  const matieres = ['L\'ordinateur', 'Les nombres', 'Les mots', 'Le monde'];
  let totalActivites = 0, totalQuestions = 0;

  for (const mat of matieres) {
    await page.click('.tuile >> text=' + JSON.stringify(mat));
    const nb = await page.locator('.carte-activite').count();
    console.log(`\n${mat} : ${nb} activités`);

    for (let i = 0; i < nb; i++) {
      const titre = await page.locator('.carte-activite .act-titre').nth(i).innerText();
      await page.locator('.carte-activite').nth(i).click();
      totalActivites++;

      // On joue les 8 questions de la partie.
      for (let q = 0; q < 9; q++) {
        if (await page.locator('.fin').count()) break;
        await page.waitForSelector('.zone-reponse', { timeout: 5000 });

        if (await page.locator('.btn-choix').count()) {
          await page.locator('.btn-choix').first().click();
        } else if (await page.locator('.pave').count()) {
          await page.locator('.touche >> text="7"').click();
          await page.locator('.touche-ok').click();
        } else if (await page.locator('.champ-frappe').count()) {
          await page.fill('.champ-frappe', 'test');
          await page.click('.btn-valider');
        } else if (await page.locator('.aire-glisser').count()) {
          // vrai glisser-déposer à la souris
          const o = await page.locator('.objet-glissable').boundingBox();
          const c = await page.locator('.cible-glisser').boundingBox();
          await page.mouse.move(o.x + o.width / 2, o.y + o.height / 2);
          await page.mouse.down();
          await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 12 });
          await page.mouse.up();
        } else {
          throw new Error(`[${titre}] aucune façon de répondre !`);
        }
        totalQuestions++;

        // étape "et pourquoi ?" éventuelle
        if (await page.locator('.mode-transfert').count() && await page.locator('.btn-choix').count()
            && !(await page.locator('.retour').count())) {
          await page.locator('.btn-choix').first().click();
        }
        if (await page.locator('.retour').count()) {
          await page.locator('.retour .btn-valider').click();
        }
      }

      await page.waitForSelector('.fin', { timeout: 5000 });
      const score = await page.locator('.score').innerText();
      console.log(`   ${titre.padEnd(26)} partie terminée, score ${score}`);
      await page.click('button:has-text("Retour au menu")');
      await page.waitForSelector('.activites', { timeout: 5000 });
    }
    await page.click('#btn-retour');
    await page.waitForSelector('.tuiles', { timeout: 5000 });
  }

  // --- progrès ---
  await page.click('button:has-text("Mes progrès")');
  const lignes = await page.locator('.progres-ligne').count();
  console.log(`\nÉcran "Mes progrès" : ${lignes} notions suivies`);
  await page.click('#btn-retour');

  // --- espace animateur ---
  await page.click('button:has-text("Changer de joueur")');
  await page.click('button:has-text("Espace animateur")');
  await page.fill('.champ', '1234');
  await page.click('button:has-text("Entrer")');
  await page.waitForSelector('.anim', { timeout: 5000 });
  const joueurs = await page.locator('.ligne-joueur').count();
  console.log(`Espace animateur : ${joueurs} joueur(s) listé(s)`);

  // --- la sauvegarde survit-elle à un rechargement ? ---
  await page.reload();
  await page.waitForSelector('.carte-joueur', { timeout: 5000 });
  const nom = await page.locator('.carte-joueur .nom').first().innerText();
  console.log(`Après rechargement, le joueur est retrouvé : ${nom}`);

  console.log(`\nBilan : ${totalActivites} activités, ${totalQuestions} questions jouées.`);
  console.log(erreurs.length ? '\nERREURS :\n' + [...new Set(erreurs)].join('\n') : 'Aucune erreur JavaScript.');
  await nav.close();
  process.exit(erreurs.length ? 1 : 0);
})().catch(e => { console.error('ÉCHEC : ' + e.message); process.exit(1); });
