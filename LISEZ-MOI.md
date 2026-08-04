# La Solution — apprendre en jouant

Application éducative hors ligne pour le coin CDI de l'orphelinat La Solution
(Lomé, Togo). 22 activités de 6 à 18 ans : nombres, français, sciences,
géographie du Togo, et prise en main de l'ordinateur.

---

## Installer sur les 4 ordinateurs (5 minutes)

Il n'y a **rien à installer**. L'application est un simple dossier.

1. Copier le dossier complet sur une clé USB.
2. Sur chaque ordinateur, coller le dossier dans `Mes Documents`.
3. Ouvrir le dossier et **double-cliquer sur `index.html`**.
4. Faire un clic droit sur `index.html` → « Envoyer vers » → « Bureau
   (créer un raccourci) », pour que les enfants le retrouvent seuls.

Il n'y a pas besoin d'Internet, ni de compte, ni de mot de passe.

### Navigateur

Ça fonctionne avec Chrome, Firefox, Edge, Opera. Sur Windows XP, installer
**Chrome 49** ou **Firefox 52** (les dernières versions compatibles XP) : le
code a été écrit pour rester compatible avec eux.

Internet Explorer 8 et antérieurs ne sont pas gérés (ils ne savent pas
afficher les dessins de l'application).

---

## Le premier jour avec les enfants

1. Chaque enfant clique sur **« Nouveau joueur »**, écrit son prénom, choisit
   son âge et une image. Pas de mot de passe : ils l'oublieraient.
2. Ceux qui n'ont jamais utilisé un ordinateur commencent par
   **L'ordinateur → La souris**, puis **Le clavier**. Tant qu'ils ne savent
   pas viser et cliquer, ils échoueront aux exercices de maths pour une
   raison qui n'a rien à voir avec les maths.
3. Les autres vont directement dans la matière qu'ils veulent.

Une partie dure 8 questions, soit environ 5 minutes. Avec 4 postes, on fait
tourner un groupe de 8 à 12 enfants sur une heure.

---

## Espace animateur

Bouton **« Espace animateur »** sur l'écran d'accueil. **Code par défaut :
`1234`.**

Pour changer le code : ouvrir `js/storage.js` avec le Bloc-notes, chercher
la ligne `code: '1234'` et remplacer par le code voulu (4 chiffres).

On y trouve :

- **À regarder en priorité** — les enfants que le système a détectés comme
  « répondant par cœur sans comprendre ». C'est la partie la plus utile :
  ce sont eux qu'il faut aller voir en personne.
- La liste des joueurs, leurs notions validées, leur dernière visite.
- L'export / import des progrès.
- Le réglage de la deuxième langue et du son.

---

## Sauvegarder les progrès (important)

Les progrès sont enregistrés **dans le navigateur de chaque ordinateur**.
Conséquences :

- un enfant qui change de poste ne retrouve pas ses progrès ;
- si quelqu'un « nettoie » l'ordinateur ou réinstalle le navigateur, tout
  est perdu.

**À faire une fois par semaine :** Espace animateur → « Enregistrer les
progrès (fichier) », et copier le fichier obtenu sur une clé USB.

Pour regrouper les progrès de plusieurs postes sur un seul, ou pour les
restaurer : « Charger un fichier de progrès ». La fusion est intelligente
(en cas de doublon, elle garde la version la plus récente).

---

## Ajouter l'éwé ou le mina

Le système est prêt, les traductions sont volontairement vides : je n'ai pas
voulu inventer des traductions approximatives que les enfants apprendraient
ensuite.

Ouvrir `js/i18n.js` avec le Bloc-notes, descendre jusqu'à `var LOCALE`, et
remplir entre les guillemets, par exemple :

```js
ee: {
  'jeu.bravo': 'écrire ici la traduction',
  'accueil.choisir': 'écrire ici la traduction'
}
```

Puis, dans l'espace animateur, choisir « Éwé » comme deuxième langue. Les
consignes s'affichent alors en français avec la traduction en dessous. Toute
ligne laissée vide reste en français.

C'est un excellent atelier à faire **avec les grands** : ils sont les
experts, et voir leur langue apparaître dans l'ordinateur a beaucoup d'effet.

---

## Si ça ne marche pas

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page blanche | Navigateur trop ancien | Installer Chrome 49 ou Firefox 52 |
| Les dessins ne s'affichent pas | Idem | Idem |
| Message « ce navigateur n'enregistre pas les progrès » | Navigation privée, ou navigateur qui bloque le stockage en local | Sortir de la navigation privée ; sur Chrome, lancer avec l'option `--allow-file-access-from-files`, ou servir le dossier via un petit serveur local |
| Le bouton « Écouter » n'apparaît pas | Aucune voix française installée sur la machine | Normal sous Windows XP. Toutes les activités fonctionnent sans le son |
| Les accents s'affichent bizarrement | Fichier ré-enregistré dans un autre encodage | Réenregistrer les fichiers en UTF-8 |

---

## Pour la suite : ajouter des exercices

Tout est en JavaScript simple, sans outil de compilation. Pour ajouter une
notion :

1. Écrire une fonction `gen(niveau, mode)` dans un des fichiers de
   `js/questions/`. Elle doit renvoyer une question différente à chaque
   appel (voir les explications en tête de `js/questions/math.js`).
2. L'inscrire dans la liste de `js/registry.js`.

Deux règles à respecter absolument, sous peine de casser tout l'intérêt du
projet :

- **ne jamais écrire les questions en dur** — elles doivent être fabriquées
  au hasard à chaque fois ;
- **prévoir au moins trois représentations différentes** de la même notion
  (objets dessinés / chiffres / problème raconté / question inversée), sinon
  le moteur ne pourra jamais valider la maîtrise.

Les détails pédagogiques sont expliqués dans `GUIDE-ANIMATEUR.md`.
